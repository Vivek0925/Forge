import { api } from "./api";

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
  return api<T>(endpoint, options);
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