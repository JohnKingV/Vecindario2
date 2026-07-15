import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Modal,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLogisticsHubScreen } from './useLogisticsHubScreen';
import { useTheme } from '../../../context/ThemeContext';
import { Avatar } from '../../../components';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const LogisticsHubScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const {
        encomiendas,
        loading,
        refreshing,
        onRefresh,
        isModalVisible,
        setIsModalVisible,
        residents,
        newPackage,
        setNewPackage,
        handleCreatePackage,
        handleMarkDelivered,
        handleConfirmReceipt,
        executePickup,
        selectedForPickup,
        setSelectedForPickup,
        searchQuery,
        setSearchQuery,
        userRole,
        userId
    } = useLogisticsHubScreen();

    const [pinInput, setPinInput] = useState('');
    const [selectedForDelivery, setSelectedForDelivery] = useState(null);

    const isStaff = ['conserje', 'admin', 'mayordomo'].includes(userRole);

    const renderPackage = ({ item }) => {
        const isMine = item.user_id === userId;
        const statusColor = item.estado === 'pendiente' ? '#f59e0b' : '#22c55e';
        const date = new Date(item.created_at);

        return (
            <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={styles.cardHeader}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {item.estado.toUpperCase()}
                    </Text>
                    <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
                        {format(date, "d LLL, HH:mm", { locale: es })}
                    </Text>
                </View>

                <View style={styles.packageInfo}>
                    <MaterialCommunityIcons name="package-variant-closed" size={32} color={theme.colors.primary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.desc, { color: theme.colors.text }]}>{item.descripcion}</Text>
                        <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
                            {item.empresa_transporte || 'Transporte no especificado'}
                        </Text>
                        {isStaff && (
                            <Text style={[styles.target, { color: theme.colors.text }]}>
                                Para: {item.profiles?.nombre} (Depto {item.profiles?.depto})
                            </Text>
                        )}
                    </View>
                </View>

                {item.estado === 'pendiente' && (
                    <View style={styles.cardActions}>
                        {isMine ? (
                            <View style={{ gap: 12 }}>
                                <View style={[styles.pinBox, { backgroundColor: theme.colors.primary + '10' }]}>
                                    <Text style={[styles.pinLabel, { color: theme.colors.primary }]}>PIN DE RETIRO</Text>
                                    <Text style={[styles.pinValue, { color: theme.colors.primary }]}>{item.codigo_retiro}</Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.deliverBtn, { backgroundColor: '#22c55e' }]}
                                    onPress={() => handleConfirmReceipt(item.id)}
                                >
                                    <Text style={styles.deliverBtnText}>Recoger Paquete</Text>
                                </TouchableOpacity>
                            </View>
                        ) : isStaff && (
                            <TouchableOpacity
                                style={[styles.deliverBtn, { backgroundColor: theme.colors.primary }]}
                                onPress={() => setSelectedForDelivery(item)}
                            >
                                <Text style={styles.deliverBtnText}>Entregar Paquete</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>Encomiendas</Text>
                {isStaff && (
                    <TouchableOpacity onPress={() => setIsModalVisible(true)} style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}>
                        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.colors.text }]}
                        placeholder="Buscar por empresa, fecha o descripción..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <MaterialCommunityIcons name="close-circle" size={18} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={isStaff ? encomiendas : encomiendas.filter(e => e.user_id === userId)}
                renderItem={renderPackage}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <MaterialCommunityIcons name="package-variant" size={80} color={theme.colors.border} />
                        <Text style={{ color: theme.colors.textSecondary, marginTop: 16 }}>No hay paquetes pendientes</Text>
                    </View>
                }
            />

            {/* Modal Recepción Conserje */}
            <Modal visible={isModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Recibir Paquete</Text>

                        <ScrollView>
                            <Text style={styles.label}>SELECCIONAR RESIDENTE</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.residentPicker}>
                                {residents.map(r => (
                                    <TouchableOpacity
                                        key={r.id}
                                        style={[
                                            styles.residentCard,
                                            { borderColor: newPackage.residente_id === r.id ? theme.colors.primary : theme.colors.border },
                                            newPackage.residente_id === r.id && { backgroundColor: theme.colors.primary + '10' }
                                        ]}
                                        onPress={() => setNewPackage({ ...newPackage, residente_id: r.id, depto_destino: r.depto })}
                                    >
                                        <Avatar uri={r.foto_url} name={r.nombre} size="sm" />
                                        <Text style={{ fontSize: 10, marginTop: 4 }}>{r.nombre.split(' ')[0]}</Text>
                                        <Text style={{ fontSize: 9, fontWeight: 'bold' }}>DPTO {r.depto}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.label}>EMPRESA / COURIER</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
                                placeholder="Ej: BlueExpress, Mercado Libre..."
                                value={newPackage.empresa_transporte}
                                onChangeText={t => setNewPackage({ ...newPackage, empresa_transporte: t })}
                            />

                            <Text style={styles.label}>DESCRIPCIÓN DEL PAQUETE</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text, height: 80 }]}
                                placeholder="Caja grande, sobre amarillo, etc..."
                                multiline
                                value={newPackage.descripcion}
                                onChangeText={t => setNewPackage({ ...newPackage, descripcion: t })}
                            />

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsModalVisible(false)}>
                                    <Text style={{ color: theme.colors.textSecondary }}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: theme.colors.primary }]} onPress={handleCreatePackage}>
                                    <Text style={styles.confirmBtnText}>Registrar Recepción</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Modal Verificación PIN Entrega */}
            <Modal visible={!!selectedForDelivery} transparent animationType="fade">
                <View style={styles.pinModalOverlay}>
                    <View style={[styles.pinModalContent, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.pinModalTitle, { color: theme.colors.text }]}>Verificar PIN de Retiro</Text>
                        <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 20 }}>
                            Solicita el código de 6 dígitos al residente para entregar el paquete.
                        </Text>
                        <TextInput
                            style={[styles.pinInput, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
                            placeholder="000000"
                            keyboardType="number-pad"
                            maxLength={6}
                            value={pinInput}
                            onChangeText={setPinInput}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setSelectedForDelivery(null); setPinInput(''); }}>
                                <Text style={{ color: theme.colors.text }}>Cerrar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: '#22c55e' }]}
                                onPress={async () => {
                                    const success = await handleMarkDelivered(selectedForDelivery.id, pinInput);
                                    if (success) {
                                        setSelectedForDelivery(null);
                                        setPinInput('');
                                    }
                                }}
                            >
                                <Text style={styles.confirmBtnText}>Validar PIN</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={{ marginTop: 20, padding: 10 }}
                            onPress={async () => {
                                Alert.alert(
                                    'Entrega Manual',
                                    '¿Estás seguro de entregar sin PIN? Úsalo solo si verificaste la identidad.',
                                    [
                                        { text: 'Cancelar', style: 'cancel' },
                                        {
                                            text: 'Entregar',
                                            onPress: async () => {
                                                const success = await handleMarkDelivered(selectedForDelivery.id, null, true);
                                                if (success) {
                                                    setSelectedForDelivery(null);
                                                    setPinInput('');
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                        >
                            <Text style={{ textAlign: 'center', color: theme.colors.textSecondary, textDecorationLine: 'underline' }}>
                                Entregar sin PIN (Manual)
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {/* Modal Confirmación Retiro (Residente) */}
            <Modal visible={!!selectedForPickup} transparent animationType="fade">
                <View style={styles.pinModalOverlay}>
                    <View style={[styles.pinModalContent, { backgroundColor: theme.colors.card }]}>
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#22c55e20', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                                <MaterialCommunityIcons name="check-circle-outline" size={32} color="#22c55e" />
                            </View>
                            <Text style={[styles.pinModalTitle, { color: theme.colors.text }]}>Confirmar Retiro</Text>
                            <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
                                ¿Confirmas que tienes el paquete en tus manos?
                            </Text>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setSelectedForPickup(null)}
                            >
                                <Text style={{ color: theme.colors.text }}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: '#22c55e' }]}
                                onPress={executePickup}
                            >
                                <Text style={styles.confirmBtnText}>Sí, lo tengo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
    title: { fontSize: 24, fontWeight: '900' },
    addBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 'auto' },
    searchContainer: { paddingHorizontal: 20, paddingBottom: 10 },
    searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 44, borderRadius: 12, borderWidth: 1 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14, fontWeight: '500' },
    list: { padding: 20, paddingTop: 10 },
    card: { padding: 20, borderRadius: 24, marginBottom: 16, borderWidth: 1 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    statusText: { fontSize: 12, fontWeight: '900', flex: 1 },
    dateText: { fontSize: 11 },
    packageInfo: { flexDirection: 'row', alignItems: 'center' },
    desc: { fontSize: 16, fontWeight: 'bold' },
    meta: { fontSize: 13, marginTop: 2 },
    target: { fontSize: 12, marginTop: 8, fontWeight: '600' },
    cardActions: { marginTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 16 },
    pinBox: { padding: 12, borderRadius: 12, alignItems: 'center' },
    pinLabel: { fontSize: 10, fontWeight: '900' },
    pinValue: { fontSize: 24, fontWeight: '900', letterSpacing: 4 },
    deliverBtn: { height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    deliverBtnText: { color: '#fff', fontWeight: 'bold' },
    empty: { alignItems: 'center', marginTop: 100 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { padding: 24, borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '80%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    label: { fontSize: 10, fontWeight: '900', color: '#666', marginBottom: 8, marginTop: 16 },
    residentPicker: { flexDirection: 'row', paddingVertical: 10 },
    residentCard: { width: 80, padding: 12, borderRadius: 16, borderWidth: 1, alignItems: 'center', marginRight: 10 },
    input: { padding: 12, borderRadius: 12, fontSize: 16 },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
    cancelBtn: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center' },
    confirmBtn: { flex: 2, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    confirmBtnText: { color: '#fff', fontWeight: 'bold' },
    pinModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    pinModalContent: { width: '100%', padding: 32, borderRadius: 24 },
    pinModalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
    pinInput: { height: 64, borderRadius: 16, textAlign: 'center', fontSize: 32, fontWeight: '900', letterSpacing: 8, marginVertical: 20 }
});

export default LogisticsHubScreen;
