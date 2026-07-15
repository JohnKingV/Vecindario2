import React from 'react';
import { Image, View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    interpolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

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
};

const FeaturedRing = ({ size }) => {
    const rotation = useSharedValue(0);
    const pulse = useSharedValue(1);

    React.useEffect(() => {
        rotation.value = withRepeat(
            withTiming(1, {
                duration: 4000,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
            }),
            -1,
            false
        );

        pulse.value = withRepeat(
            withTiming(1.08, {
                duration: 2000,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${rotation.value * 360}deg` },
            { scale: pulse.value }
        ],
        opacity: interpolate(pulse.value, [1, 1.08], [0.8, 1]),
    }));

    return (
        <View style={[styles.ringContainer, { width: size + 6, height: size + 6 }]}>
            <Animated.View style={[styles.ringInner, animatedStyle]}>
                <LinearGradient
                    colors={['#FFD700', '#FFA500', '#FFEA00', '#FF8C00', '#FFD700']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
};

const Avatar = React.memo(({ src, uri, name, size = 'md', status, showStatus = true, style, border = false, featured = false }) => {
    const containerSize = typeof size === 'number' ? size : (SIZES[size] || SIZES.md);
    const imageSource = src || uri;
    const [loading, setLoading] = React.useState(false);
    const [showLoader, setShowLoader] = React.useState(false);

    React.useEffect(() => {
        let timer;
        if (loading) {
            timer = setTimeout(() => setShowLoader(true), 150);
        } else {
            setShowLoader(false);
        }
        return () => clearTimeout(timer);
    }, [loading]);

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
            {featured && <FeaturedRing size={containerSize} />}
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
                            fadeDuration={Platform.OS === 'web' ? 0 : 300}
                            onLoadStart={() => {
                                if (typeof imageSource === 'string' && imageSource.startsWith('http')) {
                                    setLoading(true);
                                }
                            }}
                            onLoadEnd={() => setLoading(false)}
                            onError={() => setLoading(false)}
                        />
                        {showLoader && (
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
            {statusColor && showStatus && (
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
});

Avatar.displayName = 'Avatar';

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
    },
    ringContainer: {
        position: 'absolute',
        top: -3,
        left: -3,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
        // Brillo exterior intenso (Futuristic Glow)
        shadowColor: '#FFA500',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 12,
    },
    ringInner: {
        width: '100%',
        height: '100%',
        borderRadius: 999,
        overflow: 'hidden',
        padding: 2,
    },
});

export default Avatar;
