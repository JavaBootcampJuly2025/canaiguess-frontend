export interface UserStats {
  userId: string;
  username: string;
  avatar?: string;

  // Overall stats
  totalScore: number;
  totalGamesPlayed: number;
  totalImagesGuessed: number;
  totalCorrectGuesses: number;
  overallAccuracy: number;
  bestAccuracy: number;
  bestScore: number;

  // Per game mode stats
  singleImageStats: GameModeStats;
  pairImageStats: GameModeStats;
  groupImageStats: GameModeStats;

  // Achievements and streaks
  gamesThisWeek: number;
  gamesThisMonth: number;

  // Rankings
  globalRank: number;

  // Recent activity
  lastPlayedAt: string;
  joinedAt: string;
}

export interface GameModeStats {
  gamesPlayed: number;
  totalImages: number;
  correctGuesses: number;
  accuracy: number;
  bestAccuracy: number;
  averageScore: number;
  bestScore: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  accuracy?: number;
  rank: number;
  isCurrentUser?: boolean;
}

export interface Leaderboard {
  type: LeaderboardType;
  entries: LeaderboardEntry[];
  totalPlayers: number;
  lastUpdated: string;
}
export interface AccuracyLeaderboard {
  type: LeaderboardType;
  entries: LeaderboardEntry[];
  totalPlayers: number;
  lastUpdated: string;
}

export type LeaderboardType =
  | "global"
  | "weekly"
  | "monthly"

export interface RecentGame {
  id: string;
  gameMode: "single" | "pair" | "group";
  score: number;
  accuracy: number;
  totalImages: number;
  correctGuesses: number;
  difficulty: number;
}
