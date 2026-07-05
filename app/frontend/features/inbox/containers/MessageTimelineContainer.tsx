// @ts-nocheck
/**
 * Feature Container: MessageTimelineContainer (Layer 4)
 * 
 * Connects message data with MessageCard pattern.
 * This is where message data enters the UI.
 */

import { Box } from '@mui/material';
import { MessageCard, MessageCardSkeleton, MessageCardError } from '../patterns';
import { Message } from '../types';
import { getChannelColor } from '@/lib/mockMessages';
import { motion } from 'motion/react';

interface MessageTimelineContainerProps {
  message: Message | null;
  messages?: Message[];
  isLoading: boolean;
  error?: string | null;
}

export const MessageTimelineContainer = ({
  message,
  messages = [],
  isLoading,
  error,
}: MessageTimelineContainerProps) => {
  if (error) {
    return <MessageCardError error={error} />;
  }

  if (isLoading) {
    return (
      <Box>
        <MessageCardSkeleton />
      </Box>
    );
  }

  const timelineMessages = messages.length > 0 ? messages : (message ? [message] : []);

  if (timelineMessages.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.12 }}
    >
      {timelineMessages.map((timelineMessage) => (
        <MessageCard
          key={timelineMessage.id}
          type={timelineMessage.direction === 'outbound' ? 'outbound' : 'inbound'}
          senderName={timelineMessage.sender.name}
          senderAvatar={timelineMessage.sender.avatar}
          senderEmail={timelineMessage.sender.email}
          timestamp={timelineMessage.timestamp}
          content={timelineMessage.body}
          contentFormat={timelineMessage.bodyFormat || 'text'}
          channelColor={getChannelColor(timelineMessage.channel)}
          attachments={timelineMessage.attachments}
        />
      ))}
    </motion.div>
  );
};
