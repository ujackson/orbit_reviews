/**
 * View: SettingsView
 * 
 * Enterprise settings container following Orbit visual intelligence system.
 * Google Workspace-style system controls, not a settings form.
 */

import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { SettingsSidebar } from './components/SettingsSidebar';
import { SettingsHeader } from './components/SettingsHeader';
import { AppearanceSettings } from './components/AppearanceSettings';
import { NotificationsSettings } from './components/NotificationsSettings';
import { IntegrationsSettings } from './components/IntegrationsSettings';
import { UsersRolesSettings } from './components/UsersRolesSettings';
import { SecuritySettings } from './components/SecuritySettings';
import { BillingSettings } from './components/BillingSettings';
import { color, spacing } from '../../shared/tokens/design-tokens';

interface SettingsViewProps {
  initialSection?: string;
}

export const SettingsView = ({ initialSection = 'appearance' }: SettingsViewProps) => {
  const [selectedSection, setSelectedSection] = useState(initialSection);

  useEffect(() => {
    setSelectedSection(initialSection);
  }, [initialSection]);

  // Section configuration
  const sectionConfig: Record<string, { title: string; description: string }> = {
    appearance: {
      title: 'Appearance',
      description: 'Customize how Orbit looks on your device',
    },
    notifications: {
      title: 'Notifications',
      description: 'Control when and how you receive notifications from Orbit',
    },
    integrations: {
      title: 'Integrations',
      description: 'Connect Orbit to your existing tools and services',
    },
    users: {
      title: 'Users & Roles',
      description: 'Manage team members and their permissions',
    },
    security: {
      title: 'Security',
      description: 'Configure authentication, access control, and data protection',
    },
    billing: {
      title: 'Billing & Subscription',
      description: 'View your plan, usage, and payment information',
    },
  };

  const currentSection = sectionConfig[selectedSection];

  return (
    <Box sx={{ display: 'flex', flex: 1, height: '100vh', overflow: 'hidden' }}>
      {/* Settings Sidebar */}
      <SettingsSidebar
        selectedSection={selectedSection}
        onSectionChange={setSelectedSection}
      />

      {/* Settings Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          bgcolor: color.surface.work, // Layer 3 - Work surface (primary focus)
          px: spacing[64],
          py: spacing[48],
        }}
      >
        <Box sx={{ maxWidth: 800 }}>
          {/* Page header */}
          <SettingsHeader
            title={currentSection.title}
            description={currentSection.description}
          />

          {/* Section content */}
          {selectedSection === 'appearance' && <AppearanceSettings />}
          {selectedSection === 'notifications' && <NotificationsSettings />}
          
          {selectedSection === 'integrations' && <IntegrationsSettings />}
          
          {selectedSection === 'users' && <UsersRolesSettings />}
          
          {selectedSection === 'security' && <SecuritySettings />}
          
          {selectedSection === 'billing' && <BillingSettings />}
        </Box>
      </Box>
    </Box>
  );
};
