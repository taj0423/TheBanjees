ALTER TABLE nominations
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS nominee_display TEXT,
  ADD COLUMN IF NOT EXISTS vote_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS nominations_status_idx ON nominations (status);
CREATE INDEX IF NOT EXISTS nominations_category_idx ON nominations (category);
