import { useState, useEffect, useRef } from 'react';
import { Alert, Platform, LayoutAnimation, UIManager } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { messagesService } from '../../../services/messagesService';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../config/supabase';
import { useTheme } from '../../../context/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const useChatScreen = (route, navigation) => {
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
    const [selectedImage, setSelectedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerImage, setViewerImage] = useState(null);
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

    const formatPrice = (price) => {
        if (!price && price !== 0) return '$0';
        return '$' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const formatMessageTime = (dateString) => {
        if (!dateString) return '';

        // Normalizar entrada para asegurar UTC -> Local
        let isoString = dateString;
        if (typeof dateString === 'string') {
            if (!dateString.includes('T') && dateString.includes(' ')) isoString = dateString.replace(' ', 'T');
            if (!isoString.includes('Z') && !isoString.includes('+')) isoString += 'Z';
        }

        const d = new Date(isoString);
        const now = new Date();
        const isToday = d.getDate() === now.getDate() &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear();

        if (isToday) {
            return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
        } else {
            const day = d.getDate().toString().padStart(2, '0');
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        }
    };

    useEffect(() => {
        if (conversation?.id) {
            loadMessages();
            messagesService.markAsRead(conversation.id, user.id);

            const subscription = supabase
                .channel(`chat_updates:${conversation.id}`)
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversation.id}` },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            const nm = payload.new;
                            if (nm.sender_id === user.id) return;

                            const newMessage = {
                                id: nm.id,
                                text: nm.content,
                                image: nm.image_url,
                                sender: 'other',
                                time: formatMessageTime(nm.created_at),
                                rawTime: nm.created_at,
                                avatar: conversation.avatar,
                                isEdited: nm.is_edited
                            };
                            setChatHistory(prev => [newMessage, ...prev.filter(m => m.id !== nm.id)]);
                            messagesService.markAsRead(conversation.id, user.id);
                        } else if (payload.eventType === 'UPDATE') {
                            const nm = payload.new;
                            setChatHistory(prev => prev.map(m => m.id === nm.id ? {
                                ...m,
                                text: nm.content,
                                image: nm.image_url,
                                isEdited: nm.is_edited
                            } : m));
                        } else if (payload.eventType === 'DELETE') {
                            setChatHistory(prev => prev.filter(m => m.id !== payload.old.id));
                        }
                    }
                )
                .subscribe();

            const otherUserId = conversation.otherId || conversation.participants?.find(p => p !== user.id);

            typingChannelRef.current = supabase.channel(`typing:${conversation.id}`);
            typingChannelRef.current
                .on('broadcast', { event: 'typing' }, ({ payload }) => {
                    if (payload.userId !== user.id) {
                        setIsOtherTyping(payload.isTyping);
                    }
                })
                .subscribe();

            let profileSub = null;
            if (otherUserId) {
                profileSub = supabase
                    .channel(`profile_status:${otherUserId}`)
                    .on(
                        'postgres_changes',
                        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${otherUserId}` },
                        (payload) => {
                            setOtherUserStatus(payload.new.status);
                        }
                    )
                    .subscribe();

                supabase.from('profiles').select('status').eq('id', otherUserId).single().then(({ data }) => {
                    if (data) setOtherUserStatus(data.status);
                });
            }

            return () => {
                supabase.removeChannel(subscription);
                if (profileSub) supabase.removeChannel(profileSub);
                if (typingChannelRef.current) {
                    supabase.removeChannel(typingChannelRef.current);
                }
            };
        }
    }, [conversation.id]);

    useEffect(() => {
        if (initialProduct && user && conversation.id) {
            checkAndSendInitialProduct();
        }
    }, [initialProduct, conversation.id]);

    const checkAndSendInitialProduct = async () => {
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
                time: formatMessageTime(data.created_at),
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
                    image: m.image_url,
                    sender: m.sender_id === user.id ? 'me' : 'other',
                    time: formatMessageTime(m.created_at),
                    rawTime: m.created_at,
                    avatar: m.sender_id === user.id ? null : conversation.avatar,
                    isEdited: m.is_edited,
                    item: m.items
                }));
                setChatHistory(deduplicateMessages([...formatted].reverse()));
            }
        } catch (err) {
            console.error('[ChatScreen] Critical error in loadMessages:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadImage = async (url) => {
        try {
            if (Platform.OS === 'web') {
                window.open(url, '_blank');
                return;
            }

            Alert.alert('Descargar', 'Abriendo imagen para guardar...');
            const { Linking } = require('react-native');
            Linking.openURL(url);
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Error', 'No se pudo descargar la imagen');
        }
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitamos permiso para usar la cámara.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleSend = async () => {
        if ((!message.trim() && !selectedImage) || !user) return;

        const textToSend = message.trim();
        const imageToSend = selectedImage;

        setMessage('');
        setSelectedImage(null);
        setShowEmojiPicker(false);

        if (editingMessageId) {
            const msgId = editingMessageId;
            setEditingMessageId(null);

            setChatHistory(prev => prev.map(m => m.id === msgId ? { ...m, text: textToSend, isEdited: true } : m));

            const { error } = await messagesService.updateMessage(msgId, user.id, textToSend);
            if (error) {
                Alert.alert('Error', error.message || 'No se pudo editar el mensaje');
                loadMessages();
            }
            return;
        }

        const tempId = `temp-${Date.now()}`;
        const optimisticMessage = {
            id: tempId,
            text: textToSend,
            image: imageToSend,
            sender: 'me',
            time: formatMessageTime(new Date()),
            status: 'enviando...'
        };

        setChatHistory(prev => [optimisticMessage, ...prev]);

        let finalImageUrl = null;
        if (imageToSend) {
            setIsUploading(true);
            const { data: uploadPath, error: uploadError } = await messagesService.uploadMessageImage(user.id, imageToSend);
            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                Alert.alert('Error', 'No se pudo subir la imagen');
                setChatHistory(prev => prev.filter(m => m.id !== tempId));
                setIsUploading(false);
                return;
            }
            finalImageUrl = uploadPath;
        }

        const { data, error } = await messagesService.sendMessage(conversation.id, user.id, textToSend, null, finalImageUrl);

        if (error) {
            console.error('Error sending message:', error);
            setChatHistory(prev => prev.filter(m => m.id !== tempId));
            Alert.alert('Error', 'No se pudo enviar el mensaje');
        } else if (data) {
            setChatHistory(prev => prev.map(m =>
                m.id === tempId ? {
                    ...m,
                    id: data.id,
                    status: null,
                    image: data.image_url,
                    time: formatMessageTime(data.created_at),
                    rawTime: data.created_at
                } : m
            ));
        }
        setIsUploading(false);
    };

    const handleLongPress = (item) => {
        const isAdmin = profile?.role === 'admin';
        if (item.sender !== 'me' && !isAdmin) return;

        setSelectedMessage(item);
        setIsConfirmingUnsend(false);
        setShowOptionsModal(true);
    };

    const handleUnsend = async () => {
        if (!selectedMessage) return;

        setIsDeleting(true);
        const isAdmin = profile?.role === 'admin';

        try {
            const { error } = await messagesService.deleteMessage(selectedMessage.id, user.id, isAdmin);

            if (!error) {
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

    const handleTyping = (text) => {
        setMessage(text);
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
    };

    return {
        // State
        message, setMessage,
        chatHistory,
        loading,
        editingMessageId, setEditingMessageId,
        showEmojiPicker, setShowEmojiPicker,
        selectedMessage,
        showOptionsModal, setShowOptionsModal,
        isConfirmingUnsend, setIsConfirmingUnsend,
        isDeleting,
        selectedImage, setSelectedImage,
        isUploading,
        viewerVisible, setViewerVisible,
        viewerImage, setViewerImage,
        otherUserStatus,
        isOtherTyping,

        // Refs
        flatListRef,

        // Context
        user, profile,
        theme, isDark,
        conversation,

        // Constants
        commonEmojis,

        // Handlers
        handleDownloadImage,
        handlePickImage,
        handleTakePhoto,
        handleSend,
        handleLongPress,
        handleUnsend,
        handleEditOption,
        handleEmojiPress,
        handleTyping,
        formatPrice,
    };
};
