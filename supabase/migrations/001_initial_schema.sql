-- ============================================================================
-- POTRZEBNY.AI V3 - INITIAL DATABASE SCHEMA
-- ============================================================================
-- This migration creates all core tables for the Potrzebny.AI platform
-- Total: 11 tables with full indexes and constraints
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified TIMESTAMPTZ,
    password_hash VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'therapist', 'doctor', 'lecturer', 'parent')),
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- 2. PROFILES TABLE
-- ============================================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(200),
    avatar_url TEXT,
    phone VARCHAR(20),
    language VARCHAR(5) DEFAULT 'pl',
    timezone VARCHAR(50) DEFAULT 'Europe/Warsaw',
    notification_preferences JSONB DEFAULT '{
        "email_marketing": false,
        "email_updates": true,
        "email_security": true,
        "push_enabled": true,
        "sms_enabled": false
    }'::jsonb,
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step INTEGER DEFAULT 0,
    bio TEXT,
    website VARCHAR(255),
    social_links JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_display_name ON profiles(display_name);

-- ============================================================================
-- 3. SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL,
    panel_type VARCHAR(50) NOT NULL CHECK (panel_type IN (
        'educational', 'lecturer', 'patient', 'doctor', 'super-mozg',
        'parent-basic', 'parent-premium', 'teacher-admin', 'doctor-training-admin',
        'therapist-training-29', 'therapist-training-79', 'custom-content-admin',
        'platform-admin', 'gamification'
    )),
    status VARCHAR(30) NOT NULL DEFAULT 'trialing' CHECK (status IN (
        'trialing', 'active', 'past_due', 'canceled', 'incomplete',
        'incomplete_expired', 'paused', 'unpaid'
    )),
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMPTZ,
    price_pln INTEGER NOT NULL CHECK (price_pln >= 0),
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_sub_id ON subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_panel_type ON subscriptions(panel_type);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end);

-- ============================================================================
-- 4. PAYMENT METHODS TABLE
-- ============================================================================
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('card', 'blik', 'przelewy24', 'bank_transfer')),
    provider VARCHAR(30) NOT NULL CHECK (provider IN ('stripe', 'przelewy24')),
    stripe_payment_method_id VARCHAR(255) UNIQUE,
    last_four VARCHAR(4),
    brand VARCHAR(30),
    exp_month INTEGER CHECK (exp_month >= 1 AND exp_month <= 12),
    exp_year INTEGER CHECK (exp_year >= 2024),
    is_default BOOLEAN DEFAULT false,
    billing_name VARCHAR(255),
    billing_address JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(user_id, is_default) WHERE is_default = true;
CREATE INDEX idx_payment_methods_stripe_id ON payment_methods(stripe_payment_method_id) WHERE stripe_payment_method_id IS NOT NULL;

-- ============================================================================
-- 5. THERAPY NOTES TABLE (ENCRYPTED - GDPR Art. 9)
-- ============================================================================
CREATE TABLE therapy_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    therapist_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_date DATE NOT NULL,
    encrypted_content TEXT NOT NULL,
    encryption_iv VARCHAR(32) NOT NULL,
    encryption_tag VARCHAR(32) NOT NULL,
    mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    anxiety_level INTEGER CHECK (anxiety_level >= 1 AND anxiety_level <= 10),
    tags TEXT[] DEFAULT '{}',
    session_type VARCHAR(50) DEFAULT 'individual' CHECK (session_type IN ('individual', 'group', 'family', 'couples')),
    duration_minutes INTEGER CHECK (duration_minutes > 0),
    is_archived BOOLEAN DEFAULT false,
    is_shared_with_therapist BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_therapy_notes_patient_id ON therapy_notes(patient_user_id);
CREATE INDEX idx_therapy_notes_therapist_id ON therapy_notes(therapist_user_id) WHERE therapist_user_id IS NOT NULL;
CREATE INDEX idx_therapy_notes_session_date ON therapy_notes(patient_user_id, session_date DESC);
CREATE INDEX idx_therapy_notes_archived ON therapy_notes(patient_user_id, is_archived);
CREATE INDEX idx_therapy_notes_tags ON therapy_notes USING GIN(tags);

-- ============================================================================
-- 6. EDUCATIONAL CONTENT TABLE
-- ============================================================================
CREATE TABLE educational_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    description TEXT,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN (
        'course', 'lesson', 'article', 'video', 'quiz', 'flashcard_set', 'worksheet'
    )),
    panel_type VARCHAR(50) NOT NULL CHECK (panel_type IN (
        'educational', 'lecturer', 'patient', 'doctor', 'therapist'
    )),
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    estimated_duration_minutes INTEGER CHECK (estimated_duration_minutes > 0),
    content_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    flashcards JSONB DEFAULT '[]'::jsonb,
    quiz_data JSONB DEFAULT '{}'::jsonb,
    prerequisites UUID[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    thumbnail_url TEXT,
    video_url TEXT,
    is_published BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
    completion_count INTEGER DEFAULT 0 CHECK (completion_count >= 0),
    average_rating DECIMAL(3,2) CHECK (average_rating >= 0 AND average_rating <= 5),
    rating_count INTEGER DEFAULT 0 CHECK (rating_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

CREATE INDEX idx_educational_content_author ON educational_content(author_id);
CREATE INDEX idx_educational_content_slug ON educational_content(slug);
CREATE INDEX idx_educational_content_type ON educational_content(content_type);
CREATE INDEX idx_educational_content_panel ON educational_content(panel_type);
CREATE INDEX idx_educational_content_published ON educational_content(is_published, published_at DESC) WHERE is_published = true;
CREATE INDEX idx_educational_content_tags ON educational_content USING GIN(tags);
CREATE INDEX idx_educational_content_rating ON educational_content(average_rating DESC NULLS LAST) WHERE is_published = true;

-- ============================================================================
-- 7. USER CONTENT PROGRESS TABLE
-- ============================================================================
CREATE TABLE user_content_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES educational_content(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    time_spent_seconds INTEGER DEFAULT 0 CHECK (time_spent_seconds >= 0),
    quiz_score INTEGER CHECK (quiz_score >= 0 AND quiz_score <= 100),
    quiz_attempts INTEGER DEFAULT 0,
    notes TEXT,
    bookmarked BOOLEAN DEFAULT false,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, content_id)
);

CREATE INDEX idx_user_content_progress_user ON user_content_progress(user_id);
CREATE INDEX idx_user_content_progress_content ON user_content_progress(content_id);
CREATE INDEX idx_user_content_progress_completed ON user_content_progress(user_id, completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX idx_user_content_progress_bookmarked ON user_content_progress(user_id, bookmarked) WHERE bookmarked = true;

-- ============================================================================
-- 8. GAMIFICATION DATA TABLE
-- ============================================================================
CREATE TABLE gamification_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
    current_level INTEGER DEFAULT 1 CHECK (current_level >= 1),
    current_streak_days INTEGER DEFAULT 0 CHECK (current_streak_days >= 0),
    longest_streak_days INTEGER DEFAULT 0 CHECK (longest_streak_days >= 0),
    badges JSONB DEFAULT '[]'::jsonb,
    achievements JSONB DEFAULT '[]'::jsonb,
    daily_goals JSONB DEFAULT '{
        "learning_minutes": 30,
        "quizzes_completed": 1,
        "flashcards_reviewed": 20
    }'::jsonb,
    daily_goals_completed INTEGER DEFAULT 0 CHECK (daily_goals_completed >= 0),
    weekly_challenges_completed INTEGER DEFAULT 0 CHECK (weekly_challenges_completed >= 0),
    total_learning_minutes INTEGER DEFAULT 0 CHECK (total_learning_minutes >= 0),
    total_quizzes_completed INTEGER DEFAULT 0 CHECK (total_quizzes_completed >= 0),
    total_flashcards_reviewed INTEGER DEFAULT 0 CHECK (total_flashcards_reviewed >= 0),
    last_activity_date DATE,
    last_streak_check DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gamification_user ON gamification_data(user_id);
CREATE INDEX idx_gamification_xp ON gamification_data(total_xp DESC);
CREATE INDEX idx_gamification_level ON gamification_data(current_level DESC);
CREATE INDEX idx_gamification_streak ON gamification_data(current_streak_days DESC);

-- ============================================================================
-- 9. AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    request_id UUID,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity, created_at DESC);

-- Partition audit logs by month for performance
-- Note: Partitioning would be added in production for large-scale deployments

-- ============================================================================
-- 10. API KEYS TABLE
-- ============================================================================
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(12) NOT NULL,
    scopes TEXT[] NOT NULL DEFAULT '{}',
    rate_limit_per_minute INTEGER DEFAULT 60 CHECK (rate_limit_per_minute > 0),
    last_used_at TIMESTAMPTZ,
    last_used_ip INET,
    usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    revoked_at TIMESTAMPTZ,
    revoked_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_active ON api_keys(is_active, expires_at) WHERE is_active = true;

-- ============================================================================
-- 11. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'info', 'success', 'warning', 'error', 'achievement', 'reminder',
        'subscription', 'security', 'system', 'marketing'
    )),
    title VARCHAR(200) NOT NULL,
    body TEXT,
    action_url TEXT,
    action_label VARCHAR(100),
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    is_email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMPTZ,
    is_push_sent BOOLEAN DEFAULT false,
    push_sent_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read, created_at DESC) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(user_id, type);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================================================
-- 12. EMAIL TEMPLATES TABLE
-- ============================================================================
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    category VARCHAR(50) DEFAULT 'transactional' CHECK (category IN ('transactional', 'marketing', 'system')),
    language VARCHAR(5) DEFAULT 'pl',
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_templates_name ON email_templates(name);
CREATE INDEX idx_email_templates_category ON email_templates(category, is_active);

-- ============================================================================
-- 13. PASSWORD RESET TOKENS TABLE
-- ============================================================================
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_password_reset_user ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_expires ON password_reset_tokens(expires_at) WHERE used_at IS NULL;

-- ============================================================================
-- 14. EMAIL VERIFICATION TOKENS TABLE
-- ============================================================================
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_verification_user ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_expires ON email_verification_tokens(expires_at) WHERE verified_at IS NULL;

-- ============================================================================
-- 15. SESSIONS TABLE (for NextAuth)
-- ============================================================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires ON sessions(expires);

-- ============================================================================
-- 16. TRANSACTIONS TABLE (for payment history)
-- ============================================================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('subscription', 'one_time', 'refund', 'credit')),
    amount INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'PLN',
    status VARCHAR(30) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'disputed')),
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_invoice_id VARCHAR(255),
    payment_method_type VARCHAR(30),
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    failure_reason TEXT,
    refunded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_subscription ON transactions(subscription_id);
CREATE INDEX idx_transactions_status ON transactions(status, created_at DESC);
CREATE INDEX idx_transactions_stripe_pi ON transactions(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapy_notes_updated_at
    BEFORE UPDATE ON therapy_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_educational_content_updated_at
    BEFORE UPDATE ON educational_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_content_progress_updated_at
    BEFORE UPDATE ON user_content_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gamification_data_updated_at
    BEFORE UPDATE ON gamification_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate user level from XP
CREATE OR REPLACE FUNCTION calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Level formula: level = floor(sqrt(xp / 100)) + 1
    -- Level 1: 0-99 XP, Level 2: 100-399 XP, Level 3: 400-899 XP, etc.
    RETURN GREATEST(1, FLOOR(SQRT(xp / 100.0)) + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_last_activity DATE;
    v_today DATE := CURRENT_DATE;
    v_current_streak INTEGER;
    v_longest_streak INTEGER;
BEGIN
    SELECT last_activity_date, current_streak_days, longest_streak_days
    INTO v_last_activity, v_current_streak, v_longest_streak
    FROM gamification_data
    WHERE user_id = p_user_id;

    IF v_last_activity IS NULL THEN
        -- First activity
        UPDATE gamification_data
        SET current_streak_days = 1,
            longest_streak_days = GREATEST(longest_streak_days, 1),
            last_activity_date = v_today
        WHERE user_id = p_user_id;
    ELSIF v_last_activity = v_today THEN
        -- Already active today, no change
        NULL;
    ELSIF v_last_activity = v_today - 1 THEN
        -- Consecutive day, increment streak
        UPDATE gamification_data
        SET current_streak_days = current_streak_days + 1,
            longest_streak_days = GREATEST(longest_streak_days, current_streak_days + 1),
            last_activity_date = v_today
        WHERE user_id = p_user_id;
    ELSE
        -- Streak broken, reset to 1
        UPDATE gamification_data
        SET current_streak_days = 1,
            last_activity_date = v_today
        WHERE user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to add XP and update level
CREATE OR REPLACE FUNCTION add_user_xp(p_user_id UUID, p_xp INTEGER)
RETURNS TABLE(new_xp INTEGER, new_level INTEGER, level_up BOOLEAN) AS $$
DECLARE
    v_old_level INTEGER;
    v_new_level INTEGER;
    v_new_xp INTEGER;
BEGIN
    SELECT total_xp, current_level INTO v_new_xp, v_old_level
    FROM gamification_data
    WHERE user_id = p_user_id;

    v_new_xp := v_new_xp + p_xp;
    v_new_level := calculate_level(v_new_xp);

    UPDATE gamification_data
    SET total_xp = v_new_xp,
        current_level = v_new_level
    WHERE user_id = p_user_id;

    RETURN QUERY SELECT v_new_xp, v_new_level, (v_new_level > v_old_level);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL EMAIL TEMPLATES
-- ============================================================================
INSERT INTO email_templates (name, subject, body_html, body_text, variables, category) VALUES
('welcome', 'Witaj w Potrzebny.AI! {{first_name}}',
'<!DOCTYPE html><html><body><h1>Witaj {{first_name}}!</h1><p>Dziękujemy za dołączenie do Potrzebny.AI.</p><p>Twoje konto zostało utworzone. Zaloguj się aby rozpocząć.</p><a href="{{login_url}}">Zaloguj się</a></body></html>',
'Witaj {{first_name}}!\n\nDziękujemy za dołączenie do Potrzebny.AI.\n\nTwoje konto zostało utworzone. Zaloguj się aby rozpocząć:\n{{login_url}}',
ARRAY['first_name', 'login_url'], 'transactional'),

('email_verification', 'Potwierdź swój email - Potrzebny.AI',
'<!DOCTYPE html><html><body><h1>Potwierdź swój email</h1><p>Cześć {{first_name}},</p><p>Kliknij poniższy link aby potwierdzić swój email:</p><a href="{{verification_url}}">Potwierdź email</a><p>Link wygaśnie za 24 godziny.</p></body></html>',
'Cześć {{first_name}},\n\nKliknij poniższy link aby potwierdzić swój email:\n{{verification_url}}\n\nLink wygaśnie za 24 godziny.',
ARRAY['first_name', 'verification_url'], 'transactional'),

('password_reset', 'Resetowanie hasła - Potrzebny.AI',
'<!DOCTYPE html><html><body><h1>Resetowanie hasła</h1><p>Otrzymaliśmy prośbę o reset hasła dla Twojego konta.</p><p>Kliknij poniższy link aby ustawić nowe hasło:</p><a href="{{reset_url}}">Zresetuj hasło</a><p>Link wygaśnie za 1 godzinę.</p><p>Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość.</p></body></html>',
'Otrzymaliśmy prośbę o reset hasła dla Twojego konta.\n\nKliknij poniższy link aby ustawić nowe hasło:\n{{reset_url}}\n\nLink wygaśnie za 1 godzinę.\n\nJeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość.',
ARRAY['reset_url'], 'transactional'),

('subscription_created', 'Potwierdzenie subskrypcji - Potrzebny.AI',
'<!DOCTYPE html><html><body><h1>Dziękujemy za subskrypcję!</h1><p>Cześć {{first_name}},</p><p>Twoja subskrypcja planu {{plan_name}} została aktywowana.</p><p>Kwota: {{amount}} PLN / {{billing_cycle}}</p><p>Następne rozliczenie: {{next_billing_date}}</p></body></html>',
'Cześć {{first_name}},\n\nTwoja subskrypcja planu {{plan_name}} została aktywowana.\n\nKwota: {{amount}} PLN / {{billing_cycle}}\nNastępne rozliczenie: {{next_billing_date}}',
ARRAY['first_name', 'plan_name', 'amount', 'billing_cycle', 'next_billing_date'], 'transactional'),

('payment_failed', 'Problem z płatnością - Potrzebny.AI',
'<!DOCTYPE html><html><body><h1>Problem z płatnością</h1><p>Cześć {{first_name}},</p><p>Nie udało się pobrać płatności za Twoją subskrypcję.</p><p>Zaktualizuj metodę płatności aby uniknąć przerwy w dostępie.</p><a href="{{billing_url}}">Zaktualizuj płatność</a></body></html>',
'Cześć {{first_name}},\n\nNie udało się pobrać płatności za Twoją subskrypcję.\n\nZaktualizuj metodę płatności:\n{{billing_url}}',
ARRAY['first_name', 'billing_url'], 'transactional'),

('two_factor_enabled', 'Weryfikacja dwuetapowa włączona - Potrzebny.AI',
'<!DOCTYPE html><html><body><h1>2FA włączone</h1><p>Cześć {{first_name}},</p><p>Weryfikacja dwuetapowa została włączona dla Twojego konta.</p><p>Od teraz przy logowaniu będziesz potrzebować kodu z aplikacji uwierzytelniającej.</p></body></html>',
'Cześć {{first_name}},\n\nWeryfikacja dwuetapowa została włączona dla Twojego konta.\n\nOd teraz przy logowaniu będziesz potrzebować kodu z aplikacji uwierzytelniającej.',
ARRAY['first_name'], 'transactional'),

('login_alert', 'Nowe logowanie - Potrzebny.AI',
'<!DOCTYPE html><html><body><h1>Nowe logowanie</h1><p>Cześć {{first_name}},</p><p>Wykryliśmy nowe logowanie na Twoje konto:</p><ul><li>Czas: {{login_time}}</li><li>IP: {{ip_address}}</li><li>Urządzenie: {{device}}</li></ul><p>Jeśli to nie Ty, zmień hasło natychmiast.</p></body></html>',
'Cześć {{first_name}},\n\nWykryliśmy nowe logowanie na Twoje konto:\n\nCzas: {{login_time}}\nIP: {{ip_address}}\nUrządzenie: {{device}}\n\nJeśli to nie Ty, zmień hasło natychmiast.',
ARRAY['first_name', 'login_time', 'ip_address', 'device'], 'transactional');
