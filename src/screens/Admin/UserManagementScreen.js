import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Platform,
    RefreshControl,
    Modal,
    Dimensions,
    Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '../../services/authService';
import { Avatar, LoadingSpinner } from '../../components';
import { useTheme } from '../../context/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CondoAccordion = ({ condo, onUserSelect, isExpanded, onToggle }) => {
    const { theme, isDark } = useTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isExpanded && users.length === 0) {
            loadUsers();
        }
    }, [isExpanded]);

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
            <TouchableOpacity
                style={styles.accordionHeader}
                onPress={onToggle}
                activeOpacity={0.7}
            >
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

export default function UserManagementScreen({ navigation }) {
    const { theme, isDark } = useTheme();
    const [communities, setCommunities] = useState([]);
    const [filteredCommunities, setFilteredCommunities] = useState([]);
    const [unassignedUsers, setUnassignedUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedCondoId, setExpandedCondoId] = useState(null);
    const [unassignedExpanded, setUnassignedExpanded] = useState(true);

    // State para el Bottom Sheet (Modal)
    const [selectedUser, setSelectedUser] = useState(null);
    const [newCondoId, setNewCondoId] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        console.log('[UserManagement] Loading data...');

        const [comRes, profRes] = await Promise.all([
            authService.getAllCommunitiesWithStats(),
            authService.getAllProfiles()
        ]);

        if (comRes.error || profRes.error) {
            console.error('[UserManagement] Error loading data:', { comRes, profRes });
            setLoading(false);
            return;
        }

        const allCommunities = comRes.data || [];
        const allProfiles = profRes.data || [];

        console.log('[UserManagement] Communities fetched:', allCommunities.length);
        console.log('[UserManagement] Profiles fetched:', allProfiles.length);

        // Crear un set de IDs de comunidades para búsqueda rápida
        const communityIds = new Set(allCommunities.map(c => c.id));

        // Filtrar usuarios "pendientes": los que no tienen comunidad_id 
        // O los que tienen uno que NO existe en nuestra lista de comunidades
        const pending = allProfiles.filter(user =>
            !user.comunidad_id || !communityIds.has(user.comunidad_id)
        );

        console.log('[UserManagement] Pending users found:', pending.length, pending.map(u => u.nombre));

        setCommunities(allCommunities);
        setFilteredCommunities(allCommunities);
        setUnassignedUsers(pending);
        setLoading(false);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text.trim() === '') {
            setFilteredCommunities(communities);
        } else {
            const filtered = communities.filter(c =>
                c.nombre.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredCommunities(filtered);
        }
    };

    const handleUpdateUserCommunity = async () => {
        if (!selectedUser) return;

        setUpdating(true);
        const { error } = await authService.changeUserCommunity(selectedUser.id, newCondoId);
        setUpdating(false);

        if (error) {
            Alert.alert('Error', 'No se pudo cambiar el condominio: ' + error.message);
        } else {
            Alert.alert('¡Éxito!', `Usuario ${selectedUser.nombre} movido correctamente.`);
            setSelectedUser(null);
            loadData(); // Recargar para actualizar los conteos
        }
    };

    if (loading && !refreshing) return <LoadingSpinner />;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Control por Condominios</Text>
                    <View style={{ width: 28 }} />
                </View>

                <View style={styles.searchContainer}>
                    <View style={[styles.searchInputWrapper, { backgroundColor: theme.colors.inputBackground }]}>
                        <MaterialCommunityIcons name="magnify" size={22} color={theme.colors.textSecondary} style={styles.searchIcon} />
                        <TextInput
                            style={[styles.searchInput, { color: theme.colors.text }]}
                            placeholder="Buscar condominios..."
                            value={searchQuery}
                            onChangeText={handleSearch}
                            placeholderTextColor={theme.colors.placeholder}
                        />
                    </View>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {/* Sección de Usuarios sin Condominio */}
                {unassignedUsers.length > 0 && (
                    <View style={[styles.accordionContainer, styles.unassignedBorder, { backgroundColor: theme.colors.card, borderColor: isDark ? '#B91C1C' : '#FEE2E2' }]}>
                        <TouchableOpacity
                            style={styles.accordionHeader}
                            onPress={() => setUnassignedExpanded(!unassignedExpanded)}
                        >
                            <View style={styles.condoInfo}>
                                <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2' }]}>
                                    <MaterialCommunityIcons name="account-alert" size={24} color="#EF4444" />
                                </View>
                                <View>
                                    <Text style={[styles.condoName, { color: '#EF4444' }]}>Usuarios Pendientes</Text>
                                    <Text style={[styles.userCount, { color: theme.colors.textSecondary }]}>{unassignedUsers.length} sin condominio</Text>
                                </View>
                            </View>
                            <MaterialCommunityIcons
                                name={unassignedExpanded ? "chevron-up" : "chevron-down"}
                                size={24}
                                color="#EF4444"
                            />
                        </TouchableOpacity>

                        {unassignedExpanded && (
                            <View style={[styles.usersList, { borderTopColor: theme.colors.border }]}>
                                {unassignedUsers.map(user => (
                                    <TouchableOpacity
                                        key={user.id}
                                        style={styles.userItem}
                                        onPress={() => {
                                            setSelectedUser(user);
                                            setNewCondoId(null);
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

                {filteredCommunities.map(condo => (
                    <CondoAccordion
                        key={condo.id}
                        condo={condo}
                        isExpanded={expandedCondoId === condo.id}
                        onToggle={() => setExpandedCondoId(expandedCondoId === condo.id ? null : condo.id)}
                        onUserSelect={(user) => {
                            setSelectedUser(user);
                            setNewCondoId(user.comunidad_id);
                        }}
                    />
                ))}

                <Text style={styles.footerText}>
                    Mostrando {filteredCommunities.length} condominios • {communities.reduce((acc, c) => acc + c.userCount, 0) + unassignedUsers.length} usuarios totales
                </Text>
            </ScrollView>

            {/* Change Condo Modal (Bottom Sheet Simulator) */}
            <Modal
                visible={!!selectedUser}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedUser(null)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSelectedUser(null)}
                >
                    <TouchableOpacity
                        style={[styles.bottomSheet, { backgroundColor: theme.colors.card }]}
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.sheetHandle} />

                        <View style={[styles.sheetHeader, { borderBottomColor: theme.colors.border }]}>
                            <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>Cambio de Condominio</Text>
                            <TouchableOpacity onPress={() => setSelectedUser(null)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.userSummary}>
                            <View style={styles.selectedAvatarWrapper}>
                                <Avatar uri={selectedUser?.foto_url} name={selectedUser?.nombre} size="xl" />
                                <View style={[styles.verifiedBadge, { borderColor: theme.colors.card }]}>
                                    <MaterialCommunityIcons name="check-decagram" size={14} color="#fff" />
                                </View>
                            </View>
                            <Text style={[styles.selectedUserName, { color: theme.colors.text }]}>{selectedUser?.nombre}</Text>
                            <Text style={[styles.selectedUserSince, { color: theme.colors.textSecondary }]}>Miembro desde 2024</Text>
                        </View>

                        <Text style={[styles.selectionLabel, { color: theme.colors.textSecondary }]}>SELECCIONA UN CONDOMINIO</Text>

                        <ScrollView style={styles.condoPickerList}>
                            {communities.map(condo => (
                                <TouchableOpacity
                                    key={condo.id}
                                    style={[
                                        styles.condoOption,
                                        { backgroundColor: theme.colors.background },
                                        newCondoId === condo.id && [styles.condoOptionActive, { borderColor: theme.colors.primary }]
                                    ]}
                                    onPress={() => setNewCondoId(condo.id)}
                                >
                                    <View style={[
                                        styles.optionIconBox,
                                        newCondoId === condo.id ? [styles.optionIconActive, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 58, 138, 0.1)' }] : [styles.optionIconInactive, { backgroundColor: isDark ? 'rgba(148, 163, 184, 0.1)' : '#f1f5f9' }]
                                    ]}>
                                        <MaterialCommunityIcons
                                            name={condo.tipo === 'casa' ? 'home-city' : 'office-building'}
                                            size={22}
                                            color={newCondoId === condo.id ? theme.colors.primary : theme.colors.textSecondary}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[
                                            styles.optionName,
                                            { color: theme.colors.text },
                                            newCondoId === condo.id && [styles.optionNameActive, { color: theme.colors.primary }]
                                        ]}>
                                            {condo.nombre}
                                        </Text>
                                        <Text style={[styles.optionHint, { color: theme.colors.textSecondary }]}>
                                            {selectedUser?.comunidad_id === condo.id ? 'Actual' : condo.ciudad}
                                        </Text>
                                    </View>
                                    <View style={[
                                        styles.radio,
                                        { borderColor: theme.colors.border },
                                        newCondoId === condo.id && [styles.radioActive, { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary }]
                                    ]}>
                                        {newCondoId === condo.id && <View style={styles.radioInner} />}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={[styles.sheetFooter, { borderTopColor: theme.colors.border }]}>
                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: theme.colors.primary }, updating && styles.btnDisabled]}
                                onPress={handleUpdateUserCommunity}
                                disabled={updating}
                            >
                                {updating ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Text style={styles.confirmBtnText}>Confirmar Cambio</Text>
                                        <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        height: 56,
    },
    backBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        paddingHorizontal: 12,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#0F172A',
    },
    scrollContent: {
        padding: 16,
    },
    accordionContainer: {
        backgroundColor: '#fff',
        borderRadius: 24,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 1,
    },
    accordionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    condoInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    condoName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    userCount: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        marginTop: 2,
    },
    unassignedBorder: {
        borderColor: '#FEE2E2',
        borderWidth: 2,
    },
    usersList: {
        paddingHorizontal: 8,
        paddingBottom: 8,
        borderTopWidth: 1,
        borderTopColor: '#f8fafc',
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        gap: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
    },
    userUnit: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94a3b8',
    },
    emptyText: {
        textAlign: 'center',
        padding: 20,
        color: '#94a3b8',
        fontSize: 14,
        fontStyle: 'italic',
    },
    footerText: {
        textAlign: 'center',
        fontSize: 10,
        fontWeight: 'bold',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginTop: 24,
        marginBottom: 40,
    },
    // Modal & Bottom Sheet styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: SCREEN_HEIGHT * 0.85,
        paddingTop: 12,
    },
    sheetHandle: {
        width: 48,
        height: 6,
        backgroundColor: '#e2e8f0',
        borderRadius: 3,
        alignSelf: 'center',
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    userSummary: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    selectedAvatarWrapper: {
        position: 'relative',
        marginBottom: 12,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: '#3B82F6',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    selectedUserName: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0f172a',
    },
    selectedUserSince: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
        marginTop: 4,
    },
    selectionLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: 1,
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    condoPickerList: {
        maxHeight: 250,
        paddingHorizontal: 16,
    },
    condoOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'transparent',
        backgroundColor: '#fff',
    },
    condoOptionActive: {
        borderColor: '#1E3A8A',
        backgroundColor: '#F8FAFC',
    },
    optionIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    optionIconActive: {
        backgroundColor: 'rgba(30, 58, 138, 0.1)',
    },
    optionIconInactive: {
        backgroundColor: '#f1f5f9',
    },
    optionName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    optionNameActive: {
        color: '#1E3A8A',
    },
    optionHint: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#cbd5e1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioActive: {
        borderColor: '#1E3A8A',
        backgroundColor: '#1E3A8A',
    },
    radioInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    sheetFooter: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    confirmBtn: {
        height: 60,
        backgroundColor: '#1E3A8A',
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#1E3A8A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    btnDisabled: {
        backgroundColor: '#94a3b8',
        shadowOpacity: 0,
    },
    confirmBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});
