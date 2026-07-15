import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../config/supabase';
import { residentialService } from '../../../services/residentialService';
import { authService } from '../../../services/authService';
import { useAuth } from '../../../hooks/useAuth';

export const useLogisticsHubScreen = () => {
    const { profile } = useAuth();
    const [encomiendas, setEncomiendas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [residents, setResidents] = useState([]);

    // Form State
    const [newPackage, setNewPackage] = useState({
        residente_id: null,
        descripcion: '',
        empresa_transporte: '',
        depto_destino: ''
    });

    const loadData = useCallback(async () => {
        if (!profile?.comunidad_id) return;

        setLoading(true);
        const [encRes, resRes] = await Promise.all([
            residentialService.getEncomiendas(profile.comunidad_id),
            authService.getCommunityUsers(profile.comunidad_id)
        ]);

        if (encRes.error) console.error('Error packages:', encRes.error);
        if (resRes.error) console.error('Error residents:', resRes.error);

        setEncomiendas(encRes.data || []);
        setResidents(resRes.data || []);
        setLoading(false);
        setRefreshing(false);
    }, [profile?.comunidad_id]);

    useEffect(() => {
        loadData();

        const channel = supabase
            .channel('packages-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'encomiendas' }, () => loadData())
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [loadData]);

    const handleCreatePackage = async () => {
        if (!newPackage.residente_id || !newPackage.descripcion) {
            Alert.alert('Error', 'Selecciona un residente y describe el paquete.');
            return;
        }

        // Generar PIN aleatorio de 6 dígitos
        const pin = Math.floor(100000 + Math.random() * 900000).toString();

        try {
            const { error } = await residentialService.receivePackage({
                ...newPackage,
                comunidad_id: profile.comunidad_id,
                conserje_id: profile.id,
                codigo_retiro: pin,
                estado: 'pendiente'
            });

            if (error) throw error;

            Alert.alert('Éxito', `Paquete registrado. PIN de retiro: ${pin}`);
            setIsModalVisible(false);
            setNewPackage({ residente_id: null, descripcion: '', empresa_transporte: '', depto_destino: '' });
        } catch (error) {
            Alert.alert('Error', 'No se pudo registrar el paquete.');
        }
    };

    const [selectedForPickup, setSelectedForPickup] = useState(null);

    const handleConfirmReceipt = (packageId) => {
        setSelectedForPickup(packageId);
    };

    const executePickup = async () => {
        if (!selectedForPickup) return;

        try {
            const { error } = await residentialService.updatePackageStatus(selectedForPickup, 'entregado');
            if (error) throw error;

            setEncomiendas(prev => prev.map(p => p.id === selectedForPickup ? { ...p, estado: 'entregado', fecha_retiro: new Date().toISOString() } : p));
            setSelectedForPickup(null);
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar el estado.');
        }
    };

    const handleMarkDelivered = async (packageId, inputPin, force = false) => {
        const pkg = encomiendas.find(p => p.id === packageId);

        if (!force && pkg.codigo_retiro !== inputPin) {
            Alert.alert('Error', 'El PIN de retiro es incorrecto.');
            return false; // Indicador de fallo
        }

        try {
            const { error } = await residentialService.updatePackageStatus(packageId, 'entregado');
            if (error) throw error;

            Alert.alert('Entregado', force ? 'Paquete marcado como entregado manualmente.' : 'El paquete ha sido entregado al residente.');
            return true; // Indicador de éxito
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar el estado.');
            return false;
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const filteredEncomiendas = encomiendas.filter(item => {
        const query = searchQuery.toLowerCase();
        const dateStr = new Date(item.created_at).toLocaleDateString();
        const empresa = (item.empresa_transporte || '').toLowerCase();
        const desc = (item.descripcion || '').toLowerCase();

        return empresa.includes(query) || desc.includes(query) || dateStr.includes(query);
    });

    return {
        encomiendas: filteredEncomiendas,
        loading,
        refreshing,
        onRefresh,
        isModalVisible,
        setIsModalVisible,
        residents,
        newPackage,
        setNewPackage,
        handleCreatePackage,
        handleMarkDelivered,
        handleConfirmReceipt,
        selectedForPickup,
        setSelectedForPickup,
        executePickup,
        searchQuery,
        setSearchQuery,
        userRole: profile?.role,
        userId: profile?.id
    };
};
