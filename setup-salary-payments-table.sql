-- Create salary_payments_new table for teacher salary management
CREATE TABLE IF NOT EXISTS salary_payments_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2030),
  total_classes INTEGER NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  bonus_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  final_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_amount + bonus_amount) STORED,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  payment_date TIMESTAMP WITH TIME ZONE NULL,
  created_by UUID REFERENCES profiles(id),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to prevent duplicate salary records for same teacher/month/year
CREATE UNIQUE INDEX IF NOT EXISTS unique_teacher_salary_month_year 
ON salary_payments_new (teacher_id, month, year);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_salary_payments_teacher_id ON salary_payments_new (teacher_id);
CREATE INDEX IF NOT EXISTS idx_salary_payments_status ON salary_payments_new (status);
CREATE INDEX IF NOT EXISTS idx_salary_payments_month_year ON salary_payments_new (month, year);

-- Enable RLS (Row Level Security)
ALTER TABLE salary_payments_new ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admin can manage all salary payments" ON salary_payments_new
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Teachers can view their own salary payments" ON salary_payments_new
FOR SELECT USING (
  teacher_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_salary_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_salary_payments_updated_at_trigger
BEFORE UPDATE ON salary_payments_new
FOR EACH ROW
EXECUTE FUNCTION update_salary_payments_updated_at();

-- Insert some sample data (optional)
-- INSERT INTO salary_payments_new (teacher_id, month, year, total_classes, total_amount, bonus_amount, status, admin_notes)
-- SELECT 
--   id as teacher_id,
--   11 as month,
--   2024 as year,
--   20 as total_classes,
--   2000.00 as total_amount,
--   200.00 as bonus_amount,
--   'paid' as status,
--   'Sample salary record' as admin_notes
-- FROM profiles 
-- WHERE role = 'teacher' 
-- LIMIT 1;
