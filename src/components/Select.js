import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Platform, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';

const Select = ({
    label,
    value,
    onValueChange,
    options = [],
    placeholder = 'Seleccionar...',
    error,
    containerStyle,
}) => {
    const { theme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (item) => {
        onValueChange(itemValue => item); // Compatibility with standard patterns
        onValueChange(item);
        setIsOpen(false);
    };

    const selectedLabel = options.find(opt => opt === value || opt.value === value);
    const displayLabel = typeof selectedLabel === 'object' ? selectedLabel.label : selectedLabel;

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>}

            <TouchableOpacity
                style={[
                    styles.selector,
                    error && styles.errorSelector,
                    { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }
                ]}
                onPress={() => setIsOpen(true)}
                activeOpacity={0.7}
            >
                <Text style={[styles.valueText, !value && styles.placeholderText, { color: value ? theme.colors.text : theme.colors.placeholder }]}>
                    {displayLabel || placeholder}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}
                >
                    <SafeAreaView style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.menuContainer}>
                            <View style={styles.menuHeader}>
                                <Text style={[styles.menuTitle, { color: theme.colors.text }]}>{label || 'Seleccionar'}</Text>
                                <TouchableOpacity onPress={() => setIsOpen(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={options}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => {
                                    const itemLabel = typeof item === 'object' ? item.label : item;
                                    const itemValue = typeof item === 'object' ? item.value : item;
                                    const isSelected = itemValue === value;

                                    return (
                                        <TouchableOpacity
                                            style={[
                                                styles.option,
                                                isSelected && { backgroundColor: theme.colors.primary + '10' }
                                            ]}
                                            onPress={() => handleSelect(itemValue)}
                                        >
                                            <Text style={[
                                                styles.optionText,
                                                { color: theme.colors.textSecondary },
                                                isSelected && { color: theme.colors.primary, fontWeight: '800' }
                                            ]}>
                                                {itemLabel}
                                            </Text>
                                            {isSelected && (
                                                <MaterialCommunityIcons name="check" size={20} color={theme.colors.primary} />
                                            )}
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>
                    </SafeAreaView>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '900',
        color: '#64748b',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    selector: {
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#f1f5f9',
        borderRadius: 16,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        ...Platform.select({
            web: { boxShadow: '0px 4px 6px rgba(0,0,0,0.02)' },
            default: { elevation: 1 }
        })
    },
    errorSelector: {
        borderColor: '#ef4444',
    },
    valueText: {
        fontSize: 16,
        color: '#0f172a',
        fontWeight: '600',
    },
    placeholderText: {
        color: '#94a3b8',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: '80%',
    },
    menuContainer: {
        padding: 24,
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    menuTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        marginBottom: 8,
    },
    selectedOption: {
        backgroundColor: 'rgba(30, 58, 138, 0.05)',
    },
    optionText: {
        fontSize: 16,
        color: '#475569',
        fontWeight: '600',
    },
    selectedOptionText: {
        color: '#1E3A8A',
        fontWeight: '800',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
        fontWeight: 'bold',
    },
});

export default Select;
