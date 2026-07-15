import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { marketplaceService } from '../../../services/marketplaceService';

export const useFavoritesScreen = (navigation) => {
    const { theme, isDark } = useTheme();
    const { profile: userProfile } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

    useFocusEffect(
        useCallback(() => {
            if (userProfile) {
                loadFavorites();
            }
        }, [userProfile])
    );

    const loadFavorites = async () => {
        setLoading(true);
        const { data, error } = await marketplaceService.getFavoriteItems(userProfile.id);
        setLoading(false);

        if (!error) {
            setItems(data);
        } else {
            setToast({
                visible: true,
                message: 'No pudimos cargar tus favoritos.',
                type: 'error'
            });
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadFavorites();
        setRefreshing(false);
    };

    const handleToggleLike = async (itemId) => {
        const { error } = await marketplaceService.toggleLike(itemId, userProfile.id);
        if (!error) {
            setItems(prev => prev.filter(item => item.id !== itemId));
        }
    };

    const formatPrice = (price) => {
        if (!price && price !== 0) return '$0';
        return '$' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    return {
        // State
        items,
        loading,
        refreshing,
        toast, setToast,

        // Utils
        theme,
        isDark,
        formatPrice,
        userProfile,

        // Handlers
        loadFavorites, // in case needed manually
        onRefresh,
        handleToggleLike,
    };
};
