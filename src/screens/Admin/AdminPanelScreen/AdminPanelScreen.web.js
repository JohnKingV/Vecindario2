import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Input, Button, ResponsiveContainer } from '../../../components';
import { useAdminPanelScreen } from './useAdminPanelScreen';

export default function AdminPanelScreenWeb({ navigation }) {
    const logic = useAdminPanelScreen(navigation);
    const { theme, isDark } = logic;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Web Header */}
                    <View style={styles.webHeader}>
                        <View>
                            <Text style={[styles.title, { color: theme.colors.text }]}>Panel de Administración</Text>
                            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Gestiona comunidades, usuarios y mantenimiento del sistema</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { borderColor: theme.colors.border }]}>
                            <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.text} />
                            <Text style={[styles.backText, { color: theme.colors.text }]}>Volver al Dashboard</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.mainGrid}>
                        {/* Left: Create Community Form */}
                        <View style={styles.formColumn}>
                            <View style={[styles.webCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                <View style={styles.cardHeader}>
                                    <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '15' }]}>
                                        <MaterialCommunityIcons name="office-building-plus" size={32} color={theme.colors.primary} />
                                    </View>
                                    <View>
                                        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Crear Nueva Comunidad</Text>
                                        <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>Añade un nuevo condominio a la red</Text>
                                    </View>
                                </View>

                                <View style={styles.webForm}>
                                    <View style={styles.formPair}>
                                        <Input
                                            label="Nombre Comercial"
                                            placeholder="Ej: Vista Paraiso 2030"
                                            value={logic.nombre}
                                            onChangeText={logic.setNombre}
                                            containerStyle={styles.flexInput}
                                        />
                                        <Input
                                            label="Código Único"
                                            placeholder="Ej: VISTA2030"
                                            value={logic.codigo}
                                            onChangeText={logic.setCodigo}
                                            autoCapitalize="characters"
                                            containerStyle={styles.flexInput}
                                        />
                                    </View>
                                    <Input
                                        label="Dirección Completa"
                                        placeholder="Ej: Av. Las Condes 2030, Oficina 402"
                                        value={logic.direccion}
                                        onChangeText={logic.setDireccion}
                                    />
                                    <Input
                                        label="Ciudad / Comuna"
                                        placeholder="Ej: Santiago"
                                        value={logic.ciudad}
                                        onChangeText={logic.setCiudad}
                                    />

                                    <Button
                                        onPress={logic.handleCreateCommunity}
                                        loading={logic.loading}
                                        size="lg"
                                        style={styles.submitBtnWeb}
                                    >
                                        Registrar Comunidad
                                    </Button>
                                </View>
                            </View>
                        </View>

                        {/* Right: Quick Actions & Stats */}
                        <View style={styles.actionsColumn}>
                            <View style={[styles.webCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                <Text style={[styles.sectionTitleWeb, { color: theme.colors.text }]}>Acciones Rápidas</Text>
                                <View style={styles.actionsGridWeb}>
                                    <TouchableOpacity
                                        style={[styles.actionSquare, { backgroundColor: theme.colors.primary + '08' }]}
                                        onPress={() => navigation.navigate('UserManagement')}
                                    >
                                        <MaterialCommunityIcons name="account-group" size={32} color={theme.colors.primary} />
                                        <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Usuarios</Text>
                                        {logic.pendingCount > 0 && (
                                            <View style={styles.badgeWeb}>
                                                <Text style={styles.badgeTextWeb}>{logic.pendingCount}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionSquare, { backgroundColor: '#f0fdf4' }]}
                                        onPress={() => navigation.navigate('CondoManagement')}
                                    >
                                        <MaterialCommunityIcons name="key" size={32} color="#16a34a" />
                                        <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Códigos</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={[styles.maintenanceBox, { backgroundColor: theme.colors.inputBackground }]}>
                                    <View style={styles.maintenanceHeader}>
                                        <MaterialCommunityIcons name="database-sync-outline" size={24} color={theme.colors.text} />
                                        <Text style={[styles.maintenanceTitle, { color: theme.colors.text }]}>Mantenimiento Masivo</Text>
                                    </View>
                                    <Text style={[styles.maintenanceDesc, { color: theme.colors.textSecondary }]}>
                                        Sincroniza contenidos huérfanos con el condominio activo del administrador.
                                    </Text>
                                    <Button
                                        variant="secondary"
                                        onPress={logic.handleSyncData}
                                        loading={logic.syncLoading}
                                        style={styles.syncBtnWeb}
                                    >
                                        Ejecutar Sincronización
                                    </Button>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </ResponsiveContainer>

            <Modal
                visible={logic.showSuccess}
                transparent
                animationType="fade"
                onRequestClose={() => logic.setShowSuccess(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.successModal, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.successIconBox}>
                            <MaterialCommunityIcons name="check-bold" size={40} color="#fff" />
                        </View>
                        <Text style={[styles.successTitle, { color: theme.colors.text }]}>Operación Exitosa</Text>
                        <Text style={[styles.successMessage, { color: theme.colors.textSecondary }]}>
                            La comunidad ha sido creada y está lista para recibir residentes.
                        </Text>
                        <Button
                            onPress={() => logic.setShowSuccess(false)}
                            size="lg"
                            style={{ width: '100%' }}
                        >
                            Listo
                        </Button>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    webHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 48,
    },
    title: {
        fontSize: 42,
        fontWeight: '900',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 18,
        marginTop: 8,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
    },
    backText: {
        fontWeight: '700',
        fontSize: 14,
    },
    mainGrid: {
        flexDirection: 'row',
        gap: 32,
    },
    formColumn: {
        flex: 2,
    },
    actionsColumn: {
        flex: 1,
    },
    webCard: {
        padding: 40,
        borderRadius: 32,
        borderWidth: 1,
        boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 40,
    },
    iconBox: {
        width: 64,
        height: 64,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: '900',
    },
    cardSubtitle: {
        fontSize: 15,
        marginTop: 4,
    },
    webForm: {
        gap: 24,
    },
    formPair: {
        flexDirection: 'row',
        gap: 24,
    },
    flexInput: {
        flex: 1,
    },
    submitBtnWeb: {
        marginTop: 16,
        height: 60,
        borderRadius: 16,
    },
    sectionTitleWeb: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 24,
    },
    actionsGridWeb: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    actionSquare: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        position: 'relative',
    },
    actionLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    badgeWeb: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#ef4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    badgeTextWeb: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '900',
    },
    maintenanceBox: {
        padding: 24,
        borderRadius: 20,
        gap: 16,
    },
    maintenanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    maintenanceTitle: {
        fontSize: 15,
        fontWeight: '800',
    },
    maintenanceDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    syncBtnWeb: {
        height: 48,
        borderRadius: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    successModal: {
        padding: 48,
        borderRadius: 40,
        width: '100%',
        maxWidth: 440,
        alignItems: 'center',
    },
    successIconBox: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 16,
    },
    successMessage: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    }
});
