import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Button from './Button';
import { useTheme } from '../context/ThemeContext';
import BaseModal from './BaseModal';

const ConfirmModal = ({
    visible,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'danger', // 'danger', 'warning', 'info'
    showCancel = true
}) => {
    const { theme, isDark } = useTheme();

    const textColor = theme?.colors?.text || (isDark ? '#f8fafc' : '#1e293b');
    const textColorSecondary = theme?.colors?.textSecondary || (isDark ? '#94a3b8' : '#64748b');
    const inputBg = theme?.colors?.inputBackground || (isDark ? '#334155' : '#f1f5f9');

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
        <BaseModal visible={visible} onClose={onClose}>
            <View style={[styles.modalContainer, { backgroundColor: isDark ? '#111827' : '#ffffff' }]}>
                <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '15' }]}>
                    <MaterialCommunityIcons name={getIcon()} size={32} color={getIconColor()} />
                </View>

                <Text style={[styles.title, { color: textColor }]}>{title}</Text>
                <Text style={[styles.message, { color: textColorSecondary }]}>{message}</Text>

                <View style={styles.footer}>
                    {showCancel && (
                        <TouchableOpacity
                            style={[styles.cancelBtn, { backgroundColor: inputBg }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.cancelBtnText, { color: textColorSecondary }]}>{cancelText}</Text>
                        </TouchableOpacity>
                    )}

                    <Button
                        onPress={onConfirm}
                        variant={type === 'danger' ? 'danger' : 'primary'}
                        style={styles.confirmBtn}
                        textStyle={[styles.confirmBtnText, { color: '#ffffff' }]}
                    >
                        {confirmText}
                    </Button>
                </View>
            </View>
        </BaseModal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        width: Platform.OS === 'web' ? 400 : '90%',
        maxWidth: 500,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
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
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 15,
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
    },
    confirmBtn: {
        flex: 1,
        height: 50,
        marginBottom: 0,
    },
    cancelBtnText: {
        fontSize: 15,
        fontWeight: '600',
    },
    confirmBtnText: {
        fontSize: 15,
        fontWeight: '700',
    }
});

export default ConfirmModal;
