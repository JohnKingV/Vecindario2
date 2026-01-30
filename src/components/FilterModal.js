import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from './Modal';
import Button from './Button';
import Slider from '@react-native-community/slider';
import { useTheme } from '../context/ThemeContext';

export default function FilterModal({ isVisible, onClose, onApplyFilters, initialFilters }) {
    const { theme, isDark } = useTheme();
    const [condicion, setCondicion] = useState(initialFilters.condicion);
    const [priceRange, setPriceRange] = useState(initialFilters.priceRange);

    useEffect(() => {
        setCondicion(initialFilters.condicion);
        setPriceRange(initialFilters.priceRange);
    }, [initialFilters]);

    const handleApply = () => {
        onApplyFilters({ condicion, priceRange });
    };

    const handleClear = () => {
        setCondicion(null);
        setPriceRange([0, 999999999]);
    };

    return (
        <Modal
            isOpen={isVisible}
            onClose={onClose}
            title="Filtrar Productos"
        >
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.filterTitle, { color: theme.colors.text }]}>Condición</Text>
                <View style={styles.conditionButtons}>
                    <Button
                        variant={condicion === 'nuevo' ? 'primary' : 'outline'}
                        onPress={() => setCondicion('nuevo')}
                        style={styles.conditionButton}
                    >
                        Nuevo
                    </Button>
                    <Button
                        variant={condicion === 'usado' ? 'primary' : 'outline'}
                        onPress={() => setCondicion('usado')}
                        style={styles.conditionButton}
                    >
                        Usado
                    </Button>
                    <Button
                        variant={condicion === null ? 'primary' : 'outline'}
                        onPress={() => setCondicion(null)}
                        style={styles.conditionButton}
                    >
                        Todos
                    </Button>
                </View>

                <Text style={[styles.filterTitle, { color: theme.colors.text }]}>Rango de Precio</Text>
                <View>
                    <Slider
                        minimumValue={0}
                        maximumValue={999999999}
                        step={1000}
                        value={priceRange[1]} // Using only the max for a single slider
                        onValueChange={(value) => setPriceRange([0, value])}
                        thumbTintColor={theme.colors.primary}
                        minimumTrackTintColor={theme.colors.primary}
                        maximumTrackTintColor={theme.colors.border}
                    />
                    <Text style={[styles.priceRangeText, { color: theme.colors.primary }]}>
                        Hasta: ${priceRange[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                    </Text>
                </View>

                <View style={styles.actionButtons}>
                    <Button
                        variant="secondary"
                        onPress={handleClear}
                        style={styles.actionButton}
                    >
                        Limpiar
                    </Button>
                    <Button
                        onPress={handleApply}
                        style={styles.actionButton}
                    >
                        Aplicar
                    </Button>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        paddingVertical: 20,
        gap: 20,
    },
    filterTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 10,
    },
    conditionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    conditionButton: {
        flex: 1,
    },
    priceRangeText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: '#2563eb',
        marginTop: 10,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginTop: 30,
    },
    actionButton: {
        flex: 1,
    },
});
