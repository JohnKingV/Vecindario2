import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';

const ResponsiveContainer = ({ children, style, maxWidth = 800, ...props }) => {
    const { width } = useWindowDimensions();
    const isWebDesktop = Platform.OS === 'web' && width > 768;

    if (!isWebDesktop) {
        return (
            <View style={[styles.mobileContainer, style]} {...props}>
                {children}
            </View>
        );
    }

    return (
        <View style={[styles.webOuterContainer, style]} {...props}>
            <View style={[styles.webInnerContainer, { maxWidth }]}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mobileContainer: {
        flex: 1,
    },
    webOuterContainer: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
    },
    webInnerContainer: {
        flex: 1,
        width: '100%',
        alignSelf: 'center',
        // Optional: Add shadow or border for desktop look
    },
});

export default ResponsiveContainer;
