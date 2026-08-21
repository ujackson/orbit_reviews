import { useState } from 'react';
import { Box, Typography, Divider, Avatar } from '@mui/material';
import {
  Dashboard as OverviewIcon,
  BugReport as IssuesIcon,
  Inbox as FeedbackIcon,
  TaskAlt as ActionsIcon,
  TrendingUp as ImpactIcon,
  WbSunny as BriefIcon,
  Cable as IntegrationsIcon,
  AccountTree as AutomationsIcon,
  Group as TeamIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  ExpandMore as ChevronIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useNavigate, useLocation, useWorkspacePath, workspaceRelativePath } from '@/hooks/useInertiaNavigation';
import { useUIStore } from '../stores/uiStore';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { useWorkspace } from '../providers/WorkspaceProvider';

// ─── Sidebar palette — spec §12 ───────────────────────────────────────────────
const S = {
  bg:          '#FFFFFF',
  border:      '#E7E9EE',
  inactive:    '#667085',
  activeText:  '#4E51DA',
  activeBg:    '#F1F1FC',
  indicator:   '#5B5FEF',
  section:     '#98A2B3',
  hover:       'rgba(0,0,0,0.03)',
  wsName:      '#171A21',
  wsLabel:     '#9299A6',
  searchBg:    '#F7F8FA',
  kbd:         '#EAECF0',
} as const;

const PRIMARY_NAV = [
  { id: 'overview', label: 'Overview', Icon: OverviewIcon, badge: 0, path: '' },
  { id: 'issues', label: 'Issues', Icon: IssuesIcon, badge: 7, path: 'insights' },
  { id: 'feedback', label: 'Feedback', Icon: FeedbackIcon, badge: 47, path: 'inbox' },
  { id: 'actions', label: 'Actions', Icon: ActionsIcon, badge: 2, path: 'alerts' },
  { id: 'impact', label: 'Impact', Icon: ImpactIcon, badge: 0, path: 'reports' },
  { id: 'brief', label: 'Brief', Icon: BriefIcon, badge: 0, path: 'reports' },
];

const SECONDARY_NAV = [
  { id: 'integrations', label: 'Integrations', Icon: IntegrationsIcon, path: 'connections' },
  { id: 'automations', label: 'Automations', Icon: AutomationsIcon, path: 'automations' },
  { id: 'team', label: 'Team', Icon: TeamIcon, path: 'team' },
];

export const WorkspaceRail = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const workspacePath = useWorkspacePath();
  const { openCommandPalette } = useUIStore();
  const { workspace } = useWorkspace();
  const [wsOpen, setWsOpen] = useState(false);
  const currentPath = workspaceRelativePath(location.pathname);

  const isActive = (path: string) =>
    (path === '' && currentPath === '/') ||
    currentPath === `/${path}` ||
    currentPath.startsWith(`/${path}/`);

  const NavItem = ({
    id, label, Icon, path = id, badge = 0,
  }: { id: string; label: string; Icon: any; path?: string; badge?: number }) => {
    const on = isActive(path);
    const isOverdue = id === 'actions' && badge > 0;

    return (
      <Box
        component="button"
        onClick={() => navigate(workspacePath(path))}
        aria-current={on ? 'page' : undefined}
        sx={{
          display: 'flex', alignItems: 'center', gap: '8px',
          width: '100%', px: '9px', py: '6px',
          border: 'none', background: 'none', cursor: 'pointer',
          borderRadius: '6px',
          bgcolor: on ? S.activeBg : 'transparent',
          textAlign: 'left',
          position: 'relative',
          transition: 'background-color 0.10s',
          '&:hover': { bgcolor: on ? S.activeBg : S.hover },
          '&:focus-visible': { outline: `2px solid ${S.indicator}`, outlineOffset: 1 },
        }}
      >
        {/* Active left indicator — 2px per spec */}
        {on && (
          <Box sx={{
            position: 'absolute', left: 0, top: '50%',
            transform: 'translateY(-50%)',
            width: 2, height: 14,
            bgcolor: S.indicator,
            borderRadius: '0 2px 2px 0',
          }} />
        )}
        <Icon sx={{
          fontSize: 15, flexShrink: 0,
          color: on ? S.activeText : S.inactive,
          ml: '2px',
        }} />
        <Typography sx={{
          fontSize: 13, lineHeight: 1,
          fontWeight: on ? 600 : 400,
          flex: 1,
          fontFamily: 'inherit',
          color: on ? S.activeText : S.inactive,
          letterSpacing: '-0.005em',
        }}>
          {label}
        </Typography>
        {badge > 0 && (
          <Box sx={{
            minWidth: 18, height: 16, borderRadius: '4px', px: '5px',
            bgcolor: isOverdue ? '#FFF1F2' : on ? 'rgba(91,95,239,0.10)' : 'rgba(0,0,0,0.06)',
            color: isOverdue ? '#D92D3A' : on ? S.activeText : S.inactive,
            fontSize: 10, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1,
            border: isOverdue ? '1px solid #FECDCA' : 'none',
          }}>
            {badge > 99 ? '99+' : badge}
          </Box>
        )}
      </Box>
    );
  };

  const SectionLabel = ({ label }: { label: string }) => (
    <Typography sx={{
      fontSize: 11, fontWeight: 600, color: S.section,
      letterSpacing: '0.04em', textTransform: 'uppercase',
      px: '11px', pt: '10px', pb: '3px',
      fontFamily: 'inherit', lineHeight: 1,
    }}>
      {label}
    </Typography>
  );

  return (
    <>
      <Box
        component="nav"
        aria-label="Primary navigation"
        sx={{
          width: 216,
          height: '100vh',
          bgcolor: S.bg,
          borderRight: `1px solid ${S.border}`,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {/* ── Workspace switcher ───────────────────────────────────── */}
        <Box
          component="button"
          onClick={() => setWsOpen(true)}
          sx={{
            display: 'flex', alignItems: 'center', gap: '9px',
            px: '12px', py: '10px',
            border: 'none', background: 'none', cursor: 'pointer',
            borderBottom: `1px solid ${S.border}`,
            transition: 'background-color 0.10s',
            '&:hover': { bgcolor: S.hover },
            '&:focus-visible': { outline: `2px solid ${S.indicator}`, outlineOffset: -2 },
          }}
        >
          <Box sx={{
            width: 24, height: 24, borderRadius: '6px',
            bgcolor: S.indicator,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'inherit', lineHeight: 1 }}>
              A
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
            <Typography sx={{
              fontSize: 13, fontWeight: 600, color: S.wsName,
              lineHeight: 1.2, letterSpacing: '-0.01em', fontFamily: 'inherit',
            }} noWrap>
              {workspace?.name ?? 'Acme Corp'}
            </Typography>
            <Typography sx={{ fontSize: 11, color: S.wsLabel, lineHeight: 1, mt: '2px', fontFamily: 'inherit' }}>
              Enterprise
            </Typography>
          </Box>
          <ChevronIcon sx={{ fontSize: 13, color: S.wsLabel, flexShrink: 0 }} />
        </Box>

        {/* ── Search ──────────────────────────────────────────────── */}
        <Box sx={{ px: '8px', pt: '8px', pb: '4px' }}>
          <Box
            component="button"
            onClick={openCommandPalette}
            aria-label="Open command palette"
            sx={{
              display: 'flex', alignItems: 'center', gap: '7px',
              width: '100%', px: '9px', py: '6px',
              border: `1px solid ${S.border}`,
              borderRadius: '6px', bgcolor: S.searchBg,
              cursor: 'pointer', textAlign: 'left',
              transition: 'border-color 0.10s',
              '&:hover': { borderColor: '#C0C7D0' },
              '&:focus-visible': { outline: `2px solid ${S.indicator}`, outlineOffset: 1 },
            }}
          >
            <SearchIcon sx={{ fontSize: 13, color: S.inactive, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 12, color: S.inactive, flex: 1, fontFamily: 'inherit' }}>
              Search…
            </Typography>
            <Box sx={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
              {['⌘', 'K'].map(k => (
                <Box key={k} sx={{
                  fontSize: 10, color: S.wsLabel,
                  bgcolor: S.kbd, borderRadius: '3px',
                  px: '3px', lineHeight: '16px', fontFamily: 'inherit',
                }}>
                  {k}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ── Primary nav ─────────────────────────────────────────── */}
        <SectionLabel label="Workspace" />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1px', px: '6px', pb: '6px' }}>
          {PRIMARY_NAV.map(item => (
            <NavItem key={item.id} {...item} />
          ))}
        </Box>

        <Divider sx={{ mx: '8px', borderColor: S.border }} />

        {/* ── Secondary nav ───────────────────────────────────────── */}
        <SectionLabel label="Configure" />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1px', px: '6px', pb: '6px', flex: 1 }}>
          {SECONDARY_NAV.map(item => (
            <NavItem key={item.id} {...item} />
          ))}
        </Box>

        <Divider sx={{ mx: '8px', borderColor: S.border }} />

        {/* ── Settings + user ─────────────────────────────────────── */}
        <Box sx={{ px: '6px', py: '6px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <NavItem id="settings" label="Settings" Icon={SettingsIcon} path="settings" />
          {/* User row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '9px', py: '6px' }}>
            <Avatar sx={{ width: 22, height: 22, fontSize: 10, fontWeight: 600, flexShrink: 0 }}>
              SC
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: S.wsName, lineHeight: 1.2, fontFamily: 'inherit' }} noWrap>
                Sarah Chen
              </Typography>
              <Typography sx={{ fontSize: 11, color: S.wsLabel, fontFamily: 'inherit', lineHeight: 1.2 }}>
                Admin
              </Typography>
            </Box>
            {/* Logout */}
            <Box
              component="button"
              title="Sign out"
              onClick={() => toast.info('Signing out…')}
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 26, height: 26, borderRadius: '5px',
                border: 'none', background: 'none', cursor: 'pointer',
                color: S.inactive, flexShrink: 0,
                transition: 'background-color 0.10s, color 0.10s',
                '&:hover': { bgcolor: '#FFF1F2', color: '#D92D3A' },
              }}
            >
              <LogoutIcon sx={{ fontSize: 14 }} />
            </Box>
          </Box>
        </Box>
      </Box>

      <WorkspaceSwitcher open={wsOpen} onClose={() => setWsOpen(false)} />
    </>
  );
};
