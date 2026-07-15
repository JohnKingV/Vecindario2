import { useState, useCallback, useEffect, useMemo } from 'react';
import { postsService } from '../services/postsService';
import { marketplaceService } from '../services/marketplaceService';
import { useAuth } from './useAuth';

export const useUnifiedFeed = (options = { includeMarketplace: true, filterType: null }) => {
    const { profile: userProfile, user } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        if (!userProfile?.comunidad_id) return;

        setLoading(true);
        try {
            // 1. Fetch Posts
            const { data: posts, error: postsError } = await postsService.getPosts(
                userProfile.comunidad_id,
                user?.id,
                options.filterType
            );

            let combinedResults = [];

            if (!postsError && posts) {
                // Normalizar posts
                const normalizedPosts = posts.map(post => ({
                    ...post,
                    unifiedType: 'post',
                    // Asegurar campo fecha consistente para ordenamiento
                    timestamp: new Date(post.created_at).getTime()
                }));
                combinedResults = [...normalizedPosts];
            }

            // 2. Fetch Marketplace Items (si aplica)
            if (options.includeMarketplace) {
                const { data: items, error: itemsError } = await marketplaceService.getItemsByCommunity(
                    userProfile.comunidad_id,
                    { userId: user?.id }
                );

                if (!itemsError && items) {
                    // Normalizar items
                    const normalizedItems = items.map(item => ({
                        ...item,
                        unifiedType: 'marketplace',
                        titulo: item.titulo,
                        contenido: item.descripcion, // Mapear descripción a contenido
                        tipo: 'marketplace', // Tipo para etiquetas UI
                        timestamp: new Date(item.created_at).getTime()
                    }));
                    combinedResults = [...combinedResults, ...normalizedItems];
                }
            }

            // 3. Ordenar por fecha descendente
            combinedResults.sort((a, b) => b.timestamp - a.timestamp);

            setData(combinedResults);
        } catch (error) {
            console.error('[useUnifiedFeed] Error loading unified data:', error);
        } finally {
            setLoading(false);
        }
    }, [userProfile?.comunidad_id, user?.id, options.includeMarketplace, options.filterType]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    return {
        data,
        loading,
        refreshing,
        onRefresh,
        userProfile,
        user
    };
};
