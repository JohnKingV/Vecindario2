import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
} from 'react-native';
import Reanimated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withDelay,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ModernFAB = ({ onPress, label, icon = "plus", style, size = 72, colors = ['#2563eb', '#3b82f6', '#1d4ed8'], iconColor = "#fff" }) => {
    const pulse = useSharedValue(1);
    const glimmerPos = useSharedValue(-150);
    const iconScale = useSharedValue(1);
    const iconGlow = useSharedValue(0.5);

    const glimmerRange = size > 50 ? 150 : 100;

    React.useEffect(() => {
        // Pulse animation (button)
        pulse.value = withRepeat(
            withTiming(1.06, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );

        // Icon Pulse (Heart beat speed)
        iconScale.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 200, easing: Easing.out(Easing.ease) }),
                withTiming(1, { duration: 200, easing: Easing.in(Easing.ease) }),
                withDelay(800, withTiming(1, { duration: 0 }))
            ),
            -1,
            false
        );

        // Icon Glow
        iconGlow.value = withRepeat(
            withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );

        // Glimmer animation every 3s
        glimmerPos.value = withRepeat(
            withDelay(2000,
                withTiming(glimmerRange, { duration: 1000, easing: Easing.linear })
            ),
            -1,
            false
        );
    }, [size]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
    }));

    const iconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: iconScale.value }],
        opacity: iconColor === '#FFA500' ? iconGlow.value : 1,
        // Glow effect parts that can be animated simply
        shadowOpacity: iconColor === '#FFA500' ? iconGlow.value : 0,
        shadowRadius: iconColor === '#FFA500' ? 15 : 0,
    }));

    const glimmerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: glimmerPos.value }, { rotate: '30deg' }],
    }));

    return (
        <Reanimated.View style={[styles.fabWrapper, style, animatedStyle]}>
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={onPress}
                style={[styles.fabContainer, { width: size, height: size, borderRadius: size / 2 }]}
            >
                <LinearGradient
                    colors={colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />

                {/* Glimmer effect */}
                <Reanimated.View style={[styles.glimmer, glimmerStyle]} />

                <View style={styles.fabInner}>
                    <Reanimated.View style={iconStyle}>
                        <MaterialCommunityIcons
                            name={icon}
                            size={size > 50 ? 30 : 22}
                            color={iconColor}
                        />
                    </Reanimated.View>
                    {(label && size >= 45) && <Text style={[styles.fabText, { color: iconColor }]}>{label}</Text>}
                </View>
            </TouchableOpacity>
        </Reanimated.View>
    );
};

const styles = StyleSheet.create({
    fabWrapper: {
        zIndex: 9999,
        // Premium Glow
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 18,
        elevation: 15,
    },
    fabContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fabInner: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    glimmer: {
        position: 'absolute',
        width: 40,
        height: '200%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        top: '-50%',
    },
    fabText: {
        fontSize: 8,
        fontWeight: '900',
        color: '#fff',
        marginTop: 1,
        letterSpacing: 0.5,
    },
});

export default ModernFAB;
