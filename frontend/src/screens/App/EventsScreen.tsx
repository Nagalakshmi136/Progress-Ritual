import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // Import your auth hook (typed)
import { colors } from '../../themes/colors'; // Import colors for potential styling
import { spacing } from '../../themes/spacing'; // Import spacing

// Use React.FC for the component
const EventsScreen: React.FC = () => {
    // Get user and logout function (typed by useAuth hook)
    const { user } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Welcome, {user ? user.email : 'Guest'}!</Text>
            <Text style={styles.infoText}>This is your main app screen.</Text>
            {/* Example Logout Button */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg, // Use themed spacing
        backgroundColor: colors.background, // Use themed background color
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text, // Use themed text color
        marginBottom: spacing.sm,
    },
    infoText: {
        fontSize: 16,
        marginBottom: spacing.lg,
    }
});

export default EventsScreen;