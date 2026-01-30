import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const OptionsModal = ({
    visible,
    onClose,
    title = 'Opciones',
    options = []
}) => {
    const { theme, isDark } = useTheme();
    return (
        <Modal
            visible={visible}
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
                            <MaterialCommunityIcons name="close" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <SafeAreaView style={styles.optionsList}>
                        {options.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.optionItem,
                                    { backgroundColor: theme.colors.card },
                                    index === options.length - 1 && styles.lastOption
                                ]}
                                onPress={() => {
                                    onClose();
                                    option.onPress();
                                }}
                            >
                                <View style={[
                                    styles.iconBox,
                                    { backgroundColor: option.destructive ? (isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2') : theme.colors.inputBackground }
                                ]}>
                                    <MaterialCommunityIcons
                                        name={option.icon}
                                        size={22}
                                        color={option.destructive ? '#ef4444' : theme.colors.textSecondary}
                                    />
                                </View>
                                <View style={styles.optionContent}>
                                    <Text style={[
                                        styles.optionLabel,
                                        { color: theme.colors.text },
                                        option.destructive && styles.destructiveLabel
                                    ]}>
                                        {option.label}
                                    </Text>
                                    {option.subtitle && (
                                        <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>{option.subtitle}</Text>
                                    )}
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.border} />
                            </TouchableOpacity>
                        ))}
                    </SafeAreaView>
                </View>
            </View>
        </Modal>
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
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
        ...Platform.select({
            web: {
                boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.15)',
            },
            default: {
                elevation: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
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
        marginBottom: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        letterSpacing: -0.5,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionsList: {
        paddingVertical: 8,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: '#fff',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionContent: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    destructiveLabel: {
        color: '#ef4444',
    },
    optionSubtitle: {
        fontSize: 13,
        color: '#94a3b8',
        marginTop: 2,
    },
    lastOption: {
        marginBottom: 16,
    }
});

export default OptionsModal;
