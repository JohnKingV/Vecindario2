import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Alert, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { postsService } from '../../../services/postsService';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';

const { width } = Dimensions.get('window');

const getTypeConfig = (isDark) => ({
    aviso: { label: 'Avisos', color: '#16a34a', bgColor: isDark ? 'rgba(22, 163, 74, 0.15)' : '#f0fdf4' },
    alerta: { label: 'Seguridad', color: '#ef4444', bgColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2' },
    pregunta: { label: 'Comunicados', color: '#135bec', bgColor: isDark ? 'rgba(19, 91, 236, 0.15)' : '#f0f4ff' },
    evento: { label: 'Eventos', color: '#197fe6', bgColor: isDark ? 'rgba(25, 127, 230, 0.15)' : '#f0f6ff' }
});

export const usePostDetailScreen = (route, navigation) => {
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();
    const { post, commentId } = route.params;
    const { profile } = useAuth();

    // State
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [likesList, setLikesList] = useState([]);
    const [loadingLikes, setLoadingLikes] = useState(false);
    const [postData, setPostData] = useState(post);
    const flatListRef = useRef(null);

    // Initial Load
    useEffect(() => {
        loadComments();
        // Sincronizar likes del post si es necesario
    }, []);

    // Scroll to comment effect
    useEffect(() => {
        if (!loading && comments.length > 0 && commentId) {
            scrollToComment();
        }
    }, [loading, comments, commentId]);

    const scrollToComment = () => {
        if (!commentId || comments.length === 0) return;

        const index = comments.findIndex(c => c && String(c.id) === String(commentId));

        if (index !== -1) {
            let attempts = 0;
            const tryScroll = () => {
                if (attempts > 3 || !flatListRef.current) return;

                setTimeout(() => {
                    if (!flatListRef.current) return;
                    try {
                        flatListRef.current.scrollToIndex({
                            index: index,
                            animated: true,
                            viewPosition: 0
                        });
                    } catch (e) {
                        // Fallback scrolling if layout not ready
                        const offset = 400 + (index * 100);
                        flatListRef.current.scrollToOffset({ offset: offset, animated: true });
                        attempts = attempts + 1;
                        tryScroll();
                    }
                }, 500 + (attempts * 500));
            };
            tryScroll();
        }
    };

    const loadComments = async () => {
        const { data, error } = await postsService.getComments(post.id, profile?.id);
        if (!error && data) setComments(data);
        setLoading(false);
    };

    const handleToggleLikeComment = async (targetCommentId) => {
        if (!profile) return;

        // Optimistic update
        const updatedComments = comments.map(c => {
            if (c.id === targetCommentId) {
                const newHasLiked = !c.has_liked;
                return {
                    ...c,
                    has_liked: newHasLiked,
                    likes_count: newHasLiked ? (c.likes_count || 0) + 1 : Math.max(0, (c.likes_count || 0) - 1)
                };
            }
            return c;
        });
        setComments(updatedComments);

        const { error } = await postsService.toggleCommentLike(targetCommentId, profile.id);
        if (error) {
            console.error('[PostDetail] Error toggling comment like:', error);
            loadComments(); // Revert on error
        }
    };

    const handleAddComment = async () => {
        if (!comment.trim() || !profile) return;

        const { data, error } = await postsService.addComment(post.id, profile.id, comment);
        if (!error) {
            setComment('');
            loadComments();
        } else {
            console.error('Error adding comment:', error);
        }
    };

    const handleDeletePost = () => {
        setShowOptionsModal(false);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        const { error } = await postsService.deletePost(post.id, profile.id, profile.role === 'admin');
        setIsDeleting(false);
        setShowDeleteModal(false);

        if (!error) {
            navigation.goBack();
        } else {
            Alert.alert('Error', 'No se pudo eliminar la publicación');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).toUpperCase();
    };

    const handleToggleLikePost = async () => {
        if (!profile) return;

        // Optimistic update
        const newHasLiked = !postData.has_liked;
        const newLikesCount = newHasLiked ? (postData.likes_count || 0) + 1 : Math.max(0, (postData.likes_count || 1) - 1);

        setPostData(prev => ({
            ...prev,
            has_liked: newHasLiked,
            likes_count: newLikesCount
        }));

        const { error } = await postsService.toggleLike(post.id, profile.id);
        if (error) {
            console.error('[PostDetail] Error toggling post like:', error);
            // In a real app we might want to revert but getPosts or local state sync handles it
        }
    };

    const handleShowLikes = async () => {
        setShowLikesModal(true);
        setLoadingLikes(true);
        const { data, error } = await postsService.getPostLikes(post.id);
        if (!error && data) {
            setLikesList(data);
        }
        setLoadingLikes(false);
    };

    const handleShowCommentLikes = async (commentId) => {
        setShowLikesModal(true);
        setLoadingLikes(true);
        const { data, error } = await postsService.getCommentLikes(commentId);
        if (!error && data) {
            setLikesList(data);
        }
        setLoadingLikes(false);
    };

    return {
        // State
        comment, setComment,
        comments,
        loading,
        showDeleteModal, setShowDeleteModal,
        isDeleting,
        showOptionsModal, setShowOptionsModal,
        flatListRef,

        // Data
        post,
        profile,
        commentId,

        // Utils/Config
        theme,
        isDark,
        insets,
        getTypeConfig,
        formatDate,
        postData,
        showLikesModal, setShowLikesModal,
        likesList,
        loadingLikes,

        // Handlers
        handleToggleLikePost,
        handleShowLikes,
        handleToggleLikeComment,
        handleAddComment,
        handleDeletePost,
        confirmDelete,
        loadComments,
        handleShowCommentLikes,
        handleUserProfilePress: (profile) => {
            if (!profile?.id) return;
            navigation.navigate('UserProfile', {
                userId: profile.id,
                userProfile: profile
            });
        }
    };
};
