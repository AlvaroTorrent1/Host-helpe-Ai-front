-- supabase/migrations/20250109_create_data_deletion_requests.sql
-- Migration for data deletion requests tracking table
-- Supports Meta/Facebook data deletion callback requirements

-- Create enum for request status
CREATE TYPE deletion_request_status AS ENUM (
  'pending',
  'in_progress', 
  'completed',
  'denied',
  'error'
);

-- Create enum for request source
CREATE TYPE deletion_request_source AS ENUM (
  'email',
  'facebook_login',
  'phone', 
  'manual'
);

-- Create data deletion requests table
CREATE TABLE data_deletion_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Meta/Facebook specific fields
  facebook_user_id TEXT, -- App-scoped user ID from Meta
  signed_request_payload JSONB, -- Full signed request from Meta
  
  -- User identification
  email TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  phone TEXT,
  
  -- Request details
  confirmation_code TEXT UNIQUE NOT NULL,
  source deletion_request_source NOT NULL DEFAULT 'email',
  status deletion_request_status NOT NULL DEFAULT 'pending',
  
  -- Process tracking
  request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verification_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  
  -- Status information
  status_url TEXT, -- URL for Meta callback response
  human_readable_status TEXT,
  denial_reason TEXT, -- If status is 'denied'
  
  -- Additional metadata
  ip_address INET,
  user_agent TEXT,
  additional_data JSONB DEFAULT '{}',
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_data_deletion_confirmation_code ON data_deletion_requests(confirmation_code);
CREATE INDEX idx_data_deletion_facebook_user_id ON data_deletion_requests(facebook_user_id);
CREATE INDEX idx_data_deletion_email ON data_deletion_requests(email);
CREATE INDEX idx_data_deletion_status ON data_deletion_requests(status);
CREATE INDEX idx_data_deletion_source ON data_deletion_requests(source);
CREATE INDEX idx_data_deletion_created_at ON data_deletion_requests(created_at);

-- Function to generate confirmation codes
CREATE OR REPLACE FUNCTION generate_deletion_confirmation_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate format: DEL-YYYY-XXXXXXXX (where X is alphanumeric)
    code := 'DEL-' || EXTRACT(YEAR FROM NOW()) || '-' || 
            upper(substring(encode(gen_random_bytes(6), 'base64') from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(
      SELECT 1 FROM data_deletion_requests WHERE confirmation_code = code
    ) INTO exists_check;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to update human readable status
CREATE OR REPLACE FUNCTION update_deletion_request_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update human readable status based on current status
  CASE NEW.status
    WHEN 'pending' THEN
      NEW.human_readable_status := 'Your data deletion request has been received and is pending verification.';
    WHEN 'in_progress' THEN
      NEW.human_readable_status := 'Your data deletion request is being processed. Data is being removed from our systems.';
    WHEN 'completed' THEN
      NEW.human_readable_status := 'Your data deletion request has been completed successfully. All personal data has been removed.';
    WHEN 'denied' THEN
      NEW.human_readable_status := 'Your data deletion request has been denied. Reason: ' || COALESCE(NEW.denial_reason, 'Please contact support for details.');
    WHEN 'error' THEN
      NEW.human_readable_status := 'There was an error processing your data deletion request. Please contact support.';
  END CASE;
  
  -- Update timestamp
  NEW.updated_at := NOW();
  
  -- Set completion date when completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completion_date := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic status updates
CREATE TRIGGER trigger_update_deletion_request_status
  BEFORE UPDATE ON data_deletion_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_deletion_request_status();

-- Function to automatically set confirmation code
CREATE OR REPLACE FUNCTION set_confirmation_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confirmation_code IS NULL OR NEW.confirmation_code = '' THEN
    NEW.confirmation_code := generate_deletion_confirmation_code();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic confirmation code generation
CREATE TRIGGER trigger_set_confirmation_code
  BEFORE INSERT ON data_deletion_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_confirmation_code();

-- Enable RLS (Row Level Security)
ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own requests
CREATE POLICY "Users can view their own deletion requests" ON data_deletion_requests
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.email() = email
  );

-- Service role can access all records (for admin/system operations)
CREATE POLICY "Service role can manage all deletion requests" ON data_deletion_requests
  FOR ALL USING (auth.role() = 'service_role');

-- Anonymous users can check status by confirmation code (for Meta callback URL)
CREATE POLICY "Anonymous can check status by confirmation code" ON data_deletion_requests
  FOR SELECT USING (true); -- We'll handle this in the Edge Function

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON data_deletion_requests TO authenticated;
GRANT SELECT ON data_deletion_requests TO anon;

-- Insert sample data for testing (remove in production)
-- INSERT INTO data_deletion_requests (
--   email,
--   source,
--   facebook_user_id,
--   status
-- ) VALUES (
--   'test@example.com',
--   'email',
--   NULL,
--   'pending'
-- ); 