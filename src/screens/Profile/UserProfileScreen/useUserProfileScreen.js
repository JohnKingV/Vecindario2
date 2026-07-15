import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { authService } from '../../../services/authService';
import { messagesService } from '../../../services/messagesService';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';

export const useUserProfileScreen = (route, navigation) => {
    const { userId, userProfile: initialProfile } = route.params;
    const { user: currentUser } = useAuth();
    const { theme, isDark } = useTheme();
    const [profile, setProfile] = useState(initialProfile || null);
    const [loading, setLoading] = useState(!initialProfile);
    const [isViewerVisible, setIsViewerVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadProfile();
        }, [userId])
    );

    const loadProfile = async () => {
        const { data, error } = await authService.getUserPublicProfile(userId);
        if (data) {
            setProfile(data);
        }
        setLoading(false);
    };

    const handleStartChat = async () => {
        if (currentUser.id === userId) return;

        try {
            const { data: conv, error } = await messagesService.getOrCreateConversation(currentUser.id, userId);
            if (error) throw error;

            navigation.navigate('Chat', {
                conversation: {
                    id: conv.id,
                    name: profile.nombre,
                    avatar: profile.foto_url,
                    sexo: profile.sexo,
                    otherId: userId
                }
            });
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    };

    const isMe = currentUser?.id === userId;

    return {
        profile,
        loading,
        theme,
        isDark,
        isMe,
        isViewerVisible,
        setIsViewerVisible,
        handleStartChat,
        navigation
    };
};
