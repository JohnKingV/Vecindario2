import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Badge = ({ children, variant = 'neutral', style }) => {
    const variants = {
        info: {
            container: { backgroundColor: '#eff6ff' },
            text: { color: '#2563eb' }
        },
        success: {
            container: { backgroundColor: '#ecfdf5' },
            text: { color: '#059669' }
        },
        warning: {
            container: { backgroundColor: '#fffbeb' },
            text: { color: '#d97706' }
        },
        error: {
            container: { backgroundColor: '#fff1f2' },
            text: { color: '#e11d48' }
        },
        neutral: {
            container: { backgroundColor: '#f1f5f9' },
            text: { color: '#475569' }
        },
        primary: {
            container: { backgroundColor: '#2563eb' },
            text: { color: '#ffffff' }
        }
    };

    const currentVariant = variants[variant] || variants.neutral;

    // Handle both 'text' prop and 'children' for backward compatibility during transition
    const content = children;

    return (
        <View style={[styles.container, currentVariant.container, style]}>
            <Text style={[styles.text, currentVariant.text]}>{content}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 999,
        alignSelf: 'flex-start',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
});

export default Badge;
