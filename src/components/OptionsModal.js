import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import BaseModal from './BaseModal';

const OptionsModal = ({
    visible,
    onClose,
    title = 'Opciones',
    options = [],
    children
}) => {
    const { theme, isDark } = useTheme();

    const backgroundColor = isDark ? '#1e293b' : '#ffffff';
    const textColor = theme?.colors?.text || (isDark ? '#f8fafc' : '#1e293b');
    const textColorSecondary = theme?.colors?.textSecondary || (isDark ? '#94a3b8' : '#64748b');
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9';

    return (
        <BaseModal visible={visible} onClose={onClose}>
            <View
                style={[
                    styles.modalView,
                    { backgroundColor: backgroundColor, shadowColor: isDark ? '#000' : '#475569' }
                ]}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: textColor }]}>{title}</Text>
                    <TouchableOpacity onPress={onClose} hitSlop={15} style={styles.closeBtn}>
                        <MaterialCommunityIcons name="close" size={24} color={textColorSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Options List */}
                <View style={styles.list}>
                    {options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.item,
                                { borderBottomColor: borderColor, borderBottomWidth: index === options.length - 1 ? 0 : 1 }
                            ]}
                            onPress={() => {
                                if (option.onPress) {
                                    option.onPress();
                                }
                                onClose();
                            }}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name={option.icon}
                                size={24}
                                color={option.destructive ? '#ef4444' : textColorSecondary}
                                style={{ marginRight: 15 }}
                            />
                            <Text style={[styles.itemText, { color: option.destructive ? '#ef4444' : textColor }]}>
                                {option.label}
                            </Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={textColorSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>

                {children}
            </View>
        </BaseModal>
    );
};

const styles = StyleSheet.create({
    modalView: {
        width: '85%',
        maxWidth: 340,
        borderRadius: 24,
        padding: 24,
        elevation: 10,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)'
    },
    title: {
        fontSize: 18,
        fontWeight: "bold"
    },
    closeBtn: {
        padding: 5
    },
    list: {
        width: '100%'
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        width: '100%'
    },
    itemText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500'
    }
});

export default OptionsModal;
