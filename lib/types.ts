export type MatchStatus = "scheduled" | "in_progress" | "finished";
export type UserRole = "player" | "admin";
export type ScoringRuleType = "exact" | "winner_and_diff" | "winner_only" | "champion";

export interface Team {
  id: number;
  name: string;
  code: string;
  flag_url: string;
  group_letter: string;
}

export interface Match {
  id: number;
  home_team_id: number;
  away_team_id: number;
  stage: string;
  group_label: string | null;
  match_date: string;
  venue: string | null;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  home_team?: Team;
  away_team?: Team;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: number;
  home_score: number;
  away_score: number;
  created_at: string;
  updated_at: string;
}

export interface ScoringRule {
  id: number;
  rule_type: ScoringRuleType;
  label: string;
  points: number;
  is_active: boolean;
}

export interface Score {
  id: string;
  user_id: string;
  match_id: number;
  prediction_id: string;
  points_earned: number;
}

export interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_points: number;
  rank: number;
  correct_exact: number;
  correct_winner: number;
  total_predictions: number;
}

export interface Prize {
  id: number;
  position: number;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface AppConfig {
  key: string;
  value: string;
}

export interface AppUser {
  id: string;
  role: UserRole;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}
