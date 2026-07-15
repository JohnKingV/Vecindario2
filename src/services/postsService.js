import { supabase } from '../config/supabase';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export const postsService = {
    // Obtener posts de la comunidad
    async getPosts(comunidadId, userId = null, tipo = null, search = null, limit = 50) {
        try {
            let query = supabase
                .from('posts')
                .select(`
                    *,
                    profiles:user_id (
                        id,
                        nombre,
                        foto_url,
                        depto,
                        sexo,
                        raiting_ventas
                    ),
                    comentarios (
                        id,
                        contenido,
                        created_at,
                        profiles:user_id (id, nombre, foto_url, depto, raiting_ventas),
                        comentario_likes (user_id)
                    ),
                    post_likes (user_id)
                `)
                .eq('comunidad_id', comunidadId)
                .order('created_at', { ascending: false })
                .order('created_at', { foreignTable: 'comentarios', ascending: false })
                .limit(limit);

            if (tipo && tipo !== 'Todo') {
                query = query.eq('tipo', tipo.toLowerCase());
            }

            if (search) {
                query = query.or(`titulo.ilike.%${search}%,contenido.ilike.%${search}%`);
            }

            const { data, error } = await query;

            if (error) {
                console.error('[postsService] getPosts error:', error);
                throw error;
            }

            // Procesar likes y comentarios
            const processedData = data.map(post => {
                const allComments = post.comentarios || [];
                const likes = post.post_likes || [];

                const processedComments = allComments.map(comment => {
                    const commentLikes = comment.comentario_likes || [];
                    return {
                        ...comment,
                        likes_count: commentLikes.length,
                        has_liked: userId ? commentLikes.some(l => l.user_id === userId) : false
                    };
                });

                return {
                    ...post,
                    likes_count: likes.length,
                    has_liked: userId ? likes.some(like => like.user_id === userId) : false,
                    comentarios_count: allComments.length,
                    recent_comments: processedComments.slice(0, 3).reverse()
                };
            });

            return { data: processedData, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    // Alternar Like
    async toggleLike(postId, userId) {
        try {
            // Verificar si ya existe el like
            const { data: existingLike } = await supabase
                .from('post_likes')
                .select('id')
                .eq('post_id', postId)
                .eq('user_id', userId)
                .maybeSingle();

            if (existingLike) {
                // Quitar like
                const { error } = await supabase
                    .from('post_likes')
                    .delete()
                    .eq('id', existingLike.id);
                if (error) throw error;
                return { action: 'unliked', error: null };
            } else {
                // Dar like
                const { error } = await supabase
                    .from('post_likes')
                    .insert([{ post_id: postId, user_id: userId }]);
                if (error) throw error;
                return { action: 'liked', error: null };
            }
        } catch (error) {
            console.error('[postsService] toggleLike error:', error);
            return { action: null, error };
        }
    },

    // Obtener usuarios que dieron like a un post
    async getPostLikes(postId) {
        try {
            const { data, error } = await supabase
                .from('post_likes')
                .select(`
                    user_id,
                    profiles:user_id (
                        id,
                        nombre,
                        foto_url,
                        depto,
                        sexo
                    )
                `)
                .eq('post_id', postId);

            if (error) throw error;
            return { data: data.map(item => item.profiles), error: null };
        } catch (error) {
            console.error('[postsService] getPostLikes error:', error);
            return { data: null, error };
        }
    },

    // Obtener usuarios que dieron like a un comentario
    async getCommentLikes(commentId) {
        try {
            // Primero obtenemos los IDs de usuario que dieron like
            const { data: likes, error: likesError } = await supabase
                .from('comentario_likes')
                .select('user_id')
                .eq('comentario_id', commentId);

            if (likesError) throw likesError;
            if (!likes || likes.length === 0) return { data: [], error: null };

            const userIds = likes.map(l => l.user_id);

            // Luego obtenemos los perfiles para esos IDs
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, nombre, foto_url, depto, sexo')
                .in('id', userIds);

            if (profilesError) throw profilesError;

            return { data: profiles, error: null };
        } catch (error) {
            console.error('[postsService] getCommentLikes error:', error);
            return { data: null, error };
        }
    },

    // Crear post
    async createPost(postData, imageUri = null) {
        try {
            let imagenUrl = null;

            // Subir imagen si existe
            if (imageUri) {
                const uploadResult = await this.uploadPostImage(postData.user_id, imageUri);
                if (uploadResult.error) throw uploadResult.error;
                imagenUrl = uploadResult.data;
            }

            const { data, error } = await supabase
                .from('posts')
                .insert([
                    {
                        ...postData,
                        imagen_url: imagenUrl,
                    },
                ])
                .select('*')
                .single();

            if (error) throw error;

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    // Subir imagen de post
    async uploadPostImage(userId, uri) {
        try {
            const fileName = `${userId}/${Date.now()}.jpg`;

            // En Android/Hermes, Blobs y Fetch suelen fallar.
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
                .from('posts')
                .upload(fileName, fileData, {
                    contentType: 'image/jpeg',
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('posts')
                .getPublicUrl(fileName);

            return { data: publicUrl, error: null };
        } catch (error) {
            console.error('[postsService] uploadPostImage error:', error);
            return { data: null, error };
        }
    },

    // Actualizar post
    async updatePost(postId, postData, imageUri = null) {
        try {
            let imagenUrl = postData.imagen_url;

            // Subir nueva imagen si se proporciona una URI local
            if (imageUri && !imageUri.startsWith('http')) {
                const uploadResult = await this.uploadPostImage(postData.user_id, imageUri);
                if (uploadResult.error) throw uploadResult.error;
                imagenUrl = uploadResult.data;
            }

            const { data, error } = await supabase
                .from('posts')
                .update({
                    titulo: postData.titulo,
                    contenido: postData.contenido,
                    tipo: postData.tipo,
                    imagen_url: imagenUrl
                })
                .eq('id', postId)
                .select('*')
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[postsService] updatePost error:', error);
            return { data: null, error };
        }
    },

    // Eliminar post
    async deletePost(postId, userId, isAdmin = false) {
        try {
            let query = supabase.from('posts').delete().eq('id', postId);

            if (!isAdmin) {
                query = query.eq('user_id', userId);
            }

            const { error } = await query;
            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error };
        }
    },

    // Obtener comentarios de un post
    async getComments(postId, userId = null) {
        try {
            const { data, error } = await supabase
                .from('comentarios')
                .select(`
                    *,
                    profiles:user_id (
                        id,
                        nombre,
                        foto_url,
                        depto,
                        raiting_ventas
                    ),
                    comentario_likes (user_id)
                `)
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Procesar likes
            const processedData = data.map(comment => {
                const likes = comment.comentario_likes || [];
                return {
                    ...comment,
                    likes_count: likes.length,
                    has_liked: userId ? likes.some(like => like.user_id === userId) : false
                };
            });

            return { data: processedData, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    // Crear comentario
    async addComment(postId, userId, contenido) {
        try {
            const { data, error } = await supabase
                .from('comentarios')
                .insert([{ post_id: postId, user_id: userId, contenido }])
                .select(`
                    *,
                    profiles:user_id (
                        id,
                        nombre,
                        foto_url,
                        depto,
                        raiting_ventas
                    )
                `)
                .single();

            if (error) {
                console.error('[postsService] addComment error:', error);
                throw error;
            }
            return { data, error: null };
        } catch (error) {
            console.error('[postsService] addComment generic error:', error);
            return { data: null, error };
        }
    },

    // Alternar Like en Comentario
    async toggleCommentLike(commentId, userId) {
        try {
            // Verificar si ya existe el like
            const { data: existingLike } = await supabase
                .from('comentario_likes')
                .select('id')
                .eq('comentario_id', commentId)
                .eq('user_id', userId)
                .maybeSingle();

            if (existingLike) {
                // Quitar like
                const { error } = await supabase
                    .from('comentario_likes')
                    .delete()
                    .eq('id', existingLike.id);
                if (error) throw error;
                return { action: 'unliked', error: null };
            } else {
                // Dar like
                const { error } = await supabase
                    .from('comentario_likes')
                    .insert([{ comentario_id: commentId, user_id: userId }]);
                if (error) throw error;
                return { action: 'liked', error: null };
            }
        } catch (error) {
            console.error('[postsService] toggleCommentLike error:', error);
            return { action: null, error };
        }
    },

    // Suscribirse a cambios globales del Feed
    subscribeToFeedChanges(comunidadId, onPostInsert, onInteractionChange) {
        console.log(`[postsService] Suscribiendo a cambios para comunidad: ${comunidadId}`);

        // Suscripción a nuevos posts
        const postSubscription = supabase
            .channel(`feed_posts_${comunidadId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'posts',
                    filter: `comunidad_id=eq.${comunidadId}`
                },
                (payload) => {
                    console.log('[postsService] Nuevo post detectado:', payload.new.id);
                    onPostInsert(payload.new);
                }
            )
            .subscribe((status) => {
                console.log(`[postsService] Estado suscripción posts: ${status}`);
            });

        // Suscripción a cambios en likes y comentarios (para actualizar contadores)
        const interactionSubscription = supabase
            .channel(`feed_interactions_${comunidadId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'post_likes' },
                () => {
                    console.log('[postsService] Cambio en likes detectado');
                    onInteractionChange();
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'comentarios' },
                () => {
                    console.log('[postsService] Cambio en comentarios detectado');
                    onInteractionChange();
                }
            )
            .subscribe((status) => {
                console.log(`[postsService] Estado suscripción interacciones: ${status}`);
            });

        return { postSubscription, interactionSubscription };
    },

    // Desuscribirse
    unsubscribeFeed(subscriptions) {
        if (subscriptions.postSubscription) supabase.removeChannel(subscriptions.postSubscription);
        if (subscriptions.interactionSubscription) supabase.removeChannel(subscriptions.interactionSubscription);
    },
};
