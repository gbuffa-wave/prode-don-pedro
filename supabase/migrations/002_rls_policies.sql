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
