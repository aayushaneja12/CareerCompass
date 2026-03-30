import { authFetch } from "./api-client";

export interface ChatRequest {
  message: string;
  conversation_id?: string | null;
}

export interface ChatResponse {
  reply: string;
  intent?: string | null;
  conversation_id?: string | null;
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  return authFetch<ChatResponse>("/chat", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
