import { supabase } from '../config/supabase';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export const marketplaceService = {
    async getItemsByCommunity(comunidadId, filters = {}) {
        let query = supabase
            .from('items')
            .select(`
                *,
                profiles:user_id (
                    id,
                    nombre,
                    foto_url,
                    depto,
                    telefono,
                    sexo
                ),
                item_likes (user_id),
                item_comentarios (id)
            `)
            .eq('comunidad_id', comunidadId)
            .eq('vendido', false);

        if (filters.category && filters.category !== 'Todos') {
            query = query.eq('categoria', filters.category);
        }

        if (filters.condition) {
            query = query.eq('estado', filters.condition.toLowerCase());
        }

        if (filters.minPrice !== undefined) {
            query = query.gte('precio', filters.minPrice);
        }

        if (filters.maxPrice !== undefined) {
            query = query.lte('precio', filters.maxPrice);
        }

        if (filters.search) {
            query = query.or(`titulo.ilike.%${filters.search}%,descripcion.ilike.%${filters.search}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('[marketplaceService] getItems error:', error);
            if (error.code === 'PGRST116' || error.code === '42P01') {
                error.message = 'Error: Falta la tabla "item_likes". Ejecuta add_item_likes.sql en Supabase.';
            }
        }

        // Procesar likes y comentarios
        const processedData = data?.map(item => ({
            ...item,
            likes_count: item.item_likes?.length || 0,
            has_liked: filters.userId ? item.item_likes?.some(l => l.user_id === filters.userId) : false,
            comentarios_count: item.item_comentarios?.length || 0
        }));

        return { data: processedData || [], error };
    },

    async getFavoriteItems(userId) {
        try {
            const { data, error } = await supabase
                .from('item_likes')
                .select(`
                    item_id,
                    items (
                        *,
                        profiles:user_id (
                            id,
                            nombre,
                            foto_url,
                            depto,
                            telefono
                        ),
                        item_likes (user_id)
                    )
                `)
                .eq('user_id', userId);

            if (error) throw error;

            // Procesar los datos para que tengan la misma estructura que getItemsByCommunity
            const flattenedItems = data?.map(like => {
                const item = like.items;
                return {
                    ...item,
                    likes_count: item.item_likes?.length || 0,
                    has_liked: true // Ya que viene de la tabla item_likes para este usuario
                };
            }) || [];

            return { data: flattenedItems, error: null };
        } catch (error) {
            console.error('[marketplaceService] getFavoriteItems error:', error);
            return { data: [], error };
        }
    },

    createItem: async (itemData, imageUris = []) => {
        try {
            let imagenesUrls = [];

            if (imageUris && imageUris.length > 0) {
                // Subir todas las imágenes
                const uploadPromises = imageUris.map(uri => marketplaceService.uploadItemImage(itemData.user_id, uri));
                const uploadResults = await Promise.all(uploadPromises);

                for (const res of uploadResults) {
                    if (res.error) throw res.error;
                    imagenesUrls.push(res.data);
                }
            }

            const { data, error } = await supabase
                .from('items')
                .insert([{
                    ...itemData,
                    imagen_url: imagenesUrls[0] || null,
                    imagenes_url: imagenesUrls
                }])
                .select('*')
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[marketplaceService] createItem error:', error);
            return { data: null, error };
        }
    },

    async uploadItemImage(userId, uri) {
        try {
            const fileName = `${userId}/${Date.now()}.jpg`;

            // En Android/Hermes, Blobs y Fetch suelen fallar, por eso usamos FileSystem.
            // En Web, FileSystem no existe, pero Fetch/Blob funcionan nativamente.
            let fileData;

            if (Platform.OS === 'web') {
                const response = await fetch(uri);
                fileData = await response.blob();
            } else {
                const base64 = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64
                });
                fileData = decode(base64);
            }

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('items')
                .upload(fileName, fileData, {
                    contentType: 'image/jpeg',
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('items')
                .getPublicUrl(fileName);

            return { data: publicUrl, error: null };
        } catch (error) {
            console.error('[marketplaceService] uploadItemImage error:', error);
            return { data: null, error };
        }
    },

    // Actualizar artículo
    async updateItem(itemId, itemData, imageUris = []) {
        try {
            let finalImagenesUrls = [];

            if (imageUris && imageUris.length > 0) {
                // Identificar cuáles son locales (necesitan subirse) y cuáles ya son URLs
                const uploadPromises = imageUris.map(async (uri) => {
                    if (uri.startsWith('http')) {
                        return { data: uri, error: null };
                    }
                    return await marketplaceService.uploadItemImage(itemData.user_id, uri);
                });

                const uploadResults = await Promise.all(uploadPromises);

                for (const res of uploadResults) {
                    if (res.error) throw res.error;
                    finalImagenesUrls.push(res.data);
                }
            }

            const { data, error } = await supabase
                .from('items')
                .update({
                    ...itemData,
                    imagen_url: finalImagenesUrls[0] || null,
                    imagenes_url: finalImagenesUrls
                })
                .eq('id', itemId)
                .select('*')
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[marketplaceService] updateItem error:', error);
            return { data: null, error };
        }
    },

    // Eliminar artículo
    async deleteItem(itemId, userId, isAdmin = false) {
        try {
            let query = supabase.from('items').delete().eq('id', itemId);

            if (!isAdmin) {
                query = query.eq('user_id', userId);
            }

            const { error } = await query;
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('[marketplaceService] deleteItem error:', error);
            return { error };
        }
    },

    async markAsSold(itemId, userId, compradorId = null) {
        return await supabase.rpc('mark_item_as_sold', {
            p_item_id: itemId,
            p_user_id: userId,
            p_comprador_id: compradorId
        });
    },

    async getCommunityUsers(comunidadId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, nombre, foto_url, depto, torre')
                .eq('comunidad_id', comunidadId)
                .order('nombre', { ascending: true });

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error('[marketplaceService] getCommunityUsers error:', error);
            return { data: [], error };
        }
    },

    async getMyItems(userId) {
        try {
            const { data, error } = await supabase
                .from('items')
                .select(`
                    *,
                    item_likes (user_id),
                    item_comentarios (id)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const processedData = data?.map(item => ({
                ...item,
                likes_count: item.item_likes?.length || 0,
                comentarios_count: item.item_comentarios?.length || 0
            }));

            return { data: processedData || [], error: null };
        } catch (error) {
            console.error('[marketplaceService] getMyItems error:', error);
            return { data: [], error };
        }
    },

    async toggleLike(itemId, userId) {
        try {
            const { data: existingLike } = await supabase
                .from('item_likes')
                .select('id')
                .eq('item_id', itemId)
                .eq('user_id', userId)
                .maybeSingle();

            if (existingLike) {
                const { error } = await supabase
                    .from('item_likes')
                    .delete()
                    .eq('id', existingLike.id);
                if (error) throw error;
                return { action: 'unliked', error: null };
            } else {
                const { error } = await supabase
                    .from('item_likes')
                    .insert([{ item_id: itemId, user_id: userId }]);
                if (error) throw error;
                return { action: 'liked', error: null };
            }
        } catch (error) {
            console.error('[marketplaceService] toggleLike error:', error);
            return { action: null, error };
        }
    },

    // Comentarios en Marketplace
    async getItemComments(itemId) {
        try {
            const { data, error } = await supabase
                .from('item_comentarios')
                .select(`
                    *,
                    profiles:user_id (id, nombre, foto_url, depto)
                `)
                .eq('item_id', itemId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[marketplaceService] getItemComments error:', error);
            return { data: [], error };
        }
    },

    async addItemComment(itemId, userId, contenido) {
        try {
            const { data, error } = await supabase
                .from('item_comentarios')
                .insert([{ item_id: itemId, user_id: userId, contenido }])
                .select(`
                    *,
                    profiles:user_id (id, nombre, foto_url, depto)
                `)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[marketplaceService] addItemComment error:', error);
            return { data: null, error };
        }
    },

    // Suscribirse a cambios en el Marketplace
    subscribeToMarketplaceChanges(comunidadId, onUpdate) {
        return supabase
            .channel(`public:items:comunidad=${comunidadId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'items', filter: `comunidad_id=eq.${comunidadId}` },
                (payload) => onUpdate(payload)
            )
            .subscribe();
    },

    unsubscribeMarketplace(subscription) {
        if (subscription) supabase.removeChannel(subscription);
    }
};
