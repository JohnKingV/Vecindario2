import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    Dimensions,
    StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Badge, Input, Card, LoadingSpinner, ConfirmModal, OptionsModal, ResilientImage } from '../../components';
import { postsService } from '../../services/postsService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

const getTypeConfig = (isDark) => ({
    aviso: { label: 'Avisos', color: '#16a34a', bgColor: isDark ? 'rgba(22, 163, 74, 0.15)' : '#f0fdf4' },
    alerta: { label: 'Seguridad', color: '#ef4444', bgColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2' },
    pregunta: { label: 'Comunicados', color: '#135bec', bgColor: isDark ? 'rgba(19, 91, 236, 0.15)' : '#f0f4ff' },
    evento: { label: 'Eventos', color: '#197fe6', bgColor: isDark ? 'rgba(25, 127, 230, 0.15)' : '#f0f6ff' }
});

export default function PostDetailScreen({ route, navigation }) {
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();
    const { post } = route.params;
    const { profile } = useAuth();
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const flatListRef = useRef(null);
    const { commentId } = route.params;

    useEffect(() => {
        loadComments();
    }, []);

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

    const handleToggleLikeComment = async (commentId) => {
        if (!profile) return;

        // Optimistic update
        const updatedComments = comments.map(c => {
            if (c.id === commentId) {
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

        const { error } = await postsService.toggleCommentLike(commentId, profile.id);
        if (error) {
            console.error('[PostDetail] Error toggling comment like:', error);
            // Revert on error
            loadComments();
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

    const renderHeader = useMemo(() => {
        const config = (getTypeConfig(isDark))[post.tipo?.toLowerCase()] || getTypeConfig(isDark).evento;

        return (
            <View style={[styles.postContentContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={[styles.cardTypeStrip, { backgroundColor: config.color }]} />
                <View style={[styles.headerInner, { padding: 24, paddingBottom: 0 }]}>
                    <View style={styles.authorRow}>
                        <Avatar
                            uri={post.profiles?.foto_url}
                            name={post.profiles?.nombre}
                            size="lg"
                            border
                            status={post.profiles?.status}
                        />
                        <View style={styles.authorInfo}>
                            <Text style={[styles.authorName, { color: theme.colors.text }]}>{post.profiles?.nombre}</Text>
                            <Text style={[styles.authorMeta, { color: theme.colors.textSecondary }]}>
                                DEPTO {post.profiles?.depto} • {formatDate(post.created_at)}
                            </Text>
                        </View>
                        <View style={[styles.typeBadge, { backgroundColor: config.bgColor, borderColor: isDark ? config.bgColor : config.color + '20' }]}>
                            <Text style={[styles.typeBadgeText, { color: config.color }]}>
                                {config.label.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
                    <Text style={[styles.postTitle, { color: theme.colors.text }]}>{post.titulo}</Text>
                    <Text style={[styles.postBodyText, { color: theme.colors.textSecondary }]}>{post.contenido}</Text>

                    {post.imagen_url && (
                        <View style={[styles.imageWrapper, { backgroundColor: theme.colors.inputBackground }]}>
                            <ResilientImage
                                source={{ uri: post.imagen_url }}
                                style={styles.postImage}
                                resizeMode="cover"
                            />
                        </View>
                    )}

                    <View style={[styles.commentsSeparator, { borderTopColor: theme.colors.border }]}>
                        <Text style={[styles.commentsLabel, { color: theme.colors.textSecondary }]}>COMENTARIOS ({comments.length})</Text>
                    </View>
                </View>
            </View>
        );
    }, [post, comments.length, isDark, theme.colors]);

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style={[styles.navBar, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.navBack, { backgroundColor: theme.colors.inputBackground }]}>
                        <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text numberOfLines={1} style={[styles.navTitle, { color: theme.colors.text }]}>Publicación</Text>
                    {(post.user_id === profile?.id || profile?.role === 'admin') && (
                        <TouchableOpacity onPress={() => setShowOptionsModal(true)} style={[styles.navDelete, { backgroundColor: theme.colors.error + '20' }]}>
                            <MaterialCommunityIcons name="dots-vertical" size={24} color={theme.colors.error} />
                        </TouchableOpacity>
                    )}
                </View>

                <FlatList
                    data={comments}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={renderHeader}
                    renderItem={({ item }) => (
                        <View style={[
                            styles.commentItem,
                            item.id === commentId && { backgroundColor: isDark ? 'rgba(19, 127, 230, 0.15)' : '#f0f7ff', borderRadius: 12 }
                        ]}>
                            <Avatar
                                uri={item.profiles?.foto_url}
                                name={item.profiles?.nombre}
                                size="sm"
                            />
                            <View style={styles.commentTextContainer}>
                                <View style={[
                                    styles.commentBubble,
                                    { backgroundColor: theme.colors.inputBackground },
                                    item.id === commentId && { borderColor: theme.colors.primary, borderWidth: 1 }
                                ]}>
                                    <Text style={[styles.commentAuthor, { color: theme.colors.text }]}>{item.profiles?.nombre}</Text>
                                    <Text style={[styles.commentBody, { color: theme.colors.textSecondary }]}>{item.contenido}</Text>
                                </View>
                                <View style={styles.commentMetaRow}>
                                    <Text style={[styles.commentTime, { color: theme.colors.textSecondary }]}>{formatDate(item.created_at)}</Text>
                                    <View style={styles.commentActions}>
                                        <TouchableOpacity
                                            style={styles.commentActionBtn}
                                            onPress={() => handleToggleLikeComment(item.id)}
                                        >
                                            <MaterialCommunityIcons
                                                name={item.has_liked ? "heart" : "heart-outline"}
                                                size={14}
                                                color={item.has_liked ? theme.colors.error : theme.colors.textSecondary}
                                            />
                                            {item.likes_count > 0 && (
                                                <Text style={[styles.commentActionText, { color: item.has_liked ? theme.colors.error : theme.colors.textSecondary }]}>
                                                    {item.likes_count}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}
                    onScrollToIndexFailed={(info) => {
                        const wait = new Promise(resolve => setTimeout(resolve, 500));
                        wait.then(() => {
                            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                        });
                    }}
                    ref={flatListRef}
                    initialNumToRender={20}
                    removeClippedSubviews={false} // Mantener renders para asegurar posicionamiento
                    getItemLayout={(data, index) => ({
                        length: 100, // Altura estimada de un comentario
                        offset: 100 * index + 400, // 400 es un estimado de la cabecera
                        index,
                    })}
                    contentContainerStyle={styles.listContent}
                    style={{ flex: 1 }}
                    ListEmptyComponent={loading ? <LoadingSpinner /> : (
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No hay comentarios aún. ¡Sé el primero!</Text>
                        </View>
                    )}
                />

                <View style={[styles.commentInputRow, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
                    <Input
                        placeholder="Escribe un comentario..."
                        value={comment}
                        onChangeText={setComment}
                        containerStyle={styles.commentInputContainer}
                        style={[
                            styles.commentInput,
                            {
                                backgroundColor: theme.colors.inputBackground,
                                borderColor: theme.colors.border,
                                color: theme.colors.text
                            }
                        ]}
                        placeholderTextColor={theme.colors.placeholder}
                        inputStyle={{ color: theme.colors.text }}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleAddComment}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="send" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <OptionsModal
                    visible={showOptionsModal}
                    onClose={() => setShowOptionsModal(false)}
                    title="Opciones"
                    options={[
                        {
                            label: 'Eliminar publicación',
                            icon: 'trash-can-outline',
                            onPress: handleDeletePost,
                            destructive: true
                        }
                    ]}
                />

                <ConfirmModal
                    visible={showDeleteModal}
                    onClose={() => !isDeleting && setShowDeleteModal(false)}
                    onConfirm={confirmDelete}
                    title="Eliminar Publicación"
                    message="¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer."
                    confirmText={isDeleting ? "Eliminando..." : "Eliminar"}
                    type="danger"
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    navBack: {
        width: 40,
        height: 40,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    backIcon: {
        fontSize: 20,
        color: '#64748b',
        fontWeight: '900',
    },
    navTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
        flex: 1,
    },
    navDelete: {
        width: 40,
        height: 40,
        backgroundColor: '#fef2f2',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 120,
    },
    postContentContainer: {
        backgroundColor: '#fff',
        borderRadius: 32,
        marginHorizontal: 16,
        marginTop: 16,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        ...Platform.select({
            web: { boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.04)' },
            default: {
                shadowColor: '#64748b',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
                elevation: 5,
            }
        }),
    },
    cardTypeStrip: {
        height: 6,
        width: '100%',
    },
    headerInner: {
        // padding logic inside component
    },
    typeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    authorInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    authorName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0f172a',
    },
    authorMeta: {
        fontSize: 11,
        fontWeight: '900',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 2,
    },
    postTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -1,
        lineHeight: 36,
        marginBottom: 16,
    },
    postBodyText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#475569',
        lineHeight: 26,
        marginBottom: 24,
    },
    imageWrapper: {
        width: '100%',
        height: 320,
        borderRadius: 32,
        overflow: 'hidden',
        marginBottom: 32,
        backgroundColor: '#f1f5f9',
    },
    postImage: {
        width: '100%',
        height: '100%',
    },
    commentsSeparator: {
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 32,
        marginBottom: 24,
    },
    commentsLabel: {
        fontSize: 12,
        fontWeight: '900',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    commentItem: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    commentTextContainer: {
        flex: 1,
    },
    commentBubble: {
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 24,
        borderTopLeftRadius: 4,
    },
    commentAuthor: {
        fontSize: 12,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 4,
    },
    commentBody: {
        fontSize: 15,
        fontWeight: '500',
        color: '#475569',
        lineHeight: 22,
    },
    commentTime: {
        fontSize: 10,
        fontWeight: '800',
        color: '#cbd5e1',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    commentMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginLeft: 4,
        gap: 16,
    },
    commentActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    commentActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    commentActionText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        color: '#94a3b8',
        fontWeight: '500',
        textAlign: 'center',
    },
    commentInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 40 : 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        gap: 12,
    },
    commentInputContainer: {
        flex: 1,
        marginBottom: 0,
    },
    commentInput: {
        fontSize: 15,
    },
    sendButton: {
        width: 52,
        height: 52,
        backgroundColor: '#1E3A8A',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#1E3A8A',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
    },
    sendIcon: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
});
