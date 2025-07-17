import { GameConfig, GameResult } from "@/types/Game";

// This type makes it easy to pair stuff together
export type FakeGameData = {
  id: number; // fake ID for testing
  config: GameConfig;
  result: GameResult;
};

/**
 * Generates an array of 10 fake games with configs and results.
 */
export function generateFakeGames(): FakeGameData[] {
  const games: FakeGameData[] = [];

  for (let i = 1; i <= 10; i++) {
    const batchCount = Math.floor(Math.random() * 10) + 5; // 5–14
    const batchSize = Math.floor(Math.random() * 4) + 1; // 1–4

    const totalGuesses = batchCount * batchSize;

    const correct = Math.floor(totalGuesses * (0.6 + Math.random() * 0.4)); // 60–100% correct
    const incorrect = totalGuesses - correct;
    const accuracy = totalGuesses > 0 ? correct / totalGuesses : 0;

    const config: GameConfig = {
      batchSize,
      batchCount,
      currentBatch: 0,
      difficulty: Math.round((0.3 + Math.random() * 0.6) * 10) / 10, // 0.3–0.9
    };

    const result: GameResult = {
      correct,
      incorrect,
      accuracy,
    };

    games.push({
      id: i,
      config,
      result,
    });
  }

  return games;
}

