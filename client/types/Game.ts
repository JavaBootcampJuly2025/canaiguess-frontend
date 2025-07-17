export type GamePageParams = {
  gameId: string;
};

export type Guess = true | false;

export interface GuessEntry {
  imageId: string;
  guess: Guess;
}

// For now it's partially random, should be fetched from API
export type GameResult = {
  score: number;
  correctGuesses: number;
  falseGuesses: number;
  accuracy: number;
};

export type ImageData = {
  id: string;
  url: string;
  isAI: boolean;
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