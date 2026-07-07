const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export async function register(data: RegisterPayload) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Registration failed");
  }

  return result;
}