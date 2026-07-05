import { useState } from 'react';
import { Box, Typography, Tooltip, alpha, Divider, Avatar, Badge } from '@mui/material';
import {
  Home as HomeIcon,
  Inbox as InboxIcon,
  AutoGraph as InsightsIcon,
  BubbleChart as ThemesIcon,
  NotificationsNone as AlertsIcon,
  Leaderboard as CompetitorsIcon,
  Assessment as ReportsIcon,
  Cable as ConnectionsIcon,
  AccountTree as AutomationsIcon,
  Group as TeamIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  ExpandMore as ChevronIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, useWorkspacePath, workspaceRelativePath } from '@/hooks/useInertiaNavigation';
import { useUIStore } from '../stores/uiStore';
import { color, text, transition } from '@/shared/tokens/design-tokens';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { useWorkspace } from '../providers/WorkspaceProvider';

const PRIMARY_NAV = [
  { id: 'home',        label: 'Home',        Icon: HomeIcon,        badge: 0 },
  { id: 'inbox',       label: 'Inbox',       Icon: InboxIcon,       badge: 47 },
  { id: 'insights',    label: 'Insights',    Icon: InsightsIcon,    badge: 0 },
  { id: 'themes',      label: 'Themes',      Icon: ThemesIcon,      badge: 0 },
  { id: 'alerts',      label: 'Alerts',      Icon: AlertsIcon,      badge: 3 },
  { id: 'competitors', label: 'Competitors', Icon: CompetitorsIcon, badge: 0 },
  { id: 'reports',     label: 'Reports',     Icon: ReportsIcon,     badge: 0 },
];

const SECONDARY_NAV = [
  { id: 'connections',  label: 'Connections',  Icon: ConnectionsIcon },
  { id: 'automations',  label: 'Automations',  Icon: AutomationsIcon },
  { id: 'team',         label: 'Team',         Icon: TeamIcon },
];

export const WorkspaceRail = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const workspacePath = useWorkspacePath();
  const { openCommandPalette } = useUIStore();
  const { workspace } = useWorkspace();
  const [wsOpen, setWsOpen] = useState(false);

  const currentPath = workspaceRelativePath(location.pathname);
  const active = (id: string) =>
    (id === 'home' && currentPath === '/') ||
    currentPath === `/${id}` ||
    currentPath.startsWith(`/${id}/`);

  const NavItem = ({
    id, label, Icon, badge = 0,
  }: { id: string; label: string; Icon: any; badge?: number }) => {
    const on = active(id);
    return (
      <Box
        component="button"
        onClick={() => navigate(workspacePath(id === 'home' ? '' : id))}
        aria-current={on ? 'page' : undefined}
        sx={{
          display: 'flex', alignItems: 'center', gap: '9px',
          width: '100%', px: '10px', py: '7px', mx: 0,
          border: 'none', background: 'none', cursor: 'pointer',
          borderRadius: '6px',
          bgcolor: on ? '#EEF2FF' : 'transparent',
          color: on ? color.functional.primary : text.secondary,
          textAlign: 'left',
          transition: `background ${transition.duration.fast}, color ${transition.duration.fast}`,
          '&:hover': {
            bgcolor: on ? '#E0E7FF' : '#F3F4F6',
            color: on ? color.functional.primary : text.primary,
          },
          '&:focus-visible': {
            outline: `2px solid ${color.functional.primary}`,
            outlineOffset: 1,
          },
          position: 'relative',
        }}
      >
        {on && (
          <Box sx={{
            position: 'absolute', left: 0, top: '50%',
            transform: 'translateY(-50%)',
            width: 2.5, height: 16,
            bgcolor: color.functional.primary,
            borderRadius: '0 2px 2px 0',
          }} />
        )}
        <Icon sx={{ fontSize: 17, flexShrink: 0, opacity: on ? 1 : 0.86 }} />
        <Typography sx={{
          fontSize: 13, lineHeight: 1,
          fontWeight: on ? 700 : 500,
          flex: 1,
          fontFamily: 'inherit',
        }}>
          {label}
        </Typography>
        {badge > 0 && (
          <Box sx={{
            minWidth: 18, height: 16, borderRadius: 10, px: '5px',
            bgcolor: id === 'alerts' ? alpha(color.functional.error, 0.12) : alpha(color.functional.primary, 0.10),
            color: id === 'alerts' ? color.functional.error : color.functional.primary,
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1,
          }}>
            {badge > 99 ? '99+' : badge}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <>
      <Box
        component="nav"
        aria-label="Primary navigation"
        sx={{
          width: 248,
          display: { xs: 'none', md: 'flex' },
          height: '100vh',
          bgcolor: '#F8FAFC',
          borderRight: '1px solid #E5E7EB',
          flexDirection: 'column',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {/* Workspace switcher */}
        <Box
          component="button"
          onClick={() => setWsOpen(true)}
          sx={{
            display: 'flex', alignItems: 'center', gap: '9px',
            px: '12px', py: '11px',
            border: 'none', background: 'none', cursor: 'pointer',
            borderBottom: '1px solid #E5E7EB',
            '&:hover': { bgcolor: '#F3F4F6' },
            '&:focus-visible': { outline: `2px solid ${color.functional.primary}`, outlineOffset: -2 },
          }}
        >
          <Box sx={{
            width: 26, height: 26, borderRadius: '7px',
            bgcolor: color.functional.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#fff',
          }}>
            A
          </Box>
          <Box sx={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: text.primary, lineHeight: 1.2 }} noWrap>
              {workspace?.name ?? 'Acme Corp'}
            </Typography>
            <Typography sx={{ fontSize: 12, color: text.tertiary, lineHeight: 1, mt: '2px' }}>
              Enterprise
            </Typography>
          </Box>
          <ChevronIcon sx={{ fontSize: 14, color: text.tertiary, flexShrink: 0 }} />
        </Box>

        {/* Search */}
        <Box
          component="button"
          onClick={openCommandPalette}
          aria-label="Open command palette"
          sx={{
            display: 'flex', alignItems: 'center', gap: '8px',
            mx: '8px', my: '6px', px: '10px', py: '6px',
            border: '1px solid #D1D5DB',
            borderRadius: '6px', bgcolor: '#fff',
            cursor: 'pointer', textAlign: 'left',
            transition: `border-color ${transition.duration.fast}`,
            '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' },
            '&:focus-visible': { outline: `2px solid ${color.functional.primary}`, outlineOffset: 1 },
          }}
        >
          <SearchIcon sx={{ fontSize: 14, color: text.tertiary }} />
          <Typography sx={{ fontSize: 12, color: text.secondary, flex: 1, fontFamily: 'inherit' }}>
            Search…
          </Typography>
          <Box sx={{ display: 'flex', gap: '2px' }}>
            {['⌘', 'K'].map(k => (
              <Box key={k} sx={{ fontSize: 10, color: text.tertiary, bgcolor: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '4px', px: '4px', py: '1px', lineHeight: 1.5, fontFamily: 'inherit' }}>
                {k}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Primary nav */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1px', px: '8px', pb: '8px' }}>
          {PRIMARY_NAV.map(item => (
            <NavItem key={item.id} {...item} />
          ))}
        </Box>

        <Divider sx={{ mx: '8px' }} />

        {/* Secondary nav */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1px', px: '8px', py: '8px', flex: 1 }}>
          {SECONDARY_NAV.map(item => (
            <NavItem key={item.id} {...item} />
          ))}
        </Box>

        <Divider sx={{ mx: '8px' }} />

        {/* Settings + user */}
        <Box sx={{ px: '8px', py: '8px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <NavItem id="settings" label="Settings" Icon={SettingsIcon} />

          <Box
            component="button"
            onClick={() => {}}
            sx={{
              display: 'flex', alignItems: 'center', gap: '9px',
              px: '10px', py: '7px', border: 'none', background: 'none',
              cursor: 'pointer', borderRadius: '6px', textAlign: 'left',
              '&:hover': { bgcolor: '#F3F4F6' },
            }}
          >
            <Avatar sx={{ width: 22, height: 22, fontSize: 10, fontWeight: 700, bgcolor: alpha(color.functional.primary, 0.14), color: color.functional.primary }}>
              SC
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: text.primary, lineHeight: 1.2, fontFamily: 'inherit' }} noWrap>
                Sarah Chen
              </Typography>
              <Typography sx={{ fontSize: 12, color: text.tertiary, fontFamily: 'inherit' }}>Admin</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <WorkspaceSwitcher open={wsOpen} onClose={() => setWsOpen(false)} />
    </>
  );
};
