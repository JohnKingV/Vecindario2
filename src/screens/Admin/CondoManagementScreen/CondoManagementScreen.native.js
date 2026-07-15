import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    RefreshControl,
    Modal,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, LoadingSpinner, Input, Button, ConfirmModal, SuccessModal } from '../../../components';
import { useCondoManagementScreen } from './useCondoManagementScreen';
import { authService } from '../../../services/authService';

// --- Local Helper: CondoAccordion (Integrated for User Management) ---
const CondoAccordion = ({ condo, onUserSelect, isExpanded, onToggle, theme, isDark, refreshKey }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isExpanded) {
            loadUsers();
        }
    }, [isExpanded, refreshKey]);

    const loadUsers = async () => {
        setLoading(true);
        const { data, error } = await authService.getCommunityUsers(condo.id);
        if (!error) {
            setUsers(data || []);
        }
        setLoading(false);
    };

    return (
        <View style={[styles.accordionContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <TouchableOpacity style={styles.accordionHeader} onPress={onToggle} activeOpacity={0.7}>
                <View style={[styles.condoItemInfo, { gap: 16 }]}>
                    <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(148, 163, 184, 0.1)' : '#F8FAFC' }]}>
                        <MaterialCommunityIcons
                            name={condo.tipo === 'casa' ? 'home-city' : 'office-building'}
                            size={24}
                            color={theme.colors.textSecondary}
                        />
                    </View>
                    <View>
                        <Text style={[styles.condoTitleText, { color: theme.colors.text }]}>{condo.nombre}</Text>
                        <Text style={[styles.userCountText, { color: theme.colors.textSecondary }]}>{condo.userCount || 0} usuarios registrados</Text>
                    </View>
                </View>
                <MaterialCommunityIcons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={24}
                    color={theme.colors.textSecondary}
                />
            </TouchableOpacity>

            {isExpanded && (
                <View style={[styles.usersList, { borderTopColor: theme.colors.border }]}>
                    {loading ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 20 }} />
                    ) : (
                        users.map(user => (
                            <TouchableOpacity
                                key={user.id}
                                style={styles.userItem}
                                onPress={() => onUserSelect(user)}
                            >
                                <Avatar uri={user.foto_url} name={user.nombre} size="md" />
                                <View style={styles.userInfo}>
                                    <Text style={[styles.userName, { color: theme.colors.text }]}>{user.nombre}</Text>
                                    <Text style={[styles.userUnit, { color: theme.colors.textSecondary }]}>Unidad {user.depto || '-'}</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.border} />
                            </TouchableOpacity>
                        ))
                    )}
                    {!loading && users.length === 0 && (
                        <Text style={styles.emptyText}>No hay usuarios en este condominio</Text>
                    )}
                </View>
            )}
        </View>
    );
};

export default function CondoManagementScreenNative({ navigation }) {
    const logic = useCondoManagementScreen(navigation);
    const { theme, isDark } = logic;

    if (logic.loading && !logic.refreshing) return <LoadingSpinner />;

    // --- Dynamic Title mapping ---
    const getTitle = () => {
        switch (logic.view) {
            case 'codes': return 'Códigos de Condominio';
            case 'users': return 'Gestión de Usuarios';
            default: return 'Administración';
        }
    };

    // --- VIEW RENDERERS ---

    const renderDashboard = () => (
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={logic.refreshing} onRefresh={logic.handleRefresh} tintColor={theme.colors.primary} />}
        >
            {/* Card 1: Nuevo Condominio */}
            <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, padding: 24, marginBottom: 24 }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Nuevo Condominio</Text>
                <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>Registra una nueva comunidad en el sistema.</Text>

                <Input label="NOMBRE DEL CONDOMINIO" placeholder="Ej: Vista Paraiso 2030" value={logic.createName} onChangeText={logic.setCreateName} containerStyle={{ marginBottom: 16 }} />
                <Input label="DIRECCIÓN" placeholder="Ej: Av. Las Condes 2030" value={logic.createAddress} onChangeText={logic.setCreateAddress} containerStyle={{ marginBottom: 16 }} />
                <Input label="CIUDAD" placeholder="Ej: Santiago" value={logic.createCity} onChangeText={logic.setCreateCity} containerStyle={{ marginBottom: 16 }} />
                <Input label="CÓDIGO DE VERIFICACIÓN" placeholder="Ej: VISTA2030" value={logic.createCode} onChangeText={logic.setCreateCode} containerStyle={{ marginBottom: 24 }} />
                <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: '#197fe6' }]}
                    onPress={logic.handleCreateCondo}
                    disabled={logic.creatingCondo}
                >
                    {logic.creatingCondo ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.primaryButtonText}>Crear Condominio</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Card 2: Mantenimiento */}
            <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, padding: 24, marginBottom: 24 }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Mantenimiento</Text>
                <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>Recupera publicaciones y productos antiguos.</Text>
                <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff' }]} onPress={logic.handleSyncData}>
                    <Text style={[styles.secondaryButtonText, { color: '#3b82f6' }]}>Sincronizar Datos Antiguos</Text>
                </TouchableOpacity>
            </View>

            {/* Card 3: Gestión de Condominios */}
            <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, padding: 24, marginBottom: 24 }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Gestión de Condominios</Text>
                <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary, marginBottom: 20 }]}>Administra usuarios y códigos.</Text>
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#197fe6', marginBottom: 16 }]} onPress={() => logic.setView('users')}>
                    <Text style={styles.primaryButtonText}>Gestionar Usuarios</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff' }]} onPress={() => logic.setView('codes')}>
                    <Text style={[styles.secondaryButtonText, { color: '#3b82f6' }]}>Códigos de Verificación</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const renderCodesView = () => (
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={logic.refreshing} onRefresh={logic.handleRefresh} tintColor={theme.colors.primary} />}
        >
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary, marginBottom: 16 }]}>CONDOMINIOS REGISTRADOS</Text>
            {logic.communities.map(condo => (
                <View key={condo.id} style={[styles.condoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <View style={styles.condoMainInfo}>
                        <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                            <MaterialCommunityIcons name="office-building" size={24} color="#1e3a8a" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.condoName, { color: theme.colors.text }]}>{condo.nombre}</Text>
                            <Text style={[styles.condoAddress, { color: theme.colors.textSecondary }]}>{condo.direccion}, {condo.ciudad}</Text>
                        </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                    <View style={styles.codeContainer}>
                        <View>
                            <Text style={[styles.codeLabel, { color: theme.colors.textSecondary }]}>CÓDIGO SECRETO</Text>
                            <Text style={[styles.codeValue, { color: '#1e3a8a' }]}>{condo.codigo_verificacion || 'SIN CÓDIGO'}</Text>
                        </View>
                        <TouchableOpacity style={[styles.editButton, { backgroundColor: '#eff6ff' }]} onPress={() => logic.openEditCodeModal(condo)}>
                            <MaterialCommunityIcons name="pencil" size={20} color="#3b82f6" />
                            <Text style={styles.editButtonText}>Editar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </ScrollView>
    );

    const renderUsersView = () => (
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={logic.refreshing} onRefresh={logic.handleRefresh} tintColor={theme.colors.primary} />}
        >
            {/* Unassigned Users Section */}
            {logic.unassignedUsers.length > 0 && (
                <View style={[styles.accordionContainer, styles.unassignedBorder, { backgroundColor: theme.colors.card, borderColor: isDark ? '#B91C1C' : '#FEE2E2' }]}>
                    <TouchableOpacity style={styles.accordionHeader} onPress={() => logic.setUnassignedExpanded(!logic.unassignedExpanded)}>
                        <View style={[styles.condoItemInfo, { gap: 16 }]}>
                            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2' }]}>
                                <MaterialCommunityIcons name="account-alert" size={24} color="#EF4444" />
                            </View>
                            <View>
                                <Text style={[styles.condoTitleText, { color: '#EF4444' }]}>Usuarios Pendientes</Text>
                                <Text style={[styles.userCountText, { color: theme.colors.textSecondary }]}>{logic.unassignedUsers.length} sin condominio</Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name={logic.unassignedExpanded ? "chevron-up" : "chevron-down"} size={24} color="#EF4444" />
                    </TouchableOpacity>

                    {logic.unassignedExpanded && (
                        <View style={[styles.usersList, { borderTopColor: theme.colors.border }]}>
                            {logic.unassignedUsers.map(user => (
                                <TouchableOpacity key={user.id} style={styles.userItem} onPress={() => { logic.setSelectedUser(user); logic.setNewCondoId(null); }}>
                                    <Avatar uri={user.foto_url} name={user.nombre} size="md" />
                                    <View style={styles.userInfo}>
                                        <Text style={[styles.userName, { color: theme.colors.text }]}>{user.nombre}</Text>
                                        <Text style={[styles.userUnit, { color: theme.colors.textSecondary }]}>{user.email}</Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            )}

            {logic.communities.map(condo => (
                <CondoAccordion
                    key={condo.id}
                    condo={condo}
                    theme={theme}
                    isDark={isDark}
                    refreshKey={logic.refreshKey}
                    isExpanded={logic.expandedCondoId === condo.id}
                    onToggle={() => logic.setExpandedCondoId(logic.expandedCondoId === condo.id ? null : condo.id)}
                    onUserSelect={(user) => {
                        logic.setSelectedUser(user);
                        logic.setNewCondoId(user.comunidad_id);
                    }}
                />
            ))}
        </ScrollView>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header with Navigation */}
            <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={logic.handleBack} style={[styles.backBtn, { backgroundColor: theme.colors.inputBackground }]}>
                        <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{getTitle()}</Text>
                </View>
            </View>

            {/* Main Content Switcher */}
            {logic.view === 'dashboard' && renderDashboard()}
            {logic.view === 'codes' && renderCodesView()}
            {logic.view === 'users' && renderUsersView()}

            {/* --- MODALS --- */}

            {/* 1. Edit Code Modal */}
            <Modal visible={!!logic.selectedCondoForCode} transparent animationType="fade" onRequestClose={() => logic.setSelectedCondoForCode(null)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Editar Código Secreto</Text>
                        <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>Cambiando código para: <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>{logic.selectedCondoForCode?.nombre}</Text></Text>
                        <Input label="Nuevo Código" placeholder="Ej: VISTA2030" value={logic.newCode} onChangeText={logic.setNewCode} autoCapitalize="characters" />
                        <View style={styles.modalFooter}>
                            <Button variant="outline" onPress={() => logic.setSelectedCondoForCode(null)} style={{ flex: 1 }}>Cancelar</Button>
                            <Button onPress={logic.handleUpdateCode} loading={logic.updatingCode} style={{ flex: 1, marginLeft: 12 }}>Guardar</Button>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* 2. Move User Sheet (Modal) */}
            <Modal visible={!!logic.selectedUser} transparent animationType="slide" onRequestClose={() => logic.setSelectedUser(null)}>
                <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => logic.setSelectedUser(null)}>
                    <View style={[styles.bottomSheet, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.sheetHandle} />
                        <View style={styles.sheetHeader}>
                            <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>Mover Usuario</Text>
                            <TouchableOpacity onPress={() => logic.setSelectedUser(null)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.condoPickerList}>
                            {logic.communities.map(condo => (
                                <TouchableOpacity
                                    key={condo.id}
                                    style={[styles.condoOption, { backgroundColor: theme.colors.background }, logic.newCondoId === condo.id && { borderColor: theme.colors.primary, borderWidth: 2 }]}
                                    onPress={() => logic.setNewCondoId(condo.id)}
                                >
                                    <View>
                                        <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{condo.nombre}</Text>
                                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{condo.ciudad}</Text>
                                    </View>
                                    {logic.newCondoId === condo.id && <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.primary} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.actionsContainer}>
                            <TouchableOpacity style={[styles.deleteBtn, { borderColor: '#EF4444' }]} onPress={logic.handleDeleteUser}>
                                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                                <Text style={styles.deleteBtnText}>Eliminar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: theme.colors.primary }]} onPress={logic.handleUpdateUserCommunity}>
                                {logic.updatingUser ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Confirmar</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* 3. Confirm Modal (Standard Component) */}
            <ConfirmModal
                visible={logic.alertState.visible}
                onClose={logic.hideAlert}
                onConfirm={logic.alertState.onConfirm || logic.hideAlert}
                title={logic.alertState.title}
                message={logic.alertState.message}
                type={logic.alertState.type}
                showCancel={logic.alertState.showCancel}
                confirmText={logic.alertState.showCancel ? "Sí, eliminar" : "Entendido"}
                cancelText="Cancelar"
            />

            {/* 4. Success Modal (App Message) */}
            <SuccessModal
                visible={logic.showSuccess}
                onClose={() => logic.setShowSuccess(false)}
                message={logic.successMessage}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { borderBottomWidth: 1 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 56 },
    backBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
    scrollContent: { padding: 16 },

    // Cards & Buttons (Screenshot style)
    card: {
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10
    },
    cardTitle: { fontSize: 18, fontWeight: '400', marginBottom: 4 },
    cardSubtitle: { fontSize: 14, marginBottom: 20, fontWeight: '300' },
    primaryButton: { height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', width: '100%', elevation: 2, shadowColor: '#197fe6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
    secondaryButton: { height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', width: '100%' },
    secondaryButtonText: { fontSize: 16, fontWeight: '500' },

    // Codes View
    sectionTitle: { fontSize: 14, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
    condoCard: { borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    condoMainInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    textContainer: { flex: 1 },
    condoName: { fontSize: 16, fontWeight: 'bold' },
    condoAddress: { fontSize: 13, fontWeight: '500', marginTop: 2 },
    divider: { height: 1, marginVertical: 12 },
    codeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    codeLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    codeValue: { fontSize: 18, fontWeight: '900', marginTop: 2 },
    editButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    editButtonText: { fontSize: 14, fontWeight: 'bold', color: '#3b82f6', marginLeft: 4 },

    // Users View (Accordion)
    accordionContainer: { borderRadius: 24, marginBottom: 16, overflow: 'hidden', borderWidth: 1 },
    accordionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
    condoItemInfo: { flexDirection: 'row', alignItems: 'center' },
    condoTitleText: { fontSize: 16, fontWeight: 'bold' },
    userCountText: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    unassignedBorder: { borderWidth: 2 },
    usersList: { paddingHorizontal: 8, paddingBottom: 8, borderTopWidth: 1 },
    userItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, gap: 12 },
    userInfo: { flex: 1 },
    userName: { fontSize: 14, fontWeight: '700' },
    userUnit: { fontSize: 12, fontWeight: '600' },
    emptyText: { textAlign: 'center', padding: 20, fontSize: 14, fontStyle: 'italic', color: '#94a3b8' },

    // Modals
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
    sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderRadius: 24, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    modalSubtitle: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
    modalFooter: { flexDirection: 'row', marginTop: 24 },

    // Bottom Sheet
    bottomSheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '85%' },
    sheetHandle: { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    sheetTitle: { fontSize: 20, fontWeight: 'bold' },
    condoPickerList: { marginBottom: 24 },
    condoOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 10 },
    actionsContainer: { flexDirection: 'row', gap: 12 },
    confirmBtn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', flex: 1 },
    confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    deleteBtn: { height: 56, paddingHorizontal: 20, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    deleteBtnText: { color: '#EF4444', fontSize: 15, fontWeight: 'bold' },
});
