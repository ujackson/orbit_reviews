// @ts-nocheck
import { create } from 'zustand';

interface InboxUIState {
  // Selected conversation
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  
  // Focused conversation (keyboard navigation)
  focusedConversationId: string | null;
  setFocusedConversationId: (id: string | null) => void;
  
  // Right panel
  rightPanelTab: 'customer' | 'ai' | 'tasks' | 'activity';
  setRightPanelTab: (tab: 'customer' | 'ai' | 'tasks' | 'activity') => void;
  
  // Composer draft
  composerDraft: string;
  setComposerDraft: (draft: string) => void;
  clearComposerDraft: () => void;
  
  // Search query
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // AI suggested reply editing
  isEditingSuggestedReply: boolean;
  editedSuggestedReply: string;
  setEditingSuggestedReply: (editing: boolean) => void;
  setEditedSuggestedReply: (text: string) => void;
}

export const useInboxUIStore = create<InboxUIState>((set) => ({
  selectedConversationId: null,
  setSelectedConversationId: (id) => set({ selectedConversationId: id }),
  
  focusedConversationId: null,
  setFocusedConversationId: (id) => set({ focusedConversationId: id }),
  
  rightPanelTab: 'ai',
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  
  composerDraft: '',
  setComposerDraft: (draft) => set({ composerDraft: draft }),
  clearComposerDraft: () => set({ composerDraft: '' }),
  
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  isEditingSuggestedReply: false,
  editedSuggestedReply: '',
  setEditingSuggestedReply: (editing) => set({ isEditingSuggestedReply: editing }),
  setEditedSuggestedReply: (text) => set({ editedSuggestedReply: text }),
}));