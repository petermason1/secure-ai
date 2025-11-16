-- MERGE: Tier 2 Sales Agent Tables
-- Merges Sales Agent schema with existing leads/audit_logs tables

-- Add missing columns to existing leads table (if they don't exist)
DO $$ 
BEGIN
  -- Add job_id if it doesn't exist (for Sales Agent compatibility)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'job_id'
  ) THEN
    ALTER TABLE leads ADD COLUMN job_id TEXT UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_leads_job_id ON leads(job_id);
  END IF;

  -- Add company_context if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'company_context'
  ) THEN
    ALTER TABLE leads ADD COLUMN company_context TEXT;
  END IF;

  -- Add lead_score if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'lead_score'
  ) THEN
    ALTER TABLE leads ADD COLUMN lead_score INTEGER;
  END IF;

  -- Add final_status if it doesn't exist (Sales Agent uses this)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'final_status'
  ) THEN
    ALTER TABLE leads ADD COLUMN final_status TEXT CHECK (final_status IN ('COMPLETE', 'FAILED', 'PENDING', 'PROCESSING'));
  END IF;

  -- Add crm_opportunity_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'crm_opportunity_id'
  ) THEN
    ALTER TABLE leads ADD COLUMN crm_opportunity_id TEXT;
  END IF;

  -- Add email_sent if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'email_sent'
  ) THEN
    ALTER TABLE leads ADD COLUMN email_sent BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Enhance audit_logs table (add Sales Agent specific columns if needed)
DO $$
BEGIN
  -- Add job_id if it doesn't exist (for Sales Agent compatibility)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'job_id'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN job_id TEXT;
    CREATE INDEX IF NOT EXISTS idx_audit_logs_job_id ON audit_logs(job_id);
  END IF;

  -- Add step if it doesn't exist (Sales Agent uses this)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'step'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN step TEXT;
  END IF;

  -- Add log_date if it doesn't exist (for partitioning)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'log_date'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN log_date DATE GENERATED ALWAYS AS (DATE(created_at)) STORED;
    CREATE INDEX IF NOT EXISTS idx_audit_logs_log_date ON audit_logs(log_date);
  END IF;

  -- Add is_success if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'is_success'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN is_success BOOLEAN;
  END IF;
END $$;

-- Create get_job_status function (for Sales Agent)
CREATE OR REPLACE FUNCTION get_job_status(p_job_id TEXT)
RETURNS JSON AS $$
DECLARE
  final_status TEXT;
  last_log_details TEXT;
BEGIN
  -- Determine final status (based on the last log entry for a final state)
  SELECT
    CASE
      WHEN step = 'EXECUTION_FINAL_STATUS' AND is_success = TRUE THEN 'COMPLETE'
      WHEN step = 'EXECUTION_FINAL_STATUS' AND is_success = FALSE THEN 'FAILED'
      WHEN step = 'FATAL_EXCEPTION' THEN 'FAILED'
      ELSE 'PROCESSING'
    END
  INTO final_status
  FROM audit_logs
  WHERE job_id = p_job_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Get the most recent log message
  SELECT details::text INTO last_log_details
  FROM audit_logs
  WHERE job_id = p_job_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no final status is found, assume it's still PROCESSING
  IF final_status IS NULL THEN
    final_status := 'TRIGGERED';
  END IF;

  -- Return the status and the last log for the frontend
  RETURN json_build_object(
    'status', final_status,
    'last_log', COALESCE(last_log_details, 'Job has been accepted and is waiting to run.')
  );
END;
$$ LANGUAGE plpgsql;

