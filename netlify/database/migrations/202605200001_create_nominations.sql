CREATE TABLE IF NOT EXISTS nominations (
  id TEXT PRIMARY KEY,
  nominator_name TEXT NOT NULL,
  nominator_contact TEXT NOT NULL,
  answers JSONB NOT NULL,
  video_key TEXT,
  video_filename TEXT,
  video_content_type TEXT,
  video_size_bytes INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
