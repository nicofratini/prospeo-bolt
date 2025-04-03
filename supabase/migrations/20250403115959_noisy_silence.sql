/*
  # Create AI Agents Table

  1. New Tables
    - `ai_agents`
      - `id` (uuid, primary key) - Unique identifier for the agent
      - `user_id` (uuid) - Reference to auth.users, unique constraint ensures one agent per user
      - `agent_name` (text) - Name of the agent
      - `elevenlabs_voice_id` (text) - ID of the selected ElevenLabs voice
      - `system_prompt` (text) - System prompt for the agent
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `ai_agents` table
    - Add policies for:
      - SELECT: Users can read their own agent
      - INSERT: Users can create their own agent
      - UPDATE: Users can update their own agent

  3. Indexes
    - Index on `user_id` for faster lookups
*/

-- Create the ai_agents table
CREATE TABLE IF NOT EXISTS ai_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_name text,
  elevenlabs_voice_id text NOT NULL,
  system_prompt text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_agent UNIQUE (user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS ai_agents_user_id_idx ON ai_agents(user_id);

-- Enable Row Level Security
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own agent"
  ON ai_agents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own agent"
  ON ai_agents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agent"
  ON ai_agents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_agents_updated_at
  BEFORE UPDATE ON ai_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();