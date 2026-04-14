-- Populate venue data for FIFA World Cup 2026 group stage
-- Opening match and confirmed venues; remaining are populated via /api/sync-results
-- Format: "Estadio, Ciudad"

-- Group A — Matchday 1
UPDATE matches SET venue = 'Estadio Azteca, Ciudad de México'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'MEX')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'RSA');

UPDATE matches SET venue = 'Levi''s Stadium, Santa Clara'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'KOR')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'CZE');

-- Group B — Matchday 1
UPDATE matches SET venue = 'BMO Field, Toronto'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'CAN')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'BIH');

UPDATE matches SET venue = 'AT&T Stadium, Arlington'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'QAT')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'SUI');

-- Group C — Matchday 1
UPDATE matches SET venue = 'SoFi Stadium, Inglewood'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'BRA')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'MAR');

UPDATE matches SET venue = 'Arrowhead Stadium, Kansas City'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'HAI')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'SCO');

-- Group D — Matchday 1
UPDATE matches SET venue = 'MetLife Stadium, East Rutherford'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'USA')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'PAR');

UPDATE matches SET venue = 'Lumen Field, Seattle'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'AUS')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'TUR');

-- Group E — Matchday 1
UPDATE matches SET venue = 'Gillette Stadium, Foxborough'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'GER')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'CUW');

UPDATE matches SET venue = 'Lincoln Financial Field, Philadelphia'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'NED')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'JPN');

UPDATE matches SET venue = 'NRG Stadium, Houston'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'CIV')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'ECU');

UPDATE matches SET venue = 'Empower Field, Denver'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'SWE')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'TUN');

-- Group F — Matchday 1
UPDATE matches SET venue = 'Hard Rock Stadium, Miami'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'BEL')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'EGY');

UPDATE matches SET venue = 'Rose Bowl, Pasadena'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'IRN')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'NZL');

-- Group H — Matchday 1
UPDATE matches SET venue = 'MetLife Stadium, East Rutherford'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'ESP')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'CPV');

UPDATE matches SET venue = 'Estadio BBVA, Monterrey'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'KSA')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'URU');

-- Group I — Matchday 1
UPDATE matches SET venue = 'Rose Bowl, Pasadena'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'FRA')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'SEN');

UPDATE matches SET venue = 'Estadio Akron, Guadalajara'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'IRQ')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'NOR');

-- Group J — Matchday 1
UPDATE matches SET venue = 'MetLife Stadium, East Rutherford'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'ARG')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'ALG');

UPDATE matches SET venue = 'BC Place, Vancouver'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'AUT')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'JOR');

-- Group K — Matchday 1
UPDATE matches SET venue = 'Gillette Stadium, Foxborough'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'POR')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'COD');

UPDATE matches SET venue = 'SoFi Stadium, Inglewood'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'UZB')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'COL');

-- Group L — Matchday 1
UPDATE matches SET venue = 'AT&T Stadium, Arlington'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'ENG')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'CRO');

UPDATE matches SET venue = 'NRG Stadium, Houston'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'GHA')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'PAN');

-- Group A — Matchday 2
UPDATE matches SET venue = 'Estadio BBVA, Monterrey'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'CZE')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'RSA');

UPDATE matches SET venue = 'Estadio Azteca, Ciudad de México'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'MEX')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'KOR');

-- Group B — Matchday 2
UPDATE matches SET venue = 'Levi''s Stadium, Santa Clara'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'SUI')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'BIH');

UPDATE matches SET venue = 'BC Place, Vancouver'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'CAN')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'QAT');

-- Group C — Matchday 2
UPDATE matches SET venue = 'Lincoln Financial Field, Philadelphia'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'SCO')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'MAR');

UPDATE matches SET venue = 'Hard Rock Stadium, Miami'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'BRA')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'HAI');

-- Group D — Matchday 2
UPDATE matches SET venue = 'Arrowhead Stadium, Kansas City'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'USA')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'AUS');

UPDATE matches SET venue = 'Empower Field, Denver'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'TUR')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'PAR');

-- Group E — Matchday 2
UPDATE matches SET venue = 'Rose Bowl, Pasadena'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'NED')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'SWE');

UPDATE matches SET venue = 'Mercedes-Benz Stadium, Atlanta'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'GER')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'CIV');

UPDATE matches SET venue = 'Lumen Field, Seattle'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'ECU')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'CUW');

UPDATE matches SET venue = 'SoFi Stadium, Inglewood'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'TUN')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'JPN');

-- Group G — Matchday 2
UPDATE matches SET venue = 'Estadio Akron, Guadalajara'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'ESP')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'KSA');

UPDATE matches SET venue = 'Gillette Stadium, Foxborough'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'BEL')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'IRN');

UPDATE matches SET venue = 'AT&T Stadium, Arlington'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'URU')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'CPV');

UPDATE matches SET venue = 'NRG Stadium, Houston'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'NZL')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'EGY');

-- Group I — Matchday 2
UPDATE matches SET venue = 'MetLife Stadium, East Rutherford'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'ARG')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'AUT');

UPDATE matches SET venue = 'Hard Rock Stadium, Miami'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'FRA')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'IRQ');

UPDATE matches SET venue = 'Empower Field, Denver'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'NOR')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'SEN');

UPDATE matches SET venue = 'BC Place, Vancouver'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'JOR')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'ALG');

-- Group K — Matchday 2
UPDATE matches SET venue = 'Arrowhead Stadium, Kansas City'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'POR')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'UZB');

UPDATE matches SET venue = 'Mercedes-Benz Stadium, Atlanta'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'ENG')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'GHA');

UPDATE matches SET venue = 'Lumen Field, Seattle'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'PAN')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'CRO');

UPDATE matches SET venue = 'Rose Bowl, Pasadena'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'COL')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'COD');

-- Matchday 3 — Group B (simultaneous)
UPDATE matches SET venue = 'Levi''s Stadium, Santa Clara'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'SUI')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'CAN');

UPDATE matches SET venue = 'BMO Field, Toronto'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'BIH')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'QAT');

-- Matchday 3 — Group C (simultaneous)
UPDATE matches SET venue = 'Mercedes-Benz Stadium, Atlanta'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'SCO')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'BRA');

UPDATE matches SET venue = 'Estadio Akron, Guadalajara'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'MAR')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'HAI');

-- Matchday 3 — Group A (simultaneous)
UPDATE matches SET venue = 'AT&T Stadium, Arlington'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'CZE')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'MEX');

UPDATE matches SET venue = 'Lumen Field, Seattle'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'RSA')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'KOR');

-- Matchday 3 — Group E (simultaneous)
UPDATE matches SET venue = 'SoFi Stadium, Inglewood'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'ECU')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'GER');

UPDATE matches SET venue = 'NRG Stadium, Houston'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'CUW')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'CIV');

-- Matchday 3 — Group F (simultaneous)
UPDATE matches SET venue = 'Empower Field, Denver'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'JPN')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'SWE');

UPDATE matches SET venue = 'MetLife Stadium, East Rutherford'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'TUN')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'NED');

-- Matchday 3 — Group D (simultaneous)
UPDATE matches SET venue = 'Rose Bowl, Pasadena'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'TUR')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'USA');

UPDATE matches SET venue = 'Gillette Stadium, Foxborough'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'PAR')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'AUS');

-- Matchday 3 — Group I (simultaneous)
UPDATE matches SET venue = 'Lincoln Financial Field, Philadelphia'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'NOR')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'FRA');

UPDATE matches SET venue = 'BC Place, Vancouver'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'SEN')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'IRQ');

-- Matchday 3 — Group H (simultaneous)
UPDATE matches SET venue = 'Estadio BBVA, Monterrey'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'CPV')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'KSA');

UPDATE matches SET venue = 'Hard Rock Stadium, Miami'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'URU')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'ESP');

-- Matchday 3 — Group G (simultaneous)
UPDATE matches SET venue = 'AT&T Stadium, Arlington'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'EGY')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'IRN');

UPDATE matches SET venue = 'Rose Bowl, Pasadena'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'NZL')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'BEL');

-- Matchday 3 — Group L (simultaneous)
UPDATE matches SET venue = 'NRG Stadium, Houston'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'PAN')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'ENG');

UPDATE matches SET venue = 'Arrowhead Stadium, Kansas City'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'CRO')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'GHA');

-- Matchday 3 — Group K (simultaneous)
UPDATE matches SET venue = 'MetLife Stadium, East Rutherford'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'COL')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'POR');

UPDATE matches SET venue = 'SoFi Stadium, Inglewood'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'COD')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'UZB');

-- Matchday 3 — Group J (simultaneous)
UPDATE matches SET venue = 'Empower Field, Denver'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'ALG')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'AUT');

UPDATE matches SET venue = 'Mercedes-Benz Stadium, Atlanta'
  WHERE home_team_id = (SELECT id FROM teams WHERE code = 'JOR')
    AND away_team_id = (SELECT id FROM teams WHERE code = 'ARG');
