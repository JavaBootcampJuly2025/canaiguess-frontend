import { UserDTO } from "@/dto/UserDTO";
// API call to retrieve user stats
export const fetchUserStats = async (token: string, username: string):
  Promise<UserDTO> => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FALLBACK;

  const response = await fetch(`${API_BASE_URL}/api/user/${username}/stats`, {
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

  return data;
}

export const promoteUserToAdmin = async (token: string, username: string) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FALLBACK;
  const response = await fetch(`${API_BASE_URL}/api/user/${username}/promote`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to promote user: ${errorText}`);
  }
  
  return true;
};