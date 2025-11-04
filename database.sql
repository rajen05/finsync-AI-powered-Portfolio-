-- =============================================
-- FinSync Investment Portfolio Database Schema
-- Database: Supabase (PostgreSQL)
-- =============================================

-- =============================================
-- 1. PROFILES TABLE
-- Extends Supabase auth.users with additional user information
-- =============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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

-- =============================================
-- 2. TRANSACTIONS TABLE
-- Stores all buy/sell transactions for each user
-- =============================================
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticker TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('Stock', 'Crypto', 'ETF', 'Bond', 'Other')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('Buy', 'Sell')),
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  price NUMERIC NOT NULL CHECK (price > 0),
  date DATE NOT NULL,
  broker TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for better query performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_ticker ON transactions(user_id, ticker);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions" 
  ON transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" 
  ON transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" 
  ON transactions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" 
  ON transactions FOR DELETE 
  USING (auth.uid() = user_id);

-- =============================================
-- 3. WISHLIST TABLE
-- Stores tickers users are watching/interested in
-- =============================================
CREATE TABLE wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticker TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('Stock', 'Crypto', 'ETF', 'Bond', 'Other')),
  target_price NUMERIC CHECK (target_price > 0),
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, ticker)
);

-- Indexes
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_wishlist_ticker ON wishlist(ticker);

-- Enable Row Level Security
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wishlist
CREATE POLICY "Users can view own wishlist" 
  ON wishlist FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist items" 
  ON wishlist FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wishlist items" 
  ON wishlist FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items" 
  ON wishlist FOR DELETE 
  USING (auth.uid() = user_id);

-- =============================================
-- 4. USER PREFERENCES TABLE
-- Stores user settings and preferences
-- =============================================
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  default_currency TEXT DEFAULT 'USD',
  default_broker TEXT,
  notifications_enabled BOOLEAN DEFAULT true,
  price_alerts_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences" 
  ON user_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" 
  ON user_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" 
  ON user_preferences FOR UPDATE 
  USING (auth.uid() = user_id);

-- =============================================
-- 5. PRICE ALERTS TABLE
-- Stores price alert conditions for wishlist items
-- =============================================
CREATE TABLE price_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticker TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('above', 'below')),
  target_price NUMERIC NOT NULL CHECK (target_price > 0),
  is_active BOOLEAN DEFAULT true,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_price_alerts_user_active ON price_alerts(user_id, is_active);
CREATE INDEX idx_price_alerts_ticker_active ON price_alerts(ticker, is_active);

-- Enable Row Level Security
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for price_alerts
CREATE POLICY "Users can view own price alerts" 
  ON price_alerts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own price alerts" 
  ON price_alerts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own price alerts" 
  ON price_alerts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own price alerts" 
  ON price_alerts FOR DELETE 
  USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_updated_at BEFORE UPDATE ON wishlist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTION: Auto-create profile on user signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    now(),
    now()
  );
  
  INSERT INTO public.user_preferences (user_id, created_at, updated_at)
  VALUES (
    NEW.id,
    now(),
    now()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile and preferences on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- NOTES FOR SUPABASE SETUP
-- =============================================
-- 1. Copy and paste this entire file into Supabase SQL Editor
-- 2. Run the script to create all tables, indexes, and policies
-- 3. Enable Email Auth in Supabase Authentication settings
-- 4. Configure email templates (optional)
-- 5. Get your Supabase URL and anon key from Project Settings > API
-- 6. Add to your .env.local:
--    VITE_SUPABASE_URL=your-project-url
--    VITE_SUPABASE_ANON_KEY=your-anon-key
-- =============================================
