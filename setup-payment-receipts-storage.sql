-- Create storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', true);

-- Set up RLS policy for payment receipts
CREATE POLICY "Anyone can view payment receipts" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-receipts');

CREATE POLICY "Students can upload payment receipts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'payment-receipts' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage payment receipts" ON storage.objects
  FOR ALL USING (bucket_id = 'payment-receipts' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
