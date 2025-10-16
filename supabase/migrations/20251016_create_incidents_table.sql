-- Migration: Create incidents table
-- Date: 2025-10-16
-- Description: Creates the incidents table that is referenced in the incidents_with_property view but was missing
-- This migration reverse-engineers the schema based on the view definition and workflow usage

-- 1. Create incidents table
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  
  -- Titles in multiple languages
  title TEXT, -- Generic title field (for backward compatibility)
  title_spanish TEXT NOT NULL,
  title_english TEXT NOT NULL,
  
  -- Descriptions/body
  description TEXT, -- Generic description (for backward compatibility)
  conversation_body_spanish TEXT,
  conversation_body_english TEXT,
  
  -- Classification
  category TEXT NOT NULL CHECK (category IN ('maintenance', 'cleaning', 'general', 'other')),
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'cancelled')),
  
  -- Contact information
  phone_number TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  
  -- Metadata
  urgency_level INTEGER CHECK (urgency_level BETWEEN 1 AND 5), -- 1=low, 5=critical
  assigned_to UUID REFERENCES auth.users(id), -- For future assignment system
  notes TEXT, -- Internal notes
  metadata JSONB DEFAULT '{}' -- Additional flexible data
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_incidents_property_id ON public.incidents(property_id);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON public.incidents(category);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON public.incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_urgency ON public.incidents(urgency_level) WHERE urgency_level >= 4;

-- 3. Enable RLS
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Policy for SELECT
CREATE POLICY "Users can view incidents for their properties" ON public.incidents
  FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM public.properties 
      WHERE user_id = auth.uid()
    )
  );

-- Policy for INSERT
CREATE POLICY "Users can create incidents for their properties" ON public.incidents
  FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT id FROM public.properties 
      WHERE user_id = auth.uid()
    )
  );

-- Policy for UPDATE
CREATE POLICY "Users can update incidents for their properties" ON public.incidents
  FOR UPDATE
  USING (
    property_id IN (
      SELECT id FROM public.properties 
      WHERE user_id = auth.uid()
    )
  );

-- Policy for DELETE
CREATE POLICY "Users can delete incidents for their properties" ON public.incidents
  FOR DELETE
  USING (
    property_id IN (
      SELECT id FROM public.properties 
      WHERE user_id = auth.uid()
    )
  );

-- Service role can manage all incidents
CREATE POLICY "Service role can manage all incidents" ON public.incidents
  FOR ALL
  USING (auth.role() = 'service_role');

-- 5. Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_incidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Automatically set resolved_at when status changes to resolved
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at = NOW();
  END IF;
  
  -- Clear resolved_at if status changes away from resolved
  IF NEW.status != 'resolved' AND OLD.status = 'resolved' THEN
    NEW.resolved_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_incidents_timestamp
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_incidents_updated_at();

-- 6. Create helper function to calculate average resolution time
CREATE OR REPLACE FUNCTION public.get_incident_stats(
  p_property_id UUID DEFAULT NULL,
  p_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  total_incidents BIGINT,
  pending_incidents BIGINT,
  resolved_incidents BIGINT,
  avg_resolution_hours NUMERIC,
  critical_open_incidents BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_incidents,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_incidents,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved_incidents,
    AVG(
      EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600
    ) FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_hours,
    COUNT(*) FILTER (WHERE status != 'resolved' AND urgency_level >= 4) as critical_open_incidents
  FROM public.incidents
  WHERE 
    (p_property_id IS NULL OR property_id = p_property_id)
    AND (p_category IS NULL OR category = p_category);
END;
$$ LANGUAGE plpgsql;

-- 7. Recreate the incidents_with_property view (ensure it uses new table)
DROP VIEW IF EXISTS public.incidents_with_property;
CREATE VIEW public.incidents_with_property AS
SELECT 
  i.id,
  i.title,
  i.title_spanish,
  i.title_english,
  i.description,
  i.conversation_body_spanish,
  i.conversation_body_english,
  i.property_id,
  p.name as property_name,
  i.category,
  i.status,
  i.phone_number,
  i.urgency_level,
  i.assigned_to,
  i.notes,
  i.created_at as date, -- Alias for backward compatibility
  i.created_at,
  i.updated_at,
  i.resolved_at,
  i.metadata
FROM public.incidents i
LEFT JOIN public.properties p ON i.property_id = p.id;

-- 8. Add comments for documentation
COMMENT ON TABLE public.incidents IS 'Stores incidents/issues reported for properties via 11Labs or other channels';
COMMENT ON COLUMN public.incidents.title_spanish IS 'Incident title in Spanish (from AI translation)';
COMMENT ON COLUMN public.incidents.title_english IS 'Incident title in English (from AI translation)';
COMMENT ON COLUMN public.incidents.conversation_body_spanish IS 'Full conversation/description in Spanish';
COMMENT ON COLUMN public.incidents.conversation_body_english IS 'Full conversation/description in English';
COMMENT ON COLUMN public.incidents.category IS 'Type: maintenance (urgent repairs), cleaning, general, other';
COMMENT ON COLUMN public.incidents.status IS 'Current status: pending, in_progress, resolved, cancelled';
COMMENT ON COLUMN public.incidents.urgency_level IS 'Urgency from 1 (low) to 5 (critical emergency)';
COMMENT ON COLUMN public.incidents.phone_number IS 'Contact phone number of the guest reporting';
COMMENT ON COLUMN public.incidents.resolved_at IS 'Timestamp when incident was resolved (auto-set)';
COMMENT ON VIEW public.incidents_with_property IS 'View combining incidents with property names for frontend display';

-- 9. Grant permissions
GRANT ALL ON public.incidents TO authenticated;
GRANT ALL ON public.incidents TO service_role;
GRANT SELECT ON public.incidents_with_property TO authenticated;
GRANT SELECT ON public.incidents_with_property TO service_role;
GRANT EXECUTE ON FUNCTION public.get_incident_stats(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_incident_stats(UUID, TEXT) TO service_role;

