import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import {
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Extension as IntegrationIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';

const S = {
  bg:         '#FFFFFF',
  border:     '#E7E9EE',
  inactive:   '#626A78',
  activeText: '#4E51DA',
  activeBg:   '#F1F1FC',
  hover:      'rgba(0,0,0,0.03)',
  title:      '#171A21',
  section:    '#9299A6',
} as const;

interface SettingsSidebarProps {
  selectedSection: string;
  onSectionChange: (id: string) => void;
}

const SECTIONS = [
  { id: 'appearance',    label: 'Appearance',     Icon: PaletteIcon },
  { id: 'notifications', label: 'Notifications',  Icon: NotificationsIcon },
  { id: 'integrations',  label: 'Integrations',   Icon: IntegrationIcon },
  { id: 'users',         label: 'Users & Roles',  Icon: PeopleIcon },
  { id: 'security',      label: 'Security',        Icon: SecurityIcon },
  { id: 'billing',       label: 'Billing',         Icon: PaymentIcon },
];

export const SettingsSidebar = ({ selectedSection, onSectionChange }: SettingsSidebarProps) => (
  <Box sx={{
    width: 220,
    height: '100vh',
    bgcolor: S.bg,
    borderRight: `1px solid ${S.border}`,
    display: 'flex', flexDirection: 'column',
    py: '20px', px: '12px', flexShrink: 0,
  }}>
    <Typography sx={{
      fontSize: 15, fontWeight: 600, color: S.title,
      px: '8px', mb: '12px', letterSpacing: '-0.01em',
    }}>
      Settings
    </Typography>

    <List sx={{ p: 0, flex: 1 }}>
      {SECTIONS.map(({ id, label, Icon }) => {
        const on = selectedSection === id;
        return (
          <ListItem key={id} disablePadding sx={{ mb: '1px' }}>
            <ListItemButton
              selected={on}
              onClick={() => onSectionChange(id)}
              sx={{
                borderRadius: '6px', py: '6px', px: '8px', minHeight: 34,
                bgcolor: on ? S.activeBg : 'transparent',
                '&.Mui-selected': { bgcolor: S.activeBg, '&:hover': { bgcolor: S.activeBg } },
                '&:hover': { bgcolor: on ? S.activeBg : S.hover },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: on ? S.activeText : S.inactive }}>
                <Icon sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  fontSize: 13, fontWeight: on ? 600 : 400,
                  color: on ? S.activeText : S.inactive,
                  letterSpacing: '-0.005em',
                }}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>

    {/* Logout */}
    <Box
      component="button"
      onClick={() => toast.info('Signing out…')}
      sx={{
        display: 'flex', alignItems: 'center', gap: '8px',
        width: '100%', px: '8px', py: '6px', mt: '4px',
        border: 'none', background: 'none', cursor: 'pointer',
        borderRadius: '6px', textAlign: 'left',
        color: '#626A78',
        transition: 'background-color 0.10s, color 0.10s',
        '&:hover': { bgcolor: '#FFF1F2', color: '#D92D3A' },
      }}
    >
      <LogoutIcon sx={{ fontSize: 16, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 13, fontWeight: 400, fontFamily: 'inherit', color: 'inherit' }}>
        Sign out
      </Typography>
    </Box>
  </Box>
);
