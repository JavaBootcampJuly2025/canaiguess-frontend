export type GamePageParams = {
  gameId: string;
};

export type Guess = true | false;

export interface GuessEntry {
  imageId: number;
  guess: Guess;
}

export type ImageData = {
  id: number;
  url: string;
  isAI?: boolean;
};

// For now it's partially random, should be fetched from API
export type GameResult = {
  // score: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  score: number;
};

// Data fetched from the API
export type GameConfig = {
  batchSize: number;
  batchCount: number;
  currentBatch: number;
  difficulty: number;
};

// Data of the currently displayed round
export interface GameInstance {
  currentImages: ImageData[];
  userGuesses: GuessEntry[];
  result: GameResult | null;
  currentBatch?: number;
}

type RecentGame = {
  id: string;
  score: number;
  // unused temporarily
  gameMode: "single" | "pair" | "group";
  accuracy: number;
  totalImages: number;
  correctGuesses: number;
  difficulty: number;
  playedAt: string;
  duration: number; // in seconds
};