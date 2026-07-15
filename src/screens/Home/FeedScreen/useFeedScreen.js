import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Animated, Platform, LayoutAnimation, useWindowDimensions, UIManager } from 'react-native';
// Removed Haptics and ImagePicker imports as they are now used in CreatePostScreen
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { postsService } from '../../../services/postsService';
import { notificationService } from '../../../services/notificationService';

export const useFeedScreen = (navigation, route) => {
    const { profile: userProfile, user, refreshUnreadCounts } = useAuth();
    const { theme, isDark } = useTheme();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    // State
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('Todo');
    const [isFiltering, setIsFiltering] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal & Selection States
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [likesList, setLikesList] = useState([]);
    const [loadingLikes, setLoadingLikes] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(1)).current;

    const getTypeConfig = (dark) => ({
        aviso: { label: 'Avisos', color: '#16a34a', bgColor: dark ? 'rgba(22, 163, 74, 0.15)' : '#f0fdf4' },
        alerta: { label: 'Seguridad', color: '#ef4444', bgColor: dark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2' },
        pregunta: { label: 'Comunicado', color: '#135bec', bgColor: dark ? 'rgba(19, 91, 236, 0.15)' : '#f0f4ff' },
        evento: { label: 'Eventos', color: '#197fe6', bgColor: dark ? 'rgba(25, 127, 230, 0.15)' : '#f0f6ff' }
    });

    const typeConfig = useMemo(() => getTypeConfig(isDark), [isDark]);
    const HEADER_MAX_HEIGHT = (Platform.OS === 'ios' ? 260 : 220) + (insets.top > 20 ? insets.top - 20 : 0);
    const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - (Platform.OS === 'ios' ? 140 : 120 + insets.top);

    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [0, -SCROLL_DISTANCE],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE / 1.5],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const fabScale = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [1, 0.82],
        extrapolate: 'clamp',
    });

    const fabTranslateY = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [0, Platform.OS === 'ios' ? 102 : 98],
        extrapolate: 'clamp',
    });

    const fabTranslateX = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [0, 0],
        extrapolate: 'clamp',
    });

    useEffect(() => {
        if (route?.params?.openCreateModal) {
            setIsModalOpen(true);
            // Limpiar parámetro
            navigation.setParams({ openCreateModal: undefined });
        }
    }, [route?.params?.openCreateModal]);

    const loadPosts = useCallback(async (isRefresh = false) => {
        if (!userProfile?.comunidad_id) return;
        if (posts.length === 0 && !isRefresh) setLoading(true);

        const filterMap = {
            'Todo': 'Todo',
            'Seguridad': 'alerta',
            'Eventos': 'evento',
            'Avisos': 'aviso',
            'Comunicado': 'pregunta'
        };

        try {
            const { data, error } = await postsService.getPosts(
                userProfile.comunidad_id,
                user?.id,
                filterMap[activeFilter] || activeFilter,
                searchQuery.trim() || null
            );

            if (!error && data) {
                // LayoutAnimation solo en cambios significativos
                if (Platform.OS !== 'web' && posts.length !== data.length) {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                }
                setPosts(data);
                setIsFiltering(false);

                // Animate In when data is ready
                Animated.timing(contentOpacity, {
                    toValue: 1,
                    duration: 80,
                    useNativeDriver: true
                }).start();
            }
        } catch (err) {
            console.error('[useFeedScreen] loadPosts error:', err);
        } finally {
            setLoading(false);
        }
    }, [userProfile?.comunidad_id, activeFilter, searchQuery, user?.id]);

    // Reemplazo de useEffect + navigation.addListener con useFocusEffect
    useFocusEffect(
        useCallback(() => {
            if (userProfile?.comunidad_id) {
                console.log('[FeedScreen] useFocusEffect triggered');
                loadPosts(); // Carga inicial al enfocar
                if (refreshUnreadCounts) refreshUnreadCounts();
            }
        }, [loadPosts, refreshUnreadCounts, userProfile?.comunidad_id])
    );

    // Efecto separado SOLO para suscripciones Realtime
    useEffect(() => {
        if (!userProfile?.comunidad_id) return;

        console.log('[FeedScreen] Mounting Realtime Subscription');
        const subscriptions = postsService.subscribeToFeedChanges(
            userProfile.comunidad_id,
            () => {
                console.log('[FeedScreen] Realtime INSERT detected');
                loadPosts(true); // Recargar posts
            },
            () => {
                console.log('[FeedScreen] Realtime Update detected');
                loadPosts(true);
            }
        );

        return () => {
            console.log('[FeedScreen] Unmounting Realtime Subscription');
            postsService.unsubscribeFeed(subscriptions);
        };
    }, [userProfile?.comunidad_id]); // Dependencias MÍNIMAS para evitar reconexiones

    // Efecto para recargar cuando cambian filtros (independiente del foco)
    useEffect(() => {
        loadPosts();
    }, [activeFilter, searchQuery]);

    const handleLike = useCallback(async (postId) => {
        if (!user) return;

        setPosts(prevPosts => prevPosts.map(p => {
            if (p.id === postId) {
                const newHasLiked = !p.has_liked;
                return {
                    ...p,
                    has_liked: newHasLiked,
                    likes_count: newHasLiked ? (p.likes_count || 0) + 1 : Math.max(0, (p.likes_count || 1) - 1)
                };
            }
            return p;
        }));

        try {
            const { error } = await postsService.toggleLike(postId, user.id);
            if (error) throw error;
        } catch (error) {
            console.error('[FeedScreen] Like error:', error);
        }
    }, [user]);

    const toggleFilter = (filter) => {
        if (filter === 'Comunicados') {
            navigation.navigate('Announcements');
            return;
        }
        if (activeFilter === filter) return;

        // Animate Out before changing filter (fades out stale data)
        Animated.timing(contentOpacity, {
            toValue: 0,
            duration: 10,
            useNativeDriver: true
        }).start(() => {
            setIsFiltering(true);
            setActiveFilter(filter);
        });
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPosts();
        setRefreshing(false);
    };

    const handleEditPress = (post) => {
        setShowOptionsModal(false);
        navigation.navigate('CreatePost', { post });
    };

    const handleOptionsPress = useCallback((post) => {
        setSelectedPost(post);
        setShowOptionsModal(true);
    }, []);

    const handleDeletePress = () => {
        setShowOptionsModal(false);
        setShowDeleteConfirm(true);
    };

    const [alertState, setAlertState] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { }
    });

    const hideAlert = () => {
        setAlertState(prev => ({ ...prev, visible: false }));
    };

    const showAlert = (title, message, type = 'info') => {
        setAlertState({
            visible: true,
            title,
            message,
            type,
            onConfirm: hideAlert
        });
    };

    const confirmDeletePost = async () => {
        if (!selectedPost) return;
        setIsDeleting(true);
        const { error } = await postsService.deletePost(selectedPost.id, user.id, userProfile?.role === 'admin');
        setIsDeleting(false);
        setShowDeleteConfirm(false);

        if (!error) {
            loadPosts();
        } else {
            showAlert('Error', 'No se pudo eliminar la publicación', 'danger');
        }
    };

    const formatDate = useCallback((dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHrs = Math.floor(diffMs / 3600000);

        if (diffHrs < 1) return 'Ahora';
        if (diffHrs < 24) return `Hace ${diffHrs}h`;

        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    }, []);

    const handlePostPress = useCallback((post) => {
        navigation.navigate('PostDetail', { post });
    }, [navigation]);

    const handleShowLikes = async (postId) => {
        setShowLikesModal(true);
        setLoadingLikes(true);
        const { data, error } = await postsService.getPostLikes(postId);
        if (!error && data) {
            setLikesList(data);
        }
        setLoadingLikes(false);
    };

    const handleCommentLike = useCallback(async (commentId, postId) => {
        if (!user) return;

        setPosts(prevPosts => prevPosts.map(p => {
            if (p.id === postId) {
                const updatedRecentComments = p.recent_comments.map(c => {
                    if (c.id === commentId) {
                        const newHasLiked = !c.has_liked;
                        return {
                            ...c,
                            has_liked: newHasLiked,
                            likes_count: newHasLiked ? (c.likes_count || 0) + 1 : Math.max(0, (c.likes_count || 1) - 1)
                        };
                    }
                    return c;
                });
                return { ...p, recent_comments: updatedRecentComments };
            }
            return p;
        }));

        try {
            const { error } = await postsService.toggleCommentLike(commentId, user.id);
            if (error) throw error;
        } catch (error) {
            console.error('[FeedScreen] Comment like error:', error);
            loadPosts(); // Revertir en caso de error
        }
    }, [user]);

    const handleShowCommentLikes = async (commentId) => {
        setShowLikesModal(true);
        setLoadingLikes(true);
        const { data, error } = await postsService.getCommentLikes(commentId);
        if (!error && data) {
            setLikesList(data);
        }
        setLoadingLikes(false);
    };

    const handleUserProfilePress = useCallback((authorProfile) => {
        if (!authorProfile?.id) {
            console.warn('[useFeedScreen] handleUserProfilePress: Invalid profile or ID', authorProfile);
            return;
        }

        navigation.navigate('UserProfile', {
            userId: authorProfile.id,
            userProfile: authorProfile
        });
    }, [navigation]);

    return {
        // State
        posts,
        loading,
        isFiltering,
        refreshing,
        activeFilter,
        searchQuery, setSearchQuery,
        showOptionsModal, setShowOptionsModal,
        selectedPost,
        showDeleteConfirm, setShowDeleteConfirm,
        isDeleting,
        showLikesModal, setShowLikesModal,
        likesList,
        loadingLikes,
        scrollY,
        headerTranslateY,
        headerOpacity,
        fabTranslateY,
        fabTranslateX,
        fabScale,
        contentOpacity,
        HEADER_MAX_HEIGHT,

        // Context/Config
        user,
        userProfile,
        theme,
        isDark,
        width,
        insets,
        typeConfig,
        filteredPosts: posts,

        // Handlers
        toggleFilter,
        onRefresh,
        handleEditPress,
        handleOptionsPress,
        handleDeletePress,
        confirmDeletePost,
        handleLike,
        handleShowLikes,
        handleCommentLike,
        handleShowCommentLikes,
        handlePostPress,
        handleUserProfilePress,
        formatDate,
        alertState,
        hideAlert
    };
};
