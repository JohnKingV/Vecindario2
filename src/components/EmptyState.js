import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const EmptyState = ({ icon, title, message, actionLabel, onAction }) => {
    const { theme, isDark } = useTheme();

    const renderIcon = () => {
        if (!icon) return null;

        if (typeof icon !== 'string') return icon;

        const isIconName = /^[a-z0-9\-]+$/.test(icon);

        if (isIconName && icon.length > 3) {
            return (
                <View style={styles.iconWrapper}>
                    <MaterialCommunityIcons name={icon} size={64} color={isDark ? theme.colors.textSecondary : "#94a3b8"} />
                </View>
            );
        }

        return <Text style={styles.icon}>{icon}</Text>;
    };

    return (
        <View style={styles.container}>
            {renderIcon()}
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
            {message && <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>}
            {actionLabel && onAction && (
                <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={onAction}>
                    <Text style={styles.buttonText}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
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
    icon: {
        fontSize: 64,
        marginBottom: 16,
    },
    iconWrapper: {
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
    button: {
        marginTop: 24,
        backgroundColor: '#2563eb',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default EmptyState;
