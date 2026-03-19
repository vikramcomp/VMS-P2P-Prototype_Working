/**
 * VMS Design System Constants
 * Centralized design tokens and constants for consistent styling
 */

// === COLOR PALETTE ===
export const COLORS = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  
  // Neutral Colors
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  
  // Status Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // VMS Specific Colors
  vendor: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
} as const;

// === TYPOGRAPHY ===
export const TYPOGRAPHY = {
  fontFamily: {
    primary: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
    secondary: 'var(--font-geist-mono), ui-monospace, monospace',
  },
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    
    // VMS Specific
    display: '4rem',     // 64px - Hero text
    heading: '2rem',     // 32px - Page headings
    subheading: '1.5rem', // 24px - Section headings
    body: '1rem',        // 16px - Body text
    caption: '0.875rem', // 14px - Captions
  },
  
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
} as const;

// === SPACING ===
export const SPACING = {
  // Base spacing scale
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '5rem',    // 80px
  '5xl': '6rem',    // 96px
  
  // VMS Layout Spacing
  page: '2rem',      // Page margins
  section: '3rem',   // Section spacing
  component: '1.5rem', // Component spacing
  element: '1rem',   // Element spacing
} as const;

// === BORDER RADIUS ===
export const BORDER_RADIUS = {
  none: '0',
  sm: '0.25rem',     // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
  
  // VMS Component Radius
  card: '0.75rem',
  button: '0.5rem',
  input: '0.375rem',
} as const;

// === SHADOWS ===
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  
  // VMS Component Shadows
  card: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -1px rgb(0 0 0 / 0.03)',
  elevated: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -2px rgb(0 0 0 / 0.03)',
} as const;

// === TRANSITIONS ===
export const TRANSITIONS = {
  fast: '150ms ease-in-out',
  normal: '250ms ease-in-out',
  slow: '350ms ease-in-out',
} as const;

// === Z-INDEX ===
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
} as const;

// === BREAKPOINTS ===
export const BREAKPOINTS = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  
  // VMS Specific
  mobile: '640px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
} as const;

// === COMPONENT VARIANTS ===
export const COMPONENT_VARIANTS = {
  button: {
    sizes: {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4 py-2',
      lg: 'h-10 px-8',
      icon: 'h-9 w-9',
    },
    variants: {
      default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
      outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
    },
  },
  
  card: {
    variants: {
      default: 'vms-card',
      elevated: 'vms-card shadow-elevated',
      outlined: 'border-2 border-primary/20',
    },
  },
  
  badge: {
    variants: {
      default: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      success: 'bg-success text-white',
      warning: 'bg-warning text-white',
      error: 'bg-error text-white',
      outline: 'border border-current text-current',
    },
  },
} as const;

// === STATUS MAPPINGS ===
export const STATUS_COLORS = {
  active: COLORS.success[500],
  inactive: COLORS.neutral[400],
  pending: COLORS.warning[500],
  rejected: COLORS.error[500],
  approved: COLORS.success[500],
  draft: COLORS.neutral[500],
  published: COLORS.info[500],
} as const;

// === VMS SPECIFIC CONSTANTS ===
export const VMS_CONSTANTS = {
  // Navigation
  sidebarWidth: '290px',
  sidebarCollapsedWidth: '80px',
  headerHeight: '64px',
  
  // Layout
  maxContentWidth: '1200px',
  containerPadding: '1.5rem',
  
  // Tables
  tableRowHeight: '48px',
  tableHeaderHeight: '56px',
  
  // Forms
  inputHeight: '40px',
  labelSpacing: '0.5rem',
  
  // Cards
  cardPadding: '1.5rem',
  cardBorderRadius: '0.75rem',
  
  // Vendor specific
  vendorCardMinHeight: '200px',
  vendorLogoSize: '64px',
  
} as const;

// === ANIMATION PRESETS ===
export const ANIMATIONS = {
  fadeIn: 'vms-animate-fade-in',
  slideIn: 'vms-animate-slide-in',
  scaleIn: 'vms-animate-scale-in',
} as const;

// Export all as a combined design system object
export const DESIGN_SYSTEM = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  transitions: TRANSITIONS,
  zIndex: Z_INDEX,
  breakpoints: BREAKPOINTS,
  componentVariants: COMPONENT_VARIANTS,
  statusColors: STATUS_COLORS,
  vmsConstants: VMS_CONSTANTS,
  animations: ANIMATIONS,
} as const;

export default DESIGN_SYSTEM;