/*
  # Add transcript column to call_history table

  1. Changes
    - Add `transcript` column of type JSONB to store structured transcript data
    - Column is nullable since not all calls will have transcripts
    - Using JSONB for flexible transcript storage with segments, speakers, timestamps

  2. Structure
    The transcript column will store data in this format:
    {
      "segments": [
        {
          "speaker": "agent" | "caller",
          "text": "string",
          "start_time": number,
          "end_time": number
        }
      ]
    }
*/

-- Add transcript column to call_history table
ALTER TABLE public.call_history
ADD COLUMN transcript jsonb;

-- Add comment explaining the column's purpose and structure
COMMENT ON COLUMN public.call_history.transcript IS 'Stores the call transcript as a structured JSONB object with segments containing speaker, text, and timestamps';