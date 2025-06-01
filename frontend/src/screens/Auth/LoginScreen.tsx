import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack'; // Import navigation type

import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { spacing } from '../../themes/spacing';
import { colors } from '../../themes/colors';
import { typography } from '../../themes/typography'; // Import typography

// Formik and Yup types
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';

// --- Define Types ---
// Type for the navigation prop for this screen
// Replace 'any' with your actual RootStackParamList type if needed
type LoginScreenNavigationProp = StackNavigationProp<any, 'Login'>;

// Type for the form values
interface LoginFormValues {
  email: string;
  password: string;
}

// --- Validation Schema ---
const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

// Use React.FC for the component and provide the navigation prop type
const LoginScreen: React.FC<{ navigation: LoginScreenNavigationProp }> = ({ navigation }) => {
  // Access your auth context functions and state (typed by useAuth hook)
  const { login, isLoading } = useAuth();

  // Function to handle form submission (with types from FormikHelpers)
  const handleLoginSubmit = async (
    values: LoginFormValues,
    { setSubmitting, setStatus }: FormikHelpers<LoginFormValues>
  ) => {
    try {
      await login(values.email, values.password);
      // Login successful, AuthContext handles state update and navigation
    } catch (error: any) {
      console.error("Login screen caught error:", error.message);
      // Display a generic error message via Formik status
      setStatus(error.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.gradientBackground}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to continue your ritual of progress</Text>

        {/* Formik Wrapper - Specify the type of form values */}
        <Formik<LoginFormValues>
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleLoginSubmit}
        >
          {/* Formik render prop function (types inferred by Formik<LoginFormValues>) */}
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, isValid, status }) => (
            <View style={styles.form}>
              <FormInput
                label="Email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                // Ensure error prop is string or undefined/null
                error={touched.email ? errors.email : undefined}
              />

              <FormInput
                label="Password"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                secureTextEntry
                // Ensure error prop is string or undefined/null
                error={touched.password ? errors.password : undefined}
              />

              {/* General Error Message (e.g., from API) */}
              {status && <Text style={styles.generalErrorText}>{status}</Text>}


              <PrimaryButton
                title="Log In"
                onPress={() => handleSubmit()}
                loading={isSubmitting || isLoading}
                disabled={!isValid || isSubmitting || isLoading}
                buttonStyle={styles.button} // Use buttonStyle prop
              >Log In</PrimaryButton>

              {/* Link to Register Screen */}
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Don&apos;t have an account? <Text style={styles.linkBold}>Begin Ritual</Text></Text>
              </TouchableOpacity>

              {/* Optional: Forgot Password Link */}
            </View>
          )}
        </Formik>

      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
    color: colors.secondary,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.xl,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  button: {
    marginTop: spacing.md,
  },
  linkText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  linkBold: {
    fontWeight: 'bold',
    color: colors.secondary ,
  },
  generalErrorText: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});

export default LoginScreen;