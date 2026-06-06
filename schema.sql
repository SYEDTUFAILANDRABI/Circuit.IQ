-- circuits table
CREATE TABLE circuits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  circuit_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON circuits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- exp. logs data
CREATE TABLE experiment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  circuit_id UUID NOT NULL REFERENCES circuits(id) ON DELETE CASCADE,
  experiment_type TEXT NOT NULL,
  results JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- user profile details
 CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  university TEXT,
  semester TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Security
-- Enable RLS
ALTER TABLE circuits ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_logs ENABLE ROW LEVEL SECURITY;

-- circuits policies
CREATE POLICY "Users can view own circuits"
  ON circuits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own circuits"
  ON circuits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own circuits"
  ON circuits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own circuits"
  ON circuits FOR DELETE
  USING (auth.uid() = user_id);

-- experiment_logs policies
CREATE POLICY "Users can view own experiment logs"
  ON experiment_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own experiment logs"
  ON experiment_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiment logs"
  ON experiment_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own experiment logs"
  ON experiment_logs FOR DELETE
  USING (auth.uid() = user_id);


-- test data
-- Create a fake user in auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'aisha.test@circuitiq.com',
  'fake-password-hash',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  'authenticated',
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- Insert test data into your tables
DO $$
DECLARE
  fake_user_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  fake_circuit_id UUID := 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
BEGIN

  INSERT INTO profiles (id, full_name, university, semester, created_at)
  VALUES (fake_user_id, 'Aisha Rahman', 'NUST', 'Fall 2025', NOW());

  INSERT INTO circuits (id, user_id, name, description, circuit_data, created_at, updated_at)
  VALUES (
    fake_circuit_id, fake_user_id,
    'Basic Series Circuit',
    'A simple series circuit demonstrating Ohms Law.',
    '{"components": [{"type": "battery", "voltage": 9}, {"type": "resistor", "resistance": 470}], "connections": "series"}'::jsonb,
    NOW(), NOW()
  );

  INSERT INTO experiment_logs (id, user_id, circuit_id, experiment_type, results, created_at)
  VALUES (
    gen_random_uuid(), fake_user_id, fake_circuit_id,
    'Ohms Law',
    '{"voltage": 9, "resistance": 470, "current_mA": 19.15, "status": "success"}'::jsonb,
    NOW()
  );

END $$;


-- verify test
SELECT * FROM circuits;
SELECT * FROM experiment_logs;
SELECT * FROM profiles;
