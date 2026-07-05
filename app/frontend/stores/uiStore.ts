import { create } from 'zustand';

interface UIState {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Command palette
  isCommandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  
  // Selected items
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  
  // Panel states
  isContextPanelCollapsed: boolean;
  toggleContextPanel: () => void;
  
  // Focus mode
  isFocusMode: boolean;
  setFocusMode: (enabled: boolean) => void;
  
  // Active workspace
  activeWorkspaceId: string;
  setActiveWorkspaceId: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  
  isCommandPaletteOpen: false,
  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
  
  selectedConversationId: null,
  setSelectedConversationId: (id) => set({ selectedConversationId: id }),
  
  isContextPanelCollapsed: false,
  toggleContextPanel: () => set((state) => ({ isContextPanelCollapsed: !state.isContextPanelCollapsed })),
  
  isFocusMode: false,
  setFocusMode: (enabled) => set({ isFocusMode: enabled }),
  
  activeWorkspaceId: 'default',
  setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
}));