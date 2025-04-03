/*
  # Create Call History Table

  1. New Tables
    - `call_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `ai_agent_id` (uuid, references ai_agents)
      - `property_id` (uuid, references properties)
      - `caller_number` (text)
      - `call_timestamp` (timestamptz)
      - `duration_seconds` (integer)
      - `status` (text)
      - `recording_url` (text)
      - `summary` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Indexes
    - `user_id`
    - `ai_agent_id`
    - `property_id`
    - `call_timestamp`

  3. Security
    - Enable RLS
    - Add policy for users to read their own calls
*/

-- Create the call_history table
CREATE TABLE IF NOT EXISTS call_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ai_agent_id uuid REFERENCES ai_agents(id) ON DELETE SET NULL,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  caller_number text NOT NULL,
  call_timestamp timestamptz NOT NULL DEFAULT now(),
  duration_seconds integer,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'missed', 'failed', 'in-progress')),
  recording_url text,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS call_history_user_id_idx ON call_history(user_id);
CREATE INDEX IF NOT EXISTS call_history_ai_agent_id_idx ON call_history(ai_agent_id);
CREATE INDEX IF NOT EXISTS call_history_property_id_idx ON call_history(property_id);
CREATE INDEX IF NOT EXISTS call_history_call_timestamp_idx ON call_history(call_timestamp);

-- Enable Row Level Security
ALTER TABLE call_history ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own calls
CREATE POLICY "Users can read own calls"
  ON call_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_call_history_updated_at
  BEFORE UPDATE ON call_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();