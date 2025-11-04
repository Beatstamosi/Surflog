// src/utils/apiClient.ts
import { APIURL } from "./apiURL";

interface FetchOptions extends RequestInit {
  auth?: boolean; // Add token automatically if true
}

export async function apiClient(endpoint: string, options: FetchOptions = {}) {
  const { auth = true, headers, ...rest } = options;

  // Add Authorization header if needed
  const token = auth ? localStorage.getItem("token") : null;

  const res = await fetch(`${APIURL}${endpoint}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    credentials: "include", // keeps cookies for session-based auth
  });

  // Parse JSON automatically
  const data = await res.json().catch(() => ({}));

  // Handle HTTP errors globally
  if (!res.ok) {
    console.error(`API error (${res.status}):`, data);
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}
