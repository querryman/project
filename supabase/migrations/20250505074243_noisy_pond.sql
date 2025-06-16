/*
  # Fix items foreign key relationship

  1. Changes
    - Drop existing foreign key constraint that references auth.users
    - Add new foreign key constraint referencing profiles table
*/

-- First drop the existing foreign key constraint
ALTER TABLE items
DROP CONSTRAINT IF EXISTS items_user_id_fkey;

-- Add the new foreign key constraint
ALTER TABLE items
ADD CONSTRAINT items_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;