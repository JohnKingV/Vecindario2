import React from 'react';
import {
    Modal as RNModal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';

import { useTheme } from '../context/ThemeContext';

const Modal = ({ isOpen, onClose, title, children, scrollable = true }) => {
    const { theme, isDark } = useTheme();
    return (
        <RNModal
            visible={isOpen}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View style={[styles.content, { backgroundColor: theme.colors.card }]}>
                    <View style={[styles.dragPillar, { backgroundColor: theme.colors.border }]} />
                    <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: theme.colors.inputBackground }]}>
                            <Text style={[styles.closeIcon, { color: theme.colors.textSecondary }]}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={{ flexShrink: 1 }}
                    >
                        {scrollable ? (
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                bounces={false}
                                contentContainerStyle={styles.scrollBody}
                            >
                                {children}
                            </ScrollView>
                        ) : (
                            <View style={styles.body}>
                                {children}
                            </View>
                        )}
                    </KeyboardAvoidingView>
                </View>
            </View>
        </RNModal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: '90%',
        ...Platform.select({
            web: {
                boxShadow: '0px -10px 20px rgba(0, 0, 0, 0.1)',
            },
            default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
                elevation: 20,
            }
        })
    },
    dragPillar: {
        width: 40,
        height: 5,
        backgroundColor: '#e2e8f0',
        borderRadius: 3,
        alignSelf: 'center',
        marginTop: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -0.5,
        flex: 1,
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 20,
    },
    closeIcon: {
        fontSize: 16,
        color: '#94a3b8',
        fontWeight: 'bold',
    },
    body: {
        padding: 0, // Let the children handle padding to avoid double padding
    },
    scrollBody: {
        paddingBottom: 40, // Extra space at bottom for accessibility
    }
});

export default Modal;
