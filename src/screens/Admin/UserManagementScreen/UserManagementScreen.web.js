import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, LoadingSpinner, ResponsiveContainer } from '../../../components';
import { useUserManagementScreen } from './useUserManagementScreen';
import { authService } from '../../../services/authService';

const WebCondoCard = ({ condo, onUserSelect, theme, isDark }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const loadUsers = async () => {
        if (users.length > 0) return;
        setLoading(true);
        const { data, error } = await authService.getCommunityUsers(condo.id);
        if (!error) setUsers(data || []);
        setLoading(false);
    };

    return (
        <View style={[styles.webCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <TouchableOpacity
                style={styles.webCardHeader}
                onPress={() => {
                    setExpanded(!expanded);
                    if (!expanded) loadUsers();
                }}
            >
                <View style={[styles.webIconBox, { backgroundColor: theme.colors.primary + '10' }]}>
                    <MaterialCommunityIcons name="office-building" size={24} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.webCondoName, { color: theme.colors.text }]}>{condo.nombre}</Text>
                    <Text style={[styles.webCondoMeta, { color: theme.colors.textSecondary }]}>{condo.userCount} Residentes</Text>
                </View>
                <MaterialCommunityIcons name={expanded ? "chevron-up" : "chevron-down"} size={24} color={theme.colors.border} />
            </TouchableOpacity>

            {expanded && (
                <View style={[styles.webUsersList, { borderTopColor: theme.colors.border }]}>
                    {loading ? (
                        <ActivityIndicator style={{ margin: 20 }} color={theme.colors.primary} />
                    ) : (
                        users.map(user => (
                            <View key={user.id} style={styles.webUserRow}>
                                <Avatar uri={user.foto_url} size="sm" />
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={[styles.webUserName, { color: theme.colors.text }]}>{user.nombre}</Text>
                                    <Text style={[styles.webUserEmail, { color: theme.colors.textSecondary }]}>{user.email}</Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.webMoveBtn, { backgroundColor: theme.colors.inputBackground }]}
                                    onPress={() => onUserSelect(user)}
                                >
                                    <Text style={[styles.webMoveBtnText, { color: theme.colors.text }]}>Mover</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </View>
            )}
        </View>
    );
};

export default function UserManagementScreenWeb({ navigation }) {
    const logic = useUserManagementScreen(navigation);
    const { theme, isDark } = logic;

    if (logic.loading && !logic.refreshing) return <LoadingSpinner />;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.webHeader}>
                        <View>
                            <Text style={[styles.webTitle, { color: theme.colors.text }]}>Gestión de Residentes</Text>
                            <Text style={[styles.webSubtitle, { color: theme.colors.textSecondary }]}>Asigna y mueve usuarios entre las diferentes comunidades</Text>
                        </View>
                        <TextInput
                            style={[styles.webSearch, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
                            placeholder="Buscar condominio..."
                            value={logic.searchQuery}
                            onChangeText={logic.handleSearch}
                            placeholderTextColor={theme.colors.placeholder}
                        />
                    </View>

                    {/* Unassigned Section */}
                    {logic.unassignedUsers.length > 0 && (
                        <View style={[styles.unassignedBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.05)' : '#FEF2F2', borderColor: '#FCA5A5' }]}>
                            <View style={styles.unassignedHeader}>
                                <MaterialCommunityIcons name="account-alert" size={32} color="#EF4444" />
                                <Text style={styles.unassignedTitle}>Pendientes de Asignación ({logic.unassignedUsers.length})</Text>
                            </View>
                            <View style={styles.unassignedGrid}>
                                {logic.unassignedUsers.map(user => (
                                    <View key={user.id} style={[styles.unassignedCard, { backgroundColor: theme.colors.card }]}>
                                        <Avatar uri={user.foto_url} size="md" />
                                        <Text style={[styles.unassignedName, { color: theme.colors.text }]}>{user.nombre}</Text>
                                        <TouchableOpacity
                                            style={[styles.assignBtn, { backgroundColor: theme.colors.primary }]}
                                            onPress={() => {
                                                logic.setSelectedUser(user);
                                                logic.setNewCondoId(null);
                                            }}
                                        >
                                            <Text style={styles.assignBtnText}>Asignar</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    <View style={styles.webGrid}>
                        {logic.filteredCommunities.map(condo => (
                            <WebCondoCard
                                key={condo.id}
                                condo={condo}
                                theme={theme}
                                isDark={isDark}
                                onUserSelect={(user) => {
                                    logic.setSelectedUser(user);
                                    logic.setNewCondoId(condo.id);
                                }}
                            />
                        ))}
                    </View>
                </ScrollView>
            </ResponsiveContainer>

            {/* Selection Modal */}
            <Modal visible={!!logic.selectedUser} transparent animationType="fade">
                <View style={styles.modalOverlayWeb}>
                    <View style={[styles.modalContentWeb, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.modalTitleWeb, { color: theme.colors.text }]}>Mover a {logic.selectedUser?.nombre}</Text>
                        <Text style={{ color: theme.colors.textSecondary, marginBottom: 24 }}>Selecciona el nuevo destino:</Text>

                        <ScrollView style={{ maxHeight: 400 }}>
                            {logic.communities.map(condo => (
                                <TouchableOpacity
                                    key={condo.id}
                                    style={[styles.webOption, logic.newCondoId === condo.id && { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary }]}
                                    onPress={() => logic.setNewCondoId(condo.id)}
                                >
                                    <Text style={{ color: logic.newCondoId === condo.id ? theme.colors.primary : theme.colors.text, fontWeight: 'bold' }}>{condo.nombre}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.modalActionsWeb}>
                            <TouchableOpacity style={styles.webCancelBtn} onPress={() => logic.setSelectedUser(null)}>
                                <Text style={{ color: theme.colors.textSecondary }}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.webConfirmBtn, { backgroundColor: theme.colors.primary }]}
                                onPress={logic.handleUpdateUserCommunity}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Guardar Cambios</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 60 },
    webHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 },
    webTitle: { fontSize: 42, fontWeight: '900' },
    webSubtitle: { fontSize: 18, marginTop: 8 },
    webSearch: { width: 400, height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 20, fontSize: 16 },
    unassignedBox: { padding: 32, borderRadius: 24, borderWidth: 1, marginBottom: 48 },
    unassignedHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
    unassignedTitle: { fontSize: 24, fontWeight: '900', color: '#EF4444' },
    unassignedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    unassignedCard: { width: 180, padding: 20, borderRadius: 20, alignItems: 'center', gap: 12, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    unassignedName: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
    assignBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
    assignBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    webGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
    webCard: { width: 'calc(50% - 12px)', borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
    webCardHeader: { flexDirection: 'row', alignItems: 'center', padding: 24, gap: 16 },
    webIconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    webCondoName: { fontSize: 18, fontWeight: 'bold' },
    webCondoMeta: { fontSize: 14 },
    webUsersList: { borderTopWidth: 1, padding: 16 },
    webUserRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12 },
    webUserName: { fontSize: 14, fontWeight: '700' },
    webUserEmail: { fontSize: 12 },
    webMoveBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
    webMoveBtnText: { fontSize: 12, fontWeight: 'bold' },
    modalOverlayWeb: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalContentWeb: { width: 450, padding: 40, borderRadius: 32 },
    modalTitleWeb: { fontSize: 24, fontWeight: '900', marginBottom: 8 },
    webOption: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'transparent', marginBottom: 8 },
    modalActionsWeb: { flexDirection: 'row', gap: 16, marginTop: 32 },
    webCancelBtn: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center' },
    webConfirmBtn: { flex: 2, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
});
