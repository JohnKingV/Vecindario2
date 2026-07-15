import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SimpleLogoutModal = ({ visible, onCancel, onConfirm, isDark }) => {
    // Debug: log when component renders
    if (visible) {
        console.log('[SimpleLogoutModal] Modal is VISIBLE');
        console.log('[SimpleLogoutModal] onCancel:', typeof onCancel);
        console.log('[SimpleLogoutModal] onConfirm:', typeof onConfirm);
    }

    const handleCancel = () => {
        console.log('========== CANCEL PRESSED ==========');
        console.log('onCancel exists?', !!onCancel);
        console.log('onCancel type:', typeof onCancel);
        if (onCancel) {
            console.log('Calling onCancel...');
            onCancel();
            console.log('onCancel called successfully');
        }
    };

    const handleConfirm = () => {
        console.log('========== CONFIRM PRESSED ==========');
        console.log('onConfirm exists?', !!onConfirm);
        console.log('onConfirm type:', typeof onConfirm);
        if (onConfirm) {
            console.log('Calling onConfirm...');
            onConfirm();
            console.log('onConfirm called successfully');
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            statusBarTranslucent={true}
            onRequestClose={handleCancel}
        >
            <View style={styles.overlay} pointerEvents="box-none">
                <View style={[styles.container, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]} pointerEvents="auto">
                    <Text style={[styles.title, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>
                        Cerrar Sesión
                    </Text>
                    <Text style={[styles.description, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                        ¿Confirmas que deseas salir?
                    </Text>

                    <View style={styles.buttonRow}>
                        <Pressable
                            onPress={handleCancel}
                            style={({ pressed }) => [
                                styles.cancelButton,
                                { opacity: pressed ? 0.7 : 1, backgroundColor: pressed ? '#f1f5f9' : 'transparent' }
                            ]}
                        >
                            <Text style={[styles.cancelText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                                CANCELAR
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={handleConfirm}
                            style={({ pressed }) => [
                                styles.confirmButton,
                                { opacity: pressed ? 0.9 : 1, transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }] }
                            ]}
                        >
                            <Text style={styles.confirmText}>SALIR</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        width: width,
        height: height,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    container: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 28,
        lineHeight: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
        gap: 16,
    },
    cancelButton: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        minWidth: 100,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    cancelText: {
        fontWeight: '700',
        fontSize: 15,
        letterSpacing: 0.5,
    },
    confirmButton: {
        backgroundColor: '#ef4444',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 12,
        minWidth: 100,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    confirmText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 15,
        letterSpacing: 0.5,
    },
});
