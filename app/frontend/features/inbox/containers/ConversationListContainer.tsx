// @ts-nocheck
/**
 * Feature Container: ConversationListContainer (Layer 4)
 * 
 * Connects data hooks with ConversationRow pattern.
 * This is where data enters the UI.
 * 
 * Responsibilities:
 * - Call hooks
 * - Pass data into patterns
 * - Handle user actions
 */

import { Box } from '@mui/material';
import { ConversationRow, ConversationRowSkeleton, ConversationRowEmpty } from '../patterns';
import { Message } from '../types';
import { getChannelColor, getChannelLabel } from '@/lib/mockMessages';
import { useInboxUIStore } from '../store/inboxUIStore';

interface ConversationListContainerProps {
  conversations: Message[];
  isLoading: boolean;
}

export const ConversationListContainer = ({
  conversations,
  isLoading,
}: ConversationListContainerProps) => {
  const { selectedConversationId, setSelectedConversationId, focusedConversationId } = useInboxUIStore();

  if (isLoading) {
    return (
      <Box>
        {[...Array(8)].map((_, i) => (
          <ConversationRowSkeleton key={i} />
        ))}
      </Box>
    );
  }

  if (conversations.length === 0) {
    return <ConversationRowEmpty message="No conversations found" />;
  }

  return (
    <Box>
      {conversations.map((conversation) => (
        <ConversationRow
          key={conversation.id}
          id={conversation.id}
          senderName={conversation.sender.name}
          senderAvatar={conversation.sender.avatar}
          subject={conversation.subject}
          preview={conversation.preview}
          timestamp={conversation.timestamp}
          channelColor={getChannelColor(conversation.channel)}
          channelLabel={getChannelLabel(conversation.channel)}
          service={conversation.service}
          isUnread={conversation.status === 'unread'}
          isSelected={selectedConversationId === conversation.id}
          isFocused={focusedConversationId === conversation.id}
          hasAttachments={conversation.hasAttachments}
          isUrgent={conversation.priority === 'urgent'}
          onClick={() => setSelectedConversationId(conversation.id)}
        />
      ))}
    </Box>
  );
};
