import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';
import { notificationService } from '../../services/notificationService';
import { messagesService } from '../../services/messagesService';
import { useAuth } from '../../hooks/useAuth';
import { EmptyState } from '../../components';
import { useTheme } from '../../context/ThemeContext';

const NotificationIcon = ({ type }) => {
    switch (type) {
        case 'post':
        case 'security':
            return (
                <View style={[styles.iconContainer, { backgroundColor: '#e0f2fe' }]}>
                    <MaterialCommunityIcons name="bullhorn-outline" size={24} color="#0ea5e9" />
                </View>
            );
        case 'item':
        case 'marketplace':
            return (
                <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4' }]}>
                    <MaterialCommunityIcons name="storefront-outline" size={24} color="#22c55e" />
                </View>
            );
        case 'comment':
            return (
                <View style={[styles.iconContainer, { backgroundColor: '#f3e8ff' }]}>
                    <MaterialCommunityIcons name="chat-outline" size={24} color="#a855f7" />
                </View>
            );
        case 'like':
        case 'comment_like':
            return (
                <View style={[styles.iconContainer, { backgroundColor: '#fef2f2' }]}>
                    <MaterialCommunityIcons name="heart-outline" size={24} color="#ef4444" />
                </View>
            );
        case 'chat':
            return (
                <View style={[styles.iconContainer, { backgroundColor: '#f1f5f9' }]}>
                    <MaterialCommunityIcons name="message-text-outline" size={24} color="#64748b" />
                </View>
            );
        default:
            return (
                <View style={[styles.iconContainer, { backgroundColor: '#f1f5f9' }]}>
                    <MaterialCommunityIcons name="bell-outline" size={24} color="#64748b" />
                </View>
            );
    }
};

export default function NotificationsScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { theme, isDark } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (user) {
            loadNotifications();

            const subscription = notificationService.subscribeToNotifications(user.id, (newNotif) => {
                setNotifications(prev => [newNotif, ...prev]);
            });

            return () => notificationService.unsubscribe(subscription);
        }
    }, [user]);

    const loadNotifications = async () => {
        const { data, error } = await notificationService.getNotifications(user.id);
        if (!error) setNotifications(data);
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    };

    const handleMarkAllRead = async () => {
        const { error } = await notificationService.markAllAsRead(user.id);
        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    const handlePressNotification = async (item) => {
        if (!item.read) {
            notificationService.markAsRead(item.id);
            setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
        }

        const metadata = item.data || {};
        const type = item.type;

        try {
            switch (type) {
                case 'comment':
                case 'comment_like':
                case 'like':
                case 'post':
                    if (metadata.post_id) {
                        const { data: postData } = await supabase
                            .from('posts')
                            .select(`
                                *,
                                profiles:user_id (
                                    id, nombre, foto_url, depto, sexo
                                )
                            `)
                            .eq('id', metadata.post_id)
                            .single();

                        if (postData) {
                            navigation.navigate('PostDetail', {
                                post: postData,
                                commentId: (type === 'comment' || type === 'comment_like') ? metadata.comment_id : null
                            });
                        } else {
                            // Fallback al feed si el post no existe (borrado)
                            navigation.navigate('MainTabs', { screen: 'Home' });
                        }
                    }
                    break;

                case 'item':
                    if (metadata.id) {
                        // Para items, necesitamos el objeto item completo para ItemDetail
                        // Podríamos hacer un fetch aquí
                        const { data: itemData } = await supabase
                            .from('items')
                            .select('*, profiles:user_id(*)')
                            .eq('id', metadata.id)
                            .single();

                        if (itemData) {
                            navigation.navigate('ItemDetail', { item: itemData });
                        }
                    }
                    break;

                case 'chat':
                case 'message':
                    if (metadata.from_user_id) {
                        const { data: conv } = await messagesService.getOrCreateConversation(user.id, metadata.from_user_id);
                        if (conv) {
                            // Obtener datos del otro usuario para el header del chat
                            const { data: otherProfile } = await supabase
                                .from('profiles')
                                .select('*')
                                .eq('id', metadata.from_user_id)
                                .single();

                            navigation.navigate('Chat', {
                                conversation: {
                                    id: conv.id,
                                    name: otherProfile?.nombre || 'Vecino',
                                    avatar: otherProfile?.foto_url,
                                    sexo: otherProfile?.sexo,
                                    otherId: metadata.from_user_id
                                }
                            });
                        }
                    }
                    break;

                default:
                    console.log('Tipo de notificación no manejado para navegación:', type);
                    break;
            }
        } catch (error) {
            console.error('Error navegando desde notificación:', error);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHrs = Math.floor(diffMins / 60);

        if (diffMins < 60) return `${diffMins} min`;
        if (diffHrs < 24) return `${diffHrs} h`;
        return date.toLocaleDateString('es-ES', { weekday: 'short' });
    };

    const groupNotifications = (data) => {
        const groups = { hoy: [], ayer: [], semana: [] };
        const now = new Date();

        if (!data || !Array.isArray(data)) return groups;

        data.forEach(n => {
            const date = new Date(n.created_at);
            const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) groups.hoy.push(n);
            else if (diffDays === 1) groups.ayer.push(n);
            else groups.semana.push(n);
        });

        return groups;
    };

    const groupedData = groupNotifications(notifications);

    const renderHeader = (
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
            <View style={styles.headerTop}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backBtn, { backgroundColor: theme.colors.inputBackground }]}
                >
                    <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleMarkAllRead}
                    style={[styles.markReadContainer, { backgroundColor: isDark ? 'rgba(19, 109, 236, 0.2)' : 'rgba(19, 109, 236, 0.08)' }]}
                >
                    <MaterialCommunityIcons name="check-all" size={18} color={theme.colors.primary} style={{ marginRight: 4 }} />
                    <Text style={[styles.markReadBtn, { color: theme.colors.primary }]}>Marcar como leídas</Text>
                </TouchableOpacity>
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Notificaciones</Text>
        </View>
    );

    const renderSectionHeader = (title) => (
        <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>{title.toUpperCase()}</Text>
        </View>
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.notificationItem,
                { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border },
                !item.read && { backgroundColor: isDark ? 'rgba(19, 127, 230, 0.1)' : '#f0f7ff' }
            ]}
            onPress={() => handlePressNotification(item)}
            activeOpacity={0.7}
        >
            {!item.read && <View style={[styles.unreadIndicator, { backgroundColor: theme.colors.primary }]} />}
            <NotificationIcon type={item.type} />
            <View style={styles.contentContainer}>
                <View style={styles.itemHeader}>
                    <Text style={[styles.itemTitle, { color: theme.colors.text }, !item.read && styles.unreadText]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>{formatTime(item.created_at)}</Text>
                </View>
                <Text style={[styles.itemBody, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {item.message}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading && !notifications.length) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#136dec" />
            </View>
        );
    }

    const flatData = [
        ...(groupedData.hoy.length ? [{ type: 'header', title: 'Hoy' }, ...groupedData.hoy] : []),
        ...(groupedData.ayer.length ? [{ type: 'header', title: 'Ayer' }, ...groupedData.ayer] : []),
        ...(groupedData.semana.length ? [{ type: 'header', title: 'Esta semana' }, ...groupedData.semana] : []),
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />

            <FlatList
                data={flatData}
                keyExtractor={(item, index) => item.id || `header-${index}`}
                renderItem={({ item }) => item.type === 'header' ? renderSectionHeader(item.title) : renderItem({ item })}
                ListHeaderComponent={renderHeader}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listPadding}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
                ListEmptyComponent={
                    <EmptyState
                        icon="bell-off-outline"
                        title="Sin notificaciones"
                        message="Te avisaremos cuando suceda algo importante en tu comunidad."
                    />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -1,
    },
    markReadContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(19, 109, 236, 0.08)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    markReadBtn: {
        fontSize: 14,
        color: '#136dec',
        fontWeight: '700',
    },
    sectionHeader: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: '#94a3b8',
        letterSpacing: 2,
    },
    notificationItem: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 18,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    unreadItem: {
        backgroundColor: '#f0f7ff',
    },
    unreadIndicator: {
        position: 'absolute',
        left: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#136dec',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        marginLeft: 16,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0f172a',
        flex: 1,
        marginRight: 8,
        lineHeight: 20,
    },
    unreadText: {
        fontWeight: '900',
    },
    timeText: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
    },
    itemBody: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    listPadding: {
        paddingBottom: 100,
    },
});
