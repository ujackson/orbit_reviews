/**
 * Component: WorkspaceSwitcher
 *
 * Dialog for switching between workspaces with create workspace option.
 */

import { Dialog, DialogContent, DialogTitle, List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Avatar, Box, Button, IconButton, Typography, alpha } from '@mui/material';
import {
  Add as AddIcon,
  Business as BusinessIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useWorkspace } from '../providers/WorkspaceProvider';
import { color, spacing, typography, radius, text } from '@/shared/tokens/design-tokens';
import { toast } from 'sonner';

interface WorkspaceSwitcherProps {
  open: boolean;
  onClose: () => void;
}

export const WorkspaceSwitcher = ({ open, onClose }: WorkspaceSwitcherProps) => {
  const { workspace, workspaces, switchWorkspace } = useWorkspace();

  const handleSwitchWorkspace = (workspaceId: string) => {
    switchWorkspace(workspaceId);
    onClose();
    toast.success(`Switched to ${workspaces.find(w => w.id === workspaceId)?.name}`);
  };

  const handleCreateWorkspace = () => {
    onClose();
    toast.info('Create workspace dialog will open here');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: radius.lg,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: spacing[12] }}>
        <Typography sx={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold }}>
          Switch Workspace
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <List sx={{ py: 0 }}>
          {workspaces.map((ws) => {
            const isActive = workspace?.id === ws.id;
            return (
              <ListItem key={ws.id} disablePadding>
                <ListItemButton
                  selected={isActive}
                  onClick={() => !isActive && handleSwitchWorkspace(ws.id)}
                  sx={{
                    py: spacing[12],
                    px: spacing[24],
                    '&.Mui-selected': {
                      bgcolor: alpha(color.functional.primary, 0.08),
                      '&:hover': {
                        bgcolor: alpha(color.functional.primary, 0.12),
                      },
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: isActive ? color.functional.primary : alpha(color.neutral[900], 0.08),
                        color: isActive ? '#FFFFFF' : text.secondary,
                      }}
                    >
                      {ws.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={ws.name}
                    secondary="WorkOS organization"
                    primaryTypographyProps={{
                      fontSize: typography.fontSize.base,
                      fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.medium,
                    }}
                    secondaryTypographyProps={{
                      fontSize: typography.fontSize.sm,
                    }}
                  />
                  {isActive && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: color.functional.success,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ p: spacing[24], pt: spacing[16], borderTop: `1px solid ${alpha(color.neutral[900], 0.06)}` }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreateWorkspace}
            sx={{
              fontSize: typography.fontSize.base,
              textTransform: 'none',
              fontWeight: typography.fontWeight.medium,
              borderColor: alpha(color.neutral[900], 0.12),
              color: text.primary,
            }}
          >
            Create New Workspace
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
