import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../config/supabase';
import { communityService } from '../../../services/communityService';
import { useAuth } from '../../../hooks/useAuth';

export const useVotingAssemblyScreen = () => {
    const { profile } = useAuth();
    const [votaciones, setVotaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userVotes, setUserVotes] = useState({});

    const loadData = useCallback(async () => {
        if (!profile?.comunidad_id) return;

        setLoading(true);
        const { data, error } = await communityService.getActivePolls(profile.comunidad_id);

        if (error) {
            console.error('Error loading polls:', error);
        } else {
            setVotaciones(data || []);

            // Cargar votos del usuario para estas votaciones
            const pollIds = (data || []).map(p => p.id);
            if (pollIds.length > 0) {
                const { data: votes } = await supabase
                    .from('votos')
                    .select('votacion_id, opcion')
                    .eq('user_id', profile.id)
                    .in('votacion_id', pollIds);

                const votesMap = {};
                votes?.forEach(v => {
                    votesMap[v.votacion_id] = v.opcion;
                });
                setUserVotes(votesMap);
            }
        }
        setLoading(false);
        setRefreshing(false);
    }, [profile?.comunidad_id, profile.id]);

    useEffect(() => {
        loadData();

        const channel = supabase
            .channel('polls-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'votaciones' }, () => loadData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'votos' }, () => loadData())
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [loadData]);

    const handleVote = async (votacionId, opcion) => {
        const { error } = await communityService.castVote(votacionId, profile.id, opcion);
        if (error) {
            console.error('Error casting vote:', error);
            return false;
        }
        await loadData();
        return true;
    };

    const handleCreatePoll = async (newPoll) => {
        if (!newPoll.titulo || !newPoll.descripcion || !newPoll.fecha_fin) return { success: false, error: 'Faltan datos' };

        setLoading(true);
        const pollWithCommunity = {
            ...newPoll,
            comunidad_id: profile.comunidad_id,
            estado: 'activa',
            created_at: new Date() // Supabase default usually handles this, but explict is fine
        };

        const { error } = await communityService.createPoll(pollWithCommunity);

        if (error) {
            console.error('Error creating poll:', error);
            setLoading(false);
            return { success: false, error };
        }

        await loadData();
        setLoading(false);
        return { success: true };
    };

    const handleUpdatePoll = async (pollId, updates) => {
        setLoading(true);
        const { error } = await communityService.updatePoll(pollId, updates);
        if (error) {
            console.error('Error updating poll:', error);
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

    const fetchVoters = async (votacionId) => {
        const { data, error } = await communityService.getPollVoters(votacionId);
        if (error) {
            console.error('Error fetching voters:', error);
            return [];
        }
        return data; // [{ opcion: 'A Favor', profiles: { nombre: 'Juan', ... } }]
    };

    return {
        votaciones,
        loading,
        refreshing,
        onRefresh,
        userVotes,
        handleVote,
        handleVote,
        handleCreatePoll,
        handleUpdatePoll,
        fetchVoters,
        userRole: profile?.role
    };
};
