import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../config/supabase';
import { residentialService } from '../../../services/residentialService';
import { useAuth } from '../../../hooks/useAuth';

export const useParkingMonitorScreen = () => {
    const { profile } = useAuth();
    const [parkingSlots, setParkingSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadParkingStatus = useCallback(async () => {
        if (!profile?.comunidad_id) return;

        const { data, error } = await residentialService.getParkingStatus(profile.comunidad_id);
        if (error) {
            console.error('Error loading parking:', error);
        } else {
            setParkingSlots(data || []);
        }
        setLoading(false);
        setRefreshing(false);
    }, [profile?.comunidad_id]);

    useEffect(() => {
        loadParkingStatus();

        // Suscripción Realtime
        const channel = supabase
            .channel('parking-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'parqueaderos',
                    filter: `comunidad_id=eq.${profile?.comunidad_id}`
                },
                (payload) => {
                    console.log('Parking update received:', payload);
                    if (payload.eventType === 'UPDATE') {
                        setParkingSlots(prev => prev.map(slot =>
                            slot.id === payload.new.id ? payload.new : slot
                        ));
                    } else {
                        loadParkingStatus();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profile?.comunidad_id, loadParkingStatus]);

    const handleToggleStatus = async (slot) => {
        if (profile?.role !== 'conserje' && profile?.role !== 'admin' && profile?.role !== 'mayordomo') {
            Alert.alert('Acceso Denegado', 'Solo el personal de seguridad puede cambiar el estado.');
            return;
        }

        const newStatus = slot.estado === 'disponible' ? 'ocupado' : 'disponible';

        // Optimistic update
        setParkingSlots(prev => prev.map(s => s.id === slot.id ? { ...s, estado: newStatus } : s));

        try {
            const { error } = await supabase
                .from('parqueaderos')
                .update({ estado: newStatus })
                .eq('id', slot.id);

            if (error) throw error;

            // Si se marca como ocupado, podríamos abrir un modal para registrar la visita (Fase posterior)
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar el estado.');
            loadParkingStatus(); // Rollback
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadParkingStatus();
    };

    const availableCount = parkingSlots.filter(s => s.estado === 'disponible').length;
    const totalCount = parkingSlots.length;

    const handleUpdateCapacity = async (newCapacity) => {
        if (!newCapacity || isNaN(newCapacity) || newCapacity < 0) {
            Alert.alert('Error', 'Ingresa un número válido.');
            return;
        }

        setLoading(true);
        const { success, error } = await residentialService.updateParkingCapacity(profile.comunidad_id, newCapacity);

        if (error) {
            Alert.alert('Error', 'No se pudo actualizar la capacidad.');
        } else {
            Alert.alert('Éxito', 'Capacidad actualizada correctamente.');
            loadParkingStatus();
        }
        setLoading(false);
    };

    return {
        parkingSlots,
        loading,
        refreshing,
        onRefresh,
        handleToggleStatus,
        availableCount,
        totalCount,
        handleUpdateCapacity,
        userRole: profile?.role
    };
};
