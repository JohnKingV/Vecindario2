import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Avatar from './Avatar';
import ResilientImage from './ResilientImage';

const PostCard = React.memo(({
    item,
    user,
    userProfile,
    theme,
    isDark,
    typeConfig,
    onPress,
    onLike,
    onMoreOptions,
    onUserProfilePress,
    formatDate
}) => {
    const config = typeConfig[item.tipo?.toLowerCase()] || typeConfig.evento;
    const isOwner = item.user_id === user?.id;
    const isAdmin = userProfile?.role === 'admin';
    const authorProfile = isOwner ? userProfile : item.profiles;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={[styles.postCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
        >
            <View style={[styles.cardTypeStrip, { backgroundColor: config.color }]} />
            <View style={[styles.postCardHeader, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity
                    style={styles.authorRow}
                    onPress={onUserProfilePress}
                >
                    <Avatar
                        uri={authorProfile?.foto_url}
                        name={authorProfile?.nombre}
                        size="md"
                        status={authorProfile?.status}
                    />
                    <View>
                        <Text style={[styles.authorName, { color: theme.colors.text }]}>
                            {authorProfile?.nombre || (authorProfile?.sexo === 'mujer' ? 'Vecina' : 'Vecino')}
                        </Text>
                        {authorProfile?.raiting_ventas >= 4.0 && (
                            <View style={styles.featuredRow}>
                                <MaterialCommunityIcons name="star" size={14} color="#fb923c" />
                                <Text style={styles.featuredText}>Vecino destacado</Text>
                            </View>
                        )}
                        <Text style={[styles.postTime, { color: theme.colors.textSecondary }]}>{formatDate(item.created_at)}</Text>
                    </View>
                </TouchableOpacity>
                <View style={[styles.typeBadge, { backgroundColor: config.bgColor, borderColor: isDark ? config.bgColor : config.color + '20' }]}>
                    <Text style={[styles.typeBadgeText, { color: config.color }]}>
                        {config.label.toUpperCase()}
                    </Text>
                </View>
                {(isOwner || isAdmin) && (
                    <TouchableOpacity
                        onPress={onMoreOptions}
                        style={[styles.moreOptionsBtn, { backgroundColor: theme.colors.inputBackground }]}
                    >
                        <MaterialCommunityIcons name="dots-vertical" size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.postContent}>
                {item.titulo && <Text style={[styles.postTitle, { color: theme.colors.text }]}>{item.titulo}</Text>}
                <Text style={[styles.postBody, { color: theme.colors.textSecondary }]}>{item.contenido}</Text>
                {item.imagen_url && (
                    <ResilientImage
                        source={{ uri: item.imagen_url }}
                        style={styles.postImage}
                        resizeMode="cover"
                    />
                )}
            </View>

            <View style={[styles.postActions, { borderTopColor: theme.colors.border }]}>
                <View style={styles.actionLeft}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={onLike}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons
                            name={item.has_liked ? "heart" : "heart-outline"}
                            size={22}
                            color={item.has_liked ? "#ef4444" : theme.colors.textSecondary}
                        />
                        <Text style={[styles.actionText, { color: theme.colors.textSecondary }, item.has_liked && { color: '#ef4444' }]}>
                            {item.likes_count || 0}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={onPress}
                    >
                        <MaterialCommunityIcons name="chat-outline" size={22} color={theme.colors.textSecondary} />
                        <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>
                            {item.comentarios_count || 0}
                        </Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.actionBtn}>
                    <MaterialCommunityIcons name="share-variant-outline" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Vista previa de comentarios recientes */}
            {item.recent_comments && item.recent_comments.length > 0 && (
                <View style={styles.recentCommentsSection}>
                    {item.recent_comments.map((comment) => {
                        const isCommentOwner = comment.user_id === user?.id;
                        const commentProfile = isCommentOwner ? userProfile : comment.profiles;

                        return (
                            <View key={comment.id} style={styles.miniCommentRow}>
                                <Avatar
                                    uri={commentProfile?.foto_url}
                                    name={commentProfile?.nombre}
                                    size="sm"
                                />
                                <View style={[styles.miniCommentBubble, { backgroundColor: theme.colors.inputBackground }]}>
                                    <View style={styles.miniCommentHeader}>
                                        <Text style={[styles.miniCommentAuthor, { color: theme.colors.text }]}>{commentProfile?.nombre}</Text>
                                        <Text style={[styles.miniCommentTime, { color: theme.colors.textSecondary }]}>{formatDate(comment.created_at)}</Text>
                                    </View>
                                    <Text style={[styles.miniCommentBody, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                                        {comment.contenido}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}

                    {item.comentarios_count > 3 && (
                        <TouchableOpacity
                            style={styles.viewMoreBtn}
                            onPress={onPress}
                        >
                            <Text style={[styles.viewMoreText, { color: theme.colors.primary }]}>
                                Ver los {item.comentarios_count - 3} comentarios restantes
                            </Text>
                            <MaterialCommunityIcons name="chevron-right" size={16} color={theme.colors.primary} />
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    postCard: {
        marginBottom: 16,
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    cardTypeStrip: {
        height: 4,
        width: '100%',
    },
    postCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    authorName: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    featuredRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    featuredText: {
        fontSize: 10,
        color: '#fb923c',
        fontWeight: 'bold',
    },
    postTime: {
        fontSize: 11,
    },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 1,
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    moreOptionsBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    postContent: {
        padding: 16,
    },
    postTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    postBody: {
        fontSize: 15,
        lineHeight: 22,
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        marginTop: 12,
    },
    postActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
    },
    actionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
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
    },
    recentCommentsSection: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
    },
    miniCommentRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'flex-start',
    },
    miniCommentBubble: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    miniCommentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    miniCommentAuthor: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    miniCommentTime: {
        fontSize: 10,
    },
    miniCommentBody: {
        fontSize: 13,
    },
    viewMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    viewMoreText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
});

export default PostCard;
