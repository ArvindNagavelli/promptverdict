-- User API Keys table
CREATE TABLE IF NOT EXISTS user_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'gemini')),
  encrypted_key TEXT NOT NULL,
  masked_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, provider)
);

-- Prompt Tests table
CREATE TABLE IF NOT EXISTS prompt_tests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  system_prompt TEXT,
  results JSONB NOT NULL DEFAULT '[]',
  providers TEXT[] NOT NULL,
  models JSONB NOT NULL DEFAULT '{}',
  temperature FLOAT DEFAULT 1.0,
  max_tokens INTEGER DEFAULT 1024,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_tests ENABLE ROW LEVEL SECURITY;

-- RLS policies (service role bypasses these)
CREATE POLICY "Users can view own API keys" ON user_api_keys
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own tests" ON prompt_tests
  FOR SELECT USING (auth.uid()::text = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prompt_tests_user_id ON prompt_tests (user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_tests_created_at ON prompt_tests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys (user_id);
