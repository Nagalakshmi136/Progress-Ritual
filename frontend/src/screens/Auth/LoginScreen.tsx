// import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// import { Image } from "expo-image";

import { authStyles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";
import { useAuth } from "@/src/context/AuthContext";

const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    // const router = useRouter();

    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    // const [passwordError, setPasswordError] = useState("");
    // const [emailError, seteEmailError] = useState("");

    const handleLoginIn = async () => {
        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }
        if (!email.includes("@")) {
            setError("Please enter a valid email address");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }
        setError("");
        setLoading(true);
        try {
            await login(email, password);
            // Navigate to the home screen after successful login

        } catch (err) {
            console.error("Login error:", err);
            setError("Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAwareScrollView
            style={authStyles.keyboardView}
            contentContainerStyle={{ flexGrow: 1 }}
            enableOnAndroid
            enableAutomaticScroll

        >
            <View style={authStyles.container}>

                {/* <View style={authStyles.imageContainer}>
                        <Image
                            source={require("../../assets/images/i1.png")}
                            style={authStyles.image}
                            contentFit="contain"
                        />
                    </View> */}

                <Text style={authStyles.title}>Welcome Back</Text>
                <Text style={authStyles.subtitle}>
                    Log in to continue your ritual of progress </Text>
                {/* FORM CONTAINER */}
                <View style={authStyles.formContainer}>
                    {
                        error ? (
                            <View style={authStyles.errorBox}>
                                <Ionicons
                                    name="alert-circle-outline"
                                    size={20}
                                    color={COLORS.error}
                                />
                                <Text style={authStyles.errorText}>{error}</Text>
                                <TouchableOpacity onPress={() => setError("")}>
                                    <Ionicons
                                        name="close"
                                        size={20}
                                        color={COLORS.textLight}
                                    />
                                </TouchableOpacity>
                            </View>
                        ) : null
                    }
                    {/* Email Input */}
                    <View style={authStyles.inputContainer}>
                        <TextInput
                            style={[authStyles.textInput, error && authStyles.errorInput]}
                            placeholder="Enter email"
                            placeholderTextColor={COLORS.textLight}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* PASSWORD INPUT */}
                    <View style={authStyles.inputContainer}>
                        <TextInput
                            style={[authStyles.textInput, error && authStyles.errorInput]}
                            placeholder="Enter password"
                            placeholderTextColor={COLORS.textLight}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={authStyles.eyeButton}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons
                                name={showPassword ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color={COLORS.textLight}
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
                        onPress={handleLoginIn}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <Text style={authStyles.buttonText}>{loading ? "Signing In..." : "Sign In"}</Text>
                    </TouchableOpacity>

                    {/* Sign Up Link */}
                    <TouchableOpacity
                        style={authStyles.linkContainer}
                        onPress={() => navigation.navigate("Register")}
                    >
                        <Text style={authStyles.linkText}>
                            Don&apos;t have an account? <Text style={authStyles.link}>Sign up</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

        </KeyboardAwareScrollView>
    );
};
export default LoginScreen;