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
