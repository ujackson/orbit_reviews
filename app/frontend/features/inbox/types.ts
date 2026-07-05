// @ts-nocheck
export type Channel = 'email' | 'sms' | 'whatsapp' | 'instagram' | 'slack';
export type MessageStatus = 'unread' | 'read' | 'archived';
export type Priority = 'normal' | 'high' | 'urgent';

export interface Contact {
  id: string;
  name: string;
  email: string;
  avatar: string;
  organization?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'document' | 'spreadsheet' | 'video' | 'other';
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  source: Channel;
  uploadedAt: Date;
  includeInAI?: boolean;
  aiSummary?: string;
  aiExtractedFields?: Record<string, string>;
  aiDescription?: string;
  citations?: { text: string; page?: number; location?: string }[];
}

export interface Message {
  id: string;
  channel: Channel;
  sender: Contact;
  subject: string;
  preview: string;
  body: string;
  timestamp: Date;
  status: MessageStatus;
  priority: Priority;
  labels: string[];
  hasAttachments: boolean;
  attachmentCount?: number;
  attachments?: Attachment[];
  threadCount?: number;
  aiSummary?: string;
  direction?: 'inbound' | 'outbound' | 'internal_note';
  bodyFormat?: 'html' | 'markdown' | 'text';
  service?: 'gmail' | 'slack' | string;
}
