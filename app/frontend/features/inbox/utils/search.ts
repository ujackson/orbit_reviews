export const normalizeConversationSearchQuery = (value: unknown): string =>
  String(value ?? '')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060\u034F\u00AD]/g, '')
    .replace(/\s+/g, ' ');

export const compactConversationSearchQuery = (value: unknown): string =>
  normalizeConversationSearchQuery(value).trim();
