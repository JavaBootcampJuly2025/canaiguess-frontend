import { NewGameResponseDTO } from "@/dto/NewGameResponseDTO";
import { LastGameDTO } from "@/dto/LastGameDTO";
import { GameResult } from "@/types/Game";
import { ImageBatchResponseDTO, ImageDTO } from "@/dto/ImageBatchResponseDTO";

// API call to fetch game data
export const fetchGameData = async (gameId: string, token: string) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const response = await fetch(`${API_BASE_URL}/api/game/${gameId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
  const text = await response.text();
  const data = JSON.parse(text);

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return data;
};

// API call to fetch images
export const fetchBatchImagesFromApi = async (
  gameId: string,
  token: string
): Promise<ImageDTO[]> => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const response = await fetch(`${API_BASE_URL}/api/game/${gameId}/batch`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data: ImageBatchResponseDTO = await response.json();
  console.log(data);
  if (!Array.isArray(data.images)) {
    throw new Error("API response does not contain 'images' array.");
  }

  return data.images;
};

export const createNewGame = async (
  batchCount: number,
  batchSize: number,
  difficulty: number,
  token: string | null
): Promise<NewGameResponseDTO> => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const response = await fetch(`${API_BASE_URL}/api/game`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      batchCount,
      batchSize,
      difficulty,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json();
};

export const submitGuessesRequest = async (
  gameId: number,
  guesses: boolean[],
  token: string | null
): Promise<{ correct: boolean[] }> => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const response = await fetch(`${API_BASE_URL}/api/game/${gameId}/guess`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      guesses: guesses,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};

// API call to fetch game results
export const fetchGameResults = async (gameId: string, token: string):
Promise<GameResult> => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  console.log("Fetching game results for:", gameId);
  const response = await fetch(`${API_BASE_URL}/api/game/${gameId}/results`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
  const text = await response.text();
  const data = JSON.parse(text);
  console.log(data);

  return data;
};

// API call to retrieve 10 last games
export const fetchLastGames = async (token: string):
  Promise<LastGameDTO[]> => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  console.log("Fetching last 10 games for this user");

  const response = await fetch(`${API_BASE_URL}/api/history/last10`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
  const text = await response.text();
  const data = JSON.parse(text);
  console.log(data);

  return data;
}