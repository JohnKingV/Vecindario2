import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../../hooks/useAuth';
import { authService } from '../../../services/authService';
import { odooService } from '../../../services/odooService';
import { useTheme } from '../../../context/ThemeContext';
import { Alert } from 'react-native';

export const useProfileScreen = (navigation) => {
    const { profile, refreshProfile, updateStatus, signOut, isSuperAdmin } = useAuth();
    const { theme, isDark, toggleTheme } = useTheme();

    const [uploading, setUploading] = useState(false);
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [stats, setStats] = useState({ novedades: 0, ventas: 0, rating: 5.0 });
    const [syncOdooLoading, setSyncOdooLoading] = useState(false);

    const [alertState, setAlertState] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { }
    });

    const hideAlert = () => {
        setAlertState(prev => ({ ...prev, visible: false }));
    };

    const showAlert = (title, message, type = 'info') => {
        setAlertState({
            visible: true,
            title,
            message,
            type,
            onConfirm: hideAlert
        });
    };

    useFocusEffect(
        useCallback(() => {
            if (profile?.id) {
                loadStats();
            }
        }, [profile?.id, isDark])
    );

    const loadStats = async () => {
        const { data, error } = await authService.getUserPublicProfile(profile.id);
        if (data?.stats) {
            setStats(data.stats);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (newStatus === profile?.status) return;

        setIsUpdatingStatus(true);
        const { error } = await updateStatus(newStatus);
        setIsUpdatingStatus(false);

        if (error) {
            showAlert('Error', 'No se pudo actualizar el estado', 'danger');
        }
    };

    const handleRemovePhoto = () => {
        showAlert(
            "Eliminar foto",
            "¿Estás seguro de que deseas eliminar tu foto de perfil?",
            'danger'
        );
    };

    const uploadAvatar = async (uri) => {
        setUploading(true);
        try {
            const { error } = await authService.uploadAvatar(profile?.id, uri);

            if (error) {
                showAlert('Error', 'No se pudo actualizar la foto de perfil', 'danger');
            } else {
                if (refreshProfile) {
                    await refreshProfile();
                }
            }
        } catch (err) {
            showAlert('Error', 'Ocurrió un error inesperado al subir la foto', 'danger');
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        setIsLogoutModalVisible(true);
    };

    const performLogout = () => {
        signOut();
    };

    const handleSyncUsersToOdoo = async () => {
        setSyncOdooLoading(true);
        try {
            const { data: profiles, error } = await authService.getAllProfiles();
            if (error) throw error;

            let syncedCount = 0;
            let errorCount = 0;

            if (profiles) {
                for (const user of profiles) {
                    if (!user.email) continue;
                    try {
                        await odooService.syncResidenteToOdoo(user);
                        syncedCount++;
                    } catch (e) {
                        console.error('Error syncing user:', user.email, e);
                        errorCount++;
                    }
                }
            }

            const message = "Se procesaron " + (profiles?.length || 0) + " usuarios.\nExitosos: " + syncedCount + "\nFallidos: " + errorCount;
            Alert.alert('Sincronización Finalizada', message);

        } catch (err) {
            Alert.alert('Error', 'Falló la sincronización: ' + err.message);
        } finally {
            setSyncOdooLoading(false);
        }
    };

    const getMemberSince = () => {
        if (!profile?.created_at) return 'Miembro';
        const date = new Date(profile.created_at);
        const month = date.toLocaleString('es-ES', { month: 'long' });
        const year = date.getFullYear();
        return "Miembro desde " + month.charAt(0).toUpperCase() + month.slice(1) + " " + year;
    };

    return {
        profile,
        isSuperAdmin,
        theme,
        isDark,
        toggleTheme,
        uploading,
        isLogoutModalVisible,
        setIsLogoutModalVisible,
        isSuccessModalVisible,
        setIsSuccessModalVisible,
        successMessage,
        isUpdatingStatus,
        handleStatusChange,
        handleLogout,
        performLogout,
        getMemberSince,
        navigation,
        alertState,
        hideAlert,
        stats,
        handleRemovePhoto,
        handleSyncUsersToOdoo,
        syncOdooLoading
    };
};
