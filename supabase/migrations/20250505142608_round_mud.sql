/*
  # Add services-profiles relationship

  1. Changes
    - Add foreign key constraint between services and profiles
    - Enable proper joining between services and user profiles
*/

-- Drop existing foreign key if it exists
ALTER TABLE services
DROP CONSTRAINT IF EXISTS services_profiles_fkey;

-- Add the foreign key constraint
ALTER TABLE services
ADD CONSTRAINT services_profiles_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;