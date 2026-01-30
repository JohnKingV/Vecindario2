import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Platform,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Badge, Button, LoadingSpinner, EmptyState } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { postsService } from '../../services/postsService';

const ServiceCard = ({ item, onToggleLike }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={styles.authorRow}>
                <Avatar uri={item.profiles?.foto_url} size="sm" />
                <View>
                    <Text style={styles.authorName}>{item.profiles?.nombre || 'Vecino'}</Text>
                    <Text style={styles.cardMeta}>{item.profiles?.depto || 'Vecindario'} • {item.tipo?.toUpperCase()}</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.moreButton}>
                <MaterialCommunityIcons name="dots-horizontal" size={20} color="#94a3b8" />
            </TouchableOpacity>
        </View>

        <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{item.titulo}</Text>
            <Text style={styles.cardContent}>{item.contenido}</Text>
        </View>

        {item.imagen_url && (
            <Image source={{ uri: item.imagen_url }} style={styles.cardImage} resizeMode="cover" />
        )}

        <View style={styles.cardFooter}>
            <View style={styles.statsRow}>
                <TouchableOpacity style={styles.statItem} onPress={() => onToggleLike(item.id)}>
                    <MaterialCommunityIcons
                        name={item.isLiked ? "heart" : "heart-outline"}
                        size={20}
                        color={item.isLiked ? "#ef4444" : "#64748b"}
                    />
                    <Text style={[styles.statText, item.isLiked && { color: '#ef4444' }]}>{item.likes_count || 0}</Text>
                </TouchableOpacity>
                <View style={styles.statItem}>
                    <MaterialCommunityIcons name="chat-outline" size={20} color="#64748b" />
                    <Text style={styles.statText}>{item.comments_count || 0}</Text>
                </View>
            </View>
            <Button
                variant="outline"
                size="sm"
                style={styles.cardActionBtn}
                textStyle={styles.cardActionBtnText}
            >
                RESPONDER
            </Button>
        </View>
    </View>
);

export default function ServicesScreen({ navigation }) {
    const { profile, user } = useAuth();
    const [activeTab, setActiveTab] = useState('Todo');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadPosts = async () => {
        if (!profile?.comunidad_id) return;

        const { data, error } = await postsService.getPosts(profile.comunidad_id, user.id);
        if (!error) {
            // Filtrar localmente por pestaña si no es 'Todo'
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

    const HeaderComponent = () => (
        <View style={styles.header}>
            <View style={styles.topRow}>
                <TouchableOpacity style={styles.locationSelector}>
                    <View style={styles.locationIconContainer}>
                        <MaterialCommunityIcons name="map-marker" size={18} color="#197fe6" />
                    </View>
                    <Text style={styles.locationText}>{profile?.comunidad?.nombre || 'Mi Vecindario'}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={18} color="#94a3b8" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerIconButton}>
                    <MaterialCommunityIcons name="bell-outline" size={22} color="#111418" />
                    <View style={styles.notifDot} />
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                {['Todo', 'Aviso', 'Evento', 'Alerta'].map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.filterChip, activeTab === tab && styles.filterChipActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.filterText, activeTab === tab && styles.filterTextActive]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    if (loading && !refreshing) return <LoadingSpinner />;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                <FlatList
                    data={posts}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <ServiceCard item={item} onToggleLike={handleToggleLike} />}
                    ListHeaderComponent={HeaderComponent}
                    ListEmptyComponent={<EmptyState title="No hay publicaciones" message="Sé el primero en avisar algo a tus vecinos." />}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPosts(); }} />
                    }
                />

                <TouchableOpacity
                    style={styles.fab}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('CreatePost')}
                >
                    <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                    <Text style={styles.fabText}>Avisar</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#f6f7f8',
    },
    header: {
        backgroundColor: '#fff',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 8 : 16,
        paddingBottom: 16,
    },
    locationSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    locationIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(25, 127, 230, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111418',
    },
    headerIconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    notifDot: {
        position: 'absolute',
        top: 12,
        right: 13,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    filterContainer: {
        paddingHorizontal: 16,
        gap: 10,
    },
    filterChip: {
        paddingHorizontal: 20,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    filterChipActive: {
        backgroundColor: '#197fe6',
        borderColor: '#197fe6',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    filterTextActive: {
        color: '#fff',
    },
    listContent: {
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#fff',
        marginTop: 12,
        marginHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    authorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
    },
    authorName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111418',
    },
    cardMeta: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '500',
    },
    moreButton: {
        padding: 4,
    },
    cardBody: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111418',
        marginBottom: 4,
    },
    cardContent: {
        fontSize: 14,
        lineHeight: 20,
        color: '#475569',
    },
    cardImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#f1f5f9',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#f8fafc',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748b',
    },
    cardActionBtn: {
        height: 34,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    cardActionBtnText: {
        fontSize: 11,
        fontWeight: '800',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#197fe6',
        paddingVertical: 14,
        paddingHorizontal: 22,
        borderRadius: 30,
        elevation: 10,
        shadowColor: '#197fe6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        zIndex: 100,
        gap: 8,
    },
    fabText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
