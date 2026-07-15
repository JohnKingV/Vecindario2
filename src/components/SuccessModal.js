import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Modal from './Modal';
import Button from './Button';
import { useTheme } from '../context/ThemeContext';

const SuccessModal = ({ visible, onClose, title = '¡Listo!', message }) => {
    const { theme } = useTheme();

    return (
        <Modal
            isOpen={visible}
            onClose={onClose}
            title={title}
            scrollable={false}
        >
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <MaterialCommunityIcons name="check-circle" size={60} color="#10b981" />
                </View>
                <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
                    {message}
                </Text>
                <Button
                    onPress={onClose}
                    style={styles.button}
                >
                    Continuar
                </Button>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    content: {
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    button: {
        width: '100%',
    }
});

export default SuccessModal;
