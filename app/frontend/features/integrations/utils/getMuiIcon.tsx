/**
 * Utility: getMuiIcon
 * Maps icon names to MUI icon components
 */

import * as MuiIcons from '@mui/icons-material';
import { SvgIconComponent } from '@mui/icons-material';

export const getMuiIcon = (iconName: string): SvgIconComponent => {
  // @ts-ignore - Dynamic icon lookup
  const Icon = MuiIcons[iconName];
  
  if (!Icon) {
    // Fallback to a default icon
    return MuiIcons.Extension;
  }
  
  return Icon;
};
