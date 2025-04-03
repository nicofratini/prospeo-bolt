/*
  # Create Tags and Call Tags Tables

  1. New Tables
    - `tags`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `color` (text, optional)
      - `created_at` (timestamptz)
    - `call_tags`
      - `call_id` (uuid, references call_history)
      - `tag_id` (uuid, references tags)
      - `user_id` (uuid, references auth.users)
      - `assigned_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for user access
    - Add necessary indexes for performance

  3. Changes
    - Add foreign key constraints
    - Add unique constraint on user_id + name for tags
    - Add composite primary key for call_tags
*/

-- Create tags table
CREATE TABLE public.tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    color text NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, name)
);

-- Create indexes for tags
CREATE INDEX idx_tags_user_id ON public.tags(user_id);

-- Enable RLS on tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Add comment to tags table
COMMENT ON TABLE public.tags IS 'Stores user-defined tags for classifying calls or other items.';

-- Create policy for tags
CREATE POLICY "Users can manage their own tags"
    ON public.tags
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create call_tags table
CREATE TABLE public.call_tags (
    call_id uuid NOT NULL REFERENCES public.call_history(id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (call_id, tag_id)
);

-- Create indexes for call_tags
CREATE INDEX idx_call_tags_call_id ON public.call_tags(call_id);
CREATE INDEX idx_call_tags_tag_id ON public.call_tags(tag_id);
CREATE INDEX idx_call_tags_user_id ON public.call_tags(user_id);

-- Enable RLS on call_tags
ALTER TABLE public.call_tags ENABLE ROW LEVEL SECURITY;

-- Add comment to call_tags table
COMMENT ON TABLE public.call_tags IS 'Junction table linking calls with their assigned tags.';

-- Create policy for call_tags
CREATE POLICY "Users can manage tags on their own calls"
    ON public.call_tags
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);