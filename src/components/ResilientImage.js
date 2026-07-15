import React, { useState } from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { LoadingDots } from './LoadingDots';

const ResilientImage = React.memo(({ source, style, resizeMode = 'cover', ...props }) => {
    const [loading, setLoading] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const { theme } = useTheme();

    const imageUri = typeof source === 'object' ? source?.uri : source;

    React.useEffect(() => {
        let timer;
        if (loading) {
            // Only show loader if image takes more than 150ms to load (caching/fast connection)
            timer = setTimeout(() => setShowLoader(true), 150);
        } else {
            setShowLoader(false);
        }
        return () => clearTimeout(timer);
    }, [loading]);

    return (
        <View style={[styles.container, style, { backgroundColor: theme.colors.inputBackground }]}>
            <Image
                source={source}
                style={[StyleSheet.absoluteFill, style]}
                resizeMode={resizeMode}
                fadeDuration={Platform.OS === 'web' ? 0 : 300}
                onLoadStart={() => {
                    if (typeof imageUri === 'string' && imageUri.startsWith('http')) {
                        setLoading(true);
                    }
                }}
                onLoadEnd={() => setLoading(false)}
                onError={() => setLoading(false)}
                {...props}
            />
            {showLoader && (
                <View style={[StyleSheet.absoluteFill, styles.loader, { backgroundColor: theme.colors.inputBackground }]}>
                    <LoadingDots size={8} color={theme.colors.primary} />
                </View>
            )}
        </View>
    );
});

ResilientImage.displayName = 'ResilientImage';

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
