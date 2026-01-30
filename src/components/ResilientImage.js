import React, { useState } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ResilientImage = ({ source, style, resizeMode = 'cover', ...props }) => {
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    return (
        <View style={[styles.container, style, { backgroundColor: theme.colors.inputBackground }]}>
            <Image
                source={source}
                style={[StyleSheet.absoluteFill, style]}
                resizeMode={resizeMode}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                {...props}
            />
            {loading && (
                <View style={[StyleSheet.absoluteFill, styles.loader]}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        position: 'relative',
    },
    loader: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ResilientImage;
