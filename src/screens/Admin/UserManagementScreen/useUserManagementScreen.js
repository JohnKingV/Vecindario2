import { useState, useEffect } from 'react';
import { authService } from '../../../services/authService';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';

export const useUserManagementScreen = (navigation) => {
    const { theme, isDark } = useTheme();
    const { profile } = useAuth();
    const [communities, setCommunities] = useState([]);
    const [filteredCommunities, setFilteredCommunities] = useState([]);
    const [unassignedUsers, setUnassignedUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedCondoId, setExpandedCondoId] = useState(null);
    const [unassignedExpanded, setUnassignedExpanded] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const [selectedUser, setSelectedUser] = useState(null);
    const [newCondoId, setNewCondoId] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [comRes, profRes] = await Promise.all([
            authService.getAllCommunitiesWithStats(),
            authService.getAllProfiles()
        ]);

        if (comRes.error || profRes.error) {
            setLoading(false);
            return;
        }

        const allCommunities = comRes.data || [];
        const allProfiles = profRes.data || [];
        const communityIds = new Set(allCommunities.map(c => c.id));

        const isSuperAdmin = profile?.role === 'admin' && profile?.email === 'jaraneda1596@gmail.com';

        let filteredComms = allCommunities;
        let pending = [];

        if (isSuperAdmin) {
            pending = allProfiles.filter(user =>
                !user.comunidad_id || !communityIds.has(user.comunidad_id)
            );
        } else {
            // Un administrador normal solo ve su comunidad
            filteredComms = allCommunities.filter(c => c.id === profile?.comunidad_id);
            // Y no ve usuarios pendientes globales
            pending = [];
        }

        setCommunities(filteredComms);
        setFilteredCommunities(filteredComms);
        setUnassignedUsers(pending);
        setRefreshKey(prev => prev + 1);
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

    const [alertState, setAlertState] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null,
        showCancel: false
    });

    const showAlert = (title, message, type = 'info', onConfirm = null, showCancel = false) => {
        setAlertState({ visible: true, title, message, type, onConfirm, showCancel });
    };

    const hideAlert = () => setAlertState(prev => ({ ...prev, visible: false }));

    const handleUpdateUserCommunity = async () => {
        if (!selectedUser) return;

        setUpdating(true);
        const { error } = await authService.changeUserCommunity(selectedUser.id, newCondoId);
        setUpdating(false);

        if (error) {
            showAlert('Error', 'No se pudo cambiar el condominio: ' + error.message, 'danger');
        } else {
            showAlert('¡Éxito!', `Usuario ${selectedUser.nombre} movido correctamente.`, 'success');
            setSelectedUser(null);
            loadData();
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        showAlert(
            'Confirmar Eliminación',
            `¿Estás seguro de que deseas eliminar permanentemente a ${selectedUser.nombre}? Esta acción no se puede deshacer.`,
            'danger',
            async () => {
                setUpdating(true);
                const { error } = await authService.deleteUser(selectedUser.id);
                setUpdating(false);

                if (error) {
                    showAlert('Error', 'No se pudo eliminar el usuario: ' + error.message, 'danger');
                } else {
                    showAlert('Eliminado', 'El usuario ha sido eliminado correctamente.', 'success');
                    setSelectedUser(null);
                    loadData();
                }
            },
            true
        );
    };

    return {
        theme,
        isDark,
        communities,
        filteredCommunities,
        unassignedUsers,
        searchQuery,
        handleSearch,
        loading,
        refreshing,
        handleRefresh,
        expandedCondoId,
        setExpandedCondoId,
        unassignedExpanded,
        setUnassignedExpanded,
        selectedUser,
        setSelectedUser,
        newCondoId,
        setNewCondoId,
        updating,
        handleUpdateUserCommunity,
        handleDeleteUser,
        alertState,
        hideAlert,
        refreshKey,
        navigation
    };
};
