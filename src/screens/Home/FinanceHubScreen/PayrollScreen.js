import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../../context/ThemeContext';
import { financeService } from '../../../services/financeService';
import { useAuth } from '../../../hooks/useAuth';
import { ResponsiveContainer } from '../../../components';

const PayrollScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { profile } = useAuth();
    
    const ROLES_EMPLEADOS = [
        { label: 'Conserje', value: 'conserje' },
        { label: 'Personal de Aseo', value: 'aseo' },
        { label: 'Administrador', value: 'administrador' },
        { label: 'Mayordomo', value: 'mayordomo' },
        { label: 'Mantenimiento', value: 'mantenimiento' },
        { label: 'Otro', value: 'otro' }
    ];

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newEmployee, setNewEmployee] = useState({ rut: '', nombre_completo: '', cargo: '', sueldo_base: '' });

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        if (!profile?.comunidad_id) return;
        setLoading(true);
        const { data } = await financeService.getEmployees(profile.comunidad_id);
        if (data) setEmployees(data);
        setLoading(false);
    };

    const handleCreateEmployee = async () => {
        if (!newEmployee.nombre_completo) return;
        setLoading(true);
        await financeService.createEmployee({
            ...newEmployee,
            comunidad_id: profile.comunidad_id,
            sueldo_base: parseFloat(newEmployee.sueldo_base) || 0
        });
        setModalVisible(false);
        setNewEmployee({ rut: '', nombre_completo: '', cargo: '', sueldo_base: '' });
        loadEmployees();
    };

    const renderItem = ({ item }) => (
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '20' }]}>
                    <MaterialCommunityIcons name="account-tie" size={24} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={[styles.employeeName, { color: theme.colors.text }]}>{item.nombre_completo}</Text>
                    <Text style={[styles.employeeRole, { color: theme.colors.textSecondary }]}>{item.cargo?.toUpperCase() || 'GENERAL'}</Text>
                </View>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#22c55e' }]}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Liquidar</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.cardFooter}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>RUT: {item.rut}</Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: 'bold' }}>
                    Sueldo Base: ${Number(item.sueldo_base).toLocaleString('es-CL')}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>Recursos Humanos</Text>
                        <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>Nómina y Sueldos</Text>
                    </View>
                    <TouchableOpacity 
                        style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
                        onPress={() => setModalVisible(true)}
                    >
                        <MaterialCommunityIcons name="account-plus" size={20} color="#fff" />
                        <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 8 }}>Añadir Personal</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 100 }} />
                ) : (
                    <FlatList
                        data={employees}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListEmptyComponent={<Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginTop: 50 }}>No hay personal registrado.</Text>}
                    />
                )}
            </ResponsiveContainer>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Nuevo Empleado</Text>
                        
                        <TextInput
                            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                            placeholder="Nombre Completo"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={newEmployee.nombre_completo}
                            onChangeText={t => setNewEmployee({...newEmployee, nombre_completo: t})}
                        />
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TextInput
                                style={[styles.input, { flex: 1, color: theme.colors.text, borderColor: theme.colors.border }]}
                                placeholder="RUT"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={newEmployee.rut}
                                onChangeText={t => setNewEmployee({...newEmployee, rut: t})}
                            />
                            <View style={[styles.input, { flex: 1, padding: 0, justifyContent: 'center', height: 55 }]}>
                                <Picker
                                    selectedValue={newEmployee.cargo}
                                    onValueChange={(itemValue) => setNewEmployee({...newEmployee, cargo: itemValue})}
                                    style={{ color: theme.colors.text, height: 50 }}
                                    dropdownIconColor={theme.colors.textSecondary}
                                >
                                    <Picker.Item label="Cargo / Rol" value="" color={theme.colors.textSecondary} />
                                    {ROLES_EMPLEADOS.map(role => (
                                        <Picker.Item key={role.value} label={role.label} value={role.value} />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                        <TextInput
                            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                            placeholder="Sueldo Base (CLP)"
                            placeholderTextColor={theme.colors.textSecondary}
                            keyboardType="numeric"
                            value={newEmployee.sueldo_base}
                            onChangeText={t => setNewEmployee({...newEmployee, sueldo_base: t})}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={{ color: theme.colors.textSecondary }}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]} onPress={handleCreateEmployee}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Guardar Ficha</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
    backBtn: { padding: 8 },
    title: { fontSize: 28, fontWeight: '900' },
    addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
    card: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    employeeName: { fontSize: 18, fontWeight: 'bold' },
    employeeRole: { fontSize: 14, marginTop: 4 },
    actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '90%', maxWidth: 500, padding: 24, borderRadius: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    input: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 16 },
    cancelBtn: { padding: 16 },
    saveBtn: { paddingHorizontal: 24, paddingVertical: 16, borderRadius: 12 }
});

export default PayrollScreen;
