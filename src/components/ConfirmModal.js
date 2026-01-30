import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Button from './Button';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const ConfirmModal = ({
    visible,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'danger' // 'danger', 'warning', 'info'
}) => {
    const { theme, isDark } = useTheme();
    const getIcon = () => {
        switch (type) {
            case 'danger': return 'alert-circle-outline';
            case 'warning': return 'alert-outline';
            case 'info': return 'information-outline';
            default: return 'help-circle-outline';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'danger': return '#ef4444';
            case 'warning': return '#f59e0b';
            case 'info': return '#3b82f6';
            default: return '#64748b';
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
                    <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '15' }]}>
                        <MaterialCommunityIcons name={getIcon()} size={32} color={getIconColor()} />
                    </View>

                    <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
                    <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>

                    <View style={styles.footer}>
                        <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: theme.colors.inputBackground }]} onPress={onClose}>
                            <Text style={[styles.cancelBtnText, { color: theme.colors.textSecondary }]}>{cancelText}</Text>
                        </TouchableOpacity>

                        <Button
                            onPress={onConfirm}
                            variant={type === 'danger' ? 'danger' : 'primary'}
                            style={styles.confirmBtn}
                            textStyle={styles.confirmBtnText}
                        >
                            {confirmText}
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContainer: {
        width: Platform.OS === 'web' ? 400 : '100%',
        maxWidth: 500,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        ...Platform.select({
            web: {
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            },
            default: {
                elevation: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            }
        })
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    footer: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 14,
        backgroundColor: '#f1f5f9',
    },
    confirmBtn: {
        flex: 1,
        height: 50,
        marginBottom: 0,
    },
    cancelBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748b',
    },
    confirmBtnText: {
        fontSize: 15,
        fontWeight: '700',
    }
});

export default ConfirmModal;
