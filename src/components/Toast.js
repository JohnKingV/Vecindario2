import React from 'react';
import { StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';

/**
 * Componente Toast reutilizable basado en Snackbar de React Native Paper
 */
const Toast = ({
    visible,
    onDismiss,
    message,
    duration = 3000,
    type = 'default',
    action
}) => {
    const getBackgroundColor = () => {
        switch (type) {
            case 'success': return '#10b981';
            case 'error': return '#ef4444';
            case 'warning': return '#f59e0b';
            case 'info': return '#3b82f6';
            default: return '#334155';
        }
    };

    return (
        <Snackbar
            visible={visible}
            onDismiss={onDismiss}
            duration={duration}
            action={action}
            style={[styles.snackbar, { backgroundColor: getBackgroundColor() }]}
            wrapperStyle={styles.wrapper}
        >
            {message}
        </Snackbar>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        bottom: 20,
    },
    snackbar: {
        borderRadius: 12,
    },
});

export default Toast;
