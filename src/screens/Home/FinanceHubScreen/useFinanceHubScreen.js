import { useState, useEffect, useCallback } from 'react';
import { financeService } from '../../../services/financeService';
import { useAuth } from '../../../hooks/useAuth';

export const useFinanceHubScreen = () => {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total_recaudado: 0,
        total_por_cobrar: 0,
        gastos_comunes_periodo: 0,
        pago_staff: 0
    });
    const [gastosData, setGastosData] = useState([]);
    const [staffList, setStaffList] = useState([]);

    const loadFinanceData = useCallback(async () => {
        if (!profile?.comunidad_id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // En una implementación real consumimos el servicio de finanzas
            const { data, error } = await financeService.getFinanceDashboardStats(profile.comunidad_id);
            
            if (data && !error) {
                setStats(data.stats);
                setGastosData(data.gastosData);
            }

            const staffRes = await financeService.getEmployees(profile.comunidad_id);
            setStaffList(staffRes.data || []);
        } catch (error) {
            console.error('Error loading finance data:', error);
        } finally {
            setLoading(false);
        }
    }, [profile?.comunidad_id]);

    useEffect(() => {
        loadFinanceData();
    }, [loadFinanceData]);

    return {
        loading,
        stats,
        gastosData,
        staffList,
        userRole: profile?.role
    };
};
