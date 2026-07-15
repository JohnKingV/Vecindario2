import { useState, useEffect, useMemo } from 'react';
import { authService } from '../../../services/authService';
import { messagesService } from '../../../services/messagesService';
import { useAuth } from '../../../hooks/useAuth';

export const useNewMessageScreen = (navigation) => {
    const { user, profile } = useAuth();
    const [neighbors, setNeighbors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (profile?.comunidad_id) {
            loadNeighbors();
        } else if (profile) {
            setLoading(false);
        }
    }, [profile]);

    const loadNeighbors = async () => {
        const { data, error } = await authService.getCommunityNeighbors(profile.comunidad_id, user.id);
        if (!error) setNeighbors(data || []);
        setLoading(false);
    };

    const handleSelectNeighbor = async (neighbor) => {
        try {
            const { data: conv, error } = await messagesService.getOrCreateConversation(user.id, neighbor.id);
            if (!error) {
                navigation.replace('Chat', {
                    conversation: {
                        id: conv.id,
                        name: neighbor.nombre,
                        avatar: neighbor.foto_url,
                        otherId: neighbor.id,
                        raiting_ventas: neighbor.raiting_ventas
                    }
                });
            }
        } catch (error) {
            console.error('Error starting conversation:', error);
        }
    };

    const filteredNeighbors = useMemo(() => {
        return neighbors.filter(n =>
            (n.nombre && n.nombre.toLowerCase().includes(search.toLowerCase())) ||
            (n.depto && n.depto.toLowerCase().includes(search.toLowerCase()))
        );
    }, [neighbors, search]);

    const groupedNeighbors = useMemo(() => {
        const groups = {};
        filteredNeighbors.forEach(neighbor => {
            const firstLetter = neighbor.nombre.charAt(0).toUpperCase();
            if (!groups[firstLetter]) groups[firstLetter] = [];
            groups[firstLetter].push(neighbor);
        });
        return Object.keys(groups).sort().map(letter => ({
            letter,
            data: groups[letter]
        }));
    }, [filteredNeighbors]);

    return {
        search, setSearch,
        loading,
        groupedNeighbors,
        profile,
        handleSelectNeighbor,
    };
};
