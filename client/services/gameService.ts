import { NewGameResponseDTO } from "@/dto/NewGameResponseDTO";
import { GameDTO } from "@/dto/GameDTO";
import { HintResponseDTO } from "@/dto/HintResponseDTO";
import { ImageBatchResponseDTO, ImageDTO } from "@/dto/ImageBatchResponseDTO";

// API call to fetch game data
export const fetchGameData = async (gameId: string, token: string | null) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}/api/game/${gameId}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
  const text = await response.text();
  const data = JSON.parse(text);
// console.log(data);
//   if (!response.ok) {
//     throw new Error(await response.text());
//   }

  return data;
};

// API call to fetch images
export const fetchBatchImagesFromApi = async (
  gameId: string,
  token: string
): Promise<ImageDTO[]> => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}/api/game/${gameId}/batch`, {
    method: "POST",
    headers,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data: ImageBatchResponseDTO = await response.json();
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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}/api/game`, {
    method: "POST",
    headers,
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
  gameId: string,
  guesses: boolean[],
  token: string | null
): Promise<{ correct: boolean[] }> => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}/api/game/${gameId}/guess`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      guesses: guesses,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};

// API call to retrieve 10 last games
export const fetchLastGames = async (token: string):
  Promise<GameDTO[]> => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const username = localStorage.getItem("username");
  console.log("Fetching last 10 games for this user");

  const response = await fetch(`${API_BASE_URL}/api/user/${username}/games`, {
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

// API call to retrieve hints
export const fetchImageHint = async (token: string, imageId: string):
  Promise<HintResponseDTO> => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  console.log("Analyzing...");

  const response = await fetch(`${API_BASE_URL}/api/image/${imageId}/hint`, {
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
  
  return data;
}