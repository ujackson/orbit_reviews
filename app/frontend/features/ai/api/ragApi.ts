// @ts-nocheck
export interface RagSource {
  contentId: string;
  contentType: string;
  title?: string;
  score: number;
  text?: string;
  metadata: Record<string, unknown>;
}

export interface RagQueryResponse {
  answer: string;
  sources: RagSource[];
  indexing?: boolean;
}

const REQUEST_TIMEOUT_MS = 18000;

export const ragApi = {
  indexConversation: async (
    workspaceId: string,
    conversationId: string
  ): Promise<{ indexedCount: number; chunkCount: number; conversationId: string }> => {
    const response = await fetchWithTimeout(`/w/${workspaceId}/api/conversations/${conversationId}/rag/index`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
      },
    });

    if (!response.ok) throw new Error(errorMessageForResponse(response, 'index conversation knowledge'));

    const data = await response.json();
    return {
      indexedCount: data.indexed_count || 0,
      chunkCount: data.chunk_count || 0,
      conversationId: String(data.conversation_id || conversationId),
    };
  },

  query: async (
    workspaceId: string,
    query: string,
    filters: Record<string, unknown> = {},
    topK = 5
  ): Promise<RagQueryResponse> => {
    const response = await fetchWithTimeout(`/w/${workspaceId}/api/rag/query`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
      },
      body: JSON.stringify({ query, filters, top_k: topK }),
    });

    if (!response.ok) throw new Error(errorMessageForResponse(response, 'search workspace knowledge'));

    const data = await response.json();
    return {
      answer: cleanText(data.answer),
      sources: (data.sources || []).map((source: any) => ({
        contentId: source.content_id,
        contentType: source.content_type,
        title: source.title,
        score: Number(source.score || 0),
        text: cleanText(source.text),
        metadata: source.metadata || {},
      })),
    };
  },

  queryConversation: async (
    workspaceId: string,
    conversationId: string,
    query: string,
    filters: Record<string, unknown> = { content_type: 'message' },
    topK = 5
  ): Promise<RagQueryResponse> => {
    const response = await fetchWithTimeout(`/w/${workspaceId}/api/conversations/${conversationId}/rag/query`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
      },
      body: JSON.stringify({ query, filters, top_k: topK }),
    });

    if (!response.ok) throw new Error(errorMessageForResponse(response, 'search conversation knowledge'));

    const data = await response.json();
    return {
      answer: cleanText(data.answer),
      indexing: Boolean(data.indexing),
      sources: (data.sources || []).map((source: any) => ({
        contentId: source.content_id,
        contentType: source.content_type,
        title: source.title,
        score: Number(source.score || 0),
        text: cleanText(source.text),
        metadata: source.metadata || {},
      })),
    };
  },
};

const fetchWithTimeout = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Workspace knowledge is taking too long. Try again in a moment.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
};

const cleanText = (value: unknown): string =>
  String(value ?? '')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060\u034F\u00AD]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const errorMessageForResponse = (response: Response, action: string): string => {
  if (response.status === 401) return 'Your session expired. Sign in again to use workspace knowledge.';
  if (response.status === 403) return 'You do not have access to this workspace knowledge.';
  if (response.status === 404) return 'This conversation was not found in the current workspace.';
  if (response.status === 502) return 'The AI knowledge service is unavailable. Try again after orbit_ai is healthy.';

  return `Failed to ${action}`;
};
