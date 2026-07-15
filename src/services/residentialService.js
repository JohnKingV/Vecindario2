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
    },

    /**
     * --- MÓDULO DE ESTACIONAMIENTOS ---
     */

    async getParkingStatus(comunidadId) {
        try {
            const { data, error } = await supabase
                .from('parqueaderos')
                .select('*')
                .eq('comunidad_id', comunidadId)
                .order('identificador', { ascending: true });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async updateParkingOccupancy(parkingId, occupancyData) {
        try {
            const { data, error } = await supabase
                .from('uso_parqueaderos')
                .insert([occupancyData])
                .select()
                .single();
            if (error) throw error;

            // Actualizar estado del parqueadero
            await supabase
                .from('parqueaderos')
                .update({ estado: occupancyData.hora_salida ? 'disponible' : 'ocupado' })
                .eq('id', parkingId);

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async updateParkingCapacity(comunidadId, newTotal) {
        try {
            // 1. Get current count
            const { count, error: countError } = await supabase
                .from('parqueaderos')
                .select('*', { count: 'exact', head: true })
                .eq('comunidad_id', comunidadId);

            if (countError) throw countError;

            const currentTotal = count || 0;

            if (newTotal > currentTotal) {
                // Add slots
                const slotsToAdd = [];
                for (let i = currentTotal + 1; i <= newTotal; i++) {
                    slotsToAdd.push({
                        comunidad_id: comunidadId,
                        identificador: i.toString(),
                        estado: 'disponible',
                        tipo: 'visita'
                    });
                }
                const { error: insertError } = await supabase
                    .from('parqueaderos')
                    .insert(slotsToAdd);

                if (insertError) throw insertError;

            } else if (newTotal < currentTotal) {
                // Remove slots (from the end)
                // First, get the IDs of the slots to remove (highest identifiers)
                const { data: slotsToRemove, error: fetchError } = await supabase
                    .from('parqueaderos')
                    .select('id')
                    .eq('comunidad_id', comunidadId)
                    .order('identificador', { ascending: false }) // Assuming numerical or convertible identifiers
                    .limit(currentTotal - newTotal);

                if (fetchError) throw fetchError;

                if (slotsToRemove && slotsToRemove.length > 0) {
                    const ids = slotsToRemove.map(s => s.id);
                    const { error: deleteError } = await supabase
                        .from('parqueaderos')
                        .delete()
                        .in('id', ids);

                    if (deleteError) throw deleteError;
                }
            }

            return { success: true, error: null };
        } catch (error) {
            console.error('[residentialService] updateParkingCapacity error:', error);
            return { success: false, error };
        }
    },

    /**
     * --- MÓDULO DE ENCOMIENDAS ---
     */

    async getEncomiendas(comunidadId, userId = null) {
        try {
            let query = supabase
                .from('encomiendas')
                .select('*, profiles:user_id(nombre, depto, torre)')
                .eq('comunidad_id', comunidadId);

            if (userId) query = query.eq('user_id', userId);

            const { data, error } = await query.order('fecha_recepcion', { ascending: false });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async receivePackage(packageData) {
        try {
            // 1. Insertar Encomienda
            // Mapeamos los campos del frontend a la DB si es necesario
            // frontend: residente_id -> DB: user_id
            const dbData = {
                user_id: packageData.residente_id,
                comunidad_id: packageData.comunidad_id,
                conserje_id: packageData.conserje_id,
                descripcion: packageData.descripcion,
                empresa_transporte: packageData.empresa_transporte,
                codigo_retiro: packageData.codigo_retiro,
                estado: 'pendiente',
                fecha_recepcion: new Date().toISOString()
            };

            const { data: encomienda, error: encError } = await supabase
                .from('encomiendas')
                .insert([dbData])
                .select()
                .single();

            if (encError) throw encError;

            // 2. Crear Notificación
            const { error: notifError } = await supabase
                .from('notifications')
                .insert([{
                    user_id: packageData.residente_id,
                    title: '📦 Nueva Encomienda',
                    message: `Tienes un paquete esperando en conserjería. Tu PIN de retiro es: ${packageData.codigo_retiro}`,
                    type: 'package',
                    related_id: encomienda.id,
                    read: false
                }]);

            if (notifError) console.error('[residentialService] Error creating notification:', notifError);

            return { data: encomienda, error: null };
        } catch (error) {
            console.error('[residentialService] receivePackage error:', error);
            return { data: null, error };
        }
    },

    async updatePackageStatus(packageId, newStatus) {
        try {
            const updates = {
                estado: newStatus,
                fecha_retiro: newStatus === 'entregado' ? new Date().toISOString() : null,
                retirado: newStatus === 'entregado'
            };

            const { data, error } = await supabase
                .from('encomiendas')
                .update(updates)
                .eq('id', packageId)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[residentialService] updatePackageStatus error:', error);
            return { data: null, error };
        }
    },

    async markEncomiendaAsWithdrawn(encomiendaId) {
        // Deprecated: maintain for backward compatibility or refactor to use updatePackageStatus
        return this.updatePackageStatus(encomiendaId, 'entregado');
    },

    /**
     * --- LIBRO DE NOVEDADES ---
     */

    async getLibroNovedades(comunidadId) {
        try {
            const { data, error } = await supabase
                .from('libro_novedades')
                .select('*, profiles:autor_id(nombre, role)')
                .eq('comunidad_id', comunidadId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async insertNovedad(novedadData) {
        try {
            const { data, error } = await supabase
                .from('libro_novedades')
                .insert([novedadData])
                .select()
                .single();
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * --- VOTACIONES Y ASAMBLEAS ---

     */

    async getVotaciones(comunidadId) {
        try {
            const { data, error } = await supabase
                .from('votaciones')
                .select('*')
                .eq('comunidad_id', comunidadId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async castVote(voteData) {
        try {
            const { data, error } = await supabase
                .from('votos')
                .insert([voteData])
                .select()
                .single();
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * --- FINANZAS Y MEDIDORES ---
     */

    async getMedidores(comunidadId, userId = null) {
        try {
            let query = supabase
                .from('medidores')
                .select('*')
                .eq('comunidad_id', comunidadId);
            if (userId) query = query.eq('user_id', userId);
            const { data, error } = await query.order('fecha_lectura', { ascending: false });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async getNominaStaff(comunidadId) {
        try {
            const { data, error } = await supabase
                .from('nomina_staff')
                .select('*, profiles:user_id(nombre)')
                .eq('comunidad_id', comunidadId)
                .order('mes_periodo', { ascending: false });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * --- BADGES / CONTADORES ---
     */

    async getPendingPackagesCount(userId) {
        try {
            const { count, error } = await supabase
                .from('encomiendas')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('estado', 'pendiente');

            if (error) throw error;
            return { count: count || 0, error: null };
        } catch (error) {
            console.error('[residentialService] getPendingPackagesCount error:', error);
            return { count: 0, error };
        }
    },

    async getActiveVotingsUserCount(comunidadId, userId) {
        try {
            // 1. Obtener IDs de votaciones activas
            const { data: activeVotings, error: votingsError } = await supabase
                .from('votaciones')
                .select('id')
                .eq('comunidad_id', comunidadId)
                .eq('estado', 'activa');

            if (votingsError) throw votingsError;
            if (!activeVotings || activeVotings.length === 0) return { count: 0, error: null };

            const activeIds = activeVotings.map(v => v.id);

            // 2. Contar en cuántas de estas YA votó el usuario
            const { count: votedCount, error: votesError } = await supabase
                .from('votos')
                .select('*', { count: 'exact', head: true })
                .in('votacion_id', activeIds)
                .eq('user_id', userId);

            if (votesError) throw votesError;

            // 3. Pendientes = Total Activas - Votadas
            const pendingCount = Math.max(0, activeIds.length - (votedCount || 0));
            return { count: pendingCount, error: null };
        } catch (error) {
            console.error('[residentialService] getActiveVotingsUserCount error:', error);
            return { count: 0, error };
        }
    }
};
