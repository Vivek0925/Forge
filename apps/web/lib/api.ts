const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

let csrfTokenPromise: Promise<string> | null = null;

function readCsrfCookie() {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    /(?:^|;\s*)csrf_token=([^;]*)/,
  );
  return match ? decodeURIComponent(match[1]) : null;
}

async function getCsrfToken() {
  const cookieToken = readCsrfCookie();
  if (cookieToken) {
    return cookieToken;
  }

  csrfTokenPromise ??= fetch(`${API_URL}/auth/csrf-token`, {
    credentials: "include",
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Unable to initialize CSRF protection");
      }

      const data = (await response.json()) as { csrfToken: string };
      return data.csrfToken;
    })
    .finally(() => {
      csrfTokenPromise = null;
    });

  return csrfTokenPromise;
}

export async function api<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const isFormData =
    options?.body instanceof FormData;
  const method = options?.method?.toUpperCase() ?? "GET";
  const headers = new Headers(options?.headers);

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    headers.set("X-CSRF-Token", await getCsrfToken());
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      credentials: "include",
      ...options,
      headers,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Something went wrong",
    );
  }

  return data;
}