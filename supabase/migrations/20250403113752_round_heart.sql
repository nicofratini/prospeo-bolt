/*
  # Create properties table

  1. New Tables
    - `properties`
      - `id` (uuid, primary key) - Unique identifier for the property
      - `user_id` (uuid, foreign key) - Reference to the property owner
      - `name` (text) - Property name/title
      - `address` (text) - Property address
      - `property_type` (text) - Type of property (e.g., 'Maison', 'Appartement')
      - `status` (text) - Property status ('active', 'inactive', 'sold')
      - `price` (numeric) - Property price
      - `description` (text) - Detailed property description
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Indexes
    - Index on `user_id` for faster lookups of user's properties
    - Index on `status` for filtering by property status
    - Index on `property_type` for filtering by type

  3. Security
    - Enable RLS on `properties` table
    - Add policies for:
      - SELECT: Users can read their own properties
      - INSERT: Users can create properties (with user_id set to their ID)
      - UPDATE: Users can update their own properties
      - DELETE: Users can delete their own properties
*/

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  property_type text,
  status text DEFAULT 'active',
  price numeric,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Add constraints
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'sold')),
  CONSTRAINT valid_property_type CHECK (property_type IN ('Maison', 'Appartement'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS properties_user_id_idx ON properties(user_id);
CREATE INDEX IF NOT EXISTS properties_status_idx ON properties(status);
CREATE INDEX IF NOT EXISTS properties_property_type_idx ON properties(property_type);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read own properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties"
  ON properties
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();