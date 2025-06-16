/*
  # Add foreign key relationship for services table

  1. Changes
    - Add foreign key constraint between services.user_id and auth.users.id
    - This enables proper joins between services and profiles tables
*/

-- Drop existing foreign key if it exists
ALTER TABLE services
DROP CONSTRAINT IF EXISTS services_user_id_fkey;

-- Add the foreign key constraint
ALTER TABLE services
ADD CONSTRAINT services_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;