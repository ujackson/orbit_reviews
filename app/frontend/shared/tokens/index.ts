// Spacing system (8px base grid)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// Border radius
export const radius = {
  sm: 8,
  base: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

// Typography scale
export const typography = {
  title: {
    fontSize: 20,
    fontWeight: 600,
    lineHeight: 1.3,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.6,
  },
  caption: {
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 1.5,
  },
  tiny: {
    fontSize: 10,
    fontWeight: 400,
    lineHeight: 1.4,
  },
} as const;

// Elevation (box-shadow)
export const elevation = {
  0: 'none',
  1: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  2: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
  3: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
  4: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
} as const;

// Z-index system
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1200,
  popover: 1300,
  tooltip: 1400,
  toast: 1500,
} as const;

// Color tokens
export const colors = {
  primary: '#5E6AD2',
  primaryLight: '#8A94E8',
  primaryDark: '#4A54B0',
  
  // Channel colors
  email: '#3B82F6',
  sms: '#07875F',
  whatsapp: '#22C55E',
  instagram: '#EC4899',
  slack: '#8B5CF6',
  
  // Status colors
  urgent: '#E53E3E',
  high: '#F59E0B',
  normal: '#07875F',
  
  // AI colors
  ai: '#9333EA',
  aiLight: '#C084FC',
} as const;

// Layout constants
export const layout = {
  rail: 72,
  conversationsPane: 320,
  contextPane: 360,
  topBar: 56,
} as const;
