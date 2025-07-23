import { HintResponseDTO } from "@/dto/HintResponseDTO";

export type GamePageParams = {
  gameId: string;
};

export type Guess = true | false;

export interface GuessEntry {
  imageId: string;
  guess: Guess;
}

export type ImageData = {
  id: string;
  url: string;
  isAI?: boolean;
};

// For now it's partially random, should be fetched from API
export type GameResult = {
  // score: number;
  correct: number;
  total: number;
  accuracy: number;
  score: number;
  id: String;
  createdAt: Date;
  finished: boolean;
  currentBatch: number;
  batchCount: number;
  batchSize: number;
  difficulty: number;
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
  hintsUsed: HintResponseDTO[];
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