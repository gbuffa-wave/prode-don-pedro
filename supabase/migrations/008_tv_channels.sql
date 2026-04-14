-- Add tv_channel column to matches
ALTER TABLE matches ADD COLUMN IF NOT EXISTS tv_channel TEXT;

-- Argentina's matches: TV Pública + TyC Sports + DirecTV (free-to-air included)
UPDATE matches SET tv_channel = 'TV Pública · TyC Sports · DirecTV'
  WHERE home_team_id IN (SELECT id FROM teams WHERE code = 'ARG')
     OR away_team_id IN (SELECT id FROM teams WHERE code = 'ARG');

-- Opening match (Mexico): TV Pública likely covers it
UPDATE matches SET tv_channel = 'TV Pública · TyC Sports · DirecTV'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'MEX')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'RSA');

-- All remaining matches: TyC Sports + DirecTV
UPDATE matches SET tv_channel = 'TyC Sports · DirecTV'
  WHERE tv_channel IS NULL;
