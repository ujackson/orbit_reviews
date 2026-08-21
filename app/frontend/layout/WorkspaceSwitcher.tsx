import {
  Dialog, DialogContent, List, ListItem, ListItemButton,
  ListItemAvatar, ListItemText, Avatar, Box, Button, IconButton, Typography, Divider,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, Check as CheckIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useWorkspace } from '../providers/WorkspaceProvider';
import { useNavigate } from '@/hooks/useInertiaNavigation';
import { toast } from 'sonner';

const BR = '#5B5FEF';
const BRS = '#F2F2FD';
const BD = '#E7E9EE';
const TXP = '#171A21';
const TXS = '#626A78';
const TXT = '#9299A6';

interface Workspace {
  id: string;
  name: string;
  plan: string;
  memberCount?: number;
  initials: string;
}

const WORKSPACES: Workspace[] = [
  { id: 'default',     name: 'Personal Workspace', plan: 'Free',       initials: 'PW' },
  { id: 'acme-corp',   name: 'Acme Corporation',   plan: 'Enterprise', initials: 'AC', memberCount: 24 },
  { id: 'design-team', name: 'Design Team',         plan: 'Team',       initials: 'DT', memberCount: 8 },
];

interface Props { open: boolean; onClose: () => void }

export const WorkspaceSwitcher = ({ open, onClose }: Props) => {
  const { workspace, switchWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const handleSwitch = (ws: Workspace) => {
    if (workspace?.id === ws.id) { onClose(); return; }
    switchWorkspace(ws.id);
    navigate(`/w/${ws.id}`);
    onClose();
    toast.success(`Switched to ${ws.name}`);
  };

  const handleLogout = () => {
    onClose();
    toast.info('Signing out…');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: '12px', border: `1px solid ${BD}`, boxShadow: '0 16px 40px rgba(16,24,40,0.14)' } }}
    >
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: '20px', py: '14px', borderBottom: `1px solid ${BD}`,
      }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: TXP, letterSpacing: '-0.01em' }}>
          Switch workspace
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ ml: '8px' }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* Workspace list */}
        <List sx={{ py: '6px', px: '8px' }}>
          {WORKSPACES.map((ws) => {
            const isActive = workspace?.id === ws.id;
            return (
              <ListItem key={ws.id} disablePadding sx={{ mb: '1px' }}>
                <ListItemButton
                  onClick={() => handleSwitch(ws)}
                  sx={{
                    borderRadius: '8px', py: '10px', px: '12px',
                    bgcolor: isActive ? BRS : 'transparent',
                    '&:hover': { bgcolor: isActive ? BRS : 'rgba(0,0,0,0.03)' },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Avatar sx={{
                      width: 30, height: 30, fontSize: 11, fontWeight: 600,
                      bgcolor: isActive ? BR : 'rgba(0,0,0,0.07)',
                      color: isActive ? '#fff' : TXS,
                      borderRadius: '7px',
                    }}>
                      {ws.initials}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={ws.name}
                    secondary={ws.memberCount ? `${ws.memberCount} members · ${ws.plan}` : ws.plan}
                    primaryTypographyProps={{
                      fontSize: 13, fontWeight: isActive ? 600 : 400,
                      color: isActive ? BR : TXP, letterSpacing: '-0.005em',
                    }}
                    secondaryTypographyProps={{ fontSize: 11, color: TXT, mt: '1px' }}
                  />
                  {isActive && <CheckIcon sx={{ fontSize: 15, color: BR, flexShrink: 0 }} />}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ borderColor: BD, mx: '8px' }} />

        {/* Footer actions */}
        <Box sx={{ px: '16px', py: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AddIcon sx={{ fontSize: 15 }} />}
            onClick={() => { onClose(); toast.info('Create workspace — coming soon'); }}
            sx={{
              fontSize: 13, fontWeight: 500, justifyContent: 'flex-start',
              border: `1px solid ${BD}`, color: TXS, borderRadius: '8px', height: 34,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.03)', borderColor: '#D8DCE5' },
            }}
          >
            Create new workspace
          </Button>
          <Button
            fullWidth
            startIcon={<LogoutIcon sx={{ fontSize: 15 }} />}
            onClick={handleLogout}
            sx={{
              fontSize: 13, fontWeight: 500, justifyContent: 'flex-start',
              color: '#D92D3A', borderRadius: '8px', height: 34,
              '&:hover': { bgcolor: '#FFF1F2' },
            }}
          >
            Sign out
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
