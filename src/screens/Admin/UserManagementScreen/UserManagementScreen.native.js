import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    ActivityIndicator,
    Platform,
    RefreshControl,
    Modal,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, LoadingSpinner, ConfirmModal } from '../../../components';
import { useUserManagementScreen } from './useUserManagementScreen';
import { authService } from '../../../services/authService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
                <View style={styles.condoInfo}>
                    <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(148, 163, 184, 0.1)' : '#F8FAFC' }]}>
                        <MaterialCommunityIcons
                            name={condo.tipo === 'casa' ? 'home-city' : 'office-building'}
                            size={24}
                            color={theme.colors.textSecondary}
                        />
                    </View>
                    <View>
                        <Text style={[styles.condoName, { color: theme.colors.text }]}>{condo.nombre}</Text>
                        <Text style={[styles.userCount, { color: theme.colors.textSecondary }]}>{condo.userCount} usuarios registrados</Text>
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

export default function UserManagementScreenNative({ navigation }) {
    const logic = useUserManagementScreen(navigation);
    const { theme, isDark } = logic;

    if (logic.loading && !logic.refreshing) return <LoadingSpinner />;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.colors.inputBackground }]}>
                        <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Gestión de Usuarios</Text>
                    <View style={{ width: 28 }} />
                </View>

                <View style={styles.searchContainer}>
                    <View style={[styles.searchInputWrapper, { backgroundColor: theme.colors.inputBackground }]}>
                        <MaterialCommunityIcons name="magnify" size={22} color={theme.colors.textSecondary} style={styles.searchIcon} />
                        <TextInput
                            style={[styles.searchInput, { color: theme.colors.text }]}
                            placeholder="Buscar comunidades..."
                            value={logic.searchQuery}
                            onChangeText={logic.handleSearch}
                            placeholderTextColor={theme.colors.placeholder}
                        />
                    </View>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={logic.refreshing} onRefresh={logic.handleRefresh} />}
            >
                {/* Sección de Usuarios sin Condominio */}
                {logic.unassignedUsers.length > 0 && (
                    <View style={[styles.accordionContainer, styles.unassignedBorder, { backgroundColor: theme.colors.card, borderColor: isDark ? '#B91C1C' : '#FEE2E2' }]}>
                        <TouchableOpacity
                            style={styles.accordionHeader}
                            onPress={() => logic.setUnassignedExpanded(!logic.unassignedExpanded)}
                        >
                            <View style={styles.condoInfo}>
                                <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2' }]}>
                                    <MaterialCommunityIcons name="account-alert" size={24} color="#EF4444" />
                                </View>
                                <View>
                                    <Text style={[styles.condoName, { color: '#EF4444' }]}>Usuarios Pendientes</Text>
                                    <Text style={[styles.userCount, { color: theme.colors.textSecondary }]}>{logic.unassignedUsers.length} sin condominio</Text>
                                </View>
                            </View>
                            <MaterialCommunityIcons
                                name={logic.unassignedExpanded ? "chevron-up" : "chevron-down"}
                                size={24}
                                color="#EF4444"
                            />
                        </TouchableOpacity>

                        {logic.unassignedExpanded && (
                            <View style={[styles.usersList, { borderTopColor: theme.colors.border }]}>
                                {logic.unassignedUsers.map(user => (
                                    <TouchableOpacity
                                        key={user.id}
                                        style={styles.userItem}
                                        onPress={() => {
                                            logic.setSelectedUser(user);
                                            logic.setNewCondoId(null);
                                        }}
                                    >
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

                {logic.filteredCommunities.map(condo => (
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

            <Modal visible={!!logic.selectedUser} transparent animationType="slide">
                <TouchableOpacity style={styles.modalOverlay} onPress={() => logic.setSelectedUser(null)}>
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
                                    style={[
                                        styles.condoOption,
                                        { backgroundColor: theme.colors.background },
                                        logic.newCondoId === condo.id && { borderColor: theme.colors.primary, borderWidth: 2 }
                                    ]}
                                    onPress={() => logic.setNewCondoId(condo.id)}
                                >
                                    <Text style={{ color: theme.colors.text }}>{condo.nombre}</Text>
                                    {logic.newCondoId === condo.id && <MaterialCommunityIcons name="check" size={20} color={theme.colors.primary} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.actionsContainer}>
                            <TouchableOpacity
                                style={[styles.deleteBtn, { borderColor: '#EF4444' }]}
                                onPress={logic.handleDeleteUser}
                            >
                                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                                <Text style={styles.deleteBtnText}>Eliminar Usuario</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: theme.colors.primary, flex: 1 }]}
                                onPress={logic.handleUpdateUserCommunity}
                            >
                                <Text style={styles.confirmBtnText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { borderBottomWidth: 1 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, height: 56 },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    searchContainer: { paddingHorizontal: 16, paddingBottom: 16 },
    searchInputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 12, height: 48 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 15, fontWeight: '500' },
    scrollContent: { padding: 16 },
    accordionContainer: { borderRadius: 24, marginBottom: 16, overflow: 'hidden', borderWidth: 1 },
    accordionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
    condoInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    condoName: { fontSize: 16, fontWeight: 'bold' },
    userCount: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    unassignedBorder: { borderWidth: 2 },
    usersList: { paddingHorizontal: 8, paddingBottom: 8, borderTopWidth: 1 },
    userItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, gap: 12 },
    userInfo: { flex: 1 },
    userName: { fontSize: 14, fontWeight: '700' },
    userUnit: { fontSize: 12, fontWeight: '600' },
    emptyText: { textAlign: 'center', padding: 20, fontSize: 14, fontStyle: 'italic' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    bottomSheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%' },
    sheetHandle: { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    sheetTitle: { fontSize: 20, fontWeight: 'bold' },
    condoPickerList: { marginBottom: 24 },
    condoOption: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderRadius: 12, marginBottom: 8 },
    confirmBtn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    actionsContainer: { flexDirection: 'row', gap: 12, marginTop: 12 },
    deleteBtn: {
        height: 56,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    deleteBtnText: { color: '#EF4444', fontSize: 14, fontWeight: 'bold' },
});
