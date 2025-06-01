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
type RegisterScreenNavigationProp = StackNavigationProp<any, 'Register'>;

// Type for the form values
interface RegisterFormValues {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    general?: string;
}

const RegisterSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
});

// Use React.FC for the component and provide the navigation prop type
const RegisterScreen: React.FC<{ navigation: RegisterScreenNavigationProp }> = ({ navigation }) => {
    // Access your auth context functions and state (typed by useAuth hook)
    const { register, isLoading } = useAuth();
    // Function to handle form submission (with types from FormikHelpers)
    const handleRegisterSubmit = async (
        values: RegisterFormValues,
        { setSubmitting, setFieldError }: FormikHelpers<RegisterFormValues>
    ) => {
        try {
            // Call your backend register API
            await register(values.email, values.password, values.username);
            // Registration successful, AuthContext handles state update (auto-login)
            // OR you could navigate to login: navigation.navigate('Login');

        } catch (error: any) { // Catch error (typed as any for now)
            console.error("Register screen caught error:", error.message);
            // Display a generic error message or the backend's message
            setFieldError('general', error.message || 'An unexpected error occurred during registration.');
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
                <Text style={styles.title}>Begin Ritual</Text>
                <Text style={styles.subtitle}>Create your account to start your journey</Text>

                <Formik<RegisterFormValues>
                    initialValues={{ username: '', email: '', password: '', confirmPassword: '', general: '' }}
                    validationSchema={RegisterSchema}
                    onSubmit={handleRegisterSubmit}
                >
                    {/* Formik render prop function (types inferred by Formik<RegisterFormValues>) */}
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, isValid }) => (
                        <View style={styles.form}>
                            <FormInput
                                label="Username"
                                value={values.username}
                                onChangeText={handleChange('username')}
                                onBlur={handleBlur('username')}
                                autoCapitalize="none"
                                error={touched.username ? errors.username : undefined}
                            />
                            <FormInput
                                label="Email"
                                value={values.email}
                                onChangeText={handleChange('email')}
                                onBlur={handleBlur('email')}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                error={touched.email ? errors.email : undefined}
                            />

                            <FormInput
                                label="Password"
                                value={values.password}
                                onChangeText={handleChange('password')}
                                onBlur={handleBlur('password')}
                                secureTextEntry
                                error={touched.password ? errors.password : undefined}
                            />

                            <FormInput
                                label="Confirm Password"
                                value={values.confirmPassword}
                                onChangeText={handleChange('confirmPassword')}
                                onBlur={handleBlur('confirmPassword')}
                                secureTextEntry
                                error={touched.confirmPassword ? errors.confirmPassword : undefined}
                            />

                            {/* General Error Message */}
                            {errors.general && <Text style={styles.generalErrorText}>{errors.general}</Text>}


                            <PrimaryButton
                                title='Register'
                                onPress={() => handleSubmit()}
                                loading={isSubmitting || isLoading}
                                disabled={!isValid || isSubmitting || isLoading}
                                buttonStyle={styles.button} // Use buttonStyle prop
                            >
                                Register
                            </PrimaryButton>

                            {/* Link back to Login */}
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Log In</Text></Text>
                            </TouchableOpacity>

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
        flexGrow: 1, // Allow scrolling
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
        color: colors.secondary,
    },
    generalErrorText: {
        color: colors.error,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
});

export default RegisterScreen;