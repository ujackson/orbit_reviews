// @ts-nocheck
/**
 * Type: Attachment
 * 
 * Enterprise attachment model with provenance and AI metadata
 */

import { Channel } from '../types';

export type AttachmentType = 'image' | 'pdf' | 'document' | 'spreadsheet' | 'video' | 'other';

export interface Attachment {
  id: string;
  name: string;
  type: AttachmentType;
  mimeType: string;
  size: number; // bytes
  url: string;
  thumbnailUrl?: string;
  source: Channel; // Provenance: where it came from
  uploadedAt: Date;
  
  // AI metadata
  includeInAI?: boolean;
  aiSummary?: string;
  aiExtractedFields?: Record<string, string>;
  aiDescription?: string;
  citations?: AttachmentCitation[];
}

export interface AttachmentCitation {
  text: string;
  page?: number;
  location?: string; // e.g., "page 3", "slide 5", "row 12"
}

export const getAttachmentIcon = (type: AttachmentType): string => {
  switch (type) {
    case 'image':
      return '🖼️';
    case 'pdf':
      return '📄';
    case 'document':
      return '📝';
    case 'spreadsheet':
      return '📊';
    case 'video':
      return '🎥';
    default:
      return '📎';
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
