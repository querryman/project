/*
  # Add notifications system

  1. New Tables
    - `notifications` - For storing user notifications
    
  2. Security
    - Enable RLS
    - Add appropriate policies
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_id UUID,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Create function to create notification on interest
CREATE OR REPLACE FUNCTION create_interest_notification()
RETURNS TRIGGER AS $$
DECLARE
  item_owner_id UUID;
  item_title TEXT;
BEGIN
  -- Get item owner and title for item interests
  IF NEW.listing_type = 'item' THEN
    SELECT user_id, title INTO item_owner_id, item_title
    FROM items WHERE id = NEW.listing_id;
    
    -- Create notification for item owner
    INSERT INTO notifications (user_id, type, title, message, reference_id)
    VALUES (
      item_owner_id,
      'interest',
      'New Interest in Your Item',
      'Someone is interested in your item: ' || item_title,
      NEW.listing_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for notifications
CREATE TRIGGER on_interest_created
  AFTER INSERT ON interests
  FOR EACH ROW
  EXECUTE FUNCTION create_interest_notification();