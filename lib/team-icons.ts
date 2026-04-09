import { FilmSlate, Megaphone, MicrophoneStage, Tree, Moon, Sun, Lighthouse, Compass, Star, SoccerBall, Heart, Lightning, Fire, ShieldStar, Flag, Crown, Rocket, Diamond, Flower } from "@phosphor-icons/react";
import type { IconProps } from "@phosphor-icons/react";

const ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  FilmSlate,
  Megaphone,
  MicrophoneStage,
  Tree,
  Moon,
  Sun,
  Lighthouse,
  Compass,
  Star,
  SoccerBall,
  Heart,
  Lightning,
  Fire,
  ShieldStar,
  Flag,
  Crown,
  Rocket,
  Diamond,
  Flower,
};

export function getTeamIcon(iconName: string): React.ComponentType<IconProps> {
  return ICON_MAP[iconName] || SoccerBall;
}
