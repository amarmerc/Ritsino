-- ============================================
-- RITSINO — PL/pgSQL Functions
-- ============================================

-- Process a spin: deduct bet, add win, record history
CREATE OR REPLACE FUNCTION fn_process_spin(
    p_user_id INTEGER,
    p_bet_amount INTEGER,
    p_result JSONB,
    p_win_amount INTEGER
) RETURNS TABLE(new_points INTEGER, rescued BOOLEAN) AS $$
DECLARE
    v_current_points INTEGER;
    v_new_points INTEGER;
    v_rescued BOOLEAN := FALSE;
BEGIN
    -- Get current points with lock
    SELECT points INTO v_current_points
    FROM users
    WHERE id = p_user_id
    FOR UPDATE;

    IF v_current_points IS NULL THEN
        RAISE EXCEPTION 'User not found: %', p_user_id;
    END IF;

    IF v_current_points < p_bet_amount THEN
        RAISE EXCEPTION 'Insufficient points. Have: %, Need: %', v_current_points, p_bet_amount;
    END IF;

    -- Calculate new points
    v_new_points := v_current_points - p_bet_amount + p_win_amount;

    -- Update user
    UPDATE users SET
        points = v_new_points,
        total_spins = total_spins + 1,
        total_won = total_won + p_win_amount,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Record in history
    INSERT INTO game_history (user_id, bet_amount, result, win_amount)
    VALUES (p_user_id, p_bet_amount, p_result, p_win_amount);

    -- Rescue if points reached 0
    IF v_new_points <= 0 THEN
        UPDATE users SET points = 1000, updated_at = NOW()
        WHERE id = p_user_id;
        v_new_points := 1000;
        v_rescued := TRUE;
    END IF;

    RETURN QUERY SELECT v_new_points, v_rescued;
END;
$$ LANGUAGE plpgsql;


-- Ranking of users within a university
CREATE OR REPLACE FUNCTION fn_ranking_university(
    p_university_id INTEGER,
    p_limit INTEGER DEFAULT 50
) RETURNS TABLE(
    rank BIGINT,
    user_id INTEGER,
    username VARCHAR,
    points INTEGER,
    total_spins INTEGER,
    total_won INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DENSE_RANK() OVER (ORDER BY u.points DESC)::BIGINT AS rank,
        u.id AS user_id,
        u.username,
        u.points,
        u.total_spins,
        u.total_won
    FROM users u
    WHERE u.university_id = p_university_id
    ORDER BY u.points DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;


-- Global ranking of all users
CREATE OR REPLACE FUNCTION fn_ranking_global(
    p_limit INTEGER DEFAULT 50
) RETURNS TABLE(
    rank BIGINT,
    user_id INTEGER,
    username VARCHAR,
    points INTEGER,
    university_acronym VARCHAR,
    total_spins INTEGER,
    total_won INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DENSE_RANK() OVER (ORDER BY u.points DESC)::BIGINT AS rank,
        u.id AS user_id,
        u.username,
        u.points,
        un.acronym AS university_acronym,
        u.total_spins,
        u.total_won
    FROM users u
    JOIN universities un ON u.university_id = un.id
    ORDER BY u.points DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;


-- Ranking of universities by total points
CREATE OR REPLACE FUNCTION fn_ranking_universities()
RETURNS TABLE(
    rank BIGINT,
    university_id INTEGER,
    acronym VARCHAR,
    full_name VARCHAR,
    total_points BIGINT,
    member_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DENSE_RANK() OVER (ORDER BY SUM(u.points) DESC)::BIGINT AS rank,
        un.id AS university_id,
        un.acronym,
        un.full_name,
        COALESCE(SUM(u.points), 0)::BIGINT AS total_points,
        COUNT(u.id)::BIGINT AS member_count
    FROM universities un
    LEFT JOIN users u ON u.university_id = un.id
    GROUP BY un.id, un.acronym, un.full_name
    HAVING COUNT(u.id) > 0
    ORDER BY total_points DESC;
END;
$$ LANGUAGE plpgsql;


-- Get user rank in their university
CREATE OR REPLACE FUNCTION fn_user_university_rank(p_user_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    v_rank INTEGER;
    v_university_id INTEGER;
BEGIN
    SELECT university_id INTO v_university_id FROM users WHERE id = p_user_id;
    
    SELECT r.rank::INTEGER INTO v_rank
    FROM (
        SELECT u.id, DENSE_RANK() OVER (ORDER BY u.points DESC) AS rank
        FROM users u
        WHERE u.university_id = v_university_id
    ) r
    WHERE r.id = p_user_id;
    
    RETURN COALESCE(v_rank, 0);
END;
$$ LANGUAGE plpgsql;
