import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../config/supabase';
import { communityService } from '../../../services/communityService';
import { useAuth } from '../../../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useMaintenanceCalendarScreen = () => {
    const { profile } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { refreshCondoBadges, user } = useAuth(); // Importar refresh y user

    const updateLastSeen = useCallback(async () => {
        if (user?.id) {
            await AsyncStorage.setItem(`LAST_SEEN_MAINTENANCE_${user.id}`, new Date().toISOString());
            refreshCondoBadges();
        }
    }, [user?.id, refreshCondoBadges]);

    const loadData = useCallback(async () => {
        if (!profile?.comunidad_id) return;

        setLoading(true);
        const { data, error } = await communityService.getMaintenanceTasks(profile.comunidad_id);

        if (error) {
            console.error('Error loading tasks:', error);
        } else {
            setTasks(data || []);
            updateLastSeen(); // Marcar como visto al cargar
        }
        setLoading(false);
        setRefreshing(false);
    }, [profile?.comunidad_id, updateLastSeen]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleUpdateStatus = async (taskId, newStatus) => {
        const { error } = await communityService.updateTaskStatus(taskId, newStatus);
        if (error) {
            console.error('Error updating status:', error);
            return false;
        }
        await loadData();
        return true;
    };

    const handleCreateTask = async (newTask) => {
        if (!newTask.titulo || !newTask.fecha_programada) return { success: false, error: 'Faltan datos' };

        setLoading(true);
        const taskWithCommunity = {
            ...newTask,
            comunidad_id: profile.comunidad_id,
            estado: 'programada'
        };

        const { error } = await communityService.createMaintenanceTask(taskWithCommunity);

        if (error) {
            console.error('Error creating task:', error);
            setLoading(false);
            return { success: false, error };
        }

        await loadData();
        setLoading(false);
        return { success: true };
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    return {
        tasks,
        loading,
        refreshing,
        onRefresh,
        handleUpdateStatus,
        handleCreateTask,
        userRole: profile?.role
    };
};
