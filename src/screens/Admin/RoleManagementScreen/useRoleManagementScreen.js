import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../config/supabase';
import { authService } from '../../../services/authService';
import { useAuth } from '../../../hooks/useAuth';

export const useRoleManagementScreen = () => {
    const { profile } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [alertState, setAlertState] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info'
    });

    const [successState, setSuccessState] = useState({
        visible: false,
        message: ''
    });

    const showAlert = (title, message, type = 'info') => {
        setAlertState({ visible: true, title, message, type });
    };

    const hideAlert = () => setAlertState(prev => ({ ...prev, visible: false }));

    const showSuccess = (message) => {
        setSuccessState({ visible: true, message });
    };

    const hideSuccess = () => setSuccessState(prev => ({ ...prev, visible: false }));

    const loadUsers = useCallback(async () => {
        const isSuperAdmin = profile?.role === 'admin' && profile?.email === 'jaraneda1596@gmail.com';

        if (!isSuperAdmin && !profile?.comunidad_id) return;

        setLoading(true);
        const { data, error } = isSuperAdmin
            ? await authService.getAllProfiles()
            : await authService.getCommunityUsers(profile.comunidad_id);

        if (error) {
            console.error('Error loading community users:', error);
            showAlert('Error', 'No se pudieron cargar los usuarios.', 'danger');
        } else {
            setUsers(data || []);
            setFilteredUsers(data || []);
        }
        setLoading(false);
        setRefreshing(false);
    }, [profile?.comunidad_id, profile?.email, profile?.role]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (!query) {
            setFilteredUsers(users);
            return;
        }
        const filtered = users.filter(user =>
            user.nombre?.toLowerCase().includes(query.toLowerCase()) ||
            user.email?.toLowerCase().includes(query.toLowerCase()) ||
            user.depto?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredUsers(filtered);
    };

    const isSuperAdmin = profile?.role === 'admin' && profile?.email === 'jaraneda1596@gmail.com';

    const handleUpdateRole = async (userId, newRole) => {
        const targetUser = users.find(u => u.id === userId);

        // Un admin normal no puede tocar a otros admins ni asignar el rol admin
        if (!isSuperAdmin) {
            if (targetUser?.role === 'admin') {
                showAlert('Error', 'No tienes permisos para modificar a otro administrador.', 'danger');
                return;
            }
            if (newRole === 'admin') {
                showAlert('Error', 'No puedes asignar el rol de administrador.', 'danger');
                return;
            }
        }

        try {
            const { error } = await authService.updateUserRole(userId, newRole);
            if (error) throw error;

            showSuccess('Rol actualizado correctamente.');
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            setFilteredUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            setIsModalVisible(false);
            setSelectedUser(null);
        } catch (error) {
            showAlert('Error', 'No se pudo actualizar el rol.', 'danger');
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadUsers();
    };

    return {
        users: filteredUsers,
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
        currentRole: profile?.role,
        alertState,
        hideAlert,
        successState,
        hideSuccess
    };
};
