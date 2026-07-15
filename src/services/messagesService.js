import { supabase } from '../config/supabase';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export const messagesService = {
    /**
     * Obtiene la lista de conversaciones del usuario actual.
     * Incluye el último mensaje y los datos del perfil del destinatario.
     */
    async getConversations(userId, showArchived = false) {
        try {
            // Esta consulta asume una vista o una relación que une conversaciones con perfiles
            // Para simplicidad inicial, buscaremos mensajes agrupados por conversación
            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    id,
                    last_message,
                    updated_at,
                    members:conversation_members!inner(user_id, is_archived, is_deleted),
                    participants:conversation_members(
                        profile:profiles(id, nombre, foto_url, status, sexo, raiting_ventas)
                    )
                `)
                .eq('conversation_members.user_id', userId)
                .eq('conversation_members.is_deleted', false)
                .eq('conversation_members.is_archived', !!showArchived)
                .order('updated_at', { ascending: false });

            if (error) throw error;

            // Obtener conteo de no leídos para cada conversación
            const formatted = await Promise.all(data.map(async conv => {
                const otherMember = conv.participants.find(m => m.profile.id !== userId)?.profile;

                // Contar mensajes no leídos donde el remitente no es el usuario actual
                const { count } = await supabase
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('conversation_id', conv.id)
                    .neq('sender_id', userId)
                    .eq('is_read', false);

                // Obtener el ULTIMO mensaje real para tener la hora exacta y el contenido más reciente
                const { data: lastMsg } = await supabase
                    .from('messages')
                    .select('content, created_at, image_url')
                    .eq('conversation_id', conv.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                let lastText = lastMsg?.content || conv.last_message || 'Inicia una conversación';
                // Si el mensaje es una imagen y no tiene texto, mostramos el aviso de cámara
                if (!lastMsg?.content && lastMsg?.image_url) {
                    lastText = '📷 Imagen';
                }

                return {
                    id: conv.id,
                    name: otherMember?.nombre || 'Vecino',
                    avatar: otherMember?.foto_url,
                    status: otherMember?.status,
                    lastMessage: lastText,
                    time: lastMsg?.created_at || conv.updated_at,
                    otherId: otherMember?.id,
                    sexo: otherMember?.sexo,
                    raiting_ventas: otherMember?.raiting_ventas,
                    unreadCount: count || 0
                };
            }));

            // Ordenar por tiempo (el más reciente primero) de forma robusta
            formatted.sort((a, b) => {
                const getTime = (val) => {
                    if (!val) return 0;
                    // Normalizar para asegurar que el motor JS lo trate como UTC si no tiene zona
                    let s = typeof val === 'string' ? val : val.toString();
                    if (!s.includes('T') && s.includes(' ')) s = s.replace(' ', 'T');
                    if (!s.includes('Z') && !s.includes('+')) s += 'Z';
                    return new Date(s).getTime();
                };
                return getTime(b.time) - getTime(a.time);
            });

            return { data: formatted, error: null };
        } catch (error) {
            console.error('[messagesService] getConversations error:', error);
            return { data: null, error };
        }
    },

    /**
     * Obtiene el historial de mensajes de una conversación.
     */
    async getMessages(conversationId) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*, items(*)')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Envía un mensaje.
     */
    async sendMessage(conversationId, senderId, text, itemId = null, imageUrl = null) {
        try {
            const messageData = {
                conversation_id: conversationId,
                sender_id: senderId,
                content: text
            };

            if (itemId) {
                messageData.item_id = itemId;
            }

            if (imageUrl) {
                messageData.image_url = imageUrl;
            }

            const { data, error } = await supabase
                .from('messages')
                .insert([messageData])
                .select('*, items(*)')
                .single();

            if (error) throw error;

            // Actualizar la fecha de la conversación para que suba al inicio de la lista
            // Si hay imagen y no hay texto, poner "📷 Imagen" como last_message
            const lastMessageText = text || '📷 Imagen';

            await supabase
                .from('conversations')
                .update({ updated_at: new Date().toISOString(), last_message: lastMessageText })
                .eq('id', conversationId);

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Sube una imagen para un mensaje.
     */
    async uploadMessageImage(userId, uri) {
        try {
            const fileName = `${userId}/${Date.now()}.jpg`;
            let fileData;

            if (Platform.OS === 'web') {
                const response = await fetch(uri);
                fileData = await response.blob();
            } else {
                const base64 = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64
                });
                fileData = decode(base64);
            }

            // Usamos un bucket llamado 'chat' (asegúrate de que exista)
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('chat')
                .upload(fileName, fileData, {
                    contentType: 'image/jpeg',
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                // Si el bucket 'chat' no existe, intentamos usar 'posts' temporalmente o informamos
                if (uploadError.message === 'Bucket not found') {
                    // Re-intentar con bucket 'posts' que sabemos que existe
                    const { data: retryData, error: retryError } = await supabase.storage
                        .from('posts')
                        .upload(fileName, fileData, {
                            contentType: 'image/jpeg',
                            cacheControl: '3600',
                            upsert: true
                        });

                    if (retryError) throw retryError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('posts')
                        .getPublicUrl(fileName);

                    return { data: publicUrl, error: null };
                }
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('chat')
                .getPublicUrl(fileName);

            return { data: publicUrl, error: null };
        } catch (error) {
            console.error('[messagesService] uploadMessageImage error:', error);
            return { data: null, error };
        }
    },

    /**
     * Actualiza un mensaje (Editar).
     */
    async updateMessage(messageId, senderId, newContent) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .update({ content: newContent, is_edited: true })
                .eq('id', messageId)
                .eq('sender_id', senderId)
                .select()
                .single();

            if (error) {
                if (error.code === 'PGRST204') {
                    error.message = 'Error: Falta la columna "is_edited" en la tabla "messages". Por favor ejecuta el script add_is_edited_to_messages.sql en el SQL Editor de Supabase.';
                }
                throw error;
            }
            return { data, error: null };
        } catch (error) {
            console.error('[messagesService] updateMessage error:', error);
            return { data: null, error };
        }
    },

    /**
     * Elimina un mensaje.
     */
    async deleteMessage(messageId, senderId, isAdmin = false) {
        try {
            let query = supabase.from('messages').delete().eq('id', messageId);

            if (!isAdmin) {
                query = query.eq('sender_id', senderId);
            }

            const { error } = await query;
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('[messagesService] deleteMessage error:', error);
            return { error };
        }
    },

    /**
     * Marca todos los mensajes de una conversación como leídos para el usuario actual.
     */
    async markAsRead(conversationId, userId) {
        try {
            const { error } = await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('conversation_id', conversationId)
                .neq('sender_id', userId)
                .eq('is_read', false);

            if (error) throw error;

            // Al marcar como leído, NO actualizamos updated_at de la conversación principal
            // para no afectar la hora del último mensaje enviado que se muestra en la lista.
            // La suscripción en tiempo real se puede manejar escuchando la tabla de mensajes o miembros.

            return { error: null };
        } catch (error) {
            console.error('[messagesService] markAsRead error:', error);
            return { error };
        }
    },

    /**
     * Suscripción en tiempo real a mensajes de una conversación específica.
     */
    subscribeToChat(conversationId, onMessage) {
        return supabase
            .channel(`chat:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => onMessage(payload.new)
            )
            .subscribe();
    },

    /**
     * Archiva o desarchiva una conversación para el usuario actual.
     */
    async archiveConversation(conversationId, userId, status = true) {
        try {
            const { error } = await supabase
                .from('conversation_members')
                .update({ is_archived: status })
                .eq('conversation_id', conversationId)
                .eq('user_id', userId);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('[messagesService] archiveConversation error:', error);
            return { error };
        }
    },

    /**
     * Elimina lógicamente una conversación para el usuario actual.
     */
    async deleteConversation(conversationId, userId) {
        try {
            const { error } = await supabase
                .from('conversation_members')
                .update({ is_deleted: true })
                .eq('conversation_id', conversationId)
                .eq('user_id', userId);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('[messagesService] deleteConversation error:', error);
            return { error };
        }
    },

    /**
     * Obtiene o crea una conversación entre dos usuarios.
     */
    async getOrCreateConversation(user1Id, user2Id) {
        try {
            // 1. Buscar si existe una conversación compartida
            const { data: commonConvs, error: searchError } = await supabase
                .rpc('get_common_conversation', { u1: user1Id, u2: user2Id });

            if (!searchError && commonConvs && commonConvs.length > 0) {
                return { data: commonConvs[0], error: null };
            }

            // 2. Si no existe, crearla
            const { data: newConv, error: convError } = await supabase
                .from('conversations')
                .insert([{ last_message: 'Inicia una conversación' }])
                .select()
                .single();

            if (convError) throw convError;

            // 3. Agregar miembros
            const { error: memberError } = await supabase
                .from('conversation_members')
                .insert([
                    { conversation_id: newConv.id, user_id: user1Id },
                    { conversation_id: newConv.id, user_id: user2Id }
                ]);

            if (memberError) throw memberError;

            return { data: newConv, error: null };
        } catch (error) {
            console.error('[messagesService] getOrCreateConversation error:', error);
            return { data: null, error };
        }
    },

    /**
     * Suscripción en tiempo real a nuevas conversaciones o actualizaciones de la lista.
     */
    subscribeToConversations(userId, onUpdate) {
        // Suscribirse a cambios en conversaciones (para archivado/eliminación/actualización de metadata)
        const conversationsChannel = supabase.channel(`conversations-meta:${userId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'conversations' },
                () => onUpdate()
            )
            .subscribe();

        // Suscribirse a nuevos mensajes para que la lista se actualice en tiempo real 
        // cuando llegue uno nuevo, incluso si no estamos en el chat.
        const messagesChannel = supabase.channel(`conversations-live:${userId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                () => onUpdate()
            )
            .subscribe();

        return [conversationsChannel, messagesChannel];
    }
};
