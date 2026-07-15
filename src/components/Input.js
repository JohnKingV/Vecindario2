import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';

const Input = ({
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType,
    autoCapitalize,
    containerStyle,
    inputStyle,
    flat = false,
    noMargin = false,
    ...props
}) => {
    const { theme, isDark } = useTheme();
    const inputRef = React.useRef(null);

    const handlePress = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <View style={[styles.container, noMargin && { marginBottom: 0 }, containerStyle]}>
            {props.label && <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{props.label}</Text>}
            <TouchableOpacity
                activeOpacity={1}
                onPress={handlePress}
                style={[
                    styles.inputWrapper,
                    {
                        backgroundColor: theme.colors.inputBackground,
                        borderColor: theme.colors.border
                    },
                    flat && {
                        backgroundColor: 'transparent',
                        borderWidth: 0,
                        minHeight: 'auto',
                        paddingHorizontal: 0
                    },
                    props.error && styles.error
                ]}
            >
                {props.leftIcon && (
                    <View style={[styles.iconContainer, flat && { left: 0 }]}>
                        {props.leftIcon}
                    </View>
                )}
                <TextInput
                    ref={inputRef}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    placeholderTextColor={theme.colors.placeholder}
                    style={[
                        styles.input,
                        { color: theme.colors.text },
                        props.leftIcon && styles.inputWithIcon,
                        flat && props.leftIcon && { paddingLeft: 32 },
                        props.multiline && styles.multilineInput,
                        inputStyle
                    ]}
                    underlineColorAndroid="transparent"
                    {...props}
                />
                {props.rightIcon && (
                    <View style={[styles.rightAction, flat && { paddingHorizontal: 0 }]}>
                        {props.rightIcon}
                    </View>
                )}
            </TouchableOpacity>
            {props.error && <Text style={styles.errorText}>{props.error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '900',
        color: '#64748b',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    inputWrapper: {
        borderWidth: 2,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        height: 56, // Fixed height matching MessagesScreen
    },
    error: {
        borderColor: '#ef4444',
    },
    iconContainer: {
        position: 'absolute',
        left: 16,
        zIndex: 1,
    },
    input: {
        flex: 1,
        height: '100%', // Match MessagesScreen searchInput
        paddingHorizontal: 16,
        fontSize: 16,
        fontWeight: '500',
        ...Platform.select({
            web: {
                outlineStyle: 'none',
            },
            default: {
                paddingVertical: 0,
            }
        })
    },
    inputWithIcon: {
        paddingLeft: 48,
    },
    multilineInput: {
        textAlignVertical: 'top',
        height: 'auto',
        minHeight: 100,
        paddingVertical: 12,
    },
    rightAction: {
        paddingRight: 13,
        paddingLeft: 95,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
        fontWeight: 'bold',
    },
});

export default Input;
