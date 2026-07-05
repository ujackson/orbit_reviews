// @ts-nocheck
import { Box } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { ConversationsPane } from './components/ConversationsPane';
import { ThreadPane } from './components/ThreadPane';
import { AIContextPanel } from '../ai/components/AIContextPanel';
import { useConversations } from './hooks/useConversations';
import { useUpdateStatus } from './hooks/useUpdateStatus';
import { useAssignConversation } from './hooks/useAssignConversation';
import { useMessages } from './hooks/useMessages';
import { useSendReply } from './hooks/useSendReply';
import { useInboxUIStore } from './store/inboxUIStore';
import { useKeyboard } from '@/providers/KeyboardProvider';
import { layout } from '../../shared/tokens';
import { MessageStatus, Priority } from './types';
import { useUIStore } from '@/stores/uiStore';
import { motion } from 'motion/react';

interface InboxViewProps {
  viewId?: string;
}

export const InboxView = ({ viewId = 'all' }: InboxViewProps) => {
  const { registerShortcut } = useKeyboard();
  const { setFocusMode } = useUIStore();
  
  const {
    selectedConversationId,
    setSelectedConversationId,
    searchQuery,
    setSearchQuery,
  } = useInboxUIStore();

  const updateStatusMutation = useUpdateStatus();
  const assignMutation = useAssignConversation();
  const sendReplyMutation = useSendReply();

  // Build filter based on view
  const filter = useMemo(() => {
    let status: MessageStatus | 'all' = 'all';
    let priority: Priority | 'all' = 'all';

    switch (viewId) {
      case 'all':
        status = 'all';
        break;
      case 'assigned':
        status = 'unread';
        break;
      case 'mentions':
        status = 'unread';
        break;
      case 'ai-queue':
        status = 'unread';
        priority = 'urgent';
        break;
      case 'closed':
        status = 'archived';
        break;
      default:
        status = 'unread';
    }

    return {
      status,
      channels: [],
      priority,
      searchQuery,
    };
  }, [viewId, searchQuery]);

  const { data: conversations = [], isLoading } = useConversations(viewId || 'all', filter);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );
  const { data: threadMessages = [], isLoading: isMessagesLoading } = useMessages(selectedConversationId);

  // Focus mode: enable when conversation is selected
  useEffect(() => {
    setFocusMode(!!selectedConversationId);
  }, [selectedConversationId, setFocusMode]);

  useEffect(() => {
    if (selectedConversationId && selectedConversation?.status === 'unread') {
      updateStatusMutation.mutate({ messageId: selectedConversationId, status: 'read' });
    }
  }, [selectedConversationId, selectedConversation?.status]);

  // Register keyboard shortcuts
  useEffect(() => {
    const shortcuts = [
      registerShortcut({
        key: 'j',
        handler: () => {
          const currentIndex = conversations.findIndex((c) => c.id === selectedConversationId);
          if (currentIndex < conversations.length - 1) {
            setSelectedConversationId(conversations[currentIndex + 1].id);
          }
        },
        description: 'Next conversation',
      }),
      registerShortcut({
        key: 'k',
        handler: () => {
          const currentIndex = conversations.findIndex((c) => c.id === selectedConversationId);
          if (currentIndex > 0) {
            setSelectedConversationId(conversations[currentIndex - 1].id);
          }
        },
        description: 'Previous conversation',
      }),
      registerShortcut({
        key: 'e',
        handler: () => {
          if (selectedConversationId) {
            assignMutation.mutate({ conversationId: selectedConversationId });
          }
        },
        description: 'Assign to me',
      }),
      registerShortcut({
        key: 'c',
        handler: () => {
          if (selectedConversationId) {
            updateStatusMutation.mutate({ messageId: selectedConversationId, status: 'archived' });
            setSelectedConversationId(null);
          }
        },
        description: 'Close conversation',
      }),
      registerShortcut({
        key: 'r',
        handler: () => {
          if (selectedConversationId) {
            console.log('Mark as pending:', selectedConversationId);
          }
        },
        description: 'Mark as pending',
      }),
    ];

    return () => {
      shortcuts.forEach((unregister) => unregister());
    };
  }, [
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    updateStatusMutation,
    assignMutation,
    registerShortcut,
  ]);

  const handleMarkAsRead = (messageId: string) => {
    updateStatusMutation.mutate({ messageId, status: 'read' });
  };

  const handleArchive = (messageId: string) => {
    updateStatusMutation.mutate({ messageId, status: 'archived' });
    if (selectedConversationId === messageId) {
      setSelectedConversationId(null);
    }
  };

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId, setSelectedConversationId]);

  const hasFocus = !!selectedConversationId;

  return (
    <Box sx={{ display: 'flex', flex: 1, width: '100%', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
      {/* Conversations Pane - 320px with subtle focus mode dimming */}
      <motion.div
        initial={false}
        animate={{ 
          opacity: hasFocus ? 0.95 : 1, // Subtle 95% opacity for focus
        }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        style={{ display: 'flex', flex: '0 0 320px', width: 320, minWidth: 320 }}
      >
        <ConversationsPane
          conversations={conversations}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </motion.div>

      {/* Thread Pane - Flex with subtle elevation lift on focus */}
      <motion.div
        initial={false}
        animate={{ 
          boxShadow: hasFocus 
            ? '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.06)' 
            : '0 0 0 rgba(0, 0, 0, 0)',
        }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', zIndex: hasFocus ? 1 : 0, position: 'relative', overflow: 'hidden' }}
      >
        <ThreadPane
          conversation={selectedConversation}
          messages={threadMessages}
          isMessagesLoading={isMessagesLoading}
          isSending={sendReplyMutation.isPending}
          onMarkAsRead={handleMarkAsRead}
          onArchive={handleArchive}
          onSendReply={(conversationId, body) => sendReplyMutation.mutate({ conversationId, body })}
        />
      </motion.div>

      {/* AI Context Pane - 360px */}
      <Box sx={{ flex: '0 0 360px', width: 360, minWidth: 360, display: { xs: 'none', lg: 'flex' } }}>
        <AIContextPanel conversation={selectedConversation} />
      </Box>
    </Box>
  );
};
