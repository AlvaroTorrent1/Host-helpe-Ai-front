-- Migration: Create plan limits and user status function
-- Purpose: Support freemium model with plan-based limitations

-- Create plan_limits table
CREATE TABLE IF NOT EXISTS public.plan_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id TEXT NOT NULL UNIQUE,
  max_properties INTEGER NOT NULL,
  max_reservations_per_month INTEGER NOT NULL,
  max_documents_per_property INTEGER DEFAULT 10,
  max_images_per_property INTEGER DEFAULT 20,
  can_access_analytics BOOLEAN DEFAULT false,
  can_export_data BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plan limits
INSERT INTO public.plan_limits (plan_id, max_properties, max_reservations_per_month, max_documents_per_property, max_images_per_property, can_access_analytics, can_export_data) 
VALUES
  ('free', 1, 10, 5, 10, false, false),
  ('basic', 5, 100, 20, 50, true, false),
  ('pro', -1, -1, -1, -1, true, true), -- -1 means unlimited
  ('enterprise', -1, -1, -1, -1, true, true)
ON CONFLICT (plan_id) DO NOTHING;

-- Create function to get user status with all permissions and usage
CREATE OR REPLACE FUNCTION public.get_user_status(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan_id TEXT;
  v_subscription_status TEXT;
  v_plan_limits JSONB;
  v_property_count INTEGER;
  v_reservation_count INTEGER;
  v_current_month DATE;
BEGIN
  -- Get current month start
  v_current_month := date_trunc('month', CURRENT_DATE)::DATE;
  
  -- Get user's subscription status and plan
  SELECT 
    COALESCE(cs.plan_id, 'free') as plan_id,
    COALESCE(cs.status, 'free') as status
  INTO v_plan_id, v_subscription_status
  FROM auth.users u
  LEFT JOIN public.customer_subscriptions cs 
    ON u.id = cs.user_id 
    AND cs.status = 'active'
  WHERE u.id = p_user_id
  LIMIT 1;
  
  -- If no active subscription found, user is on free plan
  IF v_plan_id IS NULL THEN
    v_plan_id := 'free';
    v_subscription_status := 'free';
  END IF;
  
  -- Get plan limits
  SELECT jsonb_build_object(
    'maxProperties', max_properties,
    'maxReservationsPerMonth', max_reservations_per_month,
    'maxDocumentsPerProperty', max_documents_per_property,
    'maxImagesPerProperty', max_images_per_property,
    'canAccessAnalytics', can_access_analytics,
    'canExportData', can_export_data
  )
  INTO v_plan_limits
  FROM public.plan_limits
  WHERE plan_id = v_plan_id;
  
  -- Count user's current properties
  SELECT COUNT(*)
  INTO v_property_count
  FROM public.properties
  WHERE user_id = p_user_id;
  
  -- Count user's reservations for current month
  SELECT COUNT(*)
  INTO v_reservation_count
  FROM public.reservations r
  INNER JOIN public.properties p ON r.property_id = p.id
  WHERE p.user_id = p_user_id
    AND r.created_at >= v_current_month
    AND r.created_at < v_current_month + INTERVAL '1 month';
  
  -- Build and return the complete status object
  RETURN jsonb_build_object(
    'userId', p_user_id,
    'planId', v_plan_id,
    'subscriptionStatus', v_subscription_status,
    'limits', v_plan_limits,
    'usage', jsonb_build_object(
      'properties', v_property_count,
      'reservationsThisMonth', v_reservation_count,
      'currentMonth', v_current_month
    ),
    'permissions', jsonb_build_object(
      'canCreateProperty', 
        CASE 
          WHEN (v_plan_limits->>'maxProperties')::INTEGER = -1 THEN true
          WHEN v_property_count < (v_plan_limits->>'maxProperties')::INTEGER THEN true
          ELSE false
        END,
      'canCreateReservation',
        CASE
          WHEN (v_plan_limits->>'maxReservationsPerMonth')::INTEGER = -1 THEN true
          WHEN v_reservation_count < (v_plan_limits->>'maxReservationsPerMonth')::INTEGER THEN true
          ELSE false
        END,
      'canAccessAnalytics', (v_plan_limits->>'canAccessAnalytics')::BOOLEAN,
      'canExportData', (v_plan_limits->>'canExportData')::BOOLEAN
    )
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_status(UUID) TO authenticated;

-- Add RLS policies for plan_limits table
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

-- Everyone can read plan limits (public information)
CREATE POLICY "Anyone can view plan limits" 
  ON public.plan_limits FOR SELECT 
  USING (true);

-- Only admins can modify plan limits (implement admin check as needed)
CREATE POLICY "Only admins can modify plan limits" 
  ON public.plan_limits FOR ALL 
  USING (false)
  WITH CHECK (false);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON public.reservations(created_at);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_user_status ON public.customer_subscriptions(user_id, status); 