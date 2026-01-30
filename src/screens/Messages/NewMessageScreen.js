import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Input, EmptyState } from '../../components';
import { authService } from '../../services/authService';
import { messagesService } from '../../services/messagesService';
import { useAuth } from '../../hooks/useAuth';

export default function NewMessageScreen({ navigation }) {
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
                        otherId: neighbor.id
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

    const renderNeighbor = ({ item }) => (
        <TouchableOpacity
            style={styles.neighborItem}
            activeOpacity={0.7}
            onPress={() => handleSelectNeighbor(item)}
        >
            <Avatar
                uri={item.foto_url}
                name={item.nombre}
                size={56}
                style={styles.neighborAvatar}
            />
            <View style={styles.neighborInfo}>
                <Text style={styles.neighborName}>{item.nombre}</Text>
                <Text style={styles.neighborDepto}>
                    {item.depto ? `Depto ${item.depto}` : 'Vecino'} • {profile?.comunidades?.nombre || 'Mi Condominio'}
                </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
        </TouchableOpacity>
    );

    const renderHeader = (
        <View style={styles.header}>
            <View style={styles.topRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nuevo Mensaje</Text>
                <View style={{ width: 40 }} />
            </View>
            <View style={styles.searchBar}>
                <MaterialCommunityIcons name="magnify" size={20} color="#94a3b8" />
                <Input
                    placeholder="Buscar vecino..."
                    value={search}
                    onChangeText={setSearch}
                    containerStyle={styles.searchInputContainer}
                    style={styles.searchInput}
                    rightIcon={search.length > 0 ? (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <MaterialCommunityIcons name="close-circle" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    ) : null}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            {renderHeader}

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            ) : (
                <FlatList
                    data={groupedNeighbors}
                    keyExtractor={(item) => item.letter}
                    renderItem={({ item }) => (
                        <View style={styles.section}>
                            <Text style={styles.sectionLetter}>{item.letter}</Text>
                            {item.data.map(neighbor => (
                                <React.Fragment key={neighbor.id}>
                                    {renderNeighbor({ item: neighbor })}
                                    <View style={styles.separator} />
                                </React.Fragment>
                            ))}
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <EmptyState
                            icon="👥"
                            title="No se encontraron vecinos"
                            message="Intenta con otro nombre o número de departamento."
                        />
                    }
                />
            )}

            {/* Alphabet Scroll Indicator (Visual only as per design) */}
            <View style={styles.alphabetNav}>
                {'ABCDEFGHIJKLMNO PQRSTUVWXYZ'.split('').map((l, i) => (
                    <Text key={i} style={styles.alphabetLetter}>{l}</Text>
                ))}
                <MaterialCommunityIcons name="magnify" size={12} color="#3b82f6" />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: '#fff',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 48,
        marginTop: 8,
    },
    searchInputContainer: {
        flex: 1,
        marginBottom: 0,
    },
    searchInput: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        fontSize: 15,
        paddingHorizontal: 8,
    },
    listContent: {
        paddingBottom: 40,
    },
    section: {
        marginBottom: 16,
    },
    sectionLetter: {
        fontSize: 12,
        fontWeight: '800',
        color: '#94a3b8',
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 8,
        letterSpacing: 1,
    },
    neighborItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        gap: 16,
    },
    neighborAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: '#f8fafc',
    },
    neighborInfo: {
        flex: 1,
    },
    neighborName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
    },
    neighborDepto: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    separator: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginLeft: 96,
        marginRight: 24,
    },
    alphabetNav: {
        position: 'absolute',
        right: 8,
        top: '30%',
        alignItems: 'center',
        gap: 2,
    },
    alphabetLetter: {
        fontSize: 10,
        fontWeight: '800',
        color: '#3b82f6',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
