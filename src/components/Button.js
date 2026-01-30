import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Animated, Platform } from 'react-native';

import { useTheme } from '../context/ThemeContext';

const Button = ({
    children,
    title, // Backward compatibility
    onPress,
    variant = 'primary',
    fullWidth = false,
    style,
    disabled = false,
    loading = false,
    icon,
    ...props
}) => {
    const { theme, isDark } = useTheme();
    const [scale] = React.useState(new Animated.Value(1));

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
                return [styles.secondary, { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.15)' : '#eff6ff' }];
            case 'outline':
                return [styles.outline, { borderColor: theme.colors.border }];
            case 'danger':
                return [styles.danger, { backgroundColor: isDark ? 'rgba(225, 29, 72, 0.15)' : '#fff1f2' }];
            case 'ghost':
                return styles.ghost;
            default:
                return [styles.primary, { backgroundColor: theme.colors.primary }];
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'secondary':
                return [styles.secondaryText, { color: isDark ? '#60a5fa' : '#2563eb' }];
            case 'outline':
                return [styles.outlineText, { color: theme.colors.textSecondary }];
            case 'danger':
                return [styles.dangerText, { color: isDark ? '#fb7185' : '#e11d48' }];
            case 'ghost':
                return [styles.ghostText, { color: theme.colors.textSecondary }];
            default:
                return styles.primaryText;
        }
    };

    const content = children || title;

    return (
        <Animated.View style={[{ transform: [{ scale }], width: fullWidth ? '100%' : 'auto' }, style]}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                disabled={disabled || loading}
                style={[
                    styles.button,
                    getVariantStyle(),
                    fullWidth && styles.fullWidth,
                    disabled && styles.disabled,
                ]}
                {...props}
            >
                {loading ? (
                    <ActivityIndicator color={variant === 'primary' ? '#fff' : (isDark ? '#60a5fa' : '#2563eb')} />
                ) : (
                    <View style={styles.contentContainer}>
                        {icon && <View style={styles.iconContainer}>{icon}</View>}
                        <Text style={[styles.text, getTextStyle(), props.textStyle]}>
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
        backgroundColor: '#fff1f2',
    },
    dangerText: {
        color: '#e11d48',
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
