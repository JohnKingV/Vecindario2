import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useVerificationScreen } from './useVerificationScreen';

export default function VerificationScreenWeb() {
    const { theme } = useVerificationScreen();
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text style={{ color: theme.colors.text }}>Verification Screen Web (Placeholder)</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
