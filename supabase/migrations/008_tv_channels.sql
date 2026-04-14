-- Add tv_channel column to matches
ALTER TABLE matches ADD COLUMN IF NOT EXISTS tv_channel TEXT;

-- Argentina's matches: Telefe + TV Pública + DSports (all three have rights)
UPDATE matches SET tv_channel = 'Telefe · TV Pública · DSports · DirecTV Go'
  WHERE home_team_id IN (SELECT id FROM teams WHERE code = 'ARG')
     OR away_team_id IN (SELECT id FROM teams WHERE code = 'ARG');

-- Opening match (MEX vs RSA): Telefe covers it
UPDATE matches SET tv_channel = 'Telefe · DSports · DirecTV Go'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'MEX')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'RSA');

-- All remaining group stage matches: DSports only
UPDATE matches SET tv_channel = 'DSports · DirecTV Go'
  WHERE tv_channel IS NULL;
