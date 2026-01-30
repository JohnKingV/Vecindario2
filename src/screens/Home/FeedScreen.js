import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    ScrollView,
    Alert,
    Platform,
    Dimensions,
    StatusBar,
    useWindowDimensions,
    Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, LoadingSpinner, Input, EmptyState, ConfirmModal, OptionsModal, ResilientImage, PostCard } from '../../components';
import Modal from '../../components/Modal'; // Adjusted for require cycle fix
import Button from '../../components/Button'; // Adjusted for require cycle fix
import { postsService } from '../../services/postsService';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const getTypeConfig = (isDark) => ({
    aviso: { label: 'Avisos', color: '#16a34a', bgColor: isDark ? 'rgba(22, 163, 74, 0.15)' : '#f0fdf4' },
    alerta: { label: 'Seguridad', color: '#ef4444', bgColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2' },
    pregunta: { label: 'Comunicado', color: '#135bec', bgColor: isDark ? 'rgba(19, 91, 236, 0.15)' : '#f0f4ff' },
    evento: { label: 'Eventos', color: '#197fe6', bgColor: isDark ? 'rgba(25, 127, 230, 0.15)' : '#f0f6ff' }
});
export default function FeedScreen({ navigation }) {
    const { profile: userProfile, user, refreshUnreadCounts, unreadNotifications } = useAuth();
    const { theme, isDark } = useTheme();
    const { width } = useWindowDimensions();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('Todo');

    // Create Post State
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostType, setNewPostType] = useState('aviso');
    const [newPostImage, setNewPostImage] = useState(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [editingPost, setEditingPost] = useState(null); // id del post que se está editando
    const [searchQuery, setSearchQuery] = useState('');
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;

    const insets = useSafeAreaInsets();
    const typeConfig = useMemo(() => getTypeConfig(isDark), [isDark]);
    const HEADER_MAX_HEIGHT = (Platform.OS === 'ios' ? 240 : 200) + (insets.top > 20 ? insets.top - 20 : 0);
    const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - (Platform.OS === 'ios' ? 98 : 74 + insets.top);

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

    useEffect(() => {
        if (userProfile?.comunidad_id) {
            loadPosts();
            if (refreshUnreadCounts) refreshUnreadCounts();

            // Suscribirse a cambios en tiempo real
            const subscriptions = postsService.subscribeToFeedChanges(
                userProfile.comunidad_id,
                () => {
                    // Recargar posts cuando hay uno nuevo
                    loadPosts();
                },
                () => {
                    // Recargar conteos cuando cambian likes o comentarios
                    loadPosts();
                }
            );

            return () => {
                postsService.unsubscribeFeed(subscriptions);
            };
        }
    }, [userProfile?.comunidad_id, activeFilter, searchQuery, refreshUnreadCounts]);


    const loadPosts = async () => {
        if (!userProfile?.comunidad_id) return;

        // Solo mostrar loading la primera vez o si la lista está vacía
        if (posts.length === 0) setLoading(true);

        // Mapeo de filtros de UI a valores de DB
        const filterMap = {
            'Todo': 'Todo',
            'Seguridad': 'alerta',
            'Eventos': 'evento',
            'Avisos': 'aviso',
            'Comunicado': 'pregunta'
        };

        const { data, error } = await postsService.getPosts(
            userProfile.comunidad_id,
            user?.id,
            filterMap[activeFilter] || activeFilter,
            searchQuery.trim() || null
        );

        setLoading(false);

        if (!error && data) {
            setPosts(data);
        }
    };

    const handleLike = useCallback(async (postId) => {
        if (!user) return;

        // Optimistic UI update usando forma funcional para evitar dependencia de 'posts'
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
            // En caso de error crítico, se podría revertir, pero es mejor dejar que el siguiente pull sincronice
        }
    }, [user]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPosts();
        setRefreshing(false);
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], // Updated API
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.5,
        });

        if (!result.canceled) {
            setNewPostImage(result.assets[0].uri);
        }
    };

    const handleCreatePost = async () => {
        if (!userProfile) return;
        if (!newPostTitle.trim() || !newPostContent.trim()) {
            Alert.alert('Error', 'Por favor completa el título y el contenido');
            return;
        }

        setIsPublishing(true);
        try {
            const postData = {
                user_id: userProfile.id,
                comunidad_id: userProfile.comunidad_id,
                titulo: newPostTitle,
                contenido: newPostContent,
                tipo: newPostType,
            };

            if (editingPost) {
                // Actualizar post existente
                const { error } = await postsService.updatePost(editingPost, postData, newPostImage);
                if (!error) {
                    setIsModalOpen(false);
                    resetForm();
                    await loadPosts();
                } else {
                    Alert.alert('Error', 'No se pudo actualizar la publicación');
                }
            } else {
                // Crear nuevo post
                const { error } = await postsService.createPost(postData, newPostImage);

                if (!error) {
                    setIsModalOpen(false);
                    resetForm();
                    loadPosts();
                } else {
                    Alert.alert('Error', 'No se pudo crear la publicación');
                }
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Ocurrió un error inesperado');
        } finally {
            setIsPublishing(false);
        }
    };

    const resetForm = () => {
        setNewPostTitle('');
        setNewPostContent('');
        setNewPostImage(null);
        setNewPostType('aviso');
        setEditingPost(null);
    };

    const handleEditPress = (item) => {
        setEditingPost(item.id);
        setNewPostTitle(item.titulo);
        setNewPostContent(item.contenido);
        setNewPostType(item.tipo.toLowerCase());
        setNewPostImage(item.imagen_url);
        setIsModalOpen(true);
    };

    const handleOptionsPress = useCallback((post) => {
        setSelectedPost(post);
        setShowOptionsModal(true);
    }, []);

    const handleDeletePress = () => {
        setShowOptionsModal(false);
        setShowDeleteConfirm(true);
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
            Alert.alert('Error', 'No se pudo eliminar la publicación');
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

        // Formateo manual más compatible con Android/Hermes
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${d}/${m}`;
    }, []);

    const filteredPosts = posts; // Ya vienen filtrados desde el servicio por el activeFilter en useEffect

    const handlePostPress = useCallback((post) => {
        navigation.navigate('PostDetail', { post });
    }, [navigation]);

    const handleUserProfilePress = useCallback((authorProfile) => {
        navigation.navigate('UserProfile', {
            userId: authorProfile?.id,
            userProfile: authorProfile
        });
    }, [navigation]);

    const renderPost = useCallback(({ item }) => {
        const isOwner = item.user_id === user?.id;
        return (
            <PostCard
                item={item}
                user={user}
                userProfile={userProfile}
                theme={theme}
                isDark={isDark}
                typeConfig={typeConfig}
                onPress={() => handlePostPress(item)}
                onLike={() => handleLike(item.id)}
                onMoreOptions={() => handleOptionsPress(item)}
                onUserProfilePress={() => handleUserProfilePress(isOwner ? userProfile : item.profiles)}
                formatDate={formatDate}
            />
        );
    }, [user, userProfile, theme, isDark, typeConfig, handlePostPress, handleLike, handleOptionsPress, handleUserProfilePress, formatDate]);

    // Ya no usamos una función anidada para el Header para evitar remounting y pérdida de foco
    const renderHeader = (
        <Animated.View style={[
            styles.headerContainer,
            {
                backgroundColor: theme.colors.background,
                borderBottomColor: theme.colors.border,
                paddingTop: Platform.OS === 'ios' ? 0 : 8,
                transform: [{ translateY: headerTranslateY }]
            }
        ]}>
            <Animated.View style={{ opacity: headerOpacity }}>
                <View style={styles.topRow}>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <Avatar
                            uri={userProfile?.foto_url || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=150'}
                            size={44}
                        />
                    </TouchableOpacity>
                    <View style={styles.topActions}>
                        <TouchableOpacity
                            style={[styles.roundBtn, { backgroundColor: theme.colors.inputBackground }]}
                            onPress={() => navigation.navigate('Notifications')}
                        >
                            <MaterialCommunityIcons name="bell-outline" size={24} color={theme.colors.text} />
                            {unreadNotifications > 0 && (
                                <View style={[styles.badge, { borderColor: theme.colors.background }]}>
                                    <Text style={styles.badgeText}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.roundBtn, styles.accentBtn]}
                            onPress={() => setIsModalOpen(true)}
                        >
                            <MaterialCommunityIcons name="plus" size={26} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>

            <Text style={[styles.mainTitle, { color: theme.colors.text }]}>Novedades</Text>

            <View style={[styles.searchSection, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.searchBar, { backgroundColor: theme.colors.inputBackground }]}>
                    <MaterialCommunityIcons name="magnify" size={22} color={theme.colors.textSecondary} />
                    <Input
                        placeholder="Buscar en Vecindario"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        containerStyle={styles.searchBarInputContainer}
                        style={[styles.searchBarInput, { color: theme.colors.text }]}
                        placeholderTextColor={theme.colors.placeholder}
                        rightIcon={searchQuery.length > 0 ? (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        ) : null}
                    />
                </View>
            </View>
        </Animated.View >
    );

    const renderCategoryFilters = (
        <View style={styles.filterBar}>
            {['Todo', 'Seguridad', 'Eventos', 'Avisos', 'Comunicados'].map((filter) => (
                <TouchableOpacity
                    key={filter}
                    onPress={() => setActiveFilter(filter)}
                    style={[
                        styles.filterChip,
                        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                        activeFilter === filter && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                    ]}
                >
                    <Text style={[
                        styles.filterText,
                        { color: theme.colors.textSecondary },
                        activeFilter === filter && styles.activeFilterText
                    ]}>
                        {filter}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    if (loading && !posts.length) return <LoadingSpinner />;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />

                <Animated.FlatList
                    data={filteredPosts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPost}
                    ListHeaderComponent={renderCategoryFilters}
                    contentContainerStyle={[styles.listPadding, { paddingTop: HEADER_MAX_HEIGHT }]}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: Platform.OS !== 'web' }
                    )}
                    scrollEventThrottle={16}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            progressViewOffset={HEADER_MAX_HEIGHT}
                        />
                    }
                    ListEmptyComponent={
                        !loading ? (
                            <EmptyState
                                icon="📭"
                                title="No hay publicaciones aún"
                                message="Sé el primero en compartir algo con la comunidad."
                            />
                        ) : null
                    }
                />

                {renderHeader}

                <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title={editingPost ? "Editar Publicación" : "Crear Publicación"}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.modalScrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.modalBody}>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>TÍTULO</Text>
                                <Input
                                    placeholder="Asunto del aviso..."
                                    value={newPostTitle}
                                    onChangeText={setNewPostTitle}
                                    containerStyle={styles.premiumInputContainer}
                                    style={[styles.premiumInput, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
                                    placeholderTextColor={theme.colors.placeholder}
                                />
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>MENSAJE</Text>
                                <Input
                                    multiline
                                    placeholder="Describe lo que sucede..."
                                    value={newPostContent}
                                    onChangeText={setNewPostContent}
                                    containerStyle={styles.premiumInputContainer}
                                    style={[styles.premiumInput, styles.premiumTextArea, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
                                    placeholderTextColor={theme.colors.placeholder}
                                />
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>TIPO DE PUBLICACIÓN</Text>
                                <View style={styles.typeSelectorRow}>
                                    {Object.entries(typeConfig).map(([key, config]) => (
                                        <TouchableOpacity
                                            key={key}
                                            activeOpacity={0.7}
                                            style={[
                                                styles.typeOption,
                                                { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border },
                                                newPostType === key && {
                                                    backgroundColor: config.bgColor,
                                                    borderColor: config.color,
                                                    borderWidth: 1.5
                                                }
                                            ]}
                                            onPress={() => setNewPostType(key)}
                                        >
                                            <Text style={[
                                                styles.typeOptionText,
                                                { color: theme.colors.textSecondary },
                                                newPostType === key && { color: config.color, fontWeight: '800' }
                                            ]}>
                                                {config.label.toUpperCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.premiumImageSelector, { backgroundColor: theme.colors.inputBackground }]}
                                onPress={handlePickImage}
                                activeOpacity={0.8}
                            >
                                {newPostImage ? (
                                    <Image source={{ uri: newPostImage }} style={styles.selectedImage} />
                                ) : (
                                    <View style={styles.premiumImagePlaceholder}>
                                        <View style={[styles.cameraIconContainer, { backgroundColor: theme.colors.card }]}>
                                            <MaterialCommunityIcons name="camera" size={24} color={theme.colors.textSecondary} />
                                        </View>
                                        <Text style={[styles.premiumImageLabel, { color: theme.colors.textSecondary }]}>AÑADIR IMAGEN</Text>
                                        <Text style={[styles.premiumImageSub, { color: theme.colors.placeholder }]}>Suelte o toque para subir</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <Button
                                fullWidth
                                onPress={handleCreatePost}
                                loading={isPublishing}
                                style={styles.premiumPublishBtn}
                                textStyle={styles.premiumPublishBtnText}
                            >
                                {editingPost ? 'Guardar Cambios' : 'Publicar'} <MaterialCommunityIcons name="send" size={18} color="#fff" />
                            </Button>
                        </View>
                    </ScrollView>
                </Modal>

                <OptionsModal
                    visible={showOptionsModal}
                    onClose={() => setShowOptionsModal(false)}
                    title="Opciones de Publicación"
                    options={[
                        ...(selectedPost?.user_id === user?.id ? [{
                            label: 'Editar publicación',
                            icon: 'pencil-outline',
                            onPress: () => handleEditPress(selectedPost)
                        }] : []),
                        {
                            label: 'Eliminar publicación',
                            icon: 'trash-can-outline',
                            onPress: handleDeletePress,
                            destructive: true
                        },
                        {
                            label: 'Compartir',
                            icon: 'share-variant-outline',
                            onPress: () => {/* handle share */ }
                        }
                    ]}
                />

                <ConfirmModal
                    visible={showDeleteConfirm}
                    onClose={() => !isDeleting && setShowDeleteConfirm(false)}
                    onConfirm={confirmDeletePost}
                    title="Eliminar Publicación"
                    message="¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer."
                    confirmText={isDeleting ? "Eliminando..." : "Eliminar"}
                    type="danger"
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    listPadding: {
        paddingBottom: 120,
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(248, 250, 252, 1)',
        paddingHorizontal: 20,
        paddingBottom: 0,
        zIndex: 100,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    topActions: {
        flexDirection: 'row',
        gap: 12,
    },
    roundBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        ...Platform.select({
            web: {
                boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.05)',
            },
            default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 5,
                elevation: 2,
            }
        }),
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#ef4444',
        borderRadius: 9,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        paddingHorizontal: 1,
    },
    badgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '900',
    },
    accentBtn: {
        backgroundColor: '#197fe6',
        borderWidth: 0,
        shadowColor: '#197fe6',
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    searchSection: {
        marginBottom: 0,
        backgroundColor: '#f8fafc',
        marginHorizontal: -20,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 4,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 42,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
        paddingHorizontal: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        ...Platform.select({
            web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' },
            default: { elevation: 2 }
        })
    },
    searchBarInputContainer: {
        flex: 1,
        marginBottom: 0,
    },
    searchBarInput: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        paddingHorizontal: 0,
        fontSize: 16,
    },
    filterBar: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        ...Platform.select({
            web: {
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.03)',
            },
            default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.03,
                shadowRadius: 4,
                elevation: 1,
            }
        })
    },
    activeChip: {
        backgroundColor: '#197fe6',
        borderColor: '#197fe6',
        shadowColor: '#197fe6',
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    activeFilterText: {
        color: '#fff',
    },
    postCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 24,
        ...Platform.select({
            web: {
                boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.04)',
            },
            default: {
                shadowColor: '#64748b',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
                elevation: 5,
            }
        }),
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
    },
    cardTypeStrip: {
        height: 4,
        width: '100%',
    },
    postCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    authorAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f1f5f9',
    },
    authorName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
    },
    featuredRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 1,
    },
    featuredText: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '600',
    },
    postTime: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 1,
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    postContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    postTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    postBody: {
        fontSize: 15,
        lineHeight: 22,
        color: '#475569',
        marginBottom: 16,
    },
    postImage: {
        width: '100%',
        aspectRatio: 16 / 10,
        borderRadius: 16,
        backgroundColor: '#f1f5f9',
    },
    postActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    actionLeft: {
        flexDirection: 'row',
        gap: 20,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    modalBody: {
        padding: 24,
        gap: 20,
    },
    inputWrapper: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#94a3b8',
        letterSpacing: 2,
        paddingLeft: 4,
    },
    premiumInputContainer: {
        marginBottom: 0,
    },
    premiumInput: {
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        paddingHorizontal: 20,
    },
    premiumTextArea: {
        minHeight: 120,
        paddingTop: 16,
        textAlignVertical: 'top',
    },
    premiumImageSelector: {
        width: '100%',
        height: 160,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
    },
    premiumImagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    cameraIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    premiumImageLabel: {
        fontSize: 12,
        fontWeight: '900',
        color: '#475569',
        letterSpacing: 1,
    },
    premiumImageSub: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '500',
    },
    selectedImage: {
        width: '100%',
        height: '100%',
    },
    premiumPublishBtn: {
        height: 60,
        borderRadius: 20,
        backgroundColor: '#1E3A8A',
        marginTop: 12,
        shadowColor: '#1E3A8A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    premiumPublishBtnText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#fff',
    },
    moreOptionsBtn: {
        padding: 4,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
    },
    ownerActions: {
        flexDirection: 'row',
        gap: 8,
        marginLeft: 8,
    },
    miniActionBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    recentCommentsSection: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 12,
    },
    miniCommentRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'flex-start',
    },
    miniCommentBubble: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderTopLeftRadius: 2,
    },
    miniCommentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    miniCommentAuthor: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1e293b',
    },
    miniCommentTime: {
        fontSize: 10,
        color: '#94a3b8',
    },
    miniCommentBody: {
        fontSize: 13,
        color: '#475569',
        lineHeight: 18,
    },
    viewMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
        paddingVertical: 4,
    },
    viewMoreText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#197fe6',
    },
    typeSelectorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    typeOption: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: '#f8fafc',
        borderWidth: 1.5,
        borderColor: '#f1f5f9',
    },
    typeOptionText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748b',
    },
    modalScrollContent: {
        flexGrow: 1,
    },
});
