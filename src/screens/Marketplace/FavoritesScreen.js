import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LoadingSpinner, EmptyState, Toast } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { marketplaceService } from '../../services/marketplaceService';

const formatPrice = (price) => {
    if (!price && price !== 0) return '$0';
    return '$' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function FavoritesScreen({ navigation }) {
    const { theme, isDark } = useTheme();
    const { profile: userProfile } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

    useFocusEffect(
        useCallback(() => {
            if (userProfile) {
                loadFavorites();
            }
        }, [userProfile])
    );

    const loadFavorites = async () => {
        setLoading(true);
        const { data, error } = await marketplaceService.getFavoriteItems(userProfile.id);
        setLoading(false);

        if (!error) {
            setItems(data);
        } else {
            setToast({
                visible: true,
                message: 'No pudimos cargar tus favoritos.',
                type: 'error'
            });
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadFavorites();
        setRefreshing(false);
    };

    const handleToggleLike = async (itemId) => {
        const { error } = await marketplaceService.toggleLike(itemId, userProfile.id);
        if (!error) {
            // Eliminar de la lista localmente para feedback inmediato
            setItems(prev => prev.filter(item => item.id !== itemId));
        }
    };

    const formatPriceOriginal = (price) => { // Mantener nombre si es necesario o reemplazar uso
        return formatPrice(price);
    };

    const renderItem = ({ item }) => (
        <View style={[styles.productCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.imagen_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400' }}
                    style={styles.productImage}
                />
                <TouchableOpacity
                    style={[styles.favoriteBadge, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255,255,255,0.9)' }]}
                    onPress={() => handleToggleLike(item.id)}
                >
                    <MaterialCommunityIcons name="heart" size={20} color="#E11D48" />
                </TouchableOpacity>
                <View style={[styles.sellerBadge, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255,255,255,0.9)' }]}>
                    <Image
                        source={{ uri: item.profiles?.foto_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' }}
                        style={styles.sellerAvatar}
                    />
                    <Text style={[styles.sellerName, { color: theme.colors.text }]}>{item.profiles?.nombre || 'Vecino'}</Text>
                </View>
            </View>

            <View style={styles.productInfo}>
                <View style={styles.infoTop}>
                    <Text style={[styles.productTitle, { color: theme.colors.text }]}>{item.titulo}</Text>
                    <Text style={[styles.price, { color: theme.colors.text }]}>{formatPrice(item.precio)}</Text>
                </View>
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                    {item.categoria} • {item.estado} • {item.profiles?.depto ? `Torre ${item.profiles.depto.substring(0, 1)}` : 'Comunidad'}
                </Text>

                <TouchableOpacity
                    style={[styles.contactBtn, { backgroundColor: isDark ? theme.colors.primary : '#0f172a' }]}
                    onPress={() => navigation.navigate('ItemDetail', { item })}
                >
                    <Text style={styles.contactBtnText}>Contactar Vendedor</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderHeader = (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.marketplaceText, { color: theme.colors.text }]}>Club</Text>
                <View style={styles.headerIcons}>
                    <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(225, 29, 72, 0.1)' : '#fef2f2', borderColor: 'transparent' }]}>
                        <MaterialCommunityIcons name="heart" size={24} color="#E11D48" />
                    </View>
                </View>
            </View>
            <View style={styles.titleSection}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Mis Favoritos</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Cosas que te encantaron en tu comunidad.</Text>
            </View>
        </View>
    );

    if (loading && !items.length) return <LoadingSpinner />;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <View style={styles.container}>
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={renderHeader}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <EmptyState
                            icon="heart-off-outline"
                            title="Aún no tienes favoritos"
                            message="Explora el marketplace y guarda lo que te guste."
                        />
                    }
                />
            </View>
            <Toast
                visible={toast.visible}
                message={toast.message}
                onDismiss={() => setToast({ ...toast, visible: false })}
                type={toast.type}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    backBtn: {
        marginLeft: -8,
    },
    marketplaceText: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
        flex: 1,
        marginLeft: 8,
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    headerBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#E11D48',
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    headerBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
    },
    titleSection: {
        marginTop: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 40,
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 32,
        marginHorizontal: 24,
        marginBottom: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 4 / 3,
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    favoriteBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    sellerBadge: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    sellerAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fff',
    },
    sellerName: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1e293b',
    },
    productInfo: {
        padding: 20,
    },
    infoTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    productTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0f172a',
        flex: 1,
        marginRight: 10,
    },
    price: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
    },
    metaText: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 20,
        fontWeight: '500',
    },
    contactBtn: {
        backgroundColor: '#0f172a',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    }
});
