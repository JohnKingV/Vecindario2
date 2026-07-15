import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const NotificationIcon = ({ type }) => {
    switch (type) {
        case 'post':
        case 'security':
            return (
                <View style={[styles.iconContainer, { backgroundColor: '#e0f2fe' }]}>
                    <MaterialCommunityIcons name="bullhorn-outline" size={24} color="#0ea5e9" />
                </View>
            );
        case 'item':
        case 'marketplace':
            return (
                <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4' }]}>
                    <MaterialCommunityIcons name="storefront-outline" size={24} color="#22c55e" />
                </View>
            );
        case 'comment':
            return (
                <View style={[styles.iconContainer, { backgroundColor: '#f3e8ff' }]}>
                    <MaterialCommunityIcons name="chat-outline" size={24} color="#a855f7" />
                </View>
            );
        case 'like':
        case 'comment_like':
            return (
                <View style={[styles.iconContainer, { backgroundColor: '#fef2f2' }]}>
                    <MaterialCommunityIcons name="heart-outline" size={24} color="#ef4444" />
                </View>
            );
        case 'chat':
            return (
                <View style={[styles.iconContainer, { backgroundColor: '#dbeafe' }]}>
                    <MaterialCommunityIcons name="message-text-outline" size={24} color="#2563eb" />
                </View>
            );
        default:
            return (
                <View style={[styles.iconContainer, { backgroundColor: '#dbeafe' }]}>
                    <MaterialCommunityIcons name="bell-outline" size={24} color="#2563eb" />
                </View>
            );
    }
};

const styles = StyleSheet.create({
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
