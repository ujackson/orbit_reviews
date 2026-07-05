import { Message, MessageStatus, Priority } from '../types';
import { compactConversationSearchQuery } from '../utils/search';

export interface ConversationsFilter {
  status?: MessageStatus | 'all';
  priority?: Priority | 'all';
  channels?: string[];
  searchQuery?: string;
}

export const inboxApi = {
  getConversations: async (
    workspaceId: string,
    filter: ConversationsFilter = {}
  ): Promise<Message[]> => {
    const params = new URLSearchParams();
    const searchQuery = compactConversationSearchQuery(filter.searchQuery);

    if (filter.status && filter.status !== 'all') params.set('status', filter.status);
    if (filter.priority && filter.priority !== 'all') params.set('priority', filter.priority);
    if (searchQuery) params.set('searchQuery', searchQuery);
    filter.channels?.forEach((channel) => params.append('channels[]', channel));

    const query = params.toString();
    const response = await fetch(`/w/${workspaceId}/api/conversations${query ? `?${query}` : ''}`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) throw new Error('Failed to fetch conversations');

    const data = await response.json();
    return data.map(deserializeMessage);
  },

  getMessages: async (
    workspaceId: string,
    conversationId: string
  ): Promise<Message[]> => {
    const response = await fetch(`/w/${workspaceId}/api/conversations/${conversationId}/messages`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) throw new Error('Failed to fetch messages');

    const data = await response.json();
    return data.map(deserializeMessage);
  },

  updateMessageStatus: async (
    workspaceId: string,
    conversationId: string,
    status: MessageStatus
  ): Promise<Message> => {
    const response = await fetch(`/w/${workspaceId}/api/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update conversation');
    }

    return deserializeMessage(await response.json());
  },

  sendReply: async (
    workspaceId: string,
    conversationId: string,
    body: string
  ): Promise<Message> => {
    const response = await fetch(`/w/${workspaceId}/api/conversations/${conversationId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
      },
      body: JSON.stringify({ body }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send reply');
    }

    return deserializeMessage(await response.json());
  },

  assignConversation: async (
    workspaceId: string,
    conversationId: string,
    userId: string
  ): Promise<void> => {
    console.log('Assign conversation:', conversationId, 'to user:', userId, 'in workspace:', workspaceId);
  },
};

const deserializeMessage = (message: any): Message => ({
  ...message,
  timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
  sender: {
    ...message.sender,
    avatar: message.sender?.avatar || (message.sender?.name || '?').slice(0, 1).toUpperCase(),
  },
  attachments: (message.attachments || []).map((attachment: any) => ({
    ...attachment,
    mimeType: attachment.mimeType || attachment.mime_type || '',
    uploadedAt: attachment.uploadedAt || attachment.uploaded_at ? new Date(attachment.uploadedAt || attachment.uploaded_at) : new Date(),
    includeInAI: attachment.includeInAI ?? attachment.includeInAi ?? attachment.include_in_ai ?? false,
    aiSummary: attachment.aiSummary ?? attachment.ai_summary,
    aiExtractedFields: attachment.aiExtractedFields ?? attachment.ai_extracted_fields,
    aiDescription: attachment.aiDescription ?? attachment.ai_description,
  })),
});
