import { supabase } from '../config/supabase';

export const reconciliationService = {
    /**
     * Procesa una lista de transacciones bancarias y las compara con los pagos pendientes.
     */
    async reconcileTransactions(comunidadId, transactions) {
        try {
            console.log(`[reconciliationService] Conciliando ${transactions.length} transacciones para comunidad ${comunidadId}`);

            // 1. Obtener pagos pendientes de la comunidad
            const { data: pendingPayments, error: payError } = await supabase
                .from('pagos_expensas') // Asumiendo que esta es la tabla de deuda
                .select('*, profiles(nombre, depto)')
                .eq('comunidad_id', comunidadId)
                .eq('estado', 'pendiente');

            if (payError) throw payError;

            const results = {
                matched: [],
                manual_review: []
            };

            // 2. Lógica de emparejamiento (Fuzzy matching simple para demo)
            transactions.forEach(tx => {
                const match = pendingPayments.find(p =>
                    p.monto === tx.monto ||
                    tx.descripcion.toLowerCase().includes(p.profiles.depto.toLowerCase())
                );

                if (match) {
                    results.matched.push({ transaction: tx, payment: match });
                } else {
                    results.manual_review.push(tx);
                }
            });

            return { data: results, error: null };
        } catch (error) {
            console.error('[reconciliationService] Error:', error);
            return { data: null, error };
        }
    },

    async confirmReconciliation(matchId, paymentId) {
        // Lógica para marcar como pagado en la DB después de la validación del admin
        const { data, error } = await supabase
            .from('pagos_expensas')
            .update({ estado: 'pagado', fecha_pago: new Date().toISOString() })
            .eq('id', paymentId);

        return { data, error };
    }
};
