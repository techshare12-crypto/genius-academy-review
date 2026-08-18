-- ==============================================================================
-- GENIUS ACADEMY REVIEW ASSISTANT — SUPABASE DATABASE SCHEMA
-- ==============================================================================

-- 1. Table: review_generation_history
-- Stores all generated review drafts permanently to guarantee global uniqueness.
CREATE TABLE IF NOT EXISTS review_generation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course TEXT NOT NULL,
    review_text TEXT NOT NULL,
    review_normalized TEXT NOT NULL,
    review_hash TEXT NOT NULL UNIQUE,
    variation INTEGER DEFAULT 0,
    provider TEXT,
    status TEXT DEFAULT 'generated',
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast course lookups and chronological ordering
CREATE INDEX IF NOT EXISTS idx_review_history_course ON review_generation_history(course);
CREATE INDEX IF NOT EXISTS idx_review_history_created_at ON review_generation_history(created_at DESC);

-- 2. Table: private_feedback
-- Stores private feedback from student ratings for internal institute improvement.
CREATE TABLE IF NOT EXISTS private_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    course TEXT NOT NULL,
    feedback TEXT,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for feedback filtering, rating analytics, and chronological ordering
CREATE INDEX IF NOT EXISTS idx_private_feedback_course ON private_feedback(course);
CREATE INDEX IF NOT EXISTS idx_private_feedback_rating ON private_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_private_feedback_created_at ON private_feedback(created_at DESC);

-- 3. Row Level Security (RLS) Configuration
-- Protects data from direct unauthorized client-side / public browser access.
ALTER TABLE review_generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_feedback ENABLE ROW LEVEL SECURITY;

-- Service role policies: full backend access
CREATE POLICY "Enable full access for service role on review_generation_history"
    ON review_generation_history
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable full access for service role on private_feedback"
    ON private_feedback
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
