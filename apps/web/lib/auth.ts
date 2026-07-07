const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export function register(data: RegisterPayload) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function login(data: LoginPayload) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}