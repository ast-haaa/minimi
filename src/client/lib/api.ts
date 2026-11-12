import type {
  Conversation,
  ConversationListItem,
  Message,
  HealthResponse,
  Source,
} from '../../shared/types.js';

const BASE_URL = '/api';

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE_URL}/health`);
  return res.json();
}

export async function fetchConversations(): Promise<ConversationListItem[]> {
  const res = await fetch(`${BASE_URL}/conversations`);
  if (!res.ok) throw new Error('Failed to load conversations');
  const data = await res.json();
  return data.conversations;
}

export async function createConversation(title?: string): Promise<Conversation> {
  const res = await fetch(`${BASE_URL}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to create conversation');
  const data = await res.json();
  return data.conversation;
}

export async function fetchConversation(
  id: string
): Promise<{ conversation: Conversation; messages: Message[] }> {
  const res = await fetch(`${BASE_URL}/conversations/${id}`);
  if (!res.ok) throw new Error('Failed to load conversation');
  return res.json();
}

export async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/conversations/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete conversation');
}

export async function updateConversation(
  id: string,
  updates: { title?: string; isPinned?: boolean }
): Promise<Conversation> {
  const res = await fetch(`${BASE_URL}/conversations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update conversation');
  const data = await res.json();
  return data.conversation;
}

export async function togglePinConversation(
  id: string,
  isPinned?: boolean
): Promise<Conversation> {
  const res = await fetch(`${BASE_URL}/conversations/${id}/pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(isPinned !== undefined ? { isPinned } : {}),
  });
  if (!res.ok) throw new Error('Failed to pin conversation');
  const data = await res.json();
  return data.conversation;
}

export interface StreamChatParams {
  conversationId?: string;
  message: string;
  onStart?: (conversationId: string) => void;
  onToken: (token: string) => void;
  onComplete: (content: string, sources: Source[]) => void;
  onError: (error: Error) => void;
  signal?: AbortSignal;
}

export async function streamChatMessage({
  conversationId,
  message,
  onStart,
  onToken,
  onComplete,
  onError,
  signal,
}: StreamChatParams): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ conversationId, message, stream: true }),
      signal,
    });

    if (!res.ok) {
      let errText = 'Chat error';
      try {
        const errJson = await res.json();
        errText = errJson.message || errJson.error || errText;
      } catch {
        errText = await res.text();
      }
      throw new Error(errText);
    }

    if (!res.body) {
      throw new Error('No response body returned from server');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let accumulatedContent = '';
    let finalSources: Source[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.slice(5).trim();
        if (!dataStr) continue;

        try {
          const payload = JSON.parse(dataStr);
          if (payload.type === 'start') {
            if (payload.conversationId && onStart) {
              onStart(payload.conversationId);
            }
          } else if (payload.type === 'token') {
            accumulatedContent += payload.token;
            onToken(payload.token);
          } else if (payload.type === 'done') {
            finalSources = payload.sources || [];
            onComplete(payload.content || accumulatedContent, finalSources);
          } else if (payload.type === 'error') {
            throw new Error(payload.error || 'Server stream error');
          }
        } catch (e: unknown) {
          if (e instanceof Error && e.message.includes('Server stream error')) {
            throw e;
          }
          // Non-JSON SSE ping or keepalive line
        }
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return; // aborted by user
    }
    const errorObj = err instanceof Error ? err : new Error(String(err));
    onError(errorObj);
  }
}

