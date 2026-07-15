import { useState, useEffect } from 'react';
import { supabase } from '../../../config/supabase';
import { notificationService } from '../../../services/notificationService';
import { messagesService } from '../../../services/messagesService';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useNotificationsScreen = (navigation) => {
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
                            navigation.navigate('MainTabs', { screen: 'Home' });
                        }
                    }
                    break;

                case 'item':
                    if (metadata.id) {
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

                case 'package':
                    navigation.navigate('Residencial', { screen: 'LogisticsHub' });
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
    const flatData = [
        ...(groupedData.hoy.length ? [{ type: 'header', title: 'Hoy' }, ...groupedData.hoy] : []),
        ...(groupedData.ayer.length ? [{ type: 'header', title: 'Ayer' }, ...groupedData.ayer] : []),
        ...(groupedData.semana.length ? [{ type: 'header', title: 'Esta semana' }, ...groupedData.semana] : []),
    ];

    return {
        // State
        notifications,
        loading,
        refreshing,

        // Data
        groupedData,
        flatData,

        // Utils
        theme,
        isDark,
        insets,
        formatTime,

        // Handlers
        onRefresh,
        handleMarkAllRead,
        handlePressNotification
    };
};
