import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { postsService } from '../../../services/postsService';

export const useServicesScreen = (navigation) => {
    const { profile, user } = useAuth();
    const { theme, isDark } = useTheme();
    const [activeTab, setActiveTab] = useState('Todo');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadPosts = async () => {
        if (!profile?.comunidad_id) return;

        const { data, error } = await postsService.getPosts(profile.comunidad_id, user.id);
        if (!error) {
            const filtered = activeTab === 'Todo'
                ? data
                : data.filter(p => p.tipo?.toLowerCase() === activeTab.toLowerCase());
            setPosts(filtered);
        }
        setLoading(false);
        setRefreshing(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadPosts();
        }, [profile, activeTab])
    );

    const handleToggleLike = async (postId) => {
        const { error } = await postsService.toggleLike(postId, user.id);
        if (!error) {
            loadPosts();
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadPosts();
    };

    return {
        profile,
        user,
        theme,
        isDark,
        activeTab,
        setActiveTab,
        posts,
        loading,
        refreshing,
        handleRefresh,
        handleToggleLike,
        navigation
    };
};
