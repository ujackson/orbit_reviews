/**
 * Component: SettingsSidebar
 * 
 * Settings navigation sidebar - enterprise structure.
 */

import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, alpha } from '@mui/material';
import {
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Extension as IntegrationIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { color, spacing, typography, text, radius, transition, layout } from '../../../shared/tokens/design-tokens';

interface SettingsSidebarProps {
  selectedSection: string;
  onSectionChange: (sectionId: string) => void;
}

export const SettingsSidebar = ({ selectedSection, onSectionChange }: SettingsSidebarProps) => {
  const sections = [
    { id: 'appearance', label: 'Appearance', icon: <PaletteIcon /> },
    { id: 'notifications', label: 'Notifications', icon: <NotificationsIcon /> },
    { id: 'integrations', label: 'Integrations', icon: <IntegrationIcon /> },
    { id: 'users', label: 'Users & Roles', icon: <PeopleIcon /> },
    { id: 'security', label: 'Security', icon: <SecurityIcon /> },
    { id: 'billing', label: 'Billing', icon: <PaymentIcon /> },
  ];

  return (
    <Box
      sx={{
        width: layout.settingsSidebar.width,
        height: '100vh',
        bgcolor: color.surface.navigation, // Layer 2 - Navigation surface
        borderRight: `1px solid ${alpha(color.neutral[900], 0.04)}`, // Tonal border
        py: spacing[24],
        px: spacing[16],
      }}
    >
      <Typography
        sx={{
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.semibold,
          color: text.primary,
          px: spacing[12],
          mb: spacing[16],
        }}
      >
        Settings
      </Typography>

      <List sx={{ p: 0 }}>
        {sections.map((section) => {
          const isSelected = selectedSection === section.id;
          
          return (
            <ListItem key={section.id} disablePadding sx={{ mb: spacing[4] }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => onSectionChange(section.id)}
                sx={{
                  borderRadius: radius.base,
                  transition: `all ${transition.duration.fast} ${transition.easing.base}`,
                  '&.Mui-selected': {
                    bgcolor: alpha(color.functional.primary, 0.08), // Subtle selection state
                    '&:hover': {
                      bgcolor: alpha(color.functional.primary, 0.12),
                    },
                  },
                  '&:hover': {
                    bgcolor: alpha(color.neutral[900], 0.03),
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isSelected ? color.functional.primary : text.secondary,
                    transition: `color ${transition.duration.fast} ${transition.easing.base}`,
                  }}
                >
                  {section.icon}
                </ListItemIcon>
                <ListItemText
                  primary={section.label}
                  primaryTypographyProps={{
                    fontSize: typography.fontSize.md,
                    fontWeight: isSelected ? typography.fontWeight.semibold : typography.fontWeight.normal,
                    color: isSelected ? text.primary : text.secondary,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};