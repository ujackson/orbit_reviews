/**
 * Component: AppearanceSettings
 * 
 * Theme and visual customization settings.
 */

import { Box } from '@mui/material';
import { SettingRow } from '../patterns/SettingRow';
import { SettingSection } from '../patterns/SettingSection';
import { useUIStore } from '@/stores/uiStore';

export const AppearanceSettings = () => {
  const { theme, toggleTheme } = useUIStore();

  return (
    <Box>
      <SettingSection
        title="Theme"
        description="Customize how Orbit looks on your device"
        isFirst
      >
        <SettingRow
          label="Dark mode"
          description="Switch between light and dark color schemes for reduced eye strain"
          checked={theme === 'dark'}
          onChange={toggleTheme}
        />
      </SettingSection>
    </Box>
  );
};
