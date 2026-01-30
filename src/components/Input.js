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
    ...props
}) => {
    const { theme } = useTheme();

    return (
        <View style={[{ marginBottom: 16 }, containerStyle]}>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                placeholderTextColor="#94a3b8"
                style={[
                    {
                        backgroundColor: '#f8fafc',
                        borderWidth: 2,
                        borderColor: '#e2e8f0',
                        borderRadius: 12,
                        padding: 15,
                        fontSize: 16,
                        color: '#0f172a',
                    },
                    inputStyle
                ]}
                {...props}
            />
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
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#f1f5f9',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 56,
    },
    focused: {
        ...Platform.select({
            web: { boxShadow: '0px 0px 8px rgba(37, 99, 235, 0.1)' },
            default: {
                shadowColor: '#2563eb',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 2,
            }
        })
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
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#0f172a',
        fontWeight: '500',
        borderWidth: 0,
        backgroundColor: 'transparent',
        ...Platform.select({
            web: {
                outlineStyle: 'none',
                outlineWidth: 0,
                outlineColor: 'transparent',
                boxShadow: 'none',
            },
            default: {
                paddingVertical: 0,
                elevation: 0,
                shadowOpacity: 0,
            }
        })
    },
    inputWithIcon: {
        paddingLeft: 48,
    },
    multilineContainer: {
        alignItems: 'flex-start',
        minHeight: 120,
        paddingVertical: 12,
    },
    multilineInput: {
        textAlignVertical: 'top',
    },
    rightAction: {
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    eyeIcon: {
        fontSize: 18,
        color: '#94a3b8',
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
