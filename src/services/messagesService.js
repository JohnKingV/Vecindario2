import { supabase } from '../config/supabase';

export const messagesService = {
    /**
     * Obtiene la lista de conversaciones del usuario actual.
     * Incluye el último mensaje y los datos del perfil del destinatario.
     */
    async getConversations(userId) {
        try {
            // Esta consulta asume una vista o una relación que une conversaciones con perfiles
            // Para simplicidad inicial, buscaremos mensajes agrupados por conversación
            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    id,
                    last_message,
                    updated_at,
                    members:conversation_members!inner(user_id),
                    participants:conversation_members(
                        profile:profiles(id, nombre, foto_url, status, sexo)
                    )
                `)
                .eq('conversation_members.user_id', userId)
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

                return {
                    id: conv.id,
                    name: otherMember?.nombre || 'Vecino',
                    avatar: otherMember?.foto_url,
                    status: otherMember?.status,
                    lastMessage: conv.last_message,
                    time: conv.updated_at,
                    otherId: otherMember?.id,
                    sexo: otherMember?.sexo,
                    unreadCount: count || 0
                };
            }));

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
    async sendMessage(conversationId, senderId, text, itemId = null) {
        try {
            const messageData = {
                conversation_id: conversationId,
                sender_id: senderId,
                content: text
            };

            if (itemId) {
                messageData.item_id = itemId;
            }

            const { data, error } = await supabase
                .from('messages')
                .insert([messageData])
                .select('*, items(*)')
                .single();

            if (error) throw error;

            // Actualizar la fecha de la conversación para que suba al inicio de la lista
            await supabase
                .from('conversations')
                .update({ updated_at: new Date().toISOString(), last_message: text })
                .eq('id', conversationId);

            return { data, error: null };
        } catch (error) {
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

            // "Tocar" la conversación para disparar la actualización en tiempo real en la lista de chats
            await supabase
                .from('conversations')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', conversationId);

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
        return supabase
            .channel(`conversations:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'conversations'
                },
                () => onUpdate()
            )
            .subscribe();
    }
};
