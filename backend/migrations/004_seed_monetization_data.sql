-- =============================================
-- SEED DATA: Monetization (bypasses RLS)
-- =============================================

CREATE OR REPLACE FUNCTION seed_monetization_data(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO creator_status (user_id, is_monetization_enabled, is_verified, enabled_at)
  VALUES (p_user_id, true, true, NOW())
  ON CONFLICT (user_id) DO UPDATE SET is_monetization_enabled = true, is_verified = true, enabled_at = NOW();

  INSERT INTO subscription_tiers (creator_id, name, price_bdt, badge_tier, perks_description)
  VALUES
    (p_user_id, 'Bronze', 99, 'bronze', '🔒 এক্সক্লুসিভ পোস্ট + আর্লি অ্যাক্সেস'),
    (p_user_id, 'Silver', 249, 'silver', '🎬 লাইভ সেশন + Q&A + ব্যাজ'),
    (p_user_id, 'Gold', 599, 'gold', '⭐ সব কিছু + সরাসরি মেসেজ + শাউটআউট');

  INSERT INTO transactions (creator_id, type, amount_bdt, status, created_at)
  VALUES
    (p_user_id, 'ad_revenue',   2140, 'completed', NOW() - INTERVAL '2 days'),
    (p_user_id, 'subscription', 1797, 'completed', NOW() - INTERVAL '3 days'),
    (p_user_id, 'gift',          890, 'completed', NOW() - INTERVAL '4 days'),
    (p_user_id, 'subscription',  500, 'completed', NOW() - INTERVAL '5 days'),
    (p_user_id, 'ad_revenue',   1940, 'completed', NOW() - INTERVAL '7 days'),
    (p_user_id, 'gift',          350, 'completed', NOW() - INTERVAL '8 days'),
    (p_user_id, 'subscription', 2490, 'completed', NOW() - INTERVAL '10 days'),
    (p_user_id, 'ad_revenue',   1800, 'completed', NOW() - INTERVAL '12 days'),
    (p_user_id, 'payout',      -5000, 'completed', NOW() - INTERVAL '14 days'),
    (p_user_id, 'ad_revenue',   2200, 'completed', NOW() - INTERVAL '15 days'),
    (p_user_id, 'gift',          670, 'completed', NOW() - INTERVAL '18 days'),
    (p_user_id, 'subscription', 1200, 'completed', NOW() - INTERVAL '20 days'),
    (p_user_id, 'ad_revenue',   1500, 'completed', NOW() - INTERVAL '22 days'),
    (p_user_id, 'ad_revenue',   1900, 'completed', NOW() - INTERVAL '25 days'),
    (p_user_id, 'gift',          430, 'completed', NOW() - INTERVAL '28 days');

  INSERT INTO transactions (creator_id, type, amount_bdt, status, created_at)
  VALUES
    (p_user_id, 'ad_revenue',   850, 'pending', NOW() - INTERVAL '1 day'),
    (p_user_id, 'subscription', 599, 'pending', NOW());
END;
$$;

-- Run with sohelsokal@gmail.com UUID
SELECT seed_monetization_data('f350d605-7223-44a0-bc65-165ab095dffe');

DROP FUNCTION seed_monetization_data(UUID);
