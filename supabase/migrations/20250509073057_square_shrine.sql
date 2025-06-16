/*
  # Fix jobs-profiles relationship

  1. Changes
    - Add foreign key constraint between jobs and profiles
    - Enable proper joining between jobs and user profiles
*/

-- Drop existing foreign key if it exists
ALTER TABLE jobs
DROP CONSTRAINT IF EXISTS jobs_user_id_fkey;

-- Add the foreign key constraint
ALTER TABLE jobs
ADD CONSTRAINT jobs_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;