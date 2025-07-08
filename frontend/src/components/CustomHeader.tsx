import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

type CustomHeaderProps = {
    title: string;
    points: number;
};

const CustomHeader: React.FC<CustomHeaderProps> = ({ title, points }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>

            <View style={styles.pointsContainer}>
                <Image
                    source={require('../assets/images/icons/dollar.png')}
                    style={styles.pointsIcon}
                    resizeMode="contain"
                />
                <Text style={styles.pointsText}>{points}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 70,
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        color: COLORS.white,
    },
    pointsContainer: {
        position: 'absolute',
        right: 20,
        alignItems: 'center',
    },
    pointsIcon: {
        width: 24,
        height: 24,
    },
    pointsText: {
        fontSize: 14,
        color: COLORS.white,
        fontWeight: '600',
        marginTop: 2,
        textAlign: 'center',
    },
});

export default CustomHeader;