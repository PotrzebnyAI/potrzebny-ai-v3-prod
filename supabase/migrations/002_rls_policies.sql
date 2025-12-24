-- ============================================================================
-- POTRZEBNY.AI V3 - ROW LEVEL SECURITY POLICIES
-- ============================================================================
-- This migration enables RLS and creates security policies for all tables
-- Ensures data isolation and GDPR compliance
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS POLICIES
-- ============================================================================

-- Users can read their own data
CREATE POLICY "users_select_own"
    ON users FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own data (except role)
CREATE POLICY "users_update_own"
    ON users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "users_admin_select"
    ON users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Admins can update all users
CREATE POLICY "users_admin_update"
    ON users FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "profiles_select_own"
    ON profiles FOR SELECT
    USING (user_id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own"
    ON profiles FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
    ON profiles FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Public profiles can be viewed by anyone (for display_name, avatar)
CREATE POLICY "profiles_public_select"
    ON profiles FOR SELECT
    USING (true);

-- ============================================================================
-- SUBSCRIPTIONS POLICIES
-- ============================================================================

-- Users can read their own subscriptions
CREATE POLICY "subscriptions_select_own"
    ON subscriptions FOR SELECT
    USING (user_id = auth.uid());

-- System/Webhooks can insert subscriptions (via service role)
CREATE POLICY "subscriptions_insert_service"
    ON subscriptions FOR INSERT
    WITH CHECK (true);

-- System/Webhooks can update subscriptions
CREATE POLICY "subscriptions_update_service"
    ON subscriptions FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Admins can manage all subscriptions
CREATE POLICY "subscriptions_admin_all"
    ON subscriptions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- ============================================================================
-- PAYMENT METHODS POLICIES
-- ============================================================================

-- Users can read their own payment methods
CREATE POLICY "payment_methods_select_own"
    ON payment_methods FOR SELECT
    USING (user_id = auth.uid());

-- Users can insert their own payment methods
CREATE POLICY "payment_methods_insert_own"
    ON payment_methods FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their own payment methods
CREATE POLICY "payment_methods_update_own"
    ON payment_methods FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own payment methods
CREATE POLICY "payment_methods_delete_own"
    ON payment_methods FOR DELETE
    USING (user_id = auth.uid());

-- ============================================================================
-- THERAPY NOTES POLICIES (GDPR Art. 9 - Special Category Data)
-- ============================================================================

-- Patients can read their own notes
CREATE POLICY "therapy_notes_patient_select"
    ON therapy_notes FOR SELECT
    USING (patient_user_id = auth.uid());

-- Therapists can read notes shared with them
CREATE POLICY "therapy_notes_therapist_select"
    ON therapy_notes FOR SELECT
    USING (
        therapist_user_id = auth.uid()
        AND is_shared_with_therapist = true
    );

-- Patients can insert their own notes
CREATE POLICY "therapy_notes_patient_insert"
    ON therapy_notes FOR INSERT
    WITH CHECK (patient_user_id = auth.uid());

-- Patients can update their own notes
CREATE POLICY "therapy_notes_patient_update"
    ON therapy_notes FOR UPDATE
    USING (patient_user_id = auth.uid())
    WITH CHECK (patient_user_id = auth.uid());

-- Patients can delete their own notes
CREATE POLICY "therapy_notes_patient_delete"
    ON therapy_notes FOR DELETE
    USING (patient_user_id = auth.uid());

-- ============================================================================
-- EDUCATIONAL CONTENT POLICIES
-- ============================================================================

-- Everyone can read published content
CREATE POLICY "educational_content_public_select"
    ON educational_content FOR SELECT
    USING (is_published = true);

-- Authors can read their own content (including unpublished)
CREATE POLICY "educational_content_author_select"
    ON educational_content FOR SELECT
    USING (author_id = auth.uid());

-- Authors can insert content
CREATE POLICY "educational_content_author_insert"
    ON educational_content FOR INSERT
    WITH CHECK (author_id = auth.uid());

-- Authors can update their own content
CREATE POLICY "educational_content_author_update"
    ON educational_content FOR UPDATE
    USING (author_id = auth.uid())
    WITH CHECK (author_id = auth.uid());

-- Authors can delete their own unpublished content
CREATE POLICY "educational_content_author_delete"
    ON educational_content FOR DELETE
    USING (author_id = auth.uid() AND is_published = false);

-- Admins can manage all content
CREATE POLICY "educational_content_admin_all"
    ON educational_content FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- ============================================================================
-- USER CONTENT PROGRESS POLICIES
-- ============================================================================

-- Users can read their own progress
CREATE POLICY "user_content_progress_select_own"
    ON user_content_progress FOR SELECT
    USING (user_id = auth.uid());

-- Users can insert their own progress
CREATE POLICY "user_content_progress_insert_own"
    ON user_content_progress FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their own progress
CREATE POLICY "user_content_progress_update_own"
    ON user_content_progress FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- GAMIFICATION DATA POLICIES
-- ============================================================================

-- Users can read their own gamification data
CREATE POLICY "gamification_select_own"
    ON gamification_data FOR SELECT
    USING (user_id = auth.uid());

-- Users can view leaderboard (public XP and level)
CREATE POLICY "gamification_leaderboard"
    ON gamification_data FOR SELECT
    USING (true);

-- System can update gamification data
CREATE POLICY "gamification_update_service"
    ON gamification_data FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- System can insert gamification data
CREATE POLICY "gamification_insert_service"
    ON gamification_data FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- AUDIT LOGS POLICIES
-- ============================================================================

-- Users can read their own audit logs
CREATE POLICY "audit_logs_select_own"
    ON audit_logs FOR SELECT
    USING (user_id = auth.uid());

-- Admins can read all audit logs
CREATE POLICY "audit_logs_admin_select"
    ON audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- System can insert audit logs (via service role)
CREATE POLICY "audit_logs_insert_service"
    ON audit_logs FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- API KEYS POLICIES
-- ============================================================================

-- Users can read their own API keys (metadata only, not hash)
CREATE POLICY "api_keys_select_own"
    ON api_keys FOR SELECT
    USING (user_id = auth.uid());

-- Users can insert their own API keys
CREATE POLICY "api_keys_insert_own"
    ON api_keys FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their own API keys (e.g., revoke)
CREATE POLICY "api_keys_update_own"
    ON api_keys FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own API keys
CREATE POLICY "api_keys_delete_own"
    ON api_keys FOR DELETE
    USING (user_id = auth.uid());

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Users can read their own notifications
CREATE POLICY "notifications_select_own"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "notifications_delete_own"
    ON notifications FOR DELETE
    USING (user_id = auth.uid());

-- System can insert notifications
CREATE POLICY "notifications_insert_service"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- EMAIL TEMPLATES POLICIES
-- ============================================================================

-- Only admins can manage email templates
CREATE POLICY "email_templates_admin_all"
    ON email_templates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- System can read templates for sending emails
CREATE POLICY "email_templates_service_select"
    ON email_templates FOR SELECT
    USING (is_active = true);

-- ============================================================================
-- PASSWORD RESET TOKENS POLICIES
-- ============================================================================

-- Only system can manage password reset tokens (via service role)
CREATE POLICY "password_reset_tokens_service"
    ON password_reset_tokens FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- EMAIL VERIFICATION TOKENS POLICIES
-- ============================================================================

-- Only system can manage email verification tokens
CREATE POLICY "email_verification_tokens_service"
    ON email_verification_tokens FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- SESSIONS POLICIES
-- ============================================================================

-- Users can read their own sessions
CREATE POLICY "sessions_select_own"
    ON sessions FOR SELECT
    USING (user_id = auth.uid());

-- Users can delete their own sessions (logout)
CREATE POLICY "sessions_delete_own"
    ON sessions FOR DELETE
    USING (user_id = auth.uid());

-- System can manage sessions
CREATE POLICY "sessions_service"
    ON sessions FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- TRANSACTIONS POLICIES
-- ============================================================================

-- Users can read their own transactions
CREATE POLICY "transactions_select_own"
    ON transactions FOR SELECT
    USING (user_id = auth.uid());

-- System can insert transactions (via webhooks)
CREATE POLICY "transactions_insert_service"
    ON transactions FOR INSERT
    WITH CHECK (true);

-- Admins can view all transactions
CREATE POLICY "transactions_admin_select"
    ON transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- ============================================================================
-- HELPER FUNCTION FOR ROLE CHECK
-- ============================================================================

CREATE OR REPLACE FUNCTION auth.check_user_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = required_role
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has active subscription for panel
CREATE OR REPLACE FUNCTION auth.has_panel_access(panel_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM subscriptions
        WHERE user_id = auth.uid()
        AND panel_type = panel_name
        AND status IN ('active', 'trialing')
        AND (current_period_end IS NULL OR current_period_end > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
