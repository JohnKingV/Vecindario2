import { useEffect, useState } from 'react';
import { marketplaceService } from '../services/marketplaceService';

export const useItems = (comunidadId) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (comunidadId) {
            loadItems();

            // Suscribirse a cambios en tiempo real (Nuevos artículos, ventas o eliminaciones)
            const subscription = marketplaceService.subscribeToMarketplaceChanges(
                comunidadId,
                () => {
                    // Refrescamos la lista completa para asegurar que tenemos todos los datos relacionados 
                    // (como el perfil del vendedor) que no vienen en el payload de Realtime.
                    loadItems();
                }
            );

            return () => {
                marketplaceService.unsubscribeMarketplace(subscription);
            };
        }
    }, [comunidadId]);

    const loadItems = async () => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: err } = await marketplaceService.getItemsByCommunity(comunidadId);
            if (err) throw err;
            setItems(data || []);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const createItem = async (itemData, imageUri) => {
        const { data, error: err } = await marketplaceService.createItem(itemData, imageUri);

        if (!err && data) {
            setItems(prev => [data, ...prev]);
        }

        return { data, error: err };
    };

    const markAsSold = async (itemId) => {
        const { error: err } = await marketplaceService.markAsSold(itemId);

        if (!err) {
            setItems(prev => prev.filter((item) => item.id !== itemId));
        }

        return { error: err };
    };

    const updateItem = async (itemId, itemData, imageUri) => {
        const { data, error: err } = await marketplaceService.updateItem(itemId, itemData, imageUri);

        if (!err && data) {
            setItems(prev => prev.map(item => item.id === itemId ? data : item));
        }

        return { data, error: err };
    };

    const refresh = () => {
        loadItems();
    };

    return {
        items,
        loading,
        error,
        createItem,
        updateItem,
        markAsSold,
        refresh,
    };
};

export default useItems;
