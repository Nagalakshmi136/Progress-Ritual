import React from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native'; // Import necessary types
import { Button, useTheme, ButtonProps } from 'react-native-paper'; // Use React Native Paper Button
import { spacing } from '../themes/spacing';
import { colors } from '../themes/colors';

// Define the props for your PrimaryButton component
interface PrimaryButtonProps extends ButtonProps { // Extend ButtonProps from react-native-paper
  title: string; // Make title required
  // You can add other custom props here
  buttonStyle?: ViewStyle; // Optional style for the button
  labelStyle?: TextStyle; // Optional style for the label
}

// Use React.FC for function components and provide the props type
const PrimaryButton: React.FC<PrimaryButtonProps> = ({ title, onPress, loading, disabled, buttonStyle, labelStyle, ...rest }) => {
  const paperTheme = useTheme();

  return (
    <Button
      mode="contained"
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      contentStyle={styles.buttonContent}
      // Apply optional labelStyle prop, overriding the default style if provided
      labelStyle={[styles.buttonLabel, labelStyle]}
      // Apply optional buttonStyle prop, overriding the default style if provided
      style={[styles.button, buttonStyle]}
      theme={{
        colors: {
          primary: paperTheme.colors.primary,
          onPrimary: paperTheme.colors.onSurface,
        }
      }}
      {...rest} // Pass other Button props
    >
      {title}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: 8,
    marginBottom: spacing.md,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  }
});

export default PrimaryButton;