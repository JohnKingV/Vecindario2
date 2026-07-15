/**
 * odooService.js (Seguro vía Supabase Edge Functions)
 * Este servicio ya no se conecta directamente a Odoo. 
 * En su lugar, llama a la Edge Function 'odoo-api' que maneja las llaves de forma segura.
 */

import { supabase } from '../config/supabase';

export const odooService = {
    /**
     * Llama a la Edge Function de Supabase para comunicarse con Odoo.
     */
    async call(model, method, args, kwargs = {}) {
        try {
            const { data, error } = await supabase.functions.invoke('odoo-api', {
                body: { model, method, args, kwargs },
                headers: {
                    // Forzamos el uso de la Anon Key para descartar problemas con el Token de Usuario
                    Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`
                }
            });

            if (error) {
                console.error('[odooService] Error de Edge Function:', error);

                // Intenta leer el cuerpo del error si es posible (depende de la implementación de supabase-js)
                if (error.context && error.context.json) {
                    const errorBody = await error.context.json().catch(() => null);
                    console.error('[odooService] Detalles del error:', errorBody);
                }

                throw error;
            }

            if (data.error) {
                console.error('[odooService] Error desde Odoo:', data.error);
                throw new Error(data.error.message || 'Error en Odoo');
            }

            return data.result;
        } catch (error) {
            console.error('[odooService] Error de invocación:', error);
            throw error;
        }
    },

    /**
     * Ejemplo: Obtiene los datos de la empresa.
     */
    async getCompanyInfo() {
        return await this.call('res.company', 'search_read', [[]], {
            fields: ['name', 'email', 'currency_id'],
            limit: 1
        });
    },

    /**
     * Sincroniza un residente de Supabase hacia Odoo.
     */
    async syncResidenteToOdoo(profile) {
        // Verificar si ya existe por email para evitar duplicados
        const existing = await this.call('res.partner', 'search_read', [
            [['email', '=', profile.email]]
        ], { fields: ['id'] });

        if (existing && existing.length > 0) {
            // Si ya existe, solo actualizamos la referencia si no la tiene
            return await this.call('res.partner', 'write', [
                [existing[0].id],
                { ref: profile.id }
            ]);
        }

        return await this.call('res.partner', 'create', [{
            name: profile.nombre || profile.full_name || 'Sin Nombre',
            email: profile.email,
            ref: profile.id, // Guardamos el ID de Supabase como referencia
            comment: `Departamento: ${profile.depto || 'N/A'}`,
            customer_rank: 1
        }]);
    },

    /**
     * Obtiene el historial de facturas (pendientes y pagadas) de un cliente por su email.
     */
    async getInvoices(email) {
        // 1. Obtener Facturas (Cabeceras)
        const invoices = await this.call('account.move', 'search_read', [
            [
                ['partner_id.email', '=', email],
                ['move_type', '=', 'out_invoice'],
                ['state', '=', 'posted'] // Solo facturas publicadas/validadas
            ]
        ], {
            fields: ['name', 'amount_total', 'invoice_date', 'invoice_date_due', 'payment_state', 'currency_id', 'invoice_line_ids', 'access_url', 'access_token'],
            order: 'invoice_date desc'
        });

        if (!invoices || invoices.length === 0) return [];

        // 2. Obtener Líneas de Factura (Detalle)
        // Recolectar todos los IDs de líneas
        const allLineIds = invoices.flatMap(inv => inv.invoice_line_ids || []);

        if (allLineIds.length > 0) {
            const lines = await this.call('account.move.line', 'read', [allLineIds], {
                fields: ['move_id', 'name', 'quantity', 'price_unit', 'price_total']
            });

            // 3. Asociar líneas a sus facturas
            // Crear un mapa de move_id -> [líneas]
            const linesByInvoice = {};
            lines.forEach(line => {
                const moveId = line.move_id[0]; // move_id viene como [id, "Nombre"]
                if (!linesByInvoice[moveId]) {
                    linesByInvoice[moveId] = [];
                }
                linesByInvoice[moveId].push(line);
            });

            // Inyectar líneas en las facturas
            invoices.forEach(inv => {
                inv.lines = linesByInvoice[inv.id] || [];
            });
        }

        return invoices;
    },

    /**
     * Registra un pago en Odoo para un residente.
     */
    async registerPayment({ amount, partnerId, ref, moveId }) {
        // 1. Buscar un Diario de Banco (Journal)
        const journals = await this.call('account.journal', 'search_read', [
            [['type', '=', 'bank']]
        ], { fields: ['id'], limit: 1 });

        if (!journals || journals.length === 0) {
            throw new Error('No se encontró un diario de banco configurado en Odoo');
        }

        const journalId = journals[0].id;

        // 1.1 Buscar un Método de Pago (Payment Method Line) - Requerido en Odoo 15+
        const paymentMethods = await this.call('account.payment.method.line', 'search_read', [
            [['journal_id', '=', journalId], ['payment_type', '=', 'inbound']]
        ], { fields: ['id'], limit: 1 });

        let paymentMethodLineId = null;
        if (paymentMethods && paymentMethods.length > 0) {
            paymentMethodLineId = paymentMethods[0].id;
        }

        // 2. Crear el pago
        const paymentId = await this.call('account.payment', 'create', [{
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            payment_type: 'inbound',
            partner_type: 'customer',
            partner_id: partnerId,
            journal_id: journalId,
            payment_method_line_id: paymentMethodLineId,
            ref: ref || 'Pago desde App Vecindario',
            // No intentamos conciliar automáticamente aquí para evitar errores complejos,
            // pero Odoo lo permite.
        }]);

        // 3. Confirmar (Post) el pago
        await this.call('account.payment', 'action_post', [[paymentId]]);

        return paymentId;
    }
};
