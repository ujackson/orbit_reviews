// @ts-nocheck
/**
 * Layout Component: ConversationsPane (Layer 3)
 * 
 * Defines structural container for conversations list.
 * Manages search UI and list layout.
 */

import { Box, TextField, InputAdornment, alpha } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { Message } from '../types';
import { useInboxUIStore } from '../store/inboxUIStore';
import { ConversationListContainer } from '../containers/ConversationListContainer';
import { normalizeConversationSearchQuery } from '../utils/search';
import { color, spacing, layout, typography, text, radius } from '../../../shared/tokens/design-tokens';

interface ConversationsPaneProps {
  conversations: Message[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ConversationsPane = ({
  conversations,
  isLoading,
  searchQuery,
  onSearchChange,
}: ConversationsPaneProps) => {
  return (
    <Box
      sx={{
        width: layout.conversationsPane.width,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: color.surface.navigation, // Layer 2 - Navigation surface (semantic token)
        borderRight: `1px solid ${alpha(color.neutral[900], 0.04)}`, // Tonal border instead of visible
      }}
    >
      {/* Search */}
      <Box 
        sx={{ 
          p: spacing[16], 
          borderBottom: `1px solid ${alpha(color.neutral[900], 0.04)}`, // Tonal border
          bgcolor: color.surface.navigation, // Keep consistent with navigation surface
        }}
      >
        <TextField
          fullWidth
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(normalizeConversationSearchQuery(e.target.value))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: text.secondary, fontSize: 20 }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: radius.base,
              fontSize: typography.fontSize.md,
              bgcolor: color.surface.primary,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: color.neutral[200],
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: color.neutral[300],
              },
            },
          }}
        />
      </Box>

      {/* Conversations List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <ConversationListContainer
          conversations={conversations}
          isLoading={isLoading}
        />
      </Box>
    </Box>
  );
};
