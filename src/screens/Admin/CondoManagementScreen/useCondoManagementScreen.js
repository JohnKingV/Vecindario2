import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { authService } from '../../../services/authService';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';

export const useCondoManagementScreen = (navigation) => {
    const { theme, isDark } = useTheme();
    const { profile } = useAuth();

    // Global Navigation State
    const [view, setView] = useState('dashboard'); // 'dashboard', 'codes', 'users'

    // Data State
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Form State (Dashboard - Nuevo Condominio)
    const [createName, setCreateName] = useState('');
    const [createAddress, setCreateAddress] = useState('');
    const [createCity, setCreateCity] = useState('');
    const [createCode, setCreateCode] = useState('');
    const [creatingCondo, setCreatingCondo] = useState(false);

    // Success Modal State
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Verification Codes State (Codes View)
    const [selectedCondoForCode, setSelectedCondoForCode] = useState(null);
    const [newCode, setNewCode] = useState('');
    const [updatingCode, setUpdatingCode] = useState(false);

    // User Management State (Users View)
    const [unassignedUsers, setUnassignedUsers] = useState([]);
    const [expandedCondoId, setExpandedCondoId] = useState(null);
    const [unassignedExpanded, setUnassignedExpanded] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newCondoId, setNewCondoId] = useState(null);
    const [updatingUser, setUpdatingUser] = useState(false);

    // Custom Alert State (for User Management deletions)
    const [alertState, setAlertState] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null,
        showCancel: false
    });

    useEffect(() => {
        loadData(true);
    }, []);

    const loadData = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        const [comRes, profRes] = await Promise.all([
            authService.getAllCommunitiesWithStats(),
            authService.getAllProfiles()
        ]);

        if (comRes.error) {
            Alert.alert('Error', 'No se pudieron cargar las comunidades');
            setLoading(false);
            return;
        }

        const isSuperAdmin = profile?.role === 'admin' && profile?.email === 'jaraneda1596@gmail.com';

        // Filter communities
        let filteredComms = comRes.data || [];
        if (!isSuperAdmin) {
            filteredComms = filteredComms.filter(c => c.id === profile?.comunidad_id);
        }
        setCommunities(filteredComms);

        // Filter unassigned users (SuperAdmin only)
        if (isSuperAdmin && profRes.data) {
            const allProfiles = profRes.data || [];
            const communityIds = new Set(filteredComms.map(c => c.id));
            const pending = allProfiles.filter(user =>
                !user.comunidad_id || !communityIds.has(user.comunidad_id)
            );
            setUnassignedUsers(pending);
        }

        setRefreshKey(prev => prev + 1);
        setLoading(false);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    // --- DASHBOARD HANDLERS ---
    const handleCreateCondo = async () => {
        if (!createName.trim() || !createAddress.trim() || !createCity.trim() || !createCode.trim()) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        setCreatingCondo(true);
        const { data, error } = await authService.createCommunity({
            nombre: createName.trim(),
            direccion: createAddress.trim(),
            ciudad: createCity.trim(),
            codigo_verificacion: createCode.trim().toUpperCase()
        });
        setCreatingCondo(false);

        if (error) {
            Alert.alert('Error', 'No se pudo crear el condominio: ' + error.message);
        } else {
            setSuccessMessage('Condominio registrado con éxito');
            setShowSuccess(true);
            setCreateName('');
            setCreateAddress('');
            setCreateCity('');
            setCreateCode('');
            loadData();
        }
    };

    const handleSyncData = () => {
        Alert.alert('Mantenimiento', 'Iniciando sincronización de datos antiguos...');
    };

    // --- CODES HANDLERS ---
    const openEditCodeModal = (condo) => {
        setSelectedCondoForCode(condo);
        setNewCode(condo.codigo_verificacion || '');
    };

    const handleUpdateCode = async () => {
        if (!newCode.trim()) return;
        setUpdatingCode(true);
        const { error } = await authService.updateCommunityCode(selectedCondoForCode.id, newCode.trim());
        setUpdatingCode(false);
        if (error) {
            Alert.alert('Error', error.message);
        } else {
            setSuccessMessage('Código actualizado con éxito');
            setShowSuccess(true);
            setSelectedCondoForCode(null);
            loadData();
        }
    };

    // --- USERS HANDLERS ---
    const showAlert = (title, message, type = 'info', onConfirm = null, showCancel = false) => {
        setAlertState({ visible: true, title, message, type, onConfirm, showCancel });
    };

    const hideAlert = () => setAlertState(prev => ({ ...prev, visible: false }));

    const handleUpdateUserCommunity = async () => {
        if (!selectedUser) return;
        setUpdatingUser(true);
        const { error } = await authService.changeUserCommunity(selectedUser.id, newCondoId);
        setUpdatingUser(false);
        if (error) {
            showAlert('Error', error.message, 'danger');
        } else {
            setSuccessMessage('Usuario movido correctamente');
            setShowSuccess(true);
            setSelectedUser(null);
            loadData();
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        showAlert(
            'Confirmar Eliminación',
            `¿Estás seguro de eliminar a ${selectedUser.nombre}?`,
            'danger',
            async () => {
                setUpdatingUser(true);
                const { error } = await authService.deleteUser(selectedUser.id);
                setUpdatingUser(false);
                if (error) {
                    showAlert('Error', error.message, 'danger');
                } else {
                    setSuccessMessage('Usuario eliminado correctamente');
                    setShowSuccess(true);
                    setSelectedUser(null);
                    loadData();
                }
            },
            true
        );
    };

    const handleBack = () => {
        if (view !== 'dashboard') {
            setView('dashboard');
        } else {
            navigation.goBack();
        }
    };

    return {
        theme, isDark, navigation,
        view, setView, handleBack,
        communities, loading, refreshing, refreshKey, handleRefresh,

        // Dashboard
        createName, setCreateName,
        createAddress, setCreateAddress,
        createCity, setCreateCity,
        createCode, setCreateCode,
        creatingCondo,
        handleCreateCondo, handleSyncData,

        // Codes
        selectedCondoForCode, setSelectedCondoForCode, openEditCodeModal,
        newCode, setNewCode, updatingCode, handleUpdateCode,

        // Users
        unassignedUsers, expandedCondoId, setExpandedCondoId,
        unassignedExpanded, setUnassignedExpanded,
        selectedUser, setSelectedUser, newCondoId, setNewCondoId,
        updatingUser, handleUpdateUserCommunity, handleDeleteUser,
        alertState, hideAlert,

        // Success Modal
        showSuccess, setShowSuccess, successMessage
    };
};
