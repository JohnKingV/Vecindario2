import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import BaseModal from './BaseModal';

export const LogoutModal = ({ visible, onClose, onConfirm }) => {
    const { signOut } = useAuth();
    const { theme, isDark } = useTheme();

    const handleLogout = () => {
        console.log('[LogoutModal] Salir pressed');
        onClose();
        setTimeout(() => {
            if (onConfirm) {
                onConfirm();
            } else {
                signOut();
            }
        }, 100);
    };

    return (
        <BaseModal visible={visible} onClose={onClose}>
            <View style={[styles.modalContainer, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Cerrar Sesión</Text>
                <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                    ¿Confirmas que deseas salir?
                </Text>

                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={[styles.button, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}
                    >
                        <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogout}
                        style={[styles.button, { backgroundColor: '#ef4444' }]}
                    >
                        <Text style={[styles.buttonText, { color: '#ffffff' }]}>Salir</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </BaseModal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        width: 300,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontWeight: 'bold',
    },
});


