import { supabase } from '../config/supabase';

export const residentialService = {
    /**
     * Obtiene las amenidades disponibles en la comunidad.
     */
    async getAmenities(comunidadId) {
        try {
            const { data, error } = await supabase
                .from('amenities')
                .select('*')
                .eq('comunidad_id', comunidadId)
                .order('nombre', { ascending: true });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[residentialService] getAmenities error:', error);
            return { data: null, error };
        }
    },

    /**
     * Obtiene las reservas de un usuario.
     */
    async getReservations(userId) {
        try {
            const { data, error } = await supabase
                .from('reservas_amenidades')
                .select(`
                    *,
                    amenity:amenity_id (nombre, imagen_url, ubicacion)
                `)
                .eq('user_id', userId)
                .order('fecha', { ascending: true });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[residentialService] getReservations error:', error);
            return { data: null, error };
        }
    },

    /**
     * Crea una nueva reserva.
     */
    async createReservation(reservationData) {
        try {
            const { data, error } = await supabase
                .from('reservas_amenidades')
                .insert([reservationData])
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Obtiene el historial de pagos de expensas del usuario.
     */
    async getPaymentHistory(userId) {
        try {
            const { data, error } = await supabase
                .from('pagos_expensas')
                .select('*')
                .eq('user_id', userId)
                .order('mes_periodo', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[residentialService] getPaymentHistory error:', error);
            return { data: null, error };
        }
    }
};
