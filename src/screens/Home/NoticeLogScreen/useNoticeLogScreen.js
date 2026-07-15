import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../config/supabase';
import { residentialService } from '../../../services/residentialService';
import { useAuth } from '../../../hooks/useAuth';

export const useNoticeLogScreen = () => {
    const { profile } = useAuth();
    const [novedades, setNovedades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newNovedad, setNewNovedad] = useState({ categoria: 'general', contenido: '', importante: false });

    const loadNovedades = useCallback(async () => {
        if (!profile?.comunidad_id) return;

        const { data, error } = await residentialService.getLibroNovedades(profile.comunidad_id);
        if (error) {
            console.error('Error loading logbook:', error);
        } else {
            setNovedades(data || []);
        }
        setLoading(false);
        setRefreshing(false);
    }, [profile?.comunidad_id]);

    useEffect(() => {
        loadNovedades();

        // Suscripción Realtime
        const channel = supabase
            .channel('logbook-updates')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'libro_novedades',
                    filter: `comunidad_id=eq.${profile?.comunidad_id}`
                },
                (payload) => {
                    // Fetch profile manually to avoid missing relations
                    loadNovedades();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profile?.comunidad_id, loadNovedades]);

    const handleSubmit = async () => {
        if (!newNovedad.contenido.trim()) {
            Alert.alert('Error', 'El contenido no puede estar vacío.');
            return;
        }

        try {
            const { error } = await residentialService.insertNovedad({
                ...newNovedad,
                comunidad_id: profile.comunidad_id,
                autor_id: profile.id
            });

            if (error) throw error;

            setIsModalVisible(false);
            setNewNovedad({ categoria: 'general', contenido: '', importante: false });
            // El realtime actualizará la lista
        } catch (error) {
            Alert.alert('Error', 'No se pudo registrar la novedad.');
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadNovedades();
    };

    return {
        novedades,
        loading,
        refreshing,
        onRefresh,
        isModalVisible,
        setIsModalVisible,
        newNovedad,
        setNewNovedad,
        handleSubmit,
        userRole: profile?.role
    };
};
