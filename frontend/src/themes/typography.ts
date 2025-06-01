import { TextStyle } from 'react-native'; // Import TextStyle type
import { colors } from './colors'; // Import colors

// Define a type for your typography styles
export type TypographyScale = {
  h1: TextStyle;
  h2: TextStyle;
  body: TextStyle;
  button: TextStyle;
  // Add more text styles as needed
};

// Define typography styles (example, adjust font weights/sizes)
export const typography: TypographyScale = {
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text, // Use themed color
  },
  h2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text, // Use themed color
  },
  body: {
    fontSize: 16,
    color: colors.text, // Use themed color
  },
  button: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text, // Use themed color
  },
};