import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native'; // Import necessary types
import { TextInput, useTheme, TextInputProps } from 'react-native-paper'; // Use React Native Paper TextInput
import { spacing } from '../themes/spacing';
import { colors } from '../themes/colors'; // Import colors for direct use if needed
import { hexToRgba } from '../utils/color';

// Define the props for your FormInput component
interface FormInputProps extends Omit<TextInputProps, 'error'> { // Extend TextInputProps excluding its boolean error prop
  label: string;
  error?: string | null; // Error message is optional and can be string or null
  // You can add other custom props here
  containerStyle?: ViewStyle; // Optional style for the container View
  errorTextStyle?: TextStyle; // Optional style for the error Text
}

// Use React.FC for function components and provide the props type
const FormInput: React.FC<FormInputProps> = ({ label, error, containerStyle, errorTextStyle, ...rest }) => {
  const paperTheme = useTheme();

  return (
    // Apply containerStyle prop
    <View style={[styles.container, containerStyle]}>
      <TextInput
        label={label}
        style={styles.input}
        mode="outlined"
        theme={{
          roundness: 8,
          colors: {
            primary: paperTheme.colors.secondary,
            background: paperTheme.colors.primary,
            text: colors.text,
            placeholder: paperTheme.colors.onSurfaceDisabled,
          }
        }}
        outlineColor={colors.transparent}
        activeOutlineColor={colors.primary} // Use your theme color directly
        selectionColor={colors.primary}
        underlineColorAndroid="transparent"
        {...rest}
      />
      {error && (
        <Text style={[styles.errorText, errorTextStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: hexToRgba(colors.primary,0.2), // Use your theme color directly
    color: colors.text, // Use your theme color directly
  },
  errorText: {
    color: colors.error, // Use your theme error color
    fontSize: 12,
    marginTop: spacing.xs,
  },
});

export default FormInput;