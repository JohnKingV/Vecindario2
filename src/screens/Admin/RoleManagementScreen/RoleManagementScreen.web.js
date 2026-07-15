import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    useWindowDimensions,
    Modal
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoleManagementScreen } from './useRoleManagementScreen';
import { useTheme } from '../../../context/ThemeContext';
import { Avatar, ResponsiveContainer } from '../../../components';

const RoleManagementScreen = () => {
    const { theme, isDark } = useTheme();
    const { width } = useWindowDimensions();
    const {
        users,
        loading,
        searchQuery,
        handleSearch,
        selectedUser,
        setSelectedUser,
        isModalVisible,
        setIsModalVisible,
        handleUpdateRole,
    } = useRoleManagementScreen();

    const columnCount = width > 1200 ? 3 : width > 800 ? 2 : 1;
    const rolesAvailable = ['vecino', 'conserje', 'admin', 'mayordomo', 'comite'];

    const renderUser = ({ item }) => (
        <View style={[styles.webUserCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.webUserHeader}>
                <Avatar uri={item.foto_url} size="md" />
                <View style={{ marginLeft: 16, flex: 1 }}>
                    <Text style={[styles.webUserName, { color: theme.colors.text }]}>{item.nombre}</Text>
                    <Text style={[styles.webUserEmail, { color: theme.colors.textSecondary }]}>{item.email}</Text>
                </View>
                <View style={[styles.webRoleBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Text style={{ color: theme.colors.primary, fontSize: 10, fontWeight: '800' }}>{item.role.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.webCardFooter}>
                <Text style={[styles.webUserDepto, { color: theme.colors.textSecondary }]}>
                    {item.depto ? `Departamento ${item.depto}` : 'Sin unidad asignada'}
                </Text>
                <TouchableOpacity
                    style={[styles.webActionBtn, { backgroundColor: theme.colors.primary }]}
                    onPress={() => {
                        setSelectedUser(item);
                        setIsModalVisible(true);
                    }}
                >
                    <Text style={styles.webActionBtnText}>Cambiar Rol</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.title, { color: theme.colors.text }]}>Gestión de Roles</Text>
                            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                                Administra los permisos de acceso para el personal y residentes de la comunidad.
                            </Text>
                        </View>
                        <TextInput
                            style={[styles.webSearch, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
                            placeholder="Buscar residente..."
                            placeholderTextColor={theme.colors.placeholder}
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />
                    </View>

                    {loading ? (
                        <ActivityIndicator style={{ marginTop: 100 }} size="large" color={theme.colors.primary} />
                    ) : (
                        <FlatList
                            data={users}
                            keyExtractor={item => item.id}
                            renderItem={renderUser}
                            numColumns={columnCount}
                            key={columnCount}
                            contentContainerStyle={styles.list}
                            columnWrapperStyle={columnCount > 1 ? styles.row : null}
                        />
                    )}
                </View>
            </ResponsiveContainer>

            {/* Web Modal */}
            <Modal visible={isModalVisible} transparent animationType="fade">
                <View style={styles.webModalOverlay}>
                    <View style={[styles.webModalContent, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.webModalTitle, { color: theme.colors.text }]}>Asignar nuevo rol</Text>
                        <Text style={{ color: theme.colors.textSecondary, marginBottom: 24 }}>
                            Selecciona las responsabilidades para **{selectedUser?.nombre}**:
                        </Text>

                        <View style={styles.webRolesList}>
                            {rolesAvailable.map(role => (
                                <TouchableOpacity
                                    key={role}
                                    style={[
                                        styles.webRoleOption,
                                        {
                                            borderColor: selectedUser?.role === role ? theme.colors.primary : theme.colors.border,
                                            backgroundColor: selectedUser?.role === role ? theme.colors.primary + '10' : 'transparent'
                                        }
                                    ]}
                                    onPress={() => handleUpdateRole(selectedUser.id, role)}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.webRoleOptionName, { color: selectedUser?.role === role ? theme.colors.primary : theme.colors.text }]}>
                                            {role.toUpperCase()}
                                        </Text>
                                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                                            {role === 'admin' ? 'Control total' : role === 'conserje' ? 'Acceso a seguridad' : 'Residente estándar'}
                                        </Text>
                                    </View>
                                    {selectedUser?.role === role && (
                                        <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.webCloseBtn} onPress={() => setIsModalVisible(false)}>
                            <Text style={{ color: theme.colors.textSecondary }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingVertical: 60, paddingHorizontal: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 },
    title: { fontSize: 42, fontWeight: '900' },
    subtitle: { fontSize: 18, marginTop: 12 },
    webSearch: { width: 400, height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 20 },
    list: { paddingBottom: 100 },
    row: { justifyContent: 'flex-start', gap: 24 },
    webUserCard: { flex: 1, padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 24, minWidth: 350 },
    webUserHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    webUserName: { fontSize: 18, fontWeight: 'bold' },
    webUserEmail: { fontSize: 14 },
    webRoleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    webCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 20 },
    webUserDepto: { fontSize: 14, fontWeight: '600' },
    webActionBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
    webActionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    webModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    webModalContent: { width: 500, padding: 40, borderRadius: 32 },
    webModalTitle: { fontSize: 28, fontWeight: '900', marginBottom: 8 },
    webRolesList: { gap: 12 },
    webRoleOption: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16, borderWidth: 1 },
    webRoleOptionName: { fontSize: 16, fontWeight: '800' },
    webCloseBtn: { marginTop: 32, alignSelf: 'center' }
});

export default RoleManagementScreen;
