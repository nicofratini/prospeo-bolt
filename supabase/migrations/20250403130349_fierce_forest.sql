/*
  # Add onboarding completion tracking

  1. Changes
    - Add `onboarding_completed` boolean column to `users` table
    - Set default value to false
    - Add index for faster queries

  2. Notes
    - This column will be used to track whether a user has completed the onboarding process
    - The default false value ensures new users will be directed to onboarding
*/

-- Add onboarding_completed column with default false
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS users_onboarding_completed_idx 
ON users (onboarding_completed);