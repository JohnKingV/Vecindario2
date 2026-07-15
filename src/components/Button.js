import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated, Platform } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { LoadingDots } from './LoadingDots';

const Button = ({
    children,
    title, // Backward compatibility
    onPress,
    variant = 'primary',
    fullWidth = false,
    style,
    contentStyle,
    disabled = false,
    loading = false,
    icon,
    ...props
}) => {
    const { theme, isDark } = useTheme();
    const [scale] = React.useState(new Animated.Value(1));
    const [isHovered, setIsHovered] = React.useState(false);

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.95,
            useNativeDriver: Platform.OS !== 'web',
            tension: 40,
            friction: 3,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: Platform.OS !== 'web',
            tension: 40,
            friction: 3,
        }).start();
    };

    const getVariantStyle = () => {
        switch (variant) {
            case 'secondary':
                return [
                    styles.secondary,
                    { backgroundColor: theme.colors.primary + '20' },
                    Platform.OS === 'web' && isHovered && { backgroundColor: theme.colors.primary + '30' }
                ];
            case 'outline':
                return [
                    styles.outline,
                    { borderColor: theme.colors.border },
                    Platform.OS === 'web' && isHovered && { borderColor: theme.colors.primary, backgroundColor: isDark ? 'rgba(37, 99, 235, 0.05)' : 'rgba(37, 99, 235, 0.02)' }
                ];
            case 'danger':
                return [
                    styles.danger,
                    { backgroundColor: '#dc2626' },
                    Platform.OS === 'web' && isHovered && { backgroundColor: '#b91c1c' }
                ];
            case 'ghost':
                return [
                    styles.ghost,
                    Platform.OS === 'web' && isHovered && { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.02)' }
                ];
            default:
                return [
                    styles.primary,
                    { backgroundColor: theme.colors.primary },
                    Platform.OS === 'web' && isHovered && { backgroundColor: theme.colors.primary + 'ee', transform: [{ translateY: -1 }] }
                ];
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'secondary':
                return [styles.secondaryText, { color: isDark ? '#60a5fa' : '#2563eb' }];
            case 'outline':
                return [styles.outlineText, { color: theme.colors.textSecondary }];
            case 'danger':
                return [styles.dangerText, { color: '#ffffff' }];
            case 'ghost':
                return [styles.ghostText, { color: theme.colors.textSecondary }];
            default:
                return styles.primaryText;
        }
    };

    const content = children || title;

    return (
        <Animated.View style={[{ transform: [{ scale: scale }], width: fullWidth ? '100%' : 'auto' }, style]}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                disabled={disabled || loading}
                style={StyleSheet.flatten([
                    styles.button,
                    getVariantStyle(),
                    fullWidth && styles.fullWidth,
                    disabled && styles.disabled,
                    contentStyle,
                ])}
                {...Platform.select({
                    web: {
                        onMouseEnter: () => setIsHovered(true),
                        onMouseLeave: () => setIsHovered(false),
                    }
                })}
                {...props}
            >
                {loading ? (
                    <LoadingDots size={8} color={variant === 'primary' ? '#fff' : (isDark ? '#60a5fa' : '#2563eb')} />
                ) : (
                    <View style={styles.contentContainer}>
                        {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
                        <Text style={StyleSheet.flatten([styles.text, getTextStyle(), props.textStyle])}>
                            {content}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginRight: 8,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    primary: {
        backgroundColor: '#2563eb',
        ...Platform.select({
            web: {
                boxShadow: '0px 8px 16px rgba(37, 99, 235, 0.3)',
            },
            default: {
                shadowColor: '#2563eb',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
            }
        })
    },
    primaryText: {
        color: '#ffffff',
    },
    secondary: {
        backgroundColor: '#eff6ff',
    },
    secondaryText: {
        color: '#2563eb',
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: '#cbd5e1',
    },
    outlineText: {
        color: '#475569',
    },
    danger: {
        backgroundColor: '#ef4444',
        ...Platform.select({
            web: {
                boxShadow: '0px 8px 16px rgba(239, 68, 68, 0.3)',
            },
            default: {
                shadowColor: '#ef4444',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
            }
        })
    },
    dangerText: {
        color: '#ffffff',
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    ghostText: {
        color: '#64748b',
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },
});

export default Button;
