import React from 'react';
import { View, Text, Modal, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingModal = ({ visible, text = 'Cargando...' }) => {
    if (!visible) return null;

    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            statusBarTranslucent={true}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.text}>{text}</Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    content: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        flexDirection: 'row',
    },
    text: {
        marginLeft: 15,
        fontSize: 16,
        fontWeight: '500',
    }
});

export default LoadingModal;
