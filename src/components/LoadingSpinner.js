import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const LoadingSpinner = ({ message = 'Cargando...' }) => {
    const { theme } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            {message && <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    message: {
        marginTop: 16,
        fontSize: 14,
        color: '#64748b',
    },
});

export default LoadingSpinner;