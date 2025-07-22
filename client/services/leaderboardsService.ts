// API call to fetch the global leaderboard
export const fetchGlobalLeaderboard = async () => {
  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  // console.log("fetching score leaderboard");
  const response = await fetch(`${API_BASE_URL}/api/leaderboard`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("API response is not an array.");
  }

  // Validate that each entry has username and score
  return data.map((entry: any) => {
    if (
      typeof entry.username !== "string" ||
      typeof entry.score !== "number"
    ) {
      throw new Error("Invalid leaderboard entry format.");
    }

    return {
      username: entry.username,
      score: entry.score,
    };
  });
};

// API call to fetch the global leaderboard
export const fetchGlobalAccuracyLeaderboard = async () => {
  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  // console.log("fetching accuracy leaderboard");
  const response = await fetch(`${API_BASE_URL}/api/leaderboard/accuracy`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("API response is not an array.");
  }

  // Validate that each entry has username and score
  return data.map((entry: any) => {
    if (
      typeof entry.username !== "string" ||
      typeof entry.accuracy !== "number"
    ) {
      throw new Error("Invalid leaderboard entry format.");
    }

    return {
      username: entry.username,
      accuracy: entry.accuracy,
    };
  });
};
