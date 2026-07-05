import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { Head } from '@inertiajs/react';
import { OrbitShell } from '@/layout/OrbitShell';
import { color } from '@/shared/tokens/design-tokens.ts';
import type { Workspace } from '@/types';
import { SettingsView } from '@/features/settings/SettingsView';
import { InboxView } from '@/features/inbox/InboxView';
import { ContactsView } from '@/features/contacts/ContactsView';
import { RulesView } from '@/features/rules/RulesView';

type WorkspacePageProps = {
  currentWorkspace: Workspace;
  currentView: string;
  inboxViewId: string;
  settingsSection: string;
  integrationOnboarding: boolean;
  rails_version: string;
  ruby_version: string;
  rack_version: string;
  inertia_rails_version: string;
};

export default function Index({
  currentWorkspace,
  currentView,
  inboxViewId,
  settingsSection,
  integrationOnboarding,
  rails_version,
  ruby_version,
  rack_version,
  inertia_rails_version,
}: WorkspacePageProps) {
  return (
    <OrbitShell>
      <Head title={currentWorkspace?.name || 'Workspace'} />
      {currentView === 'settings' ? (
        <SettingsView initialSection={settingsSection} />
      ) : currentView === 'inbox' ? (
        <InboxView viewId={inboxViewId} />
      ) : currentView === 'contacts' ? (
        <ContactsView />
      ) : currentView === 'rules' ? (
        <RulesView />
      ) : (
        <Box
          sx={{
            minHeight: '100vh',
            background: `linear-gradient(180deg, ${color.surface.environment} 0%, ${color.surface.work} 100%)`,
            p: { xs: 3, md: 6 },
          }}
        >
          <Stack spacing={3} sx={{ maxWidth: 840 }}>
            <Box>
              <Typography variant="overline" sx={{ color: color.neutral[600] }}>
                Orbit Workspace
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: color.neutral[900], mb: 1 }}>
                {currentView === 'inbox' ? currentWorkspace.name || 'Inbox' : currentView.charAt(0).toUpperCase() + currentView.slice(1)}
              </Typography>
              <Typography variant="body1" sx={{ color: color.neutral[700], maxWidth: 640 }}>
                {integrationOnboarding
                  ? 'Your workspace is ready. Finish connecting your first integrations from Settings.'
                  : 'Orbit shell navigation is restored. The inbox, contacts, and rules surfaces are still being connected to backend data.'}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={`WorkOS org: ${currentWorkspace.remoteId}`} />
              {currentWorkspace.externalId ? <Chip label={`External ID: ${currentWorkspace.externalId}`} /> : null}
              {currentWorkspace.domains[0]?.domain ? <Chip label={`Domain: ${currentWorkspace.domains[0].domain}`} /> : null}
            </Stack>

            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Runtime snapshot
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">Rails {rails_version}</Typography>
                <Typography variant="body2">{ruby_version}</Typography>
                <Typography variant="body2">Rack {rack_version}</Typography>
                <Typography variant="body2">Inertia Rails {inertia_rails_version}</Typography>
              </Stack>
            </Paper>
          </Stack>
        </Box>
      )}
    </OrbitShell>
  );
}
