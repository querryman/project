-- Create a storage bucket for item images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('item-images', 'item-images', true);

-- Allow authenticated users to upload files to the item-images bucket
CREATE POLICY "Authenticated users can upload item images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'item-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to read item images
CREATE POLICY "Public users can view item images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'item-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'item-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);