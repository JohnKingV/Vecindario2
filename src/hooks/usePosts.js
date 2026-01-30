import { useEffect, useState } from 'react';
import { postsService } from '../services/postsService';

export const usePosts = (comunidadId, tipo = null) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (comunidadId) {
            loadPosts();

            // Suscribirse a cambios en tiempo real (Posts, Likes y Comentarios)
            const subscriptions = postsService.subscribeToFeedChanges(
                comunidadId,
                (newPost) => {
                    // Solo agregar si no está ya en el estado (evitar duplicados por optimismo)
                    setPosts((current) => {
                        if (current.some(p => p.id === newPost.id)) return current;
                        return [newPost, ...current];
                    });
                },
                () => {
                    // En caso de cambios en likes o comentarios, refrescamos para obtener contadores actualizados
                    // Podríamos optimizarlo a futuro, pero refresh() asegura consistencia total
                    refresh();
                }
            );

            return () => {
                postsService.unsubscribeFeed(subscriptions);
            };
        }
    }, [comunidadId, tipo]);

    const loadPosts = async () => {
        setLoading(true);
        setError(null);

        const { data, error: err } = await postsService.getPosts(comunidadId, tipo);

        if (err) {
            setError(err);
        } else {
            setPosts(data || []);
        }

        setLoading(false);
    };

    const createPost = async (postData, imageUri) => {
        const { data, error: err } = await postsService.createPost(
            postData,
            imageUri
        );

        // El listener en tiempo real ya agregará el post si es exitoso
        // Pero devolvemos los datos para control local si es necesario
        return { data, error: err };
    };

    const deletePost = async (postId, userId) => {
        const { error: err } = await postsService.deletePost(postId, userId);

        if (!err) {
            setPosts(posts.filter((p) => p.id !== postId));
        }

        return { error: err };
    };

    const refresh = () => {
        loadPosts();
    };

    return {
        posts,
        loading,
        error,
        createPost,
        deletePost,
        refresh,
    };
};

export default usePosts;
