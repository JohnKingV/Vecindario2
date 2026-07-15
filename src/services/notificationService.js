import * as Notifications from 'expo-notifications';
import { supabase } from '../config/supabase';
import { Platform } from 'react-native';

export const notificationService = {
    // Inicialización global
    init: async () => {
        if (Platform.OS === 'web') return; // Skip notification setup on web by default to avoid browser permission issues in dev

        try {
            // Configurar cómo se muestran las notificaciones cuando la app está abierta
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: true,
                }),
            });

            // Solicitar permisos inicialmente
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== 'granted') {
                await Notifications.requestPermissionsAsync();
            }
        } catch (error) {
            console.warn('[notificationService] initialization failed:', error);
        }
    },

    // Obtener token de Expo
    getPushToken: async () => {
        if (Platform.OS === 'web') return null;

        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.warn('[notificationService] push permission not granted');
                return null;
            }

            // El token de Expo requiere el projectId configurado en app.json
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log('[notificationService] Token obtenido:', token);
            return token;
        } catch (error) {
            console.error('[notificationService] error getting push token:', error);
            return null;
        }
    },

    // Permisos nativos
    requestPermissions: async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        return status;
    },

    // Obtener notificaciones desde Supabase
    getNotifications: async (userId) => {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        return { data, error };
    },

    // Marcar como leída
    markAsRead: async (notificationId) => {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId);

        return { error };
    },

    // Marcar todas como leídas
    markAllAsRead: async (userId) => {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('read', false);

        return { error };
    },

    // Suscribirse a cambios en tiempo real
    subscribeToNotifications: (userId, callback) => {
        return supabase
            .channel(`notifications:user_id=eq.${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => callback(payload.new)
            )
            .subscribe();
    },

    // Enviar notificación local
    sendLocalNotification: async (title, body, data = {}) => {
        if (Platform.OS === 'web') return;

        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: true,
                },
                trigger: null, // Envío inmediato
            });
        } catch (error) {
            console.error('[notificationService] error sending local notification:', error);
        }
    },

    // Eliminar suscripción
    unsubscribe: (subscription) => {
        if (subscription) {
            supabase.removeChannel(subscription);
        }
    }
};
