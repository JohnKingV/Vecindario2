import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Input, LoadingSpinner, ConfirmModal, OptionsModal, ResilientImage, ResponsiveContainer, PremiumHeader } from '../../../components';
import { usePostDetailScreen } from './usePostDetailScreen';

export default function PostDetailScreenWeb({ route, navigation }) {
    const logic = usePostDetailScreen(route, navigation);
    const { theme, isDark, post } = logic;

    const renderHeader = useMemo(() => {
        const config = (logic.getTypeConfig(isDark))[post.tipo?.toLowerCase()] || logic.getTypeConfig(isDark).evento;

        return (
            <View style={[styles.postContentContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={[styles.cardTypeStrip, { backgroundColor: config.color }]} />
                <View style={[styles.headerInner, { padding: 32 }]}>
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
                                DEPTO {post.profiles?.depto} • {logic.formatDate(post.created_at)}
                            </Text>
                        </View>
                        <View style={[styles.typeBadge, { backgroundColor: config.bgColor, borderColor: isDark ? config.bgColor : config.color + '20' }]}>
                            <Text style={[styles.typeBadgeText, { color: config.color }]}>
                                {config.label.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.postTitle, { color: theme.colors.text }]}>{post.titulo}</Text>
                    <Text style={[styles.postBodyText, { color: theme.colors.textSecondary }]}>{post.contenido}</Text>

                    {post.imagen_url && (
                        <View style={styles.imageWrapper}>
                            <ResilientImage
                                source={{ uri: post.imagen_url }}
                                style={styles.postImage}
                                resizeMode="cover"
                            />
                        </View>
                    )}

                    <View style={[styles.commentsSeparator, { borderTopColor: theme.colors.border }]}>
                        <Text style={[styles.commentsLabel, { color: theme.colors.textSecondary }]}>COMENTARIOS ({logic.comments.length})</Text>
                    </View>
                </View>
            </View>
        );
    }, [post, logic.comments.length, isDark, theme.colors]);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <PremiumHeader navigation={navigation} activeTab="INICIO" />
            <View style={[styles.navBar, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
                <ResponsiveContainer>
                    <View style={styles.navBarContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.navBack, { backgroundColor: theme.colors.inputBackground }]}>
                            <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.text} />
                        </TouchableOpacity>
                        <Text numberOfLines={1} style={[styles.navTitle, { color: theme.colors.text }]}>Detalle de Publicación</Text>
                        {(post.user_id === logic.profile?.id || logic.profile?.role === 'admin') && (
                            <TouchableOpacity onPress={() => logic.setShowOptionsModal(true)} style={[styles.navDelete, { backgroundColor: theme.colors.error + '20' }]}>
                                <MaterialCommunityIcons name="dots-vertical" size={24} color={theme.colors.error} />
                            </TouchableOpacity>
                        )}
                    </View>
                </ResponsiveContainer>
            </View>

            <ResponsiveContainer>
                <FlatList
                    data={logic.comments}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={renderHeader}
                    renderItem={({ item }) => (
                        <View style={[
                            styles.commentItem,
                            item.id === logic.commentId && { backgroundColor: isDark ? 'rgba(19, 127, 230, 0.15)' : '#f0f7ff', borderRadius: 12 }
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
                                    item.id === logic.commentId && { borderColor: theme.colors.primary, borderWidth: 1 }
                                ]}>
                                    <Text style={[styles.commentAuthor, { color: theme.colors.text }]}>{item.profiles?.nombre}</Text>
                                    <Text style={[styles.commentBody, { color: theme.colors.textSecondary }]}>{item.contenido}</Text>
                                </View>
                                <View style={styles.commentMetaRow}>
                                    <Text style={[styles.commentTime, { color: theme.colors.textSecondary }]}>{logic.formatDate(item.created_at)}</Text>
                                    <View style={styles.commentActions}>
                                        <TouchableOpacity
                                            style={styles.commentActionBtn}
                                            onPress={() => logic.handleToggleLikeComment(item.id)}
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
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={logic.loading ? <LoadingSpinner /> : (
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No hay comentarios aún. ¡Sé el primero!</Text>
                        </View>
                    )}
                />

                <View style={[styles.commentInputRow, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
                    <Input
                        placeholder="Escribe un comentario..."
                        value={logic.comment}
                        onChangeText={logic.setComment}
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
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
                        onPress={logic.handleAddComment}
                    >
                        <MaterialCommunityIcons name="send" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </ResponsiveContainer>

            <OptionsModal
                visible={logic.showOptionsModal}
                onClose={() => logic.setShowOptionsModal(false)}
                title="Opciones"
                options={[
                    {
                        label: 'Eliminar publicación',
                        icon: 'trash-can-outline',
                        onPress: logic.handleDeletePost,
                        destructive: true
                    }
                ]}
            />
            <ConfirmModal
                visible={logic.showDeleteModal}
                onClose={() => !logic.isDeleting && logic.setShowDeleteModal(false)}
                onConfirm={logic.confirmDelete}
                title="Eliminar Publicación"
                message="¿Estás seguro de que quieres eliminar esta publicación?"
                confirmText={logic.isDeleting ? "Eliminando..." : "Eliminar"}
                type="danger"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: '100%',
    },
    navBar: {
        borderBottomWidth: 1,
        paddingVertical: 16,
    },
    navBarContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    navBack: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        cursor: 'pointer',
    },
    navTitle: {
        fontSize: 18,
        fontWeight: '900',
        flex: 1,
    },
    navDelete: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
    },
    listContent: {
        paddingBottom: 120,
    },
    postContentContainer: {
        borderRadius: 32,
        marginTop: 24,
        marginBottom: 24,
        marginHorizontal: 0,
        overflow: 'hidden',
        borderWidth: 1,
        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.05)',
    },
    cardTypeStrip: {
        height: 6,
        width: '100%',
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
        gap: 16,
        marginBottom: 24,
    },
    authorInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    authorName: {
        fontSize: 20,
        fontWeight: '800',
    },
    authorMeta: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 4,
    },
    postTitle: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1,
        lineHeight: 40,
        marginBottom: 16,
    },
    postBodyText: {
        fontSize: 18,
        fontWeight: '400',
        lineHeight: 30,
        marginBottom: 32,
    },
    imageWrapper: {
        width: '100%',
        height: 500,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 40,
        backgroundColor: '#f1f5f9',
    },
    postImage: {
        width: '100%',
        height: '100%',
    },
    commentsSeparator: {
        borderTopWidth: 1,
        paddingTop: 32,
        marginBottom: 24,
    },
    commentsLabel: {
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    commentItem: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    commentTextContainer: {
        flex: 1,
    },
    commentBubble: {
        padding: 20,
        borderRadius: 20,
        borderTopLeftRadius: 4,
    },
    commentAuthor: {
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 6,
    },
    commentBody: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
    },
    commentTime: {
        fontSize: 11,
        fontWeight: '800',
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
        gap: 6,
        cursor: 'pointer',
    },
    commentActionText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 60,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '500',
    },
    commentInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        borderTopWidth: 1,
        gap: 16,
    },
    commentInputContainer: {
        flex: 1,
        marginBottom: 0,
    },
    commentInput: {
        fontSize: 16,
        paddingVertical: 16,
    },
    sendButton: {
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
    },
});
