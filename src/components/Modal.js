import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Portal } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Modal = ({ isOpen, onClose, title, children, scrollable = true }) => {
    const { theme, isDark } = useTheme();

    if (!isOpen) return null;

    return (
        <Portal>
            <View style={styles.portalContainer}>
                {/* Backdrop */}
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />

                {/* Content Wrapper */}
                <View style={styles.contentWrapper}>
                    <View style={[styles.content, { backgroundColor: isDark ? '#111827' : '#ffffff' }]}>
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
            </View>
        </Portal>
    );
};

const styles = StyleSheet.create({
    portalContainer: {
        ...StyleSheet.absoluteFillObject,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        zIndex: 9999,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
    },
    contentWrapper: {
        width: '100%',
        justifyContent: 'flex-end',
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
        letterSpacing: -0.5,
        flex: 1,
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
    },
    closeIcon: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    body: {
        padding: 0,
    },
    scrollBody: {
        paddingBottom: 40,
    }
});

export default Modal;
