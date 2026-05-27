-- =============================================================
-- Don Pedro — Supabase Setup Completo
-- Pegar y ejecutar en: Supabase Dashboard → SQL Editor
-- Proyecto: rtqcfhrjimjjbomxlcxu
-- =============================================================

BEGIN;

-- ============================================================
-- 1. SCHEMA — Tablas, índices, RLS
-- ============================================================

-- 001: Tablas base
CREATE TABLE app_users (
  id UUID PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'admin')),
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  flag_url TEXT NOT NULL DEFAULT '',
  group_letter TEXT NOT NULL
);

CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  home_team_id INT NOT NULL REFERENCES teams(id),
  away_team_id INT NOT NULL REFERENCES teams(id),
  stage TEXT NOT NULL DEFAULT 'group',
  group_label TEXT,
  match_date TIMESTAMPTZ NOT NULL,
  venue TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'finished')),
  home_score INT,
  away_score INT
);

CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id),
  match_id INT NOT NULL REFERENCES matches(id),
  home_score INT NOT NULL CHECK (home_score >= 0),
  away_score INT NOT NULL CHECK (away_score >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

CREATE TABLE scoring_rules (
  id SERIAL PRIMARY KEY,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('exact', 'winner_and_diff', 'winner_only')),
  label TEXT NOT NULL,
  points INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id),
  match_id INT NOT NULL REFERENCES matches(id),
  prediction_id UUID NOT NULL REFERENCES predictions(id),
  points_earned INT NOT NULL DEFAULT 0,
  UNIQUE(user_id, match_id)
);

CREATE TABLE prizes (
  id SERIAL PRIMARY KEY,
  position INT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO scoring_rules (rule_type, label, points) VALUES
  ('exact', 'Resultado exacto', 10),
  ('winner_and_diff', 'Ganador + diferencia de goles', 5),
  ('winner_only', 'Solo ganador', 3);

CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_match ON predictions(match_id);
CREATE INDEX idx_scores_user ON scores(user_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);

-- 002: RLS policies
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teams_read" ON teams FOR SELECT USING (true);
CREATE POLICY "matches_read" ON matches FOR SELECT USING (true);
CREATE POLICY "matches_admin_update" ON matches FOR UPDATE USING (
  EXISTS (SELECT 1 FROM app_users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "predictions_read_own" ON predictions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "predictions_insert_own" ON predictions FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (SELECT 1 FROM matches WHERE id = match_id AND status = 'scheduled' AND match_date > NOW())
);
CREATE POLICY "predictions_update_own" ON predictions FOR UPDATE USING (
  user_id = auth.uid()
  AND EXISTS (SELECT 1 FROM matches WHERE id = match_id AND status = 'scheduled' AND match_date > NOW())
);
CREATE POLICY "scoring_rules_read" ON scoring_rules FOR SELECT USING (true);
CREATE POLICY "scoring_rules_admin" ON scoring_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM app_users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "scores_read" ON scores FOR SELECT USING (true);
CREATE POLICY "prizes_read" ON prizes FOR SELECT USING (true);
CREATE POLICY "prizes_admin" ON prizes FOR ALL USING (
  EXISTS (SELECT 1 FROM app_users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "config_read" ON app_config FOR SELECT USING (true);
CREATE POLICY "config_admin" ON app_config FOR ALL USING (
  EXISTS (SELECT 1 FROM app_users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "users_read_own" ON app_users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_admin_read" ON app_users FOR SELECT USING (
  EXISTS (SELECT 1 FROM app_users WHERE id = auth.uid() AND role = 'admin')
);

-- 006: avatar_url en app_users
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS avatar_url TEXT;


-- 008: tv_channel en matches (solo ALTER, sin UPDATE)
ALTER TABLE matches ADD COLUMN IF NOT EXISTS tv_channel TEXT;

-- 009: internal_teams + team/champion columns (schema only)
-- 009: internal_teams + app_users.team + app_users.champion_code + RLS + índices
-- Defensiva: usa IF NOT EXISTS porque parte de esto ya existe en prod.

-- 1. Tabla de equipos internos del cliente
CREATE TABLE IF NOT EXISTS internal_teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT 'SoccerBall',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE internal_teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "internal_teams_read" ON internal_teams;
CREATE POLICY "internal_teams_read" ON internal_teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "internal_teams_admin" ON internal_teams;
CREATE POLICY "internal_teams_admin" ON internal_teams FOR ALL USING (
  EXISTS (SELECT 1 FROM app_users WHERE id = auth.uid() AND role = 'admin')
);

-- 2. Columnas en app_users
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS team TEXT;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS champion_code TEXT REFERENCES teams(code);
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS champion_locked_at TIMESTAMPTZ;

-- 3. app_users: permitir al user leerse a sí mismo. NO hay UPDATE policy,
-- así que los cambios pasan por el service role en las rutas API.
-- El SELECT de admin ya está en 002_rls_policies.sql.

-- 4. Índices de performance (el leaderboard y sync hacen joins masivos)
CREATE INDEX IF NOT EXISTS idx_app_users_team ON app_users(team);
CREATE INDEX IF NOT EXISTS idx_app_users_champion ON app_users(champion_code);
CREATE INDEX IF NOT EXISTS idx_scores_points ON scores(points_earned) WHERE points_earned > 0;
CREATE INDEX IF NOT EXISTS idx_matches_stage ON matches(stage);

-- 5. Scoring rule para acertar campeón (si no existe)
INSERT INTO scoring_rules (rule_type, label, points, is_active)
SELECT 'champion', 'Acertar al campeón', 50, true
WHERE NOT EXISTS (SELECT 1 FROM scoring_rules WHERE rule_type = 'champion');

-- 6. Actualizar el CHECK constraint de scoring_rules para incluir 'champion'
ALTER TABLE scoring_rules DROP CONSTRAINT IF EXISTS scoring_rules_rule_type_check;
ALTER TABLE scoring_rules ADD CONSTRAINT scoring_rules_rule_type_check
  CHECK (rule_type IN ('exact', 'winner_and_diff', 'winner_only', 'champion'));


-- 010: leaderboard function
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


-- ============================================================
-- 2. DATA — Equipos y partidos del Mundial 2026
-- ============================================================

-- Teams (48 selecciones)
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (49, 'México', 'MEX', 'https://flagcdn.com/w80/mx.png', 'A') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (50, 'Sudáfrica', 'RSA', 'https://flagcdn.com/w80/za.png', 'A') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (51, 'Corea del Sur', 'KOR', 'https://flagcdn.com/w80/kr.png', 'A') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (52, 'República Checa', 'CZE', 'https://flagcdn.com/w80/cz.png', 'A') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (53, 'Canadá', 'CAN', 'https://flagcdn.com/w80/ca.png', 'B') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (54, 'Bosnia y Herzegovina', 'BIH', 'https://flagcdn.com/w80/ba.png', 'B') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (55, 'Qatar', 'QAT', 'https://flagcdn.com/w80/qa.png', 'B') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (56, 'Suiza', 'SUI', 'https://flagcdn.com/w80/ch.png', 'B') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (57, 'Brasil', 'BRA', 'https://flagcdn.com/w80/br.png', 'C') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (58, 'Marruecos', 'MAR', 'https://flagcdn.com/w80/ma.png', 'C') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (59, 'Haití', 'HAI', 'https://flagcdn.com/w80/ht.png', 'C') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (60, 'Escocia', 'SCO', 'https://flagcdn.com/w80/gb-sct.png', 'C') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (61, 'Estados Unidos', 'USA', 'https://flagcdn.com/w80/us.png', 'D') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (62, 'Paraguay', 'PAR', 'https://flagcdn.com/w80/py.png', 'D') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (63, 'Australia', 'AUS', 'https://flagcdn.com/w80/au.png', 'D') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (64, 'Turquía', 'TUR', 'https://flagcdn.com/w80/tr.png', 'D') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (65, 'Alemania', 'GER', 'https://flagcdn.com/w80/de.png', 'E') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (66, 'Curazao', 'CUW', 'https://flagcdn.com/w80/cw.png', 'E') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (67, 'Costa de Marfil', 'CIV', 'https://flagcdn.com/w80/ci.png', 'E') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (68, 'Ecuador', 'ECU', 'https://flagcdn.com/w80/ec.png', 'E') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (69, 'Países Bajos', 'NED', 'https://flagcdn.com/w80/nl.png', 'F') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (70, 'Japón', 'JPN', 'https://flagcdn.com/w80/jp.png', 'F') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (71, 'Suecia', 'SWE', 'https://flagcdn.com/w80/se.png', 'F') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (72, 'Túnez', 'TUN', 'https://flagcdn.com/w80/tn.png', 'F') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (73, 'Bélgica', 'BEL', 'https://flagcdn.com/w80/be.png', 'G') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (74, 'Egipto', 'EGY', 'https://flagcdn.com/w80/eg.png', 'G') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (75, 'Irán', 'IRN', 'https://flagcdn.com/w80/ir.png', 'G') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (76, 'Nueva Zelanda', 'NZL', 'https://flagcdn.com/w80/nz.png', 'G') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (77, 'España', 'ESP', 'https://flagcdn.com/w80/es.png', 'H') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (78, 'Cabo Verde', 'CPV', 'https://flagcdn.com/w80/cv.png', 'H') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (79, 'Arabia Saudita', 'KSA', 'https://flagcdn.com/w80/sa.png', 'H') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (80, 'Uruguay', 'URU', 'https://flagcdn.com/w80/uy.png', 'H') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (81, 'Francia', 'FRA', 'https://flagcdn.com/w80/fr.png', 'I') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (82, 'Senegal', 'SEN', 'https://flagcdn.com/w80/sn.png', 'I') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (83, 'Irak', 'IRQ', 'https://flagcdn.com/w80/iq.png', 'I') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (84, 'Noruega', 'NOR', 'https://flagcdn.com/w80/no.png', 'I') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (85, 'Argentina', 'ARG', 'https://flagcdn.com/w80/ar.png', 'J') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (86, 'Argelia', 'ALG', 'https://flagcdn.com/w80/dz.png', 'J') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (87, 'Austria', 'AUT', 'https://flagcdn.com/w80/at.png', 'J') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (88, 'Jordania', 'JOR', 'https://flagcdn.com/w80/jo.png', 'J') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (89, 'Portugal', 'POR', 'https://flagcdn.com/w80/pt.png', 'K') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (90, 'RD Congo', 'COD', 'https://flagcdn.com/w80/cd.png', 'K') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (91, 'Uzbekistán', 'UZB', 'https://flagcdn.com/w80/uz.png', 'K') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (92, 'Colombia', 'COL', 'https://flagcdn.com/w80/co.png', 'K') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (93, 'Inglaterra', 'ENG', 'https://flagcdn.com/w80/gb-eng.png', 'L') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (94, 'Croacia', 'CRO', 'https://flagcdn.com/w80/hr.png', 'L') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (95, 'Ghana', 'GHA', 'https://flagcdn.com/w80/gh.png', 'L') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
INSERT INTO teams (id, name, code, flag_url, group_letter) VALUES (96, 'Panamá', 'PAN', 'https://flagcdn.com/w80/pa.png', 'L') ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, flag_url=EXCLUDED.flag_url, group_letter=EXCLUDED.group_letter;
SELECT setval('teams_id_seq', 96);

-- Matches (72 partidos de fase de grupos)
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (73, 49, 50, 'group', 'A', '2026-06-11T17:00:00+00:00', 'Estadio Azteca, Ciudad de México', 'scheduled', NULL, NULL, 'Telefe · DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (74, 51, 52, 'group', 'A', '2026-06-12T02:00:00+00:00', 'Levi''s Stadium, Santa Clara', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (75, 53, 54, 'group', 'B', '2026-06-12T19:00:00+00:00', 'BMO Field, Toronto', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (76, 61, 62, 'group', 'D', '2026-06-13T01:00:00+00:00', 'MetLife Stadium, East Rutherford', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (77, 55, 56, 'group', 'B', '2026-06-13T19:00:00+00:00', 'AT&T Stadium, Arlington', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (78, 57, 58, 'group', 'C', '2026-06-13T22:00:00+00:00', 'SoFi Stadium, Inglewood', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (79, 59, 60, 'group', 'C', '2026-06-14T01:00:00+00:00', 'Arrowhead Stadium, Kansas City', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (80, 63, 64, 'group', 'D', '2026-06-14T04:00:00+00:00', 'Lumen Field, Seattle', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (81, 65, 66, 'group', 'E', '2026-06-14T17:00:00+00:00', 'Gillette Stadium, Foxborough', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (82, 69, 70, 'group', 'F', '2026-06-14T20:00:00+00:00', 'Lincoln Financial Field, Philadelphia', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (83, 67, 68, 'group', 'E', '2026-06-14T23:00:00+00:00', 'NRG Stadium, Houston', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (84, 71, 72, 'group', 'F', '2026-06-15T02:00:00+00:00', 'Empower Field, Denver', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (85, 77, 78, 'group', 'H', '2026-06-15T17:00:00+00:00', 'MetLife Stadium, East Rutherford', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (86, 73, 74, 'group', 'G', '2026-06-15T22:00:00+00:00', 'Hard Rock Stadium, Miami', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (87, 79, 80, 'group', 'H', '2026-06-15T22:00:00+00:00', 'Estadio BBVA, Monterrey', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (88, 75, 76, 'group', 'G', '2026-06-16T04:00:00+00:00', 'Rose Bowl, Pasadena', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (89, 81, 82, 'group', 'I', '2026-06-16T19:00:00+00:00', 'Rose Bowl, Pasadena', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (90, 83, 84, 'group', 'I', '2026-06-16T22:00:00+00:00', 'Estadio Akron, Guadalajara', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (91, 85, 86, 'group', 'J', '2026-06-17T01:00:00+00:00', 'MetLife Stadium, East Rutherford', 'scheduled', NULL, NULL, 'Telefe · TV Pública · DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (92, 87, 88, 'group', 'J', '2026-06-17T04:00:00+00:00', 'BC Place, Vancouver', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (93, 89, 90, 'group', 'K', '2026-06-17T17:00:00+00:00', 'Gillette Stadium, Foxborough', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (94, 93, 94, 'group', 'L', '2026-06-17T20:00:00+00:00', 'AT&T Stadium, Arlington', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (95, 95, 96, 'group', 'L', '2026-06-17T23:00:00+00:00', 'NRG Stadium, Houston', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (96, 91, 92, 'group', 'K', '2026-06-18T02:00:00+00:00', 'SoFi Stadium, Inglewood', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (97, 52, 50, 'group', 'A', '2026-06-18T16:00:00+00:00', 'Estadio BBVA, Monterrey', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (98, 56, 54, 'group', 'B', '2026-06-18T19:00:00+00:00', 'Levi''s Stadium, Santa Clara', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (99, 53, 55, 'group', 'B', '2026-06-18T22:00:00+00:00', 'BC Place, Vancouver', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (100, 49, 51, 'group', 'A', '2026-06-19T03:00:00+00:00', 'Estadio Azteca, Ciudad de México', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (101, 61, 63, 'group', 'D', '2026-06-19T19:00:00+00:00', 'Arrowhead Stadium, Kansas City', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (102, 60, 58, 'group', 'C', '2026-06-19T22:00:00+00:00', 'Lincoln Financial Field, Philadelphia', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (103, 57, 59, 'group', 'C', '2026-06-20T01:00:00+00:00', 'Hard Rock Stadium, Miami', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (104, 64, 62, 'group', 'D', '2026-06-20T04:00:00+00:00', 'Empower Field, Denver', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (105, 69, 71, 'group', 'F', '2026-06-20T17:00:00+00:00', 'Rose Bowl, Pasadena', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (106, 65, 67, 'group', 'E', '2026-06-20T20:00:00+00:00', 'Mercedes-Benz Stadium, Atlanta', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (107, 68, 66, 'group', 'E', '2026-06-21T00:00:00+00:00', 'Lumen Field, Seattle', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (108, 72, 70, 'group', 'F', '2026-06-21T04:00:00+00:00', 'SoFi Stadium, Inglewood', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (109, 77, 79, 'group', 'H', '2026-06-21T16:00:00+00:00', 'Estadio Akron, Guadalajara', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (110, 73, 75, 'group', 'G', '2026-06-21T19:00:00+00:00', 'Gillette Stadium, Foxborough', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (111, 80, 78, 'group', 'H', '2026-06-21T22:00:00+00:00', 'AT&T Stadium, Arlington', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (112, 76, 74, 'group', 'G', '2026-06-22T01:00:00+00:00', 'NRG Stadium, Houston', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (113, 85, 87, 'group', 'J', '2026-06-22T17:00:00+00:00', 'MetLife Stadium, East Rutherford', 'scheduled', NULL, NULL, 'Telefe · TV Pública · DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (114, 81, 83, 'group', 'I', '2026-06-22T21:00:00+00:00', 'Hard Rock Stadium, Miami', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (115, 84, 82, 'group', 'I', '2026-06-23T00:00:00+00:00', 'Empower Field, Denver', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (116, 88, 86, 'group', 'J', '2026-06-23T03:00:00+00:00', 'BC Place, Vancouver', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (117, 89, 91, 'group', 'K', '2026-06-23T17:00:00+00:00', 'Arrowhead Stadium, Kansas City', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (118, 93, 95, 'group', 'L', '2026-06-23T20:00:00+00:00', 'Mercedes-Benz Stadium, Atlanta', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (119, 96, 94, 'group', 'L', '2026-06-23T23:00:00+00:00', 'Lumen Field, Seattle', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (120, 92, 90, 'group', 'K', '2026-06-24T02:00:00+00:00', 'Rose Bowl, Pasadena', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (122, 54, 55, 'group', 'B', '2026-06-24T19:00:00+00:00', 'BMO Field, Toronto', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (121, 56, 53, 'group', 'B', '2026-06-24T19:00:00+00:00', 'Levi''s Stadium, Santa Clara', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (124, 58, 59, 'group', 'C', '2026-06-24T22:00:00+00:00', 'Estadio Akron, Guadalajara', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (123, 60, 57, 'group', 'C', '2026-06-24T22:00:00+00:00', 'Mercedes-Benz Stadium, Atlanta', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (125, 52, 49, 'group', 'A', '2026-06-25T01:00:00+00:00', 'AT&T Stadium, Arlington', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (126, 50, 51, 'group', 'A', '2026-06-25T01:00:00+00:00', 'Lumen Field, Seattle', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (128, 66, 67, 'group', 'E', '2026-06-25T20:00:00+00:00', 'NRG Stadium, Houston', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (127, 68, 65, 'group', 'E', '2026-06-25T20:00:00+00:00', 'SoFi Stadium, Inglewood', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (129, 70, 71, 'group', 'F', '2026-06-25T23:00:00+00:00', 'Empower Field, Denver', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (130, 72, 69, 'group', 'F', '2026-06-25T23:00:00+00:00', 'MetLife Stadium, East Rutherford', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (131, 64, 61, 'group', 'D', '2026-06-26T02:00:00+00:00', 'Rose Bowl, Pasadena', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (132, 62, 63, 'group', 'D', '2026-06-26T02:00:00+00:00', 'Gillette Stadium, Foxborough', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (134, 82, 83, 'group', 'I', '2026-06-26T19:00:00+00:00', 'BC Place, Vancouver', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (133, 84, 81, 'group', 'I', '2026-06-26T19:00:00+00:00', 'Lincoln Financial Field, Philadelphia', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (135, 78, 79, 'group', 'H', '2026-06-27T00:00:00+00:00', 'Estadio BBVA, Monterrey', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (136, 80, 77, 'group', 'H', '2026-06-27T00:00:00+00:00', 'Hard Rock Stadium, Miami', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (137, 74, 75, 'group', 'G', '2026-06-27T03:00:00+00:00', 'AT&T Stadium, Arlington', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (138, 76, 73, 'group', 'G', '2026-06-27T03:00:00+00:00', 'Rose Bowl, Pasadena', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (139, 96, 93, 'group', 'L', '2026-06-27T21:00:00+00:00', 'NRG Stadium, Houston', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (140, 94, 95, 'group', 'L', '2026-06-27T21:00:00+00:00', 'Arrowhead Stadium, Kansas City', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (141, 92, 89, 'group', 'K', '2026-06-27T23:30:00+00:00', 'MetLife Stadium, East Rutherford', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (142, 90, 91, 'group', 'K', '2026-06-27T23:30:00+00:00', 'SoFi Stadium, Inglewood', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (143, 86, 87, 'group', 'J', '2026-06-28T02:00:00+00:00', 'Empower Field, Denver', 'scheduled', NULL, NULL, 'DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
INSERT INTO matches (id, home_team_id, away_team_id, stage, group_label, match_date, venue, status, home_score, away_score, tv_channel) VALUES (144, 88, 85, 'group', 'J', '2026-06-28T02:00:00+00:00', 'Mercedes-Benz Stadium, Atlanta', 'scheduled', NULL, NULL, 'Telefe · TV Pública · DSports · DirecTV Go') ON CONFLICT (id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status=EXCLUDED.status, tv_channel=EXCLUDED.tv_channel, venue=EXCLUDED.venue;
SELECT setval('matches_id_seq', 144);

-- App config
INSERT INTO app_config (key, value) VALUES ('last_reminder_sent', '{"date":"2026-04-14T18:46:56.175Z","sent":3,"matches":4,"test":true}') ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value;

-- Internal teams (equipos del cliente)
INSERT INTO internal_teams (name, icon) VALUES ('Contenidos', 'FilmSlate') ON CONFLICT (name) DO NOTHING;
INSERT INTO internal_teams (name, icon) VALUES ('Comunicación', 'Megaphone') ON CONFLICT (name) DO NOTHING;
INSERT INTO internal_teams (name, icon) VALUES ('Eventos', 'MicrophoneStage') ON CONFLICT (name) DO NOTHING;
INSERT INTO internal_teams (name, icon) VALUES ('Bosque', 'Tree') ON CONFLICT (name) DO NOTHING;
INSERT INTO internal_teams (name, icon) VALUES ('Luna', 'Moon') ON CONFLICT (name) DO NOTHING;
INSERT INTO internal_teams (name, icon) VALUES ('Sol', 'Sun') ON CONFLICT (name) DO NOTHING;
INSERT INTO internal_teams (name, icon) VALUES ('Faro', 'Lighthouse') ON CONFLICT (name) DO NOTHING;
INSERT INTO internal_teams (name, icon) VALUES ('Dirección', 'Compass') ON CONFLICT (name) DO NOTHING;

COMMIT;

-- ============================================================
-- Verificación rápida (ejecutar aparte)
-- ============================================================
-- SELECT count(*) FROM teams;   -- debe dar 48
-- SELECT count(*) FROM matches; -- debe dar 72