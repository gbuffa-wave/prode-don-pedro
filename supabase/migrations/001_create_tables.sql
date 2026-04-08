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
