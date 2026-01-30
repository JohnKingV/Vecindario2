import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Image,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    ScrollView,
    LayoutAnimation,
    UIManager,
    Modal,
    TouchableWithoutFeedback,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { messagesService } from '../../services/messagesService';
import { useAuth } from '../../hooks/useAuth';
import { Input, Avatar } from '../../components';
import { supabase } from '../../config/supabase';
import { useTheme } from '../../context/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const formatPrice = (price) => {
    if (!price && price !== 0) return '$0';
    return '$' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const ChatScreen = ({ route, navigation }) => {
    const { conversation, initialProduct } = route.params;
    const { user, profile } = useAuth();
    const { theme, isDark } = useTheme();
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [isConfirmingUnsend, setIsConfirmingUnsend] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [otherUserStatus, setOtherUserStatus] = useState(null);
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const typingChannelRef = useRef(null);
    const flatListRef = useRef(null);

    const commonEmojis = ['😀', '😂', '😍', '👍', '🙏', '🔥', '👏', '🙌', '❤️', '😊', '🤔', '😎', '🏠', '📦', '✨', '✅', '❌', '👋'];

    const deduplicateMessages = (newMessages) => {
        const seen = new Set();
        return newMessages.filter(m => {
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
        });
    };

    useEffect(() => {
        if (conversation?.id) {
            loadMessages();
            // Marcar como leídos al entrar
            messagesService.markAsRead(conversation.id, user.id);

            const subscription = supabase
                .channel(`chat_updates:${conversation.id}`)
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversation.id}` },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            const nm = payload.new;
                            if (nm.sender_id === user.id) return; // Ignore messages sent by current user, as they are optimistically updated

                            const newMessage = {
                                id: nm.id,
                                text: nm.content,
                                sender: 'other', // Always 'other' for incoming messages
                                time: new Date(nm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                rawTime: nm.created_at,
                                avatar: conversation.avatar, // Always conversation avatar for 'other'
                                isEdited: nm.is_edited
                            };
                            // Add new message at the beginning (index 0) since list is inverted
                            setChatHistory(prev => [newMessage, ...prev.filter(m => m.id !== nm.id)]);
                            messagesService.markAsRead(conversation.id, user.id); // Mark as read if it's an incoming message
                        } else if (payload.eventType === 'UPDATE') {
                            const nm = payload.new;
                            setChatHistory(prev => prev.map(m => m.id === nm.id ? {
                                ...m,
                                text: nm.content,
                                isEdited: nm.is_edited
                            } : m));
                        } else if (payload.eventType === 'DELETE') {
                            setChatHistory(prev => prev.filter(m => m.id !== payload.old.id));
                        }
                    }
                )
                .subscribe();

            // Suscribirse al estado del otro usuario
            const otherUserId = conversation.participants?.find(p => p !== user.id);
            if (otherUserId) {
                const profileSub = supabase
                    .channel(`profile_status:${otherUserId}`)
                    .on(
                        'postgres_changes',
                        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${otherUserId}` },
                        (payload) => {
                            setOtherUserStatus(payload.new.status);
                        }
                    )
                    .subscribe();

                // Obtener estado inicial
                supabase.from('profiles').select('status').eq('id', otherUserId).single().then(({ data }) => {
                    if (data) setOtherUserStatus(data.status);
                });

                // Suscribirse a indicadores de escritura
                typingChannelRef.current = supabase.channel(`typing:${conversation.id}`);
                typingChannelRef.current
                    .on('broadcast', { event: 'typing' }, ({ payload }) => {
                        if (payload.userId !== user.id) {
                            setIsOtherTyping(payload.isTyping);
                        }
                    })
                    .subscribe();

                return () => {
                    supabase.removeChannel(subscription);
                    supabase.removeChannel(profileSub);
                    if (typingChannelRef.current) {
                        supabase.removeChannel(typingChannelRef.current);
                    }
                };
            }

            return () => {
                supabase.removeChannel(subscription);
                if (typingChannelRef.current) {
                    supabase.removeChannel(typingChannelRef.current);
                }
            };
        }
    }, [conversation.id]);

    useEffect(() => {
        // Si entramos desde un producto y es una conversación vacía o iniciada por este producto
        if (initialProduct && user && conversation.id) {
            checkAndSendInitialProduct();
        }
    }, [initialProduct, conversation.id]);

    const checkAndSendInitialProduct = async () => {
        // Solo enviamos el producto si no ha sido enviado recientemente en esta conversación por el usuario actual
        // o si queremos que siempre salga como contexto inicial.
        // Por ahora, lo enviaremos siempre que vengamos de un producto para dar contexto claro.

        const messageText = `¡Hola! Me interesa este producto: ${initialProduct.titulo}`;
        handleSendCustom(messageText, initialProduct.id);
    };

    const handleSendCustom = async (text, itemId = null) => {
        if (!text.trim() || !user) return;

        const { data, error } = await messagesService.sendMessage(conversation.id, user.id, text, itemId);
        if (data) {
            const newMessage = {
                id: data.id,
                text: data.content,
                sender: 'me',
                time: new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                rawTime: data.created_at,
                item: data.items
            };
            setChatHistory(prev => {
                const combined = [newMessage, ...prev];
                return deduplicateMessages(combined);
            });
        }
    };

    const loadMessages = async () => {
        try {
            if (!conversation?.id) {
                setLoading(false);
                return;
            }

            const { data, error } = await messagesService.getMessages(conversation.id);

            if (error) {
                console.error('[ChatScreen] Load error:', error);
                Alert.alert('Error', 'No se pudieron cargar los mensajes');
                return;
            }

            if (data && Array.isArray(data)) {
                const formatted = data.map(m => ({
                    id: m.id,
                    text: m.content,
                    sender: m.sender_id === user.id ? 'me' : 'other',
                    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    rawTime: m.created_at,
                    avatar: m.sender_id === user.id ? null : conversation.avatar,
                    isEdited: m.is_edited,
                    item: m.items
                }));
                // Para FlatList inverted, los más recientes van al principio del array
                setChatHistory(deduplicateMessages([...formatted].reverse()));
            }
        } catch (err) {
            console.error('[ChatScreen] Critical error in loadMessages:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!message.trim() || !user) return;

        const textToSend = message.trim();
        setMessage('');
        setShowEmojiPicker(false);

        if (editingMessageId) {
            const msgId = editingMessageId;
            setEditingMessageId(null);

            // Optimistic update
            setChatHistory(prev => prev.map(m => m.id === msgId ? { ...m, text: textToSend, isEdited: true } : m));

            const { error } = await messagesService.updateMessage(msgId, user.id, textToSend);
            if (error) {
                Alert.alert('Error', error.message || 'No se pudo editar el mensaje');
                loadMessages();
            }
            return;
        }

        // 1. Actualización optimista para feedback inmediato
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage = {
            id: tempId,
            text: textToSend,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'enviando...'
        };

        setChatHistory(prev => [optimisticMessage, ...prev]);

        // 2. Enviar a Supabase
        const { data, error } = await messagesService.sendMessage(conversation.id, user.id, textToSend);

        if (error) {
            console.error('Error sending message:', error);
            // Revertir o marcar como error
            setChatHistory(prev => prev.filter(m => m.id !== tempId));
            Alert.alert('Error', 'No se pudo enviar el mensaje');
        } else if (data) {
            // Reemplazar mensaje temporal con el real de la DB
            setChatHistory(prev => prev.map(m =>
                m.id === tempId ? {
                    ...m,
                    id: data.id,
                    status: null,
                    time: new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    rawTime: data.created_at
                } : m
            ));
        }
    };

    const handleLongPress = (item) => {
        const isAdmin = profile?.role === 'admin';
        if (item.sender !== 'me' && !isAdmin) return;

        console.log('[ChatScreen] Long press on message:', item.id);
        setSelectedMessage(item);
        setIsConfirmingUnsend(false);
        setShowOptionsModal(true);
    };

    const handleUnsend = async () => {
        if (!selectedMessage) return;

        console.log('[ChatScreen] Attempting to unsend message:', selectedMessage.id);
        setIsDeleting(true);
        const isAdmin = profile?.role === 'admin';

        try {
            const { error } = await messagesService.deleteMessage(selectedMessage.id, user.id, isAdmin);

            if (!error) {
                console.log('[ChatScreen] Message unsent successfully');
                // Efecto de desaparición (solo móvil)
                if (Platform.OS !== 'web') {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                }

                setChatHistory(prev => prev.filter(m => m.id !== selectedMessage.id));
                setShowOptionsModal(false);
                setIsConfirmingUnsend(false);
                setSelectedMessage(null);
            } else {
                console.error('[ChatScreen] Delete error:', error);
                Alert.alert('Error', error.message || 'No se pudo anular el mensaje');
            }
        } catch (err) {
            console.error('[ChatScreen] Catch error in unsend:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditOption = () => {
        if (!selectedMessage) return;
        setEditingMessageId(selectedMessage.id);
        setMessage(selectedMessage.text);
        setShowOptionsModal(false);
    };

    const handleEmojiPress = (emoji) => {
        setMessage(prev => prev + emoji);
    };

    const renderMessage = ({ item, index }) => {
        const isMe = item.sender === 'me';
        // En inverted=true, index 0 es el último mensaje (el de más abajo)
        // Mostramos avatar si es el mensaje más bajo del bloque 'other'
        const showAvatar = item.sender === 'other' && (index === 0 || chatHistory[index - 1]?.sender !== 'other');

        return (
            <View style={[styles.messageContainer, isMe ? styles.myMessageContainer : styles.otherMessageContainer]}>
                {!isMe && (
                    <View style={styles.avatarPlaceholder}>
                        {showAvatar && (
                            <Avatar
                                uri={item.avatar}
                                name={conversation.name}
                                size="sm"
                            />
                        )}
                    </View>
                )}
                <View style={styles.bubbleWrapper}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onLongPress={() => handleLongPress(item)}
                        style={[
                            styles.bubble,
                            isMe ? styles.myBubble : [styles.otherBubble, { backgroundColor: theme.colors.inputBackground }],
                            editingMessageId === item.id && styles.editingBubble
                        ]}
                    >
                        {item.item && (
                            <View style={[styles.productReference, { backgroundColor: isMe ? 'rgba(0,0,0,0.1)' : theme.colors.background, borderColor: theme.colors.border }]}>
                                <Image source={{ uri: item.item.imagen_url }} style={styles.productThumb} />
                                <View style={styles.productInfo}>
                                    <Text style={[styles.productTitle, { color: isMe ? '#fff' : theme.colors.text }]} numberOfLines={1}>{item.item.titulo}</Text>
                                    <Text style={[styles.productPrice, { color: isMe ? '#e0f2fe' : theme.colors.primary }]}>
                                        {formatPrice(item.item.precio)}
                                    </Text>
                                </View>
                            </View>
                        )}
                        <Text style={[styles.messageText, isMe ? styles.myMessageText : [styles.otherMessageText, { color: theme.colors.text }]]}>
                            {item.text}
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.timeRow}>
                        {item.isEdited && <Text style={styles.editedText}>editado</Text>}
                        {item.time && (
                            <Text style={[styles.timeText, isMe && styles.myTimeText]}>
                                {item.time}{item.status ? ` • ${item.status}` : ''}
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const renderTypingIndicator = () => {
        if (!isOtherTyping) return null;

        return (
            <View style={[styles.messageContainer, styles.otherMessageContainer, { marginBottom: 12, marginTop: 8 }]}>
                <View style={styles.avatarPlaceholder}>
                    <Avatar
                        uri={conversation.avatar}
                        name={conversation.name}
                        size="sm"
                    />
                </View>
                <View style={styles.bubbleWrapper}>
                    <View style={[styles.bubble, styles.otherBubble, { backgroundColor: theme.colors.inputBackground, paddingVertical: 10, paddingHorizontal: 16, borderBottomLeftRadius: 4 }]}>
                        <View style={styles.typingContainer}>
                            <Text style={[styles.typingText, { color: theme.colors.textSecondary }]}>
                                escribiendo
                                <Text style={styles.typingDotsText}>...</Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
            >
                {/* Header */}
                <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <MaterialCommunityIcons name="chevron-left" size={32} color={theme.colors.text} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.userInfo}
                            onPress={() => navigation.navigate('UserProfile', { userId: conversation.otherId, userProfile: conversation })}
                        >
                            <Avatar
                                uri={conversation.avatar}
                                name={conversation.name}
                                size="md"
                                status={isOtherTyping ? 'typing' : (otherUserStatus === 'online' ? 'online' : 'offline')}
                            />
                            <View>
                                <Text style={[styles.userName, { color: theme.colors.text }]}>
                                    {conversation.sexo === 'mujer' ? 'Vecina: ' : 'Vecino: '}{conversation.name}
                                </Text>
                                <Text style={styles.userStatus}>
                                    {isOtherTyping ? 'Escribiendo...' :
                                        (otherUserStatus === 'online' ? 'En línea' : 'Desconectado')}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                </View>

                {/* Chat List */}
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <ActivityIndicator size="large" color="#197fe6" />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={chatHistory}
                        inverted={true}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMessage}
                        ListHeaderComponent={renderTypingIndicator}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        initialNumToRender={20}
                        ListFooterComponent={() => (
                            <View style={styles.dateSeparator}>
                                <Text style={[styles.dateText, { color: theme.colors.textSecondary, backgroundColor: theme.colors.inputBackground }]}>HOY</Text>
                            </View>
                        )}
                        ListEmptyComponent={() => (
                            <View style={{ flex: 1, alignItems: 'center', marginTop: 40, transform: [{ scaleY: -1 }, { scaleX: -1 }] }}>
                                <Text style={{ color: '#94a3b8' }}>Dile hola a tu vecino 👋</Text>
                            </View>
                        )}
                    />
                )}

                {/* Input Area */}
                <View style={[styles.inputArea, { backgroundColor: theme.colors.background }]}>
                    {editingMessageId && (
                        <View style={[styles.editingBanner, { backgroundColor: theme.colors.inputBackground }]}>
                            <Text style={[styles.editingBannerText, { color: theme.colors.textSecondary }]}>Editando mensaje...</Text>
                            <TouchableOpacity onPress={() => { setEditingMessageId(null); setMessage(''); }}>
                                <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {showEmojiPicker && (
                        <View style={[styles.emojiTray, { backgroundColor: theme.colors.inputBackground }]}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {commonEmojis.map((emoji, i) => (
                                    <TouchableOpacity key={i} onPress={() => handleEmojiPress(emoji)} style={styles.emojiBtn}>
                                        <Text style={styles.emojiText}>{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <View style={[styles.inputRow, { backgroundColor: theme.colors.inputBackground }]}>
                        <TouchableOpacity
                            style={[
                                styles.addButton,
                                { backgroundColor: theme.colors.card },
                                showEmojiPicker && { backgroundColor: isDark ? 'rgba(25, 127, 230, 0.2)' : '#f0f7ff' }
                            ]}
                            onPress={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                            <MaterialCommunityIcons name={showEmojiPicker ? "keyboard-outline" : "emoticon-outline"} size={24} color={showEmojiPicker ? theme.colors.primary : theme.colors.textSecondary} />
                        </TouchableOpacity>
                        <Input
                            placeholder={editingMessageId ? "Editar mensaje..." : "Mensaje..."}
                            placeholderTextColor={theme.colors.placeholder}
                            multiline
                            value={message}
                            onChangeText={(text) => {
                                setMessage(text);
                                // Broadcast typing status optimizado
                                if (conversation.id && typingChannelRef.current) {
                                    typingChannelRef.current.send({
                                        type: 'broadcast',
                                        event: 'typing',
                                        payload: { userId: user.id, isTyping: true },
                                    });

                                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                                    typingTimeoutRef.current = setTimeout(() => {
                                        if (typingChannelRef.current) {
                                            typingChannelRef.current.send({
                                                type: 'broadcast',
                                                event: 'typing',
                                                payload: { userId: user.id, isTyping: false },
                                            });
                                        }
                                    }, 2000);
                                }
                            }}
                            containerStyle={styles.inputContainer}
                            style={styles.inputInner}
                            inputStyle={[styles.input, { color: theme.colors.text }]}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
                            onPress={handleSend}
                            disabled={!message.trim()}
                        >
                            <MaterialCommunityIcons name={editingMessageId ? "check" : "send"} size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Message Options Modal */}
                <Modal
                    visible={showOptionsModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => {
                        setShowOptionsModal(false);
                        setIsConfirmingUnsend(false);
                    }}
                >
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => {
                            setShowOptionsModal(false);
                            setIsConfirmingUnsend(false);
                        }}
                    >
                        <Pressable
                            style={[styles.modalContent, { backgroundColor: theme.colors.card, zIndex: 100, elevation: 10 }]}
                            onPress={(e) => {
                                if (Platform.OS === 'web') {
                                    e.stopPropagation();
                                }
                            }}
                        >
                            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                                    {isConfirmingUnsend ? '¿Anular mensaje?' : 'Opciones de mensaje'}
                                </Text>
                            </View>

                            {selectedMessage && (() => {
                                const isAdmin = profile?.role === 'admin';
                                const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
                                const canEdit = selectedMessage.rawTime ? new Date(selectedMessage.rawTime) > oneHourAgo : true;

                                if (isConfirmingUnsend) {
                                    return (
                                        <View style={styles.confirmContainer}>
                                            <Text style={styles.confirmDesc}>
                                                Esta acción borrará el mensaje para todos los participantes.
                                            </Text>
                                            {isDeleting ? (
                                                <View style={{ padding: 20 }}>
                                                    <ActivityIndicator size="small" color="#ef4444" />
                                                </View>
                                            ) : (
                                                <>
                                                    <Pressable
                                                        style={({ pressed }) => [
                                                            styles.modalOption,
                                                            styles.modalOptionDestructive,
                                                            pressed && { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2' }
                                                        ]}
                                                        onPress={handleUnsend}
                                                    >
                                                        <MaterialCommunityIcons name="delete-forever" size={24} color="#ef4444" />
                                                        <Text style={[styles.modalOptionText, styles.destructiveText]}>Anular para todos</Text>
                                                    </Pressable>
                                                    <Pressable
                                                        style={({ pressed }) => [
                                                            styles.modalOption,
                                                            pressed && { backgroundColor: '#f1f5f9' }
                                                        ]}
                                                        onPress={() => setIsConfirmingUnsend(false)}
                                                    >
                                                        <MaterialCommunityIcons name="arrow-left" size={24} color="#64748b" />
                                                        <Text style={styles.modalOptionText}>Volver</Text>
                                                    </Pressable>
                                                </>
                                            )}
                                        </View>
                                    );
                                }

                                return (
                                    <>
                                        {(canEdit || isAdmin) ? (
                                            <Pressable
                                                style={({ pressed }) => [
                                                    styles.modalOption,
                                                    pressed && { backgroundColor: theme.colors.inputBackground }
                                                ]}
                                                onPress={() => {
                                                    setShowOptionsModal(false);
                                                    setEditingMessageId(selectedMessage.id);
                                                    setMessage(selectedMessage.text);
                                                }}
                                            >
                                                <MaterialCommunityIcons name="pencil" size={24} color={theme.colors.primary} />
                                                <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>Editar mensaje</Text>
                                            </Pressable>
                                        ) : (
                                            <View style={[styles.modalOption, { opacity: 0.5 }]}>
                                                <MaterialCommunityIcons name="clock-outline" size={24} color="#94a3b8" />
                                                <Text style={[styles.modalOptionText, { color: '#94a3b8' }]}>Edición no disponible (+1h)</Text>
                                            </View>
                                        )}

                                        <Pressable
                                            style={({ pressed }) => [
                                                styles.modalOption,
                                                styles.modalOptionDestructive,
                                                pressed && { backgroundColor: '#fef2f2' }
                                            ]}
                                            onPress={() => setIsConfirmingUnsend(true)}
                                        >
                                            <MaterialCommunityIcons name="delete-outline" size={24} color="#ef4444" />
                                            <Text style={[styles.modalOptionText, styles.destructiveText]}>Anular mensaje</Text>
                                        </Pressable>
                                    </>
                                );
                            })()}

                            <Pressable
                                style={({ pressed }) => [
                                    styles.modalCancelBtn,
                                    pressed && { backgroundColor: '#f8fafc' },
                                    Platform.OS === 'web' && { cursor: 'pointer' }
                                ]}
                                onPress={() => {
                                    setShowOptionsModal(false);
                                    setIsConfirmingUnsend(false);
                                }}
                            >
                                <Text style={styles.modalCancelText}>Cancelar</Text>
                            </Pressable>
                        </Pressable>
                    </Pressable>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingTop: Platform.OS === 'android' ? 8 : 0,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        backgroundColor: '#fff',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    backButton: {
        padding: 4,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarWrapper: {
        position: 'relative',
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#181112',
    },
    timeText: {
        fontSize: 10,
        color: '#94a3b8',
        fontWeight: '500',
    },
    productReference: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 12,
        padding: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        gap: 12,
        minWidth: 200,
    },
    productThumb: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    productTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    productPrice: {
        fontSize: 13,
        color: '#197fe6',
        fontWeight: '900',
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    dateSeparator: {
        alignItems: 'center',
        marginVertical: 24,
    },
    dateText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#94a3b8',
        backgroundColor: '#f8fafc',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        letterSpacing: 1,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        maxWidth: '85%',
    },
    myMessageContainer: {
        alignSelf: 'flex-end',
        justifyContent: 'flex-end',
    },
    otherMessageContainer: {
        alignSelf: 'flex-start',
    },
    avatarPlaceholder: {
        width: 32,
        marginRight: 8,
        justifyContent: 'flex-end',
    },
    smallAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f3f4f6',
        marginBottom: 4,
    },
    bubbleWrapper: {
        gap: 4,
    },
    bubble: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    myBubble: {
        backgroundColor: '#197fe6',
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        backgroundColor: '#f1f5f9',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#fff',
    },
    otherMessageText: {
        color: '#181112',
    },
    myTimeText: {
        textAlign: 'right',
    },
    inputArea: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        backgroundColor: 'transparent',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 8,
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    inputContainer: {
        flex: 1,
        marginBottom: 0, // Reset margin de Input.js
    },
    inputInner: {
        borderWidth: 0,
        minHeight: 40,
        backgroundColor: 'transparent',
    },
    input: {
        fontSize: 15,
        paddingVertical: 8,
        minHeight: 40,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#197fe6',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            web: { boxShadow: '0px 2px 4px rgba(25, 127, 230, 0.3)' },
            default: {
                shadowColor: '#197fe6',
                shadowOpacity: 0.3,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
            }
        })
    },
    sendButtonDisabled: {
        backgroundColor: '#94a3b8',
        ...Platform.select({
            web: { boxShadow: 'none' },
            default: { shadowOpacity: 0 }
        }),
        opacity: 0.5,
    },
    editingBubble: {
        opacity: 0.7,
        borderWidth: 1,
        borderColor: '#197fe6',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
    },
    editedText: {
        fontSize: 9,
        color: '#94a3b8',
        fontStyle: 'italic',
    },
    editingBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    editingBannerText: {
        fontSize: 12,
        color: '#197fe6',
        fontWeight: 'bold',
    },
    emojiTray: {
        paddingBottom: 12,
        paddingHorizontal: 8,
    },
    emojiBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emojiText: {
        fontSize: 24,
    },
    activeAddBtn: {
        backgroundColor: '#f0f7ff',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 24,
        width: '100%',
        maxWidth: 340,
        padding: 8,
        padding: 8,
        ...Platform.select({
            web: { boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.25)' },
            default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 20,
            }
        }),
        elevation: 10,
    },
    modalHeader: {
        padding: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#181112',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    modalOptionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    modalOptionDestructive: {
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    destructiveText: {
        color: '#ef4444',
    },
    modalCancelBtn: {
        padding: 16,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        marginTop: 4,
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#64748b',
    },
    confirmContainer: {
        paddingVertical: 8,
    },
    confirmDesc: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        lineHeight: 20,
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typingText: {
        fontSize: 14,
        fontWeight: '500',
    },
    typingDotsText: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },
});

export default ChatScreen;
