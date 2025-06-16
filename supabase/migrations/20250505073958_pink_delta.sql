/*
  # Add foreign key relationship between items and profiles

  1. Changes
    - Add foreign key constraint between items.user_id and profiles.id
    - This enables proper joins between items and profiles tables
*/

-- Add foreign key constraint
ALTER TABLE items
ADD CONSTRAINT items_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;