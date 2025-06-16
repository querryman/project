/*
  # Tradex Database Schema

  1. New Tables
    - `profiles` - Extended user profile data
    - `items` - For buy/sell marketplace listings
    - `jobs` - For job postings
    - `services` - For service offerings
    - `interests` - Tracks user interest in listings
    - `currencies` - Currency data for conversions
  
  2. Security
    - Enable RLS on all tables
    - Add policies for CRUD operations
    - Set up appropriate permissions
*/

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  bio TEXT,
  location TEXT,
  preferred_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create items table for buy/sell marketplace
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency_code TEXT DEFAULT 'USD',
  category TEXT NOT NULL,
  condition TEXT,
  images TEXT[] DEFAULT '{}',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active'
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  salary DECIMAL(10, 2),
  currency_code TEXT DEFAULT 'USD',
  location TEXT,
  job_type TEXT NOT NULL,
  company TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active'
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency_code TEXT DEFAULT 'USD',
  category TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active'
);

-- Create interests table (for tracking who's interested in listings)
CREATE TABLE IF NOT EXISTS interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_type TEXT NOT NULL, -- 'item', 'job', or 'service'
  listing_id UUID NOT NULL,
  interested_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  contact_info TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create currencies table (for currency conversion)
CREATE TABLE IF NOT EXISTS currencies (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  conversion_rate_to_usd DECIMAL(10, 6) NOT NULL
);

-- Insert some common currencies
INSERT INTO currencies (code, name, symbol, conversion_rate_to_usd)
VALUES
  ('USD', 'US Dollar', '$', 1),
  ('EUR', 'Euro', '€', 0.91),
  ('GBP', 'British Pound', '£', 0.78),
  ('JPY', 'Japanese Yen', '¥', 110.54),
  ('CAD', 'Canadian Dollar', 'C$', 1.35),
  ('AUD', 'Australian Dollar', 'A$', 1.45)
ON CONFLICT (code) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for items
CREATE POLICY "Items are viewable by everyone"
  ON items FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for jobs
CREATE POLICY "Jobs are viewable by everyone"
  ON jobs FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs"
  ON jobs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for services
CREATE POLICY "Services are viewable by everyone"
  ON services FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own services"
  ON services FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services"
  ON services FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own services"
  ON services FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for interests
CREATE POLICY "Interests are viewable by related users"
  ON interests FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM items WHERE id = listing_id AND listing_type = 'item'
      UNION
      SELECT user_id FROM jobs WHERE id = listing_id AND listing_type = 'job'
      UNION
      SELECT user_id FROM services WHERE id = listing_id AND listing_type = 'service'
    )
    OR
    auth.uid() = interested_user_id
  );

CREATE POLICY "Users can insert their own interests"
  ON interests FOR INSERT
  WITH CHECK (auth.uid() = interested_user_id);

CREATE POLICY "Users can update their own interests"
  ON interests FOR UPDATE
  USING (auth.uid() = interested_user_id);

CREATE POLICY "Users can delete their own interests"
  ON interests FOR DELETE
  USING (auth.uid() = interested_user_id);

-- RLS Policies for currencies
CREATE POLICY "Currencies are viewable by everyone"
  ON currencies FOR SELECT
  USING (true);

-- Function to trigger updated_at for any table with that column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_items_updated_at
BEFORE UPDATE ON items
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to create a profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'username', 
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for creating profile after signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();