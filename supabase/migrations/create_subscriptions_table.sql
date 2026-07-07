-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('weekly', 'monthly', 'yearly')),
  price INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('gpay', 'upi')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id TEXT,
  google_drive_link TEXT,
  daily_downloads_used INTEGER DEFAULT 0,
  daily_limit INTEGER NOT NULL,
  subscription_start TIMESTAMPTZ DEFAULT NOW(),
  subscription_end TIMESTAMPTZ,
  last_download_reset DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create downloads table to track individual PSD downloads
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_brand TEXT DEFAULT 'ramarts',
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  download_date DATE DEFAULT CURRENT_DATE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(payment_status);
CREATE INDEX IF NOT EXISTS idx_downloads_subscription ON downloads(subscription_id);
CREATE INDEX IF NOT EXISTS idx_downloads_date ON downloads(download_date);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "select_own_subscriptions" ON subscriptions FOR SELECT
  TO authenticated USING (auth.uid()::text = email OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "insert_subscriptions" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "update_own_subscriptions" ON subscriptions FOR UPDATE
  TO authenticated USING (auth.uid()::text = email OR auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for downloads
CREATE POLICY "select_own_downloads" ON downloads FOR SELECT
  TO authenticated USING (
    subscription_id IN (SELECT id FROM subscriptions WHERE email = auth.uid()::text)
    OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "insert_downloads" ON downloads FOR INSERT
  TO authenticated WITH CHECK (true);

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();