import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { authService } from '../../../services/authService';
import { odooService } from '../../../services/odooService';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';

export const useAdminPanelScreen = (navigation) => {
    const { theme, isDark } = useTheme();
    const { profile } = useAuth();
    const [nombre, setNombre] = useState('');
    const [direccion, setDireccion] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [codigo, setCodigo] = useState('');
    const [loading, setLoading] = useState(false);
    const [syncLoading, setSyncLoading] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [syncOdooLoading, setSyncOdooLoading] = useState(false);

    useEffect(() => {
        fetchPendingCount();
    }, []);

    const fetchPendingCount = async () => {
        const [comRes, profRes] = await Promise.all([
            authService.getAllCommunitiesWithStats(),
            authService.getAllProfiles()
        ]);

        if (comRes.data && profRes.data) {
            const communityIds = new Set(comRes.data.map(c => c.id));
            const pending = profRes.data.filter(user =>
                !user.comunidad_id || !communityIds.has(user.comunidad_id)
            );
            setPendingCount(pending.length);
        }
    };

    const handleCreateCommunity = async () => {
        if (!nombre || !direccion || !ciudad || !codigo) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        setLoading(true);
        try {
            const { error } = await authService.createCommunity({
                nombre,
                direccion,
                ciudad,
                codigo_verificacion: codigo.toUpperCase(),
            });

            if (error) {
                Alert.alert('Error', error.message);
            } else {
                setShowSuccess(true);
                setNombre('');
                setDireccion('');
                setCiudad('');
                setCodigo('');
            }
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSyncData = async () => {
        if (!profile?.comunidad_id) {
            Alert.alert('Error', 'No tienes una comunidad asignada');
            return;
        }

        Alert.alert(
            'Confirmar Sincronización',
            'Esto vinculará todas las publicaciones y productos antiguos al condominio actual. ¿Deseas continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sincronizar',
                    onPress: async () => {
                        setSyncLoading(true);
                        try {
                            const { error } = await authService.syncCommunityContent(profile.comunidad_id);
                            if (error) throw error;
                            Alert.alert('¡Éxito!', 'Los datos antiguos han sido recuperados.');
                        } catch (err) {
                            Alert.alert('Error', 'No se pudieron sincronizar los datos: ' + err.message);
                        } finally {
                            setSyncLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleSyncUsersToOdoo = async () => {
        setSyncOdooLoading(true);
        try {
            const { data: profiles, error } = await authService.getAllProfiles();
            if (error) throw error;

            let syncedCount = 0;
            let errorCount = 0;

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

            Alert.alert(
                'Sincronización Finalizada',
                `Se procesaron ${profiles.length} usuarios.\nExitosos: ${syncedCount}\nFallidos: ${errorCount}`
            );

        } catch (err) {
            Alert.alert('Error', 'Falló la sincronización: ' + err.message);
        } finally {
            setSyncOdooLoading(false);
        }
    };

    return {
        theme,
        isDark,
        nombre,
        setNombre,
        direccion,
        setDireccion,
        ciudad,
        setCiudad,
        codigo,
        setCodigo,
        loading,
        syncLoading,
        pendingCount,
        showSuccess,
        setShowSuccess,
        handleCreateCommunity,
        handleSyncData,
        handleSyncUsersToOdoo,
        syncOdooLoading,
        // Permitir acceso si es admin O si es el email del desarrollador (para evitar problemas de rol)
        isSuperAdmin: (profile?.role === 'admin') || (profile?.email === 'jaraneda1596@gmail.com'),
        navigation
    };
};
