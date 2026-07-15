import { supabase } from '../config/supabase';

export const communityService = {
    // --- Votaciones ---
    async getActivePolls(comunidadId) {
        return await supabase
            .from('votaciones')
            .select('*')
            .eq('comunidad_id', comunidadId)
            .eq('estado', 'activa')
            .order('created_at', { ascending: false });
    },

    async castVote(votacionId, userId, opcion) {
        return await supabase
            .from('votos')
            .insert([{
                votacion_id: votacionId,
                user_id: userId,
                opcion: opcion
            }]);
    },

    async getPollResults(votacionId) {
        const { data, error } = await supabase
            .from('votos')
            .select('opcion')
            .eq('votacion_id', votacionId);

        if (error) return { data: null, error };

        // Procesar conteo
        const results = data.reduce((acc, curr) => {
            acc[curr.opcion] = (acc[curr.opcion] || 0) + 1;
            return acc;
        }, {});

        return { data: results, error: null };
    },

    async createPoll(poll) {
        return await supabase
            .from('votaciones')
            .insert([poll]);
    },

    async getPollVoters(votacionId) {
        return await supabase
            .from('votos')
            .select(`
                opcion,
                profiles:user_id (
                    nombre,
                    depto,
                    torre,
                    foto_url
                )
            `)
            .eq('votacion_id', votacionId);
    },

    async getCommunityDocuments(communityId) {
        return await supabase
            .from('documentos_comunales')
            .select('*')
            .eq('comunidad_id', communityId)
            .order('created_at', { ascending: false });
    },

    async createDocument(docData) {
        return await supabase
            .from('documentos_comunales')
            .insert(docData)
            .select()
            .single();
    },

    async deleteDocument(id) {
        return await supabase
            .from('documentos_comunales')
            .delete()
            .eq('id', id);
    },

    async updatePoll(pollId, updates) {
        return await supabase
            .from('votaciones')
            .update(updates)
            .eq('id', pollId);
    },

    // --- Mantenimiento ---
    async getMaintenanceTasks(comunidadId) {
        return await supabase
            .from('mantencion_preventiva')
            .select('*')
            .eq('comunidad_id', comunidadId)
            .order('fecha_programada', { ascending: true });
    },

    async updateTaskStatus(taskId, status) {
        return await supabase
            .from('mantencion_preventiva')
            .update({ estado: status })
            .eq('id', taskId);
    },

    async createMaintenanceTask(task) {
        return await supabase
            .from('mantencion_preventiva')
            .insert([task]);
    },

    async uploadDocumentFile(bucket, path, file) {
        return await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false
            });
    },

    async getNewMaintenanceCount(comunidadId, lastSeenDate) {
        try {
            let query = supabase
                .from('mantencion_preventiva')
                .select('*', { count: 'exact', head: true })
                .eq('comunidad_id', comunidadId);

            if (lastSeenDate) {
                query = query.gt('created_at', lastSeenDate);
            }

            const { count, error } = await query;
            if (error) throw error;
            return { count: count || 0, error: null };
        } catch (error) {
            console.error('[communityService] getNewMaintenanceCount error:', error);
            return { count: 0, error };
        }
    }
};
