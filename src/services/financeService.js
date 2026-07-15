import { supabase } from '../config/supabase';

export const financeService = {
    // ==========================================
    // 1. PROVEEDORES (Providers)
    // ==========================================
    async getProviders(comunidadId) {
        try {
            const { data, error } = await supabase
                .from('proveedores')
                .select('*')
                .eq('comunidad_id', comunidadId)
                .order('razon_social', { ascending: true });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[financeService] getProviders error:', error);
            return { data: null, error };
        }
    },

    async createProvider(providerData) {
        try {
            const { data, error } = await supabase
                .from('proveedores')
                .insert([providerData])
                .select()
                .single();
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[financeService] createProvider error:', error);
            return { data: null, error };
        }
    },

    // ==========================================
    // 2. EMPLEADOS (Employees)
    // ==========================================
    async getEmployees(comunidadId) {
        try {
            const { data, error } = await supabase
                .from('empleados')
                .select('*')
                .eq('comunidad_id', comunidadId)
                .order('nombre_completo', { ascending: true });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[financeService] getEmployees error:', error);
            return { data: null, error };
        }
    },

    async createEmployee(employeeData) {
        try {
            const { data, error } = await supabase
                .from('empleados')
                .insert([employeeData])
                .select()
                .single();
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[financeService] createEmployee error:', error);
            return { data: null, error };
        }
    },

    // ==========================================
    // 3. NÓMINA (Payroll)
    // ==========================================
    async getPayroll(comunidadId, mesPeriodo) {
        try {
            let query = supabase
                .from('pagos_nomina')
                .select('*, empleado:empleado_id(*)')
                .eq('comunidad_id', comunidadId);
            
            if (mesPeriodo) {
                query = query.eq('mes_periodo', mesPeriodo);
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[financeService] getPayroll error:', error);
            return { data: null, error };
        }
    },

    async createPayrollPayment(payrollData) {
        try {
            const { data, error } = await supabase
                .from('pagos_nomina')
                .insert([payrollData])
                .select()
                .single();
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[financeService] createPayrollPayment error:', error);
            return { data: null, error };
        }
    },

    // ==========================================
    // 4. EGRESOS (Expenses)
    // ==========================================
    async getExpenses(comunidadId, mesPeriodo) {
        try {
            const { data, error } = await supabase
                .from('egresos')
                .select('*, proveedor:proveedor_id(*)')
                .eq('comunidad_id', comunidadId)
                .order('fecha_emision', { ascending: false });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[financeService] getExpenses error:', error);
            return { data: null, error };
        }
    },

    async createExpense(expenseData) {
        try {
            const { data, error } = await supabase
                .from('egresos')
                .insert([expenseData])
                .select()
                .single();
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[financeService] createExpense error:', error);
            return { data: null, error };
        }
    },

    // ==========================================
    // 5. DASHBOARD STATS
    // ==========================================
    async getFinanceDashboardStats(comunidadId) {
        try {
            // 1. Get Expenses
            const { data: gastos, error: errGastos } = await supabase
                .from('egresos')
                .select('monto, estado_pago, categoria')
                .eq('comunidad_id', comunidadId);
            
            if (errGastos) throw errGastos;

            // 2. Get active Employees for Payroll projection
            const { data: empleados, error: errEmp } = await supabase
                .from('empleados')
                .select('sueldo_base')
                .eq('comunidad_id', comunidadId);

            if (errEmp) throw errEmp;

            // 3. Get Income (Pagos de Expensas)
            const { data: ingresos, error: errIng } = await supabase
                .from('pagos_expensas')
                .select('monto, estado, profiles!inner(comunidad_id)')
                .eq('profiles.comunidad_id', comunidadId);
                
            if (errIng) throw errIng;

            let total_recaudado = 0;
            let total_por_cobrar = 0;
            let gastos_comunes_periodo = 0;
            let gastosDataMap = {};

            if (ingresos) {
                ingresos.forEach(i => {
                    const status = (i.estado || '').toLowerCase();
                    if (status === 'pagado') {
                        total_recaudado += Number(i.monto || 0);
                    } else if (status === 'pendiente' || status === 'atrasado') {
                        total_por_cobrar += Number(i.monto || 0);
                    }
                });
            }
            
            if (gastos) {
                gastos.forEach(g => {
                    gastos_comunes_periodo += Number(g.monto);
                    if (!gastosDataMap[g.categoria]) gastosDataMap[g.categoria] = 0;
                    gastosDataMap[g.categoria] += Number(g.monto);
                });
            }

            let pago_staff = 0;
            if (empleados) {
                empleados.forEach(e => {
                    const salario = Number(e.sueldo_base) || 0;
                    pago_staff += salario;
                    if (!gastosDataMap['RRHH']) gastosDataMap['RRHH'] = 0;
                    gastosDataMap['RRHH'] += salario;
                });
            }

            const colorMap = {
                'mantenimiento': '#3b82f6',
                'servicios_basicos': '#22c55e',
                'RRHH': '#f59e0b',
                'insumos': '#8b5cf6',
                'honorarios': '#ec4899',
                'seguridad': '#ef4444',
                'reparaciones': '#14b8a6',
                'otro': '#64748b'
            };

            let gastosData = Object.keys(gastosDataMap).map(cat => ({
                name: cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' '),
                amount: gastosDataMap[cat],
                color: colorMap[cat] || '#64748b',
                legendFontColor: '#7F7F7F',
                legendFontSize: 12
            }));

            // Previene crash de libreria PieChart si arreglo esta vacío
            if (gastosData.length === 0) {
                gastosData.push({
                    name: 'Sin Egresos',
                    amount: 0.00001, // Valor microscópico para que renderice pero lea 0
                    color: '#e2e8f0',
                    legendFontColor: '#7F7F7F',
                    legendFontSize: 12
                });
            }

            return {
                data: {
                    stats: {
                        total_recaudado,
                        total_por_cobrar,
                        gastos_comunes_periodo,
                        pago_staff
                    },
                    gastosData
                },
                error: null
            };

        } catch (error) {
            console.error('[financeService] getFinanceDashboardStats error:', error);
            return { data: null, error };
        }
    },

    // ==========================================
    // 6. BANK RECONCILIATION & AI
    // ==========================================
    
    // Import bank transactions from CSV/JSON
    async importBankTransactions(comunidadId, transactions) {
        try {
            const { data, error } = await supabase
                .from('transacciones_bancarias')
                .upsert(transactions, { onConflict: 'referencia_bancaria, comunidad_id' })
                .select();
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[financeService] importBankTransactions error:', error);
            return { data: null, error };
        }
    },

    // Get un-reconciled bank transactions
    async getPendingBankTransactions(comunidadId) {
        try {
            const { data, error } = await supabase
                .from('transacciones_bancarias')
                .select('*')
                .eq('comunidad_id', comunidadId)
                .eq('estado', 'pendiente')
                .order('fecha_transaccion', { ascending: false });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[financeService] getPendingBankTransactions error:', error);
            return { data: null, error };
        }
    },

    // AI Heuristic Match Algorithm
    async runSmartReconciliation(comunidadId) {
        try {
            // 1. Fetch pending transactions
            const { data: bankTx, error: errBank } = await supabase
                .from('transacciones_bancarias')
                .select('*')
                .eq('comunidad_id', comunidadId)
                .eq('estado', 'pendiente');
            if (errBank) throw errBank;

            // 2. Fetch pending expenses
            const { data: egresos, error: errEg } = await supabase
                .from('egresos')
                .select('*, proveedor:proveedor_id(razon_social)')
                .eq('comunidad_id', comunidadId)
                .eq('estado_pago', 'pendiente');
            if (errEg) throw errEg;

            // 3. Fetch pending payroll
            const { data: nominas, error: errNom } = await supabase
                .from('pagos_nomina')
                .select('*, empleado:empleado_id(nombre_completo)')
                .eq('comunidad_id', comunidadId)
                .eq('estado_pago', 'pendiente');
            if (errNom) throw errNom;

            let matches = [];
            let orphans = [];

            // Algoritmo Heurístico Básico (IA)
            if (bankTx) {
                bankTx.forEach(tx => {
                    const txDate = new Date(tx.fecha_transaccion);
                    let foundMatch = false;
                    
                    if (Number(tx.cargo) > 0) { // Dinero Saliendo
                        // a) Buscar en Egresos (Prioridad 1)
                        const matchedEgreso = egresos?.find(e => {
                            const dateDiff = Math.abs((new Date(e.fecha_emision) - txDate) / (1000 * 60 * 60 * 24));
                            const amountMatch = Number(e.monto) === Number(tx.cargo);
                            const textMatch = tx.descripcion_banco.toLowerCase().includes((e.proveedor?.razon_social || '').toLowerCase());
                            return amountMatch && (dateDiff <= 5 || textMatch);
                        });

                        if (matchedEgreso) {
                            matches.push({
                                transaccion: tx,
                                match_type: 'egreso',
                                target: matchedEgreso,
                                metodo: 'ia_exacto',
                                nivel_confianza: 98.5
                            });
                            foundMatch = true;
                        }

                        // b) Buscar en Nomina (Prioridad 2) si no hubo match
                        if (!foundMatch) {
                            const matchedNomina = nominas?.find(n => {
                                const amountMatch = Number(n.total_a_pagar) === Number(tx.cargo);
                                const textMatch = tx.descripcion_banco.toLowerCase().includes('sueldo') || 
                                                  tx.descripcion_banco.toLowerCase().includes((n.empleado?.nombre_completo || '').toLowerCase());
                                return amountMatch && textMatch;
                            });

                            if (matchedNomina) {
                                matches.push({
                                    transaccion: tx,
                                    match_type: 'nomina',
                                    target: matchedNomina,
                                    metodo: 'ia_sugerido',
                                    nivel_confianza: 85.0
                                });
                                foundMatch = true;
                            }
                        }
                    } else if (Number(tx.abono) > 0) { // Dinero Entrando
                        // Aquí iría el logic para pagos_expensas (GC) de residentes
                        // ...
                    }

                    if (!foundMatch) {
                        orphans.push(tx);
                    }
                });
            }

            return { data: { matches, orphans }, error: null };
        } catch (error) {
            console.error('[financeService] runSmartReconciliation error:', error);
            return { data: null, error };
        }
    },
    
    // Save and execute reconciliation
    async saveReconciliations(comunidadId, matchesToSave, userId) {
         try {
             // Formateamos para inserción en `conciliaciones`
             const conciliaciones = matchesToSave.map(m => ({
                 comunidad_id: comunidadId,
                 transaccion_bancaria_id: m.transaccion.id,
                 egreso_id: m.match_type === 'egreso' ? m.target.id : null,
                 pago_nomina_id: m.match_type === 'nomina' ? m.target.id : null,
                 metodo: m.metodo,
                 nivel_confianza: m.nivel_confianza,
                 usuario_id: userId
             }));

             if(conciliaciones.length > 0) {
                 const { error } = await supabase.from('conciliaciones').insert(conciliaciones);
                 if (error) throw error;
             }

             // Actualizar estados (En un sistema real idealmente se usa RPC/Triggers)
             for (let m of matchesToSave) {
                 // Marcar transacción como conciliada
                 await supabase.from('transacciones_bancarias')
                    .update({ estado: 'conciliada' }).eq('id', m.transaccion.id);
                 
                 // Marcar el egreso o nómina como pagado
                 if (m.match_type === 'egreso') {
                     await supabase.from('egresos').update({ estado_pago: 'pagado' }).eq('id', m.target.id);
                 } else if (m.match_type === 'nomina') {
                     await supabase.from('pagos_nomina').update({ estado_pago: 'pagado' }).eq('id', m.target.id);
                 }
             }
             
             return { data: { success: true, count: matchesToSave.length }, error: null };
         } catch(error) {
             console.error('[financeService] saveReconciliations error:', error);
             return { data: null, error };
         }
    }
};
