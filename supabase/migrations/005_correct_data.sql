-- Delete old data
DELETE FROM matches;
DELETE FROM teams;

-- Insert correct 48 teams for FIFA World Cup 2026
INSERT INTO teams (name, code, flag_url, group_letter) VALUES
-- Group A
('Mexico', 'MEX', 'https://flagcdn.com/w80/mx.png', 'A'),
('Sudafrica', 'RSA', 'https://flagcdn.com/w80/za.png', 'A'),
('Corea del Sur', 'KOR', 'https://flagcdn.com/w80/kr.png', 'A'),
('Chequia', 'CZE', 'https://flagcdn.com/w80/cz.png', 'A'),
-- Group B
('Canada', 'CAN', 'https://flagcdn.com/w80/ca.png', 'B'),
('Bosnia y Herzegovina', 'BIH', 'https://flagcdn.com/w80/ba.png', 'B'),
('Qatar', 'QAT', 'https://flagcdn.com/w80/qa.png', 'B'),
('Suiza', 'SUI', 'https://flagcdn.com/w80/ch.png', 'B'),
-- Group C
('Brasil', 'BRA', 'https://flagcdn.com/w80/br.png', 'C'),
('Marruecos', 'MAR', 'https://flagcdn.com/w80/ma.png', 'C'),
('Haiti', 'HAI', 'https://flagcdn.com/w80/ht.png', 'C'),
('Escocia', 'SCO', 'https://flagcdn.com/w80/gb-sct.png', 'C'),
-- Group D
('Estados Unidos', 'USA', 'https://flagcdn.com/w80/us.png', 'D'),
('Paraguay', 'PAR', 'https://flagcdn.com/w80/py.png', 'D'),
('Australia', 'AUS', 'https://flagcdn.com/w80/au.png', 'D'),
('Turquia', 'TUR', 'https://flagcdn.com/w80/tr.png', 'D'),
-- Group E
('Alemania', 'GER', 'https://flagcdn.com/w80/de.png', 'E'),
('Curazao', 'CUW', 'https://flagcdn.com/w80/cw.png', 'E'),
('Costa de Marfil', 'CIV', 'https://flagcdn.com/w80/ci.png', 'E'),
('Ecuador', 'ECU', 'https://flagcdn.com/w80/ec.png', 'E'),
-- Group F
('Paises Bajos', 'NED', 'https://flagcdn.com/w80/nl.png', 'F'),
('Japon', 'JPN', 'https://flagcdn.com/w80/jp.png', 'F'),
('Suecia', 'SWE', 'https://flagcdn.com/w80/se.png', 'F'),
('Tunez', 'TUN', 'https://flagcdn.com/w80/tn.png', 'F'),
-- Group G
('Belgica', 'BEL', 'https://flagcdn.com/w80/be.png', 'G'),
('Egipto', 'EGY', 'https://flagcdn.com/w80/eg.png', 'G'),
('Iran', 'IRN', 'https://flagcdn.com/w80/ir.png', 'G'),
('Nueva Zelanda', 'NZL', 'https://flagcdn.com/w80/nz.png', 'G'),
-- Group H
('Espana', 'ESP', 'https://flagcdn.com/w80/es.png', 'H'),
('Cabo Verde', 'CPV', 'https://flagcdn.com/w80/cv.png', 'H'),
('Arabia Saudita', 'KSA', 'https://flagcdn.com/w80/sa.png', 'H'),
('Uruguay', 'URU', 'https://flagcdn.com/w80/uy.png', 'H'),
-- Group I
('Francia', 'FRA', 'https://flagcdn.com/w80/fr.png', 'I'),
('Senegal', 'SEN', 'https://flagcdn.com/w80/sn.png', 'I'),
('Irak', 'IRQ', 'https://flagcdn.com/w80/iq.png', 'I'),
('Noruega', 'NOR', 'https://flagcdn.com/w80/no.png', 'I'),
-- Group J
('Argentina', 'ARG', 'https://flagcdn.com/w80/ar.png', 'J'),
('Argelia', 'ALG', 'https://flagcdn.com/w80/dz.png', 'J'),
('Austria', 'AUT', 'https://flagcdn.com/w80/at.png', 'J'),
('Jordania', 'JOR', 'https://flagcdn.com/w80/jo.png', 'J'),
-- Group K
('Portugal', 'POR', 'https://flagcdn.com/w80/pt.png', 'K'),
('RD Congo', 'COD', 'https://flagcdn.com/w80/cd.png', 'K'),
('Uzbekistan', 'UZB', 'https://flagcdn.com/w80/uz.png', 'K'),
('Colombia', 'COL', 'https://flagcdn.com/w80/co.png', 'K'),
-- Group L
('Inglaterra', 'ENG', 'https://flagcdn.com/w80/gb-eng.png', 'L'),
('Croacia', 'CRO', 'https://flagcdn.com/w80/hr.png', 'L'),
('Ghana', 'GHA', 'https://flagcdn.com/w80/gh.png', 'L'),
('Panama', 'PAN', 'https://flagcdn.com/w80/pa.png', 'L');

-- Now insert all group stage matches with correct schedule
-- All times converted to UTC (ET + 4 hours for UTC, but using ET offset -4)
-- Using ET times converted to UTC

-- June 11
INSERT INTO matches (home_team_id, away_team_id, stage, group_label, match_date, status) VALUES
((SELECT id FROM teams WHERE code='MEX'), (SELECT id FROM teams WHERE code='RSA'), 'group', 'A', '2026-06-11T17:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='KOR'), (SELECT id FROM teams WHERE code='CZE'), 'group', 'A', '2026-06-12T02:00:00Z', 'scheduled');

-- June 12
INSERT INTO matches (home_team_id, away_team_id, stage, group_label, match_date, status) VALUES
((SELECT id FROM teams WHERE code='CAN'), (SELECT id FROM teams WHERE code='BIH'), 'group', 'B', '2026-06-12T19:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='USA'), (SELECT id FROM teams WHERE code='PAR'), 'group', 'D', '2026-06-13T01:00:00Z', 'scheduled');

-- June 13
INSERT INTO matches (home_team_id, away_team_id, stage, group_label, match_date, status) VALUES
((SELECT id FROM teams WHERE code='QAT'), (SELECT id FROM teams WHERE code='SUI'), 'group', 'B', '2026-06-13T19:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='BRA'), (SELECT id FROM teams WHERE code='MAR'), 'group', 'C', '2026-06-13T22:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='HAI'), (SELECT id FROM teams WHERE code='SCO'), 'group', 'C', '2026-06-14T01:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='AUS'), (SELECT id FROM teams WHERE code='TUR'), 'group', 'D', '2026-06-14T04:00:00Z', 'scheduled');

-- June 14
INSERT INTO matches (home_team_id, away_team_id, stage, group_label, match_date, status) VALUES
((SELECT id FROM teams WHERE code='GER'), (SELECT id FROM teams WHERE code='CUW'), 'group', 'E', '2026-06-14T17:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='NED'), (SELECT id FROM teams WHERE code='JPN'), 'group', 'F', '2026-06-14T20:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='CIV'), (SELECT id FROM teams WHERE code='ECU'), 'group', 'E', '2026-06-14T23:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='SWE'), (SELECT id FROM teams WHERE code='TUN'), 'group', 'F', '2026-06-15T02:00:00Z', 'scheduled');

-- June 15
INSERT INTO matches (home_team_id, away_team_id, stage, group_label, match_date, status) VALUES
((SELECT id FROM teams WHERE code='ESP'), (SELECT id FROM teams WHERE code='CPV'), 'group', 'H', '2026-06-15T17:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='BEL'), (SELECT id FROM teams WHERE code='EGY'), 'group', 'G', '2026-06-15T22:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='KSA'), (SELECT id FROM teams WHERE code='URU'), 'group', 'H', '2026-06-15T22:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='IRN'), (SELECT id FROM teams WHERE code='NZL'), 'group', 'G', '2026-06-16T04:00:00Z', 'scheduled');

-- June 16
INSERT INTO matches (home_team_id, away_team_id, stage, group_label, match_date, status) VALUES
((SELECT id FROM teams WHERE code='FRA'), (SELECT id FROM teams WHERE code='SEN'), 'group', 'I', '2026-06-16T19:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='IRQ'), (SELECT id FROM teams WHERE code='NOR'), 'group', 'I', '2026-06-16T22:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='ARG'), (SELECT id FROM teams WHERE code='ALG'), 'group', 'J', '2026-06-17T01:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='AUT'), (SELECT id FROM teams WHERE code='JOR'), 'group', 'J', '2026-06-17T04:00:00Z', 'scheduled');

-- June 17
INSERT INTO matches (home_team_id, away_team_id, stage, group_label, match_date, status) VALUES
((SELECT id FROM teams WHERE code='POR'), (SELECT id FROM teams WHERE code='COD'), 'group', 'K', '2026-06-17T17:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='ENG'), (SELECT id FROM teams WHERE code='CRO'), 'group', 'L', '2026-06-17T20:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='GHA'), (SELECT id FROM teams WHERE code='PAN'), 'group', 'L', '2026-06-17T23:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='UZB'), (SELECT id FROM teams WHERE code='COL'), 'group', 'K', '2026-06-18T02:00:00Z', 'scheduled');

-- June 18 (Matchday 2 starts)
INSERT INTO matches (home_team_id, away_team_id, stage, group_label, match_date, status) VALUES
((SELECT id FROM teams WHERE code='CZE'), (SELECT id FROM teams WHERE code='RSA'), 'group', 'A', '2026-06-18T16:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='SUI'), (SELECT id FROM teams WHERE code='BIH'), 'group', 'B', '2026-06-18T19:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='CAN'), (SELECT id FROM teams WHERE code='QAT'), 'group', 'B', '2026-06-18T22:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='MEX'), (SELECT id FROM teams WHERE code='KOR'), 'group', 'A', '2026-06-19T03:00:00Z', 'scheduled');

-- June 19
INSERT INTO matches (home_team_id, away_team_id, stage, group_label, match_date, status) VALUES
((SELECT id FROM teams WHERE code='USA'), (SELECT id FROM teams WHERE code='AUS'), 'group', 'D', '2026-06-19T19:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='SCO'), (SELECT id FROM teams WHERE code='MAR'), 'group', 'C', '2026-06-19T22:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='BRA'), (SELECT id FROM teams WHERE code='HAI'), 'group', 'C', '2026-06-20T01:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='TUR'), (SELECT id FROM teams WHERE code='PAR'), 'group', 'D', '2026-06-20T04:00:00Z', 'scheduled');

-- June 20
INSERT INTO matches (home_team_id, away_team_id, stage, group_label, match_date, status) VALUES
((SELECT id FROM teams WHERE code='NED'), (SELECT id FROM teams WHERE code='SWE'), 'group', 'F', '2026-06-20T17:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='GER'), (SELECT id FROM teams WHERE code='CIV'), 'group', 'E', '2026-06-20T20:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='ECU'), (SELECT id FROM teams WHERE code='CUW'), 'group', 'E', '2026-06-21T00:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='TUN'), (SELECT id FROM teams WHERE code='JPN'), 'group', 'F', '2026-06-21T04:00:00Z', 'scheduled');

-- June 21
INSERT INTO matches (home_team_id, away_team_id, stage, group_label, match_date, status) VALUES
((SELECT id FROM teams WHERE code='ESP'), (SELECT id FROM teams WHERE code='KSA'), 'group', 'H', '2026-06-21T16:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='BEL'), (SELECT id FROM teams WHERE code='IRN'), 'group', 'G', '2026-06-21T19:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='URU'), (SELECT id FROM teams WHERE code='CPV'), 'group', 'H', '2026-06-21T22:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='NZL'), (SELECT id FROM teams WHERE code='EGY'), 'group', 'G', '2026-06-22T01:00:00Z', 'scheduled');

-- June 22
INSERT INTO matches (home_team_id, away_team_id, stage, group_label, match_date, status) VALUES
((SELECT id FROM teams WHERE code='ARG'), (SELECT id FROM teams WHERE code='AUT'), 'group', 'J', '2026-06-22T17:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='FRA'), (SELECT id FROM teams WHERE code='IRQ'), 'group', 'I', '2026-06-22T21:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='NOR'), (SELECT id FROM teams WHERE code='SEN'), 'group', 'I', '2026-06-23T00:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='JOR'), (SELECT id FROM teams WHERE code='ALG'), 'group', 'J', '2026-06-23T03:00:00Z', 'scheduled');

-- June 23
INSERT INTO matches (home_team_id, away_team_id, stage, group_label, match_date, status) VALUES
((SELECT id FROM teams WHERE code='POR'), (SELECT id FROM teams WHERE code='UZB'), 'group', 'K', '2026-06-23T17:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='ENG'), (SELECT id FROM teams WHERE code='GHA'), 'group', 'L', '2026-06-23T20:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='PAN'), (SELECT id FROM teams WHERE code='CRO'), 'group', 'L', '2026-06-23T23:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='COL'), (SELECT id FROM teams WHERE code='COD'), 'group', 'K', '2026-06-24T02:00:00Z', 'scheduled');

-- June 24 (Matchday 3 - simultaneous matches)
INSERT INTO matches (home_team_id, away_team_id, stage, group_label, match_date, status) VALUES
((SELECT id FROM teams WHERE code='SUI'), (SELECT id FROM teams WHERE code='CAN'), 'group', 'B', '2026-06-24T19:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='BIH'), (SELECT id FROM teams WHERE code='QAT'), 'group', 'B', '2026-06-24T19:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='SCO'), (SELECT id FROM teams WHERE code='BRA'), 'group', 'C', '2026-06-24T22:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='MAR'), (SELECT id FROM teams WHERE code='HAI'), 'group', 'C', '2026-06-24T22:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='CZE'), (SELECT id FROM teams WHERE code='MEX'), 'group', 'A', '2026-06-25T01:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='RSA'), (SELECT id FROM teams WHERE code='KOR'), 'group', 'A', '2026-06-25T01:00:00Z', 'scheduled');

-- June 25
INSERT INTO matches (home_team_id, away_team_id, stage, group_label, match_date, status) VALUES
((SELECT id FROM teams WHERE code='ECU'), (SELECT id FROM teams WHERE code='GER'), 'group', 'E', '2026-06-25T20:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='CUW'), (SELECT id FROM teams WHERE code='CIV'), 'group', 'E', '2026-06-25T20:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='JPN'), (SELECT id FROM teams WHERE code='SWE'), 'group', 'F', '2026-06-25T23:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='TUN'), (SELECT id FROM teams WHERE code='NED'), 'group', 'F', '2026-06-25T23:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='TUR'), (SELECT id FROM teams WHERE code='USA'), 'group', 'D', '2026-06-26T02:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='PAR'), (SELECT id FROM teams WHERE code='AUS'), 'group', 'D', '2026-06-26T02:00:00Z', 'scheduled');

-- June 26
INSERT INTO matches (home_team_id, away_team_id, stage, group_label, match_date, status) VALUES
((SELECT id FROM teams WHERE code='NOR'), (SELECT id FROM teams WHERE code='FRA'), 'group', 'I', '2026-06-26T19:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='SEN'), (SELECT id FROM teams WHERE code='IRQ'), 'group', 'I', '2026-06-26T19:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='CPV'), (SELECT id FROM teams WHERE code='KSA'), 'group', 'H', '2026-06-27T00:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='URU'), (SELECT id FROM teams WHERE code='ESP'), 'group', 'H', '2026-06-27T00:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='EGY'), (SELECT id FROM teams WHERE code='IRN'), 'group', 'G', '2026-06-27T03:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='NZL'), (SELECT id FROM teams WHERE code='BEL'), 'group', 'G', '2026-06-27T03:00:00Z', 'scheduled');

-- June 27
INSERT INTO matches (home_team_id, away_team_id, stage, group_label, match_date, status) VALUES
((SELECT id FROM teams WHERE code='PAN'), (SELECT id FROM teams WHERE code='ENG'), 'group', 'L', '2026-06-27T21:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='CRO'), (SELECT id FROM teams WHERE code='GHA'), 'group', 'L', '2026-06-27T21:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='COL'), (SELECT id FROM teams WHERE code='POR'), 'group', 'K', '2026-06-27T23:30:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='COD'), (SELECT id FROM teams WHERE code='UZB'), 'group', 'K', '2026-06-27T23:30:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='ALG'), (SELECT id FROM teams WHERE code='AUT'), 'group', 'J', '2026-06-28T02:00:00Z', 'scheduled'),
((SELECT id FROM teams WHERE code='JOR'), (SELECT id FROM teams WHERE code='ARG'), 'group', 'J', '2026-06-28T02:00:00Z', 'scheduled');
