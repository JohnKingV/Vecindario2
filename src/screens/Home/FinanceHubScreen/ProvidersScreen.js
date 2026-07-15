import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { financeService } from '../../../services/financeService';
import { useAuth } from '../../../hooks/useAuth';
import { ResponsiveContainer } from '../../../components';

const ProvidersScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { profile } = useAuth();
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newProvider, setNewProvider] = useState({ rut: '', razon_social: '', giro: '', banco: '', numero_cuenta: '' });

    useEffect(() => {
        loadProviders();
    }, []);

    const loadProviders = async () => {
        if (!profile?.comunidad_id) return;
        setLoading(true);
        const { data } = await financeService.getProviders(profile.comunidad_id);
        if (data) setProviders(data);
        setLoading(false);
    };

    const handleCreateProvider = async () => {
        if (!newProvider.razon_social) return;
        setLoading(true);
        await financeService.createProvider({
            ...newProvider,
            comunidad_id: profile.comunidad_id
        });
        setModalVisible(false);
        setNewProvider({ rut: '', razon_social: '', giro: '', banco: '', numero_cuenta: '' });
        loadProviders();
    };

    const renderItem = ({ item }) => (
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '20' }]}>
                    <MaterialCommunityIcons name="domain" size={24} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={[styles.providerName, { color: theme.colors.text }]}>{item.razon_social}</Text>
                    <Text style={[styles.providerRut, { color: theme.colors.textSecondary }]}>RUT: {item.rut || 'N/A'}</Text>
                </View>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.primary + '10' }]}>
                    <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Pagar</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.cardFooter}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>{item.giro || 'Sin giro especificado'}</Text>
                {item.banco && <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>{item.banco} - {item.numero_cuenta}</Text>}
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
                        <Text style={[styles.title, { color: theme.colors.text }]}>Directorio de Proveedores</Text>
                        <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>Módulo de Egresos</Text>
                    </View>
                    <TouchableOpacity 
                        style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
                        onPress={() => setModalVisible(true)}
                    >
                        <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                        <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 8 }}>Nuevo Proveedor</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 100 }} />
                ) : (
                    <FlatList
                        data={providers}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListEmptyComponent={<Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginTop: 50 }}>No hay proveedores registrados aún.</Text>}
                    />
                )}
            </ResponsiveContainer>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Nuevo Proveedor</Text>
                        
                        <TextInput
                            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                            placeholder="Razón Social / Nombre"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={newProvider.razon_social}
                            onChangeText={t => setNewProvider({...newProvider, razon_social: t})}
                        />
                        <TextInput
                            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                            placeholder="RUT"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={newProvider.rut}
                            onChangeText={t => setNewProvider({...newProvider, rut: t})}
                        />
                        <TextInput
                            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                            placeholder="Giro comercial (Ej: Mantención de Ascensores)"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={newProvider.giro}
                            onChangeText={t => setNewProvider({...newProvider, giro: t})}
                        />
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TextInput
                                style={[styles.input, { flex: 1, color: theme.colors.text, borderColor: theme.colors.border }]}
                                placeholder="Banco"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={newProvider.banco}
                                onChangeText={t => setNewProvider({...newProvider, banco: t})}
                            />
                            <TextInput
                                style={[styles.input, { flex: 1, color: theme.colors.text, borderColor: theme.colors.border }]}
                                placeholder="N° Cuenta"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={newProvider.numero_cuenta}
                                onChangeText={t => setNewProvider({...newProvider, numero_cuenta: t})}
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={{ color: theme.colors.textSecondary }}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]} onPress={handleCreateProvider}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Guardar Proveedor</Text>
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
    providerName: { fontSize: 18, fontWeight: 'bold' },
    providerRut: { fontSize: 14, marginTop: 4 },
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

export default ProvidersScreen;
