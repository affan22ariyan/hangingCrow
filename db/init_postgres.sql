
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT DEFAULT 'user',
  parent_id UUID,
  agent_code TEXT UNIQUE,
  phone TEXT,
  ewallet_balance NUMERIC(18,4) DEFAULT 0,
  turnover NUMERIC(18,4) DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS commissions_config (
  id SERIAL PRIMARY KEY,
  owner_subadmin_id UUID,
  type TEXT NOT NULL,
  percent NUMERIC(8,4) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY,
  user_id UUID,
  type TEXT,
  amount NUMERIC(18,4),
  meta JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bets (
  id UUID PRIMARY KEY,
  user_id UUID,
  market_id TEXT,
  selection TEXT,
  stake NUMERIC(18,4),
  price NUMERIC(12,4),
  status TEXT DEFAULT 'pending',
  placed_at TIMESTAMP DEFAULT now(),
  settled_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS commission_logs (
  id SERIAL PRIMARY KEY,
  to_user_id UUID,
  from_user_id UUID,
  type TEXT,
  percent NUMERIC(8,4),
  amount NUMERIC(18,4),
  meta JSONB,
  created_at TIMESTAMP DEFAULT now()
);
