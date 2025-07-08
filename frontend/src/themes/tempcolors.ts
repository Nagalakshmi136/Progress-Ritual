// Define a type for your color palette structure
export type ColorPalette = {
  primary: string;
  secondary: string;
  tertiary: string; 
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  error: string;
  success: string;
  warning: string;
  gradientStart: string;
  gradientEnd: string;
  glow: string;
  white: string;
  black: string;
  transparent: string;
  shadow: string;
  border: string;
  borderLight: string;
  borderDark: string;
  borderAccent: string;
  borderError: string;
  borderSuccess: string;
  borderWarning: string;
  borderDisabled: string;
  borderFocus: string;
  borderHover: string;
  borderActive: string;
  borderPressed: string;
  borderSelected: string;
  inputBackground: string; // Optional for input fields
};

// Define your theme colors based on your Magic UI concept
export const colors: ColorPalette = {
  primary: '#6C63FF',           // Indigo
  secondary: '#FF6584',
  tertiary:'#F59E0B',            // Amber
  background: '#FAFAFA',        // Very soft gray
  surface: '#FFFFFF',
  text: '#111827',              // Very dark gray
  textSecondary: '#6B7280',     // Muted gray

  error: '#DC2626',             // Strong red
  success: '#16A34A',           // Deep green
  warning: '#D97706',           // Golden brown

  gradientStart: '#E0E7FF',
  gradientEnd: '#FCE7F3',
  glow: '#FFFBEB',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  shadow: 'rgba(0, 0, 0, 0.05)',

  border: '#D1D5DB',
  borderLight: '#E5E7EB',
  borderDark: '#1F2937',
  borderAccent: '#4F46E5',
  borderError: '#DC2626',
  borderSuccess: '#16A34A',
  borderWarning: '#D97706',
  borderDisabled: '#E5E7EB',
  borderFocus: '#2563EB',
  borderHover: '#1D4ED8',
  borderActive: '#1E40AF',
  borderPressed: '#1E3A8A',
  borderSelected: '#818CF8',
  inputBackground: '#D4CDFA', 
};
