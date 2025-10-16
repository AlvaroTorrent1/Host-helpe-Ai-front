-- Migration: Add helper function for safe property matching
-- Date: 2025-10-16
-- Description: Creates a function to safely match property names with validation and logging
-- This helps the n8n workflow avoid creating incidents with incorrect property_id

-- 1. Create function for safe property name matching
CREATE OR REPLACE FUNCTION public.match_property_by_name(
  p_input_name TEXT,
  p_similarity_threshold NUMERIC DEFAULT 0.8
)
RETURNS TABLE (
  property_id UUID,
  property_name TEXT,
  similarity_score NUMERIC,
  match_confidence TEXT,
  alternatives JSONB
) AS $$
DECLARE
  v_best_match RECORD;
  v_all_matches JSONB;
BEGIN
  -- Find all matches with similarity scores
  WITH scored_matches AS (
    SELECT 
      p.id,
      p.name,
      similarity(lower(p.name), lower(p_input_name)) as score
    FROM public.properties p
    WHERE p.status = 'active'
    ORDER BY score DESC
    LIMIT 5
  )
  SELECT 
    sm.id,
    sm.name,
    sm.score,
    CASE 
      WHEN sm.score >= 0.9 THEN 'high'
      WHEN sm.score >= 0.8 THEN 'medium'
      WHEN sm.score >= 0.7 THEN 'low'
      ELSE 'very_low'
    END as confidence,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'name', name,
          'score', score
        )
      )
      FROM scored_matches
      WHERE score >= p_similarity_threshold
    ) as alts
  INTO v_best_match
  FROM scored_matches
  LIMIT 1;

  -- Return result if confidence is acceptable
  IF v_best_match.score >= p_similarity_threshold THEN
    RETURN QUERY
    SELECT 
      v_best_match.id::UUID,
      v_best_match.name::TEXT,
      v_best_match.score::NUMERIC,
      v_best_match.confidence::TEXT,
      v_best_match.alts::JSONB;
  ELSE
    -- Return NULL result with alternatives for manual resolution
    RETURN QUERY
    SELECT 
      NULL::UUID,
      p_input_name::TEXT,
      0::NUMERIC,
      'no_match'::TEXT,
      v_best_match.alts::JSONB;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. Create table to log ambiguous matches for review
CREATE TABLE IF NOT EXISTS public.property_match_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_name TEXT NOT NULL,
  matched_property_id UUID REFERENCES public.properties(id),
  matched_property_name TEXT,
  similarity_score NUMERIC,
  confidence_level TEXT,
  alternatives JSONB,
  source TEXT, -- e.g., '11labs', 'manual', 'api'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed BOOLEAN DEFAULT FALSE,
  reviewer_notes TEXT
);

-- 3. Create index on match log
CREATE INDEX IF NOT EXISTS idx_property_match_log_created_at 
  ON public.property_match_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_match_log_unreviewed 
  ON public.property_match_log(reviewed) WHERE reviewed = FALSE;
CREATE INDEX IF NOT EXISTS idx_property_match_log_low_confidence 
  ON public.property_match_log(confidence_level) 
  WHERE confidence_level IN ('low', 'very_low', 'no_match');

-- 4. Enable RLS on match log
ALTER TABLE public.property_match_log ENABLE ROW LEVEL SECURITY;

-- Policy for service role (n8n) to insert
CREATE POLICY "Service role can insert match logs" ON public.property_match_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy for authenticated users to view logs for their properties
CREATE POLICY "Users can view match logs for their properties" ON public.property_match_log
  FOR SELECT
  USING (
    matched_property_id IN (
      SELECT id FROM public.properties 
      WHERE user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

-- Policy for users to update review status
CREATE POLICY "Users can update review status" ON public.property_match_log
  FOR UPDATE
  USING (
    matched_property_id IN (
      SELECT id FROM public.properties 
      WHERE user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

-- 5. Create function to log fuzzy matches
CREATE OR REPLACE FUNCTION public.log_property_match(
  p_input_name TEXT,
  p_matched_id UUID,
  p_matched_name TEXT,
  p_score NUMERIC,
  p_confidence TEXT,
  p_alternatives JSONB,
  p_source TEXT DEFAULT '11labs'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.property_match_log (
    input_name,
    matched_property_id,
    matched_property_name,
    similarity_score,
    confidence_level,
    alternatives,
    source
  ) VALUES (
    p_input_name,
    p_matched_id,
    p_matched_name,
    p_score,
    p_confidence,
    p_alternatives,
    p_source
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Add comments
COMMENT ON FUNCTION public.match_property_by_name IS 'Safely matches property names with similarity scoring and threshold validation';
COMMENT ON TABLE public.property_match_log IS 'Logs all property name matching attempts for review and debugging';
COMMENT ON COLUMN public.property_match_log.confidence_level IS 'high (>0.9), medium (0.8-0.9), low (0.7-0.8), very_low (<0.7), no_match';
COMMENT ON COLUMN public.property_match_log.alternatives IS 'JSON array of alternative matches with scores';

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION public.match_property_by_name(TEXT, NUMERIC) TO service_role;
GRANT EXECUTE ON FUNCTION public.log_property_match(TEXT, UUID, TEXT, NUMERIC, TEXT, JSONB, TEXT) TO service_role;
GRANT ALL ON public.property_match_log TO service_role;
GRANT SELECT, UPDATE ON public.property_match_log TO authenticated;

-- 8. Create view for unreviewed low-confidence matches
CREATE OR REPLACE VIEW public.property_matches_needing_review AS
SELECT 
  pml.*,
  p.name as current_property_name,
  p.user_id as property_owner_id
FROM public.property_match_log pml
LEFT JOIN public.properties p ON p.id = pml.matched_property_id
WHERE pml.reviewed = FALSE
  AND pml.confidence_level IN ('low', 'very_low', 'no_match')
ORDER BY pml.created_at DESC;

COMMENT ON VIEW public.property_matches_needing_review IS 'Shows low-confidence property matches that need manual review';
GRANT SELECT ON public.property_matches_needing_review TO authenticated;
GRANT SELECT ON public.property_matches_needing_review TO service_role;

