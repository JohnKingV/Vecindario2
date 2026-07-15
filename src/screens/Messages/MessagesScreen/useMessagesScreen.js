import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { messagesService } from '../../../services/messagesService';
import { supabase } from '../../../config/supabase';

export const useMessagesScreen = (navigation) => {
    const { user, loading: authLoading } = useAuth();
    const { theme, isDark } = useTheme();
    const [search, setSearch] = useState('');
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isArchivedView, setIsArchivedView] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
    const [alertState, setAlertState] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'danger',
        onConfirm: () => { }
    });

    const showAlert = (title, message, type = 'danger', onConfirm = null) => {
        setAlertState({
            visible: true,
            title,
            message,
            type,
            onConfirm: onConfirm || (() => setAlertState(prev => ({ ...prev, visible: false })))
        });
    };

    useEffect(() => {
        if (authLoading) return; // Wait for auth to initialize

        if (user) {
            loadConversations();

            const subscriptions = messagesService.subscribeToConversations(user.id, () => {
                loadConversations();
            });

            return () => {
                subscriptions.forEach(sub => supabase.removeChannel(sub));
            };
        } else {
            // Not logged in or auth failed, stop loading
            setLoading(false);
        }
    }, [user, authLoading, isArchivedView]);

    const loadConversations = async () => {
        setLoading(true);
        const { data, error } = await messagesService.getConversations(user.id, isArchivedView);
        if (!error) setConversations(data || []);
        setLoading(false);
    };

    const handlePressConversation = (item) => {
        navigation.navigate('Chat', { conversation: item });
    };

    const handleLongPressConversation = (item) => {
        console.log('[useMessagesScreen] Long press detected for chat:', item.name);
        setSelectedConversation(item);
        setIsOptionsModalVisible(true);
    };

    const handleArchiveToggle = async () => {
        if (!selectedConversation) return;

        const { error } = await messagesService.archiveConversation(
            selectedConversation.id,
            user.id,
            !isArchivedView
        );

        if (!error) {
            loadConversations();
        } else {
            showAlert('Error', 'No se pudo procesar la solicitud', 'danger');
        }
    };

    const handleDeleteConversation = async () => {
        if (!selectedConversation) return;

        showAlert(
            'Eliminar chat',
            '¿Estás seguro de que quieres eliminar este chat? Esta acción no se puede deshacer.',
            'danger',
            async () => {
                setAlertState(prev => ({ ...prev, visible: false }));
                const { error } = await messagesService.deleteConversation(
                    selectedConversation.id,
                    user.id
                );
                if (!error) {
                    loadConversations();
                } else {
                    showAlert('Error', 'No se pudo eliminar el chat', 'danger');
                }
            }
        );
    };

    const toggleView = () => {
        setIsArchivedView(!isArchivedView);
    };

    const handleNewMessage = () => {
        navigation.navigate('NewMessage');
    };

    const filteredConversations = conversations.filter(c => {
        const term = search.toLowerCase().trim();
        if (!term) return true;

        const nameMatch = c.name && c.name.toLowerCase().includes(term);
        const msgMatch = c.lastMessage && c.lastMessage.toLowerCase().includes(term);

        return nameMatch || msgMatch;
    });

    const formatDate = (dateString) => {
        if (!dateString) return '';

        // Forzar formato ISO si falta la T o la Z (común en algunas respuestas de DB)
        let isoString = dateString;
        if (typeof dateString === 'string') {
            if (!dateString.includes('T') && dateString.includes(' ')) {
                isoString = dateString.replace(' ', 'T');
            }
            if (!isoString.includes('Z') && !isoString.includes('+')) {
                isoString += 'Z'; // Asumimos UTC desde la base de datos
            }
        }

        const d = new Date(isoString);
        const now = new Date();
        const isToday = d.getDate() === now.getDate() &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear();

        if (isToday) {
            // Usamos las opciones de toLocaleTimeString para asegurar formato local 24h o 12h según región
            // Pero nos aseguramos de que sea la hora LOCAL del dispositivo.
            return d.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).toUpperCase();
        } else {
            const day = d.getDate().toString().padStart(2, '0');
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        }
    };

    return {
        // State
        search, setSearch,
        conversations,
        loading,
        filteredConversations,
        formatDate,
        isArchivedView,
        isOptionsModalVisible,
        setIsOptionsModalVisible,
        selectedConversation,

        // Utils
        theme,
        isDark,

        // Handlers
        handlePressConversation,
        handleLongPressConversation,
        handleArchiveToggle,
        handleDeleteConversation,
        handleToggleView: toggleView,
        handleNewMessage,
        alertState,
        setAlertState
    };
};
