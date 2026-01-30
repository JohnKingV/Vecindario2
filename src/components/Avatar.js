import React from 'react';
import { Image, View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';

const SIZES = {
    xs: 20,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 96,
};

const AVATAR_COLORS = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
];

const getBackgroundColor = (name) => {
    if (!name) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
};

const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
};

const Avatar = ({ src, uri, name, size = 'md', status, style, border = false }) => {
    const containerSize = typeof size === 'number' ? size : (SIZES[size] || SIZES.md);
    const imageSource = src || uri;
    const [loading, setLoading] = React.useState(true);

    const getStatusColor = (s) => {
        switch (s?.toLowerCase()) {
            case 'online': return '#10b981'; // Green
            case 'busy': return '#f59e0b';   // Amber
            case 'offline': return '#94a3b8'; // Gray
            default: return null;
        }
    };

    const statusColor = getStatusColor(status);
    const indicatorSize = Math.max(containerSize * 0.25, 12);
    const indicatorOffset = 0; // Pegado al borde

    const hasImage = imageSource && imageSource !== '' && !imageSource.includes('undefined');

    return (
        <View style={[styles.outerContainer, style]}>
            <View style={[
                styles.container,
                {
                    width: containerSize,
                    height: containerSize,
                    borderRadius: containerSize / 2,
                    backgroundColor: hasImage ? '#f1f5f9' : getBackgroundColor(name)
                },
                border && styles.border,
            ]}>
                {hasImage ? (
                    <>
                        <Image
                            source={{ uri: imageSource }}
                            style={styles.image}
                            onLoadStart={() => setLoading(true)}
                            onLoadEnd={() => setLoading(false)}
                        />
                        {loading && (
                            <View style={[StyleSheet.absoluteFill, styles.loaderContainer]}>
                                <ActivityIndicator size="small" color="#94a3b8" />
                            </View>
                        )}
                    </>
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={[
                            styles.placeholderText,
                            { fontSize: containerSize * 0.4, color: '#fff' }
                        ]}>
                            {getInitials(name)}
                        </Text>
                    </View>
                )}
            </View>
            {statusColor && (
                <View style={[
                    styles.statusIndicator,
                    {
                        backgroundColor: statusColor,
                        width: indicatorSize,
                        height: indicatorSize,
                        borderRadius: indicatorSize / 2,
                        bottom: indicatorOffset,
                        right: indicatorOffset,
                        borderColor: '#fff',
                        borderWidth: 2,
                    }
                ]} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        position: 'relative',
    },
    container: {
        backgroundColor: '#f1f5f9',
        overflow: 'hidden',
    },
    statusIndicator: {
        position: 'absolute',
        zIndex: 10,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    loaderContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
    },
    placeholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        color: '#fff',
        fontWeight: '800',
    },
    border: {
        borderWidth: 2,
        borderColor: '#ffffff',
    }
});

export default Avatar;
