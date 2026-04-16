-- 010: Función get_leaderboard() con SECURITY DEFINER.
-- Motivo: RLS en predictions restringe SELECT al dueño. Una VIEW normal rompería
-- el COUNT/FILTER para otros usuarios. Con SECURITY DEFINER + función STABLE,
-- Postgres puede cachear el plan y bypassear RLS de forma controlada.

CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  team TEXT,
  total_points INT,
  correct_exact INT,
  correct_winner INT,
  matches_played INT,
  champion_bonus INT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH champion AS (
    SELECT value AS code FROM app_config WHERE key = 'champion_code' LIMIT 1
  ),
  champion_points AS (
    SELECT points FROM scoring_rules
    WHERE rule_type = 'champion' AND is_active = true
    LIMIT 1
  )
  SELECT
    u.id AS user_id,
    u.display_name,
    u.avatar_url,
    u.team,
    (COALESCE(SUM(s.points_earned), 0)
      + CASE
          WHEN u.champion_code IS NOT NULL
            AND u.champion_code = (SELECT code FROM champion)
          THEN COALESCE((SELECT points FROM champion_points), 0)
          ELSE 0
        END
    )::INT AS total_points,
    COUNT(s.id) FILTER (
      WHERE p.home_score = m.home_score
        AND p.away_score = m.away_score
    )::INT AS correct_exact,
    COUNT(s.id) FILTER (
      WHERE NOT (p.home_score = m.home_score AND p.away_score = m.away_score)
        AND SIGN(p.home_score - p.away_score) = SIGN(m.home_score - m.away_score)
    )::INT AS correct_winner,
    COUNT(s.id)::INT AS matches_played,
    (CASE
      WHEN u.champion_code IS NOT NULL
        AND u.champion_code = (SELECT code FROM champion)
      THEN COALESCE((SELECT points FROM champion_points), 0)
      ELSE 0
    END)::INT AS champion_bonus
  FROM app_users u
  LEFT JOIN scores s ON s.user_id = u.id
  LEFT JOIN predictions p ON p.id = s.prediction_id
  LEFT JOIN matches m ON m.id = s.match_id AND m.status = 'finished'
  GROUP BY u.id, u.display_name, u.avatar_url, u.team, u.champion_code
  ORDER BY total_points DESC, correct_exact DESC, u.display_name ASC;
$$;

GRANT EXECUTE ON FUNCTION get_leaderboard() TO authenticated;
GRANT EXECUTE ON FUNCTION get_leaderboard() TO anon;
