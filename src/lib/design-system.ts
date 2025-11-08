/**
 * Design System Configuration
 * 
 * Centralized design tokens based on Figma specifications.
 * Modify these values to update the entire application's styling.
 */

// ============================================
// COLOR SYSTEM
// ============================================

export const colors = {
  // Content Colors
  primaryFont: '#1A1A1A',
  secondaryFont: '#888888',
  descriptionFont: '#E0E0E0',
  
  // Border Color
  border: '#F7F7F7',
  
  // Background Colors
  leftPanel: '#444444',
  tabBackground: '#FAFAFA',
  buttonDefault: '#3C3C3C',
  icon: '#888888',
  
  // Additional semantic colors (for compatibility with existing system)
  background: '#FFFFFF',
  foreground: '#1A1A1A',
  card: '#FFFFFF',
  cardForeground: '#1A1A1A',
  muted: '#FAFAFA',
  mutedForeground: '#888888',
  accent: '#F7F7F7',
  accentForeground: '#1A1A1A',
  destructive: '#DC2626',
  destructiveForeground: '#FFFFFF',
  primary: '#3C3C3C',
  primaryForeground: '#FFFFFF',
  secondary: '#F7F7F7',
  secondaryForeground: '#1A1A1A',
  input: '#F7F7F7',
  ring: '#3C3C3C',
} as const;

// Dark mode color overrides
export const darkColors = {
  primaryFont: '#FFFFFF',
  secondaryFont: '#888888',
  descriptionFont: '#E0E0E0',
  border: '#444444',
  leftPanel: '#1A1A1A',
  tabBackground: '#2A2A2A',
  buttonDefault: '#3C3C3C',
  icon: '#888888',
  background: '#1A1A1A',
  foreground: '#FFFFFF',
  card: '#2A2A2A',
  cardForeground: '#FFFFFF',
  muted: '#2A2A2A',
  mutedForeground: '#888888',
  accent: '#444444',
  accentForeground: '#FFFFFF',
  destructive: '#DC2626',
  destructiveForeground: '#FFFFFF',
  primary: '#3C3C3C',
  primaryForeground: '#FFFFFF',
  secondary: '#444444',
  secondaryForeground: '#FFFFFF',
  input: '#444444',
  ring: '#3C3C3C',
} as const;

// ============================================
// TYPOGRAPHY SYSTEM
// ============================================

export const typography = {
  fontFamily: {
    primary: 'Inter, system-ui, -apple-system, sans-serif',
  },
  heading: {
    h1: {
      fontSize: '24px',
      lineHeight: '36px',
      fontWeight: 600,
    },
    h2: {
      fontSize: '14px',
      lineHeight: '21px',
      fontWeight: 600,
    },
    h3: {
      fontSize: '12px',
      lineHeight: '18px',
      fontWeight: 400,
    },
  },
} as const;

// ============================================
// SPACING SYSTEM
// ============================================

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

// ============================================
// BORDER RADIUS
// ============================================

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

// ============================================
// SHADOWS
// ============================================

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
} as const;

// ============================================
// EXPORT ALL TOKENS
// ============================================

export const designSystem = {
  colors,
  darkColors,
  typography,
  spacing,
  borderRadius,
  shadows,
} as const;

export default designSystem;

