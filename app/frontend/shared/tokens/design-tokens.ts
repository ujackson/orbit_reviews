/**
 * Orbit Design System - Enterprise Color Intelligence Model
 * 
 * Color Distribution Philosophy:
 * - Neutral: 85-90% (structure, stability, reading)
 * - Functional: 8-10% (status, channels, information)
 * - Accent: 2-3% (actions, decisions)
 * 
 * Core Principle: Color is rare. The absence of color guides attention.
 */

// ============================================================================
// PRIMITIVE COLOR TOKENS - Foundation Palette
// ============================================================================

export const color = {
  // Neutral scale - enterprise calm foundation (85-90% of UI)
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    150: '#F0F0F0',    // Added for environment hover states
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },
  
  // AI accent - heavily desaturated for tinted neutrality (enterprise AI uses tinted neutrals, not bright colors)
  ai: {
    50: '#F9F8FC',
    100: '#F3F1F9',
    200: '#E9E5F7',
    300: '#D8CEF3',
    400: '#C1AEEF',
    500: '#A28BE8',
    600: '#8B6FD9',
    700: '#7659C6',
    800: '#624AAD',
    900: '#523E91',
  },
  
  // Functional colors — enterprise semantic palette
  functional: {
    primary:       '#5B5FEF',
    primaryHover:  '#4E51DA',
    primaryPressed:'#4447C4',
    primarySoft:   '#F2F2FD',
    primaryBorder: '#D9D9FA',
    success:       '#07875F',
    successLight:  '#EBFAF4',
    successBorder: '#A7F3D0',
    warning:       '#B76E00',
    warningLight:  '#FFF8E6',
    warningBorder: '#FDE68A',
    error:         '#D92D3A',
    errorHover:    '#B4232F',
    errorLight:    '#FFF1F2',
    errorBorder:   '#FECDCA',
    info:          '#3568D4',
    infoLight:     '#EFF4FF',
    slate:         '#171A21',
    selectedTint:  '#F4F4FC',
  },

  nav: {
    bg:          '#FFFFFF',
    subtle:      '#FBFBFC',
    border:      '#E7E9EE',
    textInactive:'#667085',
    textActive:  '#4E51DA',
    activeBg:    '#F1F1FC',
    indicator:   '#5B5FEF',
    sectionLabel:'#98A2B3',
  },

  canvas: {
    bg:          '#F7F8FA',
    surface:     '#FFFFFF',
    raised:      '#FBFBFC',
    selected:    '#F4F4FC',
    border:      '#E7E9EE',
    borderStrong:'#D8DCE5',
  },
  
  channel: {
    email: '#3B8FB8',
    slack: '#7D5AC9',
    whatsapp: '#2D9B75',
    instagram: '#C94C8A',
    sms: '#8B6FD9',
  },
  
  surface: {
    environment: '#FAFAFA',
    environmentHover: '#F0F0F0',
    navigation: '#FCFCFC',
    navigationHover: '#F5F5F5',
    work: '#FFFEFB',
    workSubtle: '#FFFCF8',
    ai: '#FAFAFD',
    aiSubtle: '#FCFCFE',
    aiAccent: '#F9F8FC',
    primary: '#FFFFFF',
  },
} as const;

// ============================================================================
// SEMANTIC ACTION TOKENS - Decision Colors (2-3% of UI)
// ============================================================================

export const action = {
  primary: '#5E6AD2',
  primaryHover: '#4E5BBD',
  primaryPressed: '#3E4AAD',
  primaryFocus: 'rgba(94, 106, 210, 0.08)',
} as const;

// ============================================================================
// SEMANTIC STATUS TOKENS - Informational Color (rare, desaturated)
// ============================================================================

export const status = {
  urgent: {
    bg: 'rgba(232, 124, 124, 0.12)',
    text: 'rgba(220, 38, 38, 0.75)',
    border: 'rgba(220, 38, 38, 0.15)',
  },
  success: {
    bg: 'rgba(5, 150, 105, 0.10)',
    text: 'rgba(5, 150, 105, 0.80)',
    border: 'rgba(5, 150, 105, 0.15)',
  },
  warning: {
    bg: 'rgba(217, 119, 6, 0.10)',
    text: 'rgba(217, 119, 6, 0.85)',
    border: 'rgba(217, 119, 6, 0.15)',
  },
  info: {
    bg: 'rgba(2, 132, 199, 0.10)',
    text: 'rgba(2, 132, 199, 0.80)',
    border: 'rgba(2, 132, 199, 0.15)',
  },
} as const;

// ============================================================================
// SPACING TOKENS - 8px Grid System
// ============================================================================

export const spacing = {
  0: '0px',
  4: '4px',
  6: '6px',
  8: '8px',
  10: '10px',
  12: '12px',
  16: '16px',
  20: '20px',
  24: '24px',
  32: '32px',
  48: '48px',
  64: '64px',
  96: '96px',
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS - Semantic Scale
// ============================================================================

export const typography = {
  fontFamily: {
    base: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
  },
  
  fontSize: {
    xs: '11px',
    sm: '12px',
    base: '13px',
    md: '14px',
    lg: '15px',
    xl: '16px',
    xxl: '18px',
  },
  
  fontWeight: {
    normal: 500,
    medium: 500,
    semibold: 600,
  },
  
  lineHeight: {
    tight: 1.4,
    base: 1.5,
    relaxed: 1.6,
  },
  
  letterSpacing: {
    tight: '-0.01em',
    normal: '0',
    wide: '0.01em',
  },
} as const;

// ============================================================================
// ELEVATION TOKENS - Subtle Depth (0-3)
// ============================================================================

export const elevation = {
  0: 'none',
  1: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
  2: '0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 3px 6px 0 rgba(0, 0, 0, 0.03)',
  3: '0 4px 8px 0 rgba(0, 0, 0, 0.06), 0 6px 12px 0 rgba(0, 0, 0, 0.04)',
} as const;

// ============================================================================
// RADIUS TOKENS - Standardized Corner Rounding
// ============================================================================

export const radius = {
  sm: '6px',
  base: '8px',
  md: '12px',
  lg: '16px',
  full: '9999px',
} as const;

// ============================================================================
// OPACITY TOKENS - Semantic Transparency
// ============================================================================

export const opacity = {
  disabled: 0.4,
  muted: 0.6,
  secondary: 0.7,
  primary: 1,
} as const;

// ============================================================================
// TRANSITION TOKENS - Micro-Motion Guidelines
// ============================================================================

export const transition = {
  duration: {
    instant: '0ms',
    fast: '120ms',
    base: '150ms',
    slow: '200ms',
  },
  
  easing: {
    base: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0.0, 1, 1)',
    out: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  },
} as const;

// ============================================================================
// LAYOUT TOKENS - Fixed Panel Dimensions
// ============================================================================

export const layout = {
  rail: {
    width: '72px',
  },
  
  conversationsPane: {
    width: '320px',
  },
  
  settingsSidebar: {
    width: '260px',
  },
  
  aiPane: {
    width: '360px',
  },
  
  threadPane: {
    minWidth: '480px',
  },
} as const;

// ============================================================================
// AI VISUAL LANGUAGE TOKENS
// ============================================================================

export const aiVisualLanguage = {
  surface: {
    background: color.surface.ai,
    border: 'rgba(139, 92, 246, 0.15)',
    accent: 'linear-gradient(90deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0))',
  },
  
  badge: {
    background: 'rgba(139, 92, 246, 0.12)',
    color: color.ai[700],
    iconSize: '12px',
  },
  
  emphasis: {
    subtle: 'rgba(139, 92, 246, 0.05)',
    medium: 'rgba(139, 92, 246, 0.10)',
  },
} as const;

// ============================================================================
// SEMANTIC TEXT TOKENS
// ============================================================================

export const text = {
  primary:   '#171A21',
  secondary: '#525B69',
  tertiary:  '#7F8897',
  disabled:  '#AAB2BF',
  inverse:   '#FFFFFF',
} as const;

// ============================================================================
// BORDER TOKENS
// ============================================================================

export const border = {
  width: {
    none: '0',
    thin: '1px',
    medium: '2px',
  },
  
  color: {
    subtle: color.neutral[200],
    base: color.neutral[300],
    emphasis: color.neutral[400],
  },
} as const;
