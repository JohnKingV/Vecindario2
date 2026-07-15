import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    StatusBar,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Input, LoadingSpinner, ConfirmModal, OptionsModal, ResilientImage } from '../../../components';
import { usePostDetailScreen } from './usePostDetailScreen';

export default function PostDetailScreenNative({ route, navigation }) {
    const logic = usePostDetailScreen(route, navigation);
    const { theme, isDark, postData: post } = logic;

    const renderHeader = useMemo(() => {
        const config = (logic.getTypeConfig(isDark))[post.tipo?.toLowerCase()] || logic.getTypeConfig(isDark).evento;

        return (
            <View style={[styles.postContentContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={[styles.cardTypeStrip, { backgroundColor: config.color }]} />
                <View style={[styles.headerInner, { padding: 24, paddingBottom: 0 }]}>
                    <TouchableOpacity
                        style={styles.authorRow}
                        onPress={() => logic.handleUserProfilePress(post.profiles)}
                    >
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
                    </TouchableOpacity>
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

                    <View style={styles.postInteractions}>
                        <TouchableOpacity
                            style={styles.interactionBtn}
                            onPress={logic.handleToggleLikePost}
                            onLongPress={logic.handleShowLikes}
                            delayLongPress={300}
                        >
                            <MaterialCommunityIcons
                                name={post.has_liked ? "heart" : "heart-outline"}
                                size={28}
                                color={post.has_liked ? "#FFA500" : theme.colors.textSecondary}
                            />
                            <Text style={[styles.interactionText, { color: theme.colors.text, fontWeight: '800' }]}>
                                {post.likes_count || 0} Likes
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.interactionBtn}>
                            <MaterialCommunityIcons name="comment-outline" size={24} color={theme.colors.textSecondary} />
                            <Text style={[styles.interactionText, { color: theme.colors.textSecondary }]}>
                                {logic.comments.length} Comentarios
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.commentsSeparator, { borderTopColor: theme.colors.border }]}>
                        <Text style={[styles.commentsLabel, { color: theme.colors.textSecondary }]}>COMENTARIOS</Text>
                    </View>
                </View>
            </View>
        );
    }, [post, logic.comments.length, isDark, theme.colors]);

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
                        <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text numberOfLines={1} style={[styles.navTitle, { color: theme.colors.text }]}>Publicación</Text>
                    {(post.user_id === logic.profile?.id || logic.profile?.role === 'admin') && (
                        <TouchableOpacity onPress={() => logic.setShowOptionsModal(true)} style={[styles.navDelete, { backgroundColor: theme.colors.error + '20' }]}>
                            <MaterialCommunityIcons name="dots-vertical" size={24} color={theme.colors.error} />
                        </TouchableOpacity>
                    )}
                </View>

                <FlatList
                    data={logic.comments}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={renderHeader}
                    renderItem={({ item }) => (
                        <View style={[
                            styles.commentItem,
                            item.id === logic.commentId && { backgroundColor: isDark ? 'rgba(19, 127, 230, 0.15)' : '#f0f7ff', borderRadius: 12 }
                        ]}>
                            <TouchableOpacity onPress={() => logic.handleUserProfilePress(item.profiles)}>
                                <Avatar
                                    uri={item.profiles?.foto_url}
                                    name={item.profiles?.nombre}
                                    size="sm"
                                />
                            </TouchableOpacity>
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
                                            onLongPress={() => logic.handleShowCommentLikes(item.id)}
                                            delayLongPress={300}
                                        >
                                            <MaterialCommunityIcons
                                                name={item.has_liked ? "heart" : "heart-outline"}
                                                size={14}
                                                color={item.has_liked ? "#FFA500" : theme.colors.textSecondary}
                                            />
                                            {item.likes_count > 0 && (
                                                <Text style={[styles.commentActionText, { color: item.has_liked ? "#FFA500" : theme.colors.textSecondary }]}>
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
                            logic.flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                        });
                    }}
                    ref={logic.flatListRef}
                    initialNumToRender={20}
                    removeClippedSubviews={false}
                    getItemLayout={(data, index) => ({
                        length: 100,
                        offset: 100 * index + 400,
                        index,
                    })}
                    contentContainerStyle={styles.listContent}
                    style={{ flex: 1 }}
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
                        inputStyle={{ color: theme.colors.text }}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
                        onPress={logic.handleAddComment}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="send" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

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
                    message="¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer."
                    confirmText={logic.isDeleting ? "Eliminando..." : "Eliminar"}
                    type="danger"
                />

                <OptionsModal
                    visible={logic.showLikesModal}
                    onClose={() => logic.setShowLikesModal(false)}
                    title="Vecinos que les gusta"
                >
                    <View style={{ maxHeight: 400, paddingBottom: 24 }}>
                        {logic.loadingLikes ? (
                            <LoadingSpinner />
                        ) : logic.likesList.length > 0 ? (
                            <FlatList
                                data={logic.likesList}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.likeUserItem}
                                        onPress={() => {
                                            logic.setShowLikesModal(false);
                                            navigation.navigate('UserProfile', { userId: item.id, userProfile: item });
                                        }}
                                    >
                                        <Avatar uri={item.foto_url} name={item.nombre} size="sm" />
                                        <View>
                                            <Text style={[styles.likeUserName, { color: theme.colors.text }]}>{item.nombre}</Text>
                                            <Text style={[styles.likeUserDepto, { color: theme.colors.textSecondary }]}>DEPTO {item.depto}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        ) : (
                            <Text style={{ textAlign: 'center', padding: 20, color: theme.colors.textSecondary }}>Aún no hay likes</Text>
                        )}
                    </View>
                </OptionsModal>
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
        width: 44,
        height: 44,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
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
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
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
    postInteractions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        marginBottom: 24,
        paddingTop: 8,
    },
    interactionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    interactionText: {
        fontSize: 16,
        fontWeight: '600',
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
        paddingBottom: 80,
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
    likeUserItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    likeUserName: {
        fontSize: 16,
        fontWeight: '700',
    },
    likeUserDepto: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
});
