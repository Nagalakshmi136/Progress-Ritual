// Combine all theme settings into one export
import { colors, ColorPalette } from './colors'; // Import types as well
import { spacing, SpacingScale } from './spacing';
import { typography, TypographyScale } from './typography';

// Define a type for the overall theme structure
export type AppTheme = {
  colors: ColorPalette;
  spacing: SpacingScale;
  typography: TypographyScale;
  // Add other theme properties here
};

export const theme: AppTheme = {
  colors,
  spacing,
  typography,
};

// Export individual parts if needed
export { colors, spacing, typography };