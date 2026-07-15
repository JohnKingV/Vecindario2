import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const LoadingDots = ({ size = 8, color, style }) => {
    const { theme } = useTheme();
    const dotColor = color || theme.colors.primary;

    const anim1 = useRef(new Animated.Value(0)).current;
    const anim2 = useRef(new Animated.Value(0)).current;
    const anim3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = (anim, delay) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 400,
                        delay: delay,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease)
                    }),
                    Animated.timing(anim, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease)
                    })
                ])
            ).start();
        };

        animate(anim1, 0);
        animate(anim2, 200);
        animate(anim3, 400);
    }, []);

    const getDotStyle = (anim) => ({
        transform: [
            {
                translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -6]
                })
            }
        ],
        opacity: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.4, 1]
        })
    });

    return (
        <View style={[styles.container, style]}>
            <Animated.View style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: dotColor }, getDotStyle(anim1)]} />
            <Animated.View style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: dotColor }, getDotStyle(anim2)]} />
            <Animated.View style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: dotColor }, getDotStyle(anim3)]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: 10,
    },
    dot: {
        // dynamic styles
    }
});
