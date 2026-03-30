import { supabase } from "./client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function getAccessToken(): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.access_token) {
    return sessionData.session.access_token;
  }

  const { data: refreshData, error } = await supabase.auth.refreshSession();
  if (error || !refreshData.session?.access_token) {
    throw new Error("You are not authenticated. Please sign in again.");
  }

  return refreshData.session.access_token;
}

export async function authFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  const hasBody = init.body !== undefined && init.body !== null;
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json().catch(() => ({})) : await response.text().catch(() => "");

  if (!response.ok) {
    const detail = typeof payload === "object" && payload && "detail" in payload ? String((payload as { detail?: unknown }).detail) : String(payload || response.statusText);
    if (response.status === 401) {
      throw new Error(detail || "Session expired. Please sign in again.");
    }
    throw new Error(detail || `Request failed with status ${response.status}`);
  }

  return payload as T;
}
