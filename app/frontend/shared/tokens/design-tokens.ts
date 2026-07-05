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
    50: '#F9F8FC',   // Further reduced saturation - barely perceptible violet
    100: '#F3F1F9',  // Tinted neutral, not accent color
    200: '#E9E5F7',  // 12-15% less saturated than original
    300: '#D8CEF3',  // Intelligence tint, not decoration
    400: '#C1AEEF',  // Reduced saturation
    500: '#A28BE8',  // Primary AI tint - significantly desaturated from #8B5CF6
    600: '#8B6FD9',  // Desaturated
    700: '#7659C6',  // Desaturated
    800: '#624AAD',  // Desaturated
    900: '#523E91',  // Desaturated
  },
  
  // Functional colors — reserved use: active nav, primary CTA, selected state, brand moments
  functional: {
    primary:      '#5B5BD6',  // Orbit brand indigo — use sparingly
    primaryHover: '#4F46E5',
    success:      '#059669',
    warning:      '#D97706',
    error:        '#DC2626',
    errorHover:   '#B91C1C',
    errorSubtle:  '#FCA5A5',
    info:         '#2563EB',
  },
  
  // Channel colors - reduced saturation for informational badges (not decorative)
  channel: {
    email: '#3B8FB8',      // Desaturated by 15%
    slack: '#7D5AC9',      // Desaturated by 15%
    whatsapp: '#2D9B75',   // Desaturated by 15%
    instagram: '#C94C8A',  // Desaturated by 15%
    sms: '#8B6FD9',        // Desaturated by 15%
  },
  
  // ============================================================================
  // SEMANTIC SURFACE TOKENS - The Four Color Layers
  // ============================================================================
  
  // Layer 1: Environment (System Chrome)
  // Purpose: Structure & stability - fades into background cognition
  // Rules: No strong color, no gradients, no visual noise
  surface: {
    environment: '#F8FAFC',           // Rail, command bar, system chrome
    environmentHover: '#F3F4F6',      // Subtle hover state (+3% darkening)
    
    // Layer 2: Navigation Surface
    // Purpose: Conversation list - neutral navigation context
    navigation: '#F9FAFB',            // Slightly lighter than environment
    navigationHover: '#F3F4F6',       // Hover state
    
    // Layer 3: Work Surface (Primary Cognitive Anchor)
    // Purpose: Thread panel - center of gravity, slightly warm
    // Rules: 1-2% warmer than navigation, minimal borders, zero accent unless acting
    work: '#FFFFFF',                  // Primary work surface
    workSubtle: '#F9FAFB',            // Subtle surface differentiation
    
    // Layer 4: Intelligence Surface (AI Panel)
    // Purpose: AI thinking layer - tinted neutrality, not bright color
    // Rules: 2-4% violet tint, extremely low saturation
    ai: '#FAFAFD',                    // Faint violet-neutral tint (3% violet)
    aiSubtle: '#FCFCFE',              // Nearly invisible violet tint for AI components
    aiAccent: '#F9F8FC',              // Subtle AI component backgrounds
    
    // Primary surface (used for panels, modals, slide panels)
    primary: '#FFFFFF',               // Pure white for overlays and panels
  },
} as const;

// ============================================================================
// SEMANTIC ACTION TOKENS - Decision Colors (2-3% of UI)
// ============================================================================

// Action colors should be RARE and INTENTIONAL
// Used only for: Send button, Use Draft, Focus rings, Primary CTAs
export const action = {
  primary: '#5E6AD2',                 // Primary decision color
  primaryHover: '#4E5BBD',            // Hover state
  primaryPressed: '#3E4AAD',          // Active/pressed state
  primaryFocus: 'rgba(94, 106, 210, 0.08)', // Focus ring
} as const;

// ============================================================================
// SEMANTIC STATUS TOKENS - Informational Color (rare, desaturated)
// ============================================================================

// Status colors inform - they do NOT dominate
// Rules: 10-15% less saturated than primitive, avoid pure red
export const status = {
  urgent: {
    bg: 'rgba(232, 124, 124, 0.12)',   // Desaturated red background
    text: 'rgba(220, 38, 38, 0.75)',   // Muted red text - readable but not dominant
    border: 'rgba(220, 38, 38, 0.15)', // Subtle border
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
  6: '6px', // Added for tighter chip padding
  8: '8px',
  10: '10px', // Added for conversation row density
  12: '12px',
  16: '16px',
  20: '20px', // Added for AI summary dominance
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
  // Font families
  fontFamily: {
    base: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
  },
  
  // Font sizes
  fontSize: {
    xs: '11px',
    sm: '12px',
    base: '13px',
    md: '14px',
    lg: '15px',
    xl: '16px',
    xxl: '18px',
  },
  
  // Font weights - strategic emphasis
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.4,
    base: 1.5,
    relaxed: 1.6,
  },
  
  // Letter spacing
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
  primary:   '#111827',  // gray-900 — high contrast, legible
  secondary: '#4B5563',  // gray-600 — secondary labels and body metadata
  tertiary:  '#6B7280',  // gray-500 — timestamps and low-priority metadata
  disabled:  '#9CA3AF',  // gray-400 — disabled/helper-only text
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
