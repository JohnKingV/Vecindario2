import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { marketplaceService } from '../../../services/marketplaceService';

export const useMyItemsScreen = (navigation) => {
    const { theme, isDark } = useTheme();
    const { profile: userProfile } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('active'); // 'active' o 'inactive'
    const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

    useFocusEffect(
        useCallback(() => {
            if (userProfile) {
                loadMyItems();
            }
        }, [userProfile])
    );

    const loadMyItems = async () => {
        setLoading(true);
        const { data, error } = await marketplaceService.getMyItems(userProfile.id);
        setLoading(false);

        if (!error) {
            setItems(data);
        } else {
            setToast({
                visible: true,
                message: 'No pudimos cargar tus publicaciones.',
                type: 'error'
            });
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMyItems();
        setRefreshing(false);
    };

    const filteredItems = items.filter(item =>
        activeTab === 'active' ? !item.vendido : item.vendido
    );

    const formatPrice = (price) => {
        if (!price && price !== 0) return '$0';
        return '$' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    return {
        // State
        items,
        loading,
        refreshing,
        activeTab, setActiveTab,
        toast, setToast,
        filteredItems,

        // Utils
        theme,
        isDark,
        formatPrice,

        // Handlers
        onRefresh,
    };
};
