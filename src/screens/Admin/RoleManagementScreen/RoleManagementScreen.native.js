import React from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// BlurView removido de aquí
import { useRoleManagementScreen } from './useRoleManagementScreen';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { Avatar, SuccessModal, ConfirmModal } from '../../../components';

const RoleManagementScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const {
        users,
        loading,
        refreshing,
        onRefresh,
        searchQuery,
        handleSearch,
        selectedUser,
        setSelectedUser,
        isModalVisible,
        setIsModalVisible,
        handleUpdateRole,
        alertState,
        hideAlert,
        successState,
        hideSuccess
    } = useRoleManagementScreen();

    const { profile } = useAuth();
    const isSuperAdmin = profile?.role === 'admin' && profile?.email === 'jaraneda1596@gmail.com';
    const rolesAvailable = isSuperAdmin
        ? ['vecino', 'conserje', 'admin', 'mayordomo', 'comite']
        : ['vecino', 'conserje', 'comite'];

    const renderUser = ({ item }) => (
        <TouchableOpacity
            style={[styles.userCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => {
                setSelectedUser(item);
                setIsModalVisible(true);
            }}
        >
            <Avatar uri={item.foto_url} size="md" />
            <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: theme.colors.text }]}>{item.nombre}</Text>
                <Text style={[styles.userDetails, { color: theme.colors.textSecondary }]}>
                    {item.depto ? `Depto ${item.depto}` : 'Sin depto'} • {item.role}
                </Text>
            </View>
            <View style={[styles.roleBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.roleText, { color: theme.colors.primary }]}>{item.role.toUpperCase()}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>Gestión de Roles</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.colors.inputBackground }]}>
                    <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.colors.text }]}
                        placeholder="Buscar por nombre o depto..."
                        placeholderTextColor={theme.colors.placeholder}
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>
            </View>

            {loading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id}
                    renderItem={renderUser}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <MaterialCommunityIcons name="account-search-outline" size={64} color={theme.colors.border} />
                            <Text style={{ color: theme.colors.textSecondary, marginTop: 16 }}>No se encontraron residentes</Text>
                        </View>
                    }
                />
            )}

            {/* Modal de Selección de Rol */}
            <Modal visible={isModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Asignar Rol a {selectedUser?.nombre}</Text>
                        <View style={styles.rolesGrid}>
                            {rolesAvailable.map((role) => (
                                <TouchableOpacity
                                    key={role}
                                    style={[
                                        styles.roleOption,
                                        {
                                            backgroundColor: selectedUser?.role === role ? theme.colors.primary : (isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
                                            borderColor: theme.colors.border
                                        }
                                    ]}
                                    onPress={() => handleUpdateRole(selectedUser.id, role)}
                                >
                                    <Text style={[
                                        styles.roleOptionText,
                                        { color: selectedUser?.role === role ? '#fff' : theme.colors.text }
                                    ]}>
                                        {role.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => setIsModalVisible(false)}
                        >
                            <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <SuccessModal
                visible={successState.visible}
                onClose={hideSuccess}
                message={successState.message}
            />

            <ConfirmModal
                visible={alertState.visible}
                onClose={hideAlert}
                onConfirm={hideAlert}
                title={alertState.title}
                message={alertState.message}
                confirmText="Entendido"
                type={alertState.type}
                showCancel={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    title: { fontSize: 20, fontWeight: 'bold' },
    searchContainer: { padding: 16 },
    searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 48, borderRadius: 12 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
    list: { padding: 16 },
    userCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1 },
    userInfo: { flex: 1, marginLeft: 12 },
    userName: { fontSize: 16, fontWeight: 'bold' },
    userDetails: { fontSize: 13, marginTop: 2 },
    roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    roleText: { fontSize: 10, fontWeight: '900' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { alignItems: 'center', marginTop: 100 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { padding: 24, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: 40 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    rolesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
    roleOption: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, minWidth: '40%', alignItems: 'center' },
    roleOptionText: { fontWeight: 'bold', fontSize: 13 },
    closeBtn: { marginTop: 24, alignSelf: 'center', padding: 12 }
});

export default RoleManagementScreen;
