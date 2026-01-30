import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';

const Card = ({ children, style, noPadding = false, onClick }) => {
    const Content = onClick ? TouchableOpacity : View;

    return (
        <Content
            activeOpacity={0.9}
            onPress={onClick}
            style={[
                styles.card,
                !noPadding && styles.padding,
                style
            ]}
        >
            {children}
        </Content>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        ...Platform.select({
            web: {
                boxShadow: '0px 12px 24px rgba(15, 23, 42, 0.1)',
            },
            default: {
                shadowColor: '#0f172a',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.1,
                shadowRadius: 24,
                elevation: 8,
            }
        }),
        overflow: 'hidden',
    },
    padding: {
        padding: 20,
    }
});

export default Card;
