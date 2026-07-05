import { alpha, Box, Divider, IconButton, Tooltip } from '@mui/material';
import {
  Inbox as InboxIcon,
  Person as PersonIcon,
  BookmarkBorder as BookmarkIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
  People as PeopleIcon,
  Rule as RuleIcon,
  Settings as SettingsIcon,
  Workspaces as WorkspacesIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from '@/hooks/useInertiaNavigation';
import { color, spacing, layout, radius, text, transition } from '@/shared/tokens/design-tokens.ts';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { workspace } from '@/api';

type RailItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: (workspaceId: string) => string;
};

const inboxViews: RailItem[] = [
  { id: 'inbox', label: 'All Inbox', icon: <InboxIcon />, path: (workspaceId) => workspace.inbox.path({ workspace_id: workspaceId, view_id: 'all' }) },
  { id: 'assigned', label: 'Assigned to Me', icon: <PersonIcon />, path: (workspaceId) => workspace.inbox.path({ workspace_id: workspaceId, view_id: 'assigned' }) },
  { id: 'mentions', label: 'Mentions', icon: <BookmarkIcon />, path: (workspaceId) => workspace.inbox.path({ workspace_id: workspaceId, view_id: 'mentions' }) },
  { id: 'ai-queue', label: 'AI Queue', icon: <AutoAwesomeIcon />, path: (workspaceId) => workspace.inbox.path({ workspace_id: workspaceId, view_id: 'ai-queue' }) },
  { id: 'closed', label: 'Closed', icon: <CheckCircleIcon />, path: (workspaceId) => workspace.inbox.path({ workspace_id: workspaceId, view_id: 'closed' }) },
];

const objectViews: RailItem[] = [
  { id: 'contacts', label: 'Contacts', icon: <PeopleIcon />, path: (workspaceId) => workspace.contacts.path({ workspace_id: workspaceId }) },
  { id: 'rules', label: 'Rules', icon: <RuleIcon />, path: (workspaceId) => workspace.rules.path({ workspace_id: workspaceId }) },
];

const systemViews: RailItem[] = [
  { id: 'settings', label: 'Settings', icon: <SettingsIcon />, path: (workspaceId) => workspace.settings.path({ workspace_id: workspaceId }) },
];

export const WorkspaceRail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspace: currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id ?? 'default';

  const isActive = (path: string) => location.pathname === path;

  const renderNavButton = (item: RailItem) => {
    const path = item.path(workspaceId);
    const active = isActive(path);

    return (
      <Tooltip key={item.id} title={item.label} placement="right">
        <Box sx={{ position: 'relative' }}>
          {active && (
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 3,
                height: 28,
                bgcolor: color.functional.primary,
                borderRadius: '0 4px 4px 0',
              }}
            />
          )}

          <IconButton
            onClick={() => navigate(path)}
            sx={{
              width: 44,
              height: 44,
              borderRadius: radius.base,
              color: active ? color.functional.primary : text.secondary,
              bgcolor: active ? alpha(color.functional.primary, 0.12) : 'transparent',
              transition: `all ${transition.duration.fast} ${transition.easing.base}`,
              '&:hover': {
                bgcolor: active ? alpha(color.functional.primary, 0.16) : alpha(color.neutral[900], 0.04),
              },
            }}
          >
            {item.icon}
          </IconButton>
        </Box>
      </Tooltip>
    );
  };

  return (
    <Box
      sx={{
        width: layout.rail.width,
        height: '100vh',
        bgcolor: color.surface.environment,
        borderRight: `1px solid ${alpha(color.neutral[900], 0.04)}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: spacing[16],
      }}
    >
      <Tooltip title="Orbit workspace" placement="right">
        <IconButton
          onClick={() => navigate(workspace.inbox.path({ workspace_id: workspaceId, view_id: 'all' }))}
          sx={{
            width: 48,
            height: 48,
            mb: spacing[16],
            bgcolor: color.functional.primary,
            color: color.neutral[0],
            transition: `all ${transition.duration.fast} ${transition.easing.base}`,
            '&:hover': {
              bgcolor: color.functional.primaryHover,
              transform: 'scale(1.05)',
            },
          }}
        >
          <WorkspacesIcon />
        </IconButton>
      </Tooltip>

      <Divider sx={{ width: 40, mb: spacing[16] }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[4], mb: spacing[16] }}>
        {inboxViews.map(renderNavButton)}
      </Box>

      <Divider sx={{ width: 40, mb: spacing[16] }} />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
        {objectViews.map(renderNavButton)}
      </Box>

      <Divider sx={{ width: 40, mb: spacing[16] }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
        {systemViews.map(renderNavButton)}
      </Box>
    </Box>
  );
};
