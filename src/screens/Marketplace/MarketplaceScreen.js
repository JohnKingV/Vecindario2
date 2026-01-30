import React, { useState, useMemo, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
    ScrollView,
    Platform,
    StatusBar,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { notificationService } from '../../services/notificationService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, LoadingSpinner, EmptyState, Input, Button, FilterModal, Toast, ResilientImage, ItemCard } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { marketplaceService } from '../../services/marketplaceService';
import { useWindowDimensions } from 'react-native';

const formatPrice = (price) => {
    if (!price && price !== 0) return '$0';
    return '$' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const COLUMN_COUNT = 2;

const MOCK_SERVICES = [
    {
        id: 's1',
        titulo: 'Recomendación de Plomero',
        descripcion: '¿Alguien conoce a un buen plomero en la zona? Tengo una fuga en el fregadero que no puedo detener.',
        imagen_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
        categoria: 'Servicios',
        precio: 0,
        profiles: {
            nombre: 'Juan Perez',
            foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
        }
    },
    {
        id: 's2',
        titulo: 'Clases de Yoga al Aire Libre',
        descripcion: '¡Hola vecinos! Estaré dando clases de yoga todos los sábados a las 8 AM en el parque central del conjunto. Todos los niveles bienvenidos.',
        imagen_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
        categoria: 'Servicios',
        precio: 25000,
        profiles: {
            nombre: 'Maria G.',
            foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
        }
    },
    {
        id: 's3',
        titulo: 'Paseadora de Perros Certificada',
        descripcion: 'Cuido y paseo a tus peludos con toda la dedicación. Tengo experiencia con razas grandes y pequeñas.',
        imagen_url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800',
        categoria: 'Servicios',
        precio: 15000,
        profiles: {
            nombre: 'Lucía - Apto 402',
            foto_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150'
        }
    }
];

export default function MarketplaceScreen({ navigation }) {
    const { theme, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const { profile: userProfile, unreadNotifications } = useAuth();
    const isAdmin = userProfile?.role === 'admin';
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filterConditions, setFilterConditions] = useState({
        condicion: null,
        priceRange: [0, 999999999],
    });
    const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

    useFocusEffect(
        useCallback(() => {
            if (userProfile) {
                loadItems();

                // Suscripción en tiempo real
                const subscription = marketplaceService.subscribeToMarketplaceChanges(
                    userProfile.comunidad_id,
                    () => {
                        loadItems();
                    }
                );

                return () => {
                    marketplaceService.unsubscribeMarketplace(subscription);
                };
            }
        }, [userProfile, activeCategory, filterConditions, search])
    );


    const loadItems = useCallback(async () => {
        if (!userProfile?.comunidad_id) return;

        // Si es la primera carga y no hay items, mostrar loading
        if (items.length === 0) setLoading(true);

        const filters = {
            category: activeCategory === 'Todos' ? null : activeCategory,
            condition: filterConditions.condicion,
            minPrice: filterConditions.priceRange[0],
            maxPrice: filterConditions.priceRange[1],
            search: search.trim() || null,
            userId: userProfile.id
        };

        const { data, error } = await marketplaceService.getItemsByCommunity(
            userProfile.comunidad_id,
            filters
        );

        setLoading(false);

        if (!error && data) {
            setItems(data);
        } else if (error) {
            console.error('[Marketplace] load error:', error);
            setToast({
                visible: true,
                message: error.message || 'No pudimos cargar los artículos.',
                type: 'error'
            });
        }
    }, [userProfile?.comunidad_id, activeCategory, filterConditions, search, items.length]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadItems();
        setRefreshing(false);
    }, [loadItems]);

    const handleApplyFilters = useCallback((filters) => {
        setFilterConditions(filters);
        setFilterModalVisible(false);
    }, []);

    const filteredProducts = useMemo(() => {
        if (activeCategory === 'Servicios') {
            return [...items, ...MOCK_SERVICES];
        }
        return items;
    }, [items, activeCategory]);

    const formatPrice = (price) => {
        if (!price && price !== 0) return '$0';
        return '$' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handleLike = useCallback(async (itemId) => {
        if (!userProfile) return;

        // Optimistic UI update
        setItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const newHasLiked = !item.has_liked;
                return {
                    ...item,
                    has_liked: newHasLiked,
                    likes_count: newHasLiked ? (item.likes_count || 0) + 1 : Math.max(0, (item.likes_count || 1) - 1)
                };
            }
            return item;
        }));

        try {
            await marketplaceService.toggleLike(itemId, userProfile.id);
        } catch (error) {
            console.error('[Marketplace] Like error:', error);
        }
    }, [userProfile]);

    const renderProduct = useCallback(({ item }) => (
        <ItemCard
            item={item}
            userProfile={userProfile}
            theme={theme}
            onPress={() => navigation.navigate('ItemDetail', { item })}
            onLike={(e) => {
                e.stopPropagation();
                handleLike(item.id);
            }}
            isService={item.categoria === 'Servicios'}
            activeCategory={activeCategory}
            formatPrice={formatPrice}
        />
    ), [userProfile, theme, navigation, handleLike, activeCategory]);

    const renderHeader = (
        <View style={[styles.headerContainer, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
            <View style={styles.headerTop}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconBtn, { backgroundColor: theme.colors.inputBackground }]}>
                        <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.premiumTitle, { color: theme.colors.text }]}>Club</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={[styles.iconBtn, { backgroundColor: theme.colors.inputBackground }]}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <MaterialCommunityIcons name="bell-outline" size={22} color={theme.colors.text} />
                        {unreadNotifications > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.iconBtn, { backgroundColor: theme.colors.inputBackground }]}
                        onPress={() => navigation.navigate('Favorites')}
                    >
                        <MaterialCommunityIcons name="heart-outline" size={22} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.searchBox}>
                <View style={[styles.searchInner, { backgroundColor: theme.colors.inputBackground }]}>
                    <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textSecondary} />
                    <Input
                        placeholder="¿Qué buscas en tu barrio?"
                        value={search}
                        onChangeText={setSearch}
                        containerStyle={styles.searchInnerInputContainer}
                        style={[styles.searchInnerInput, { color: theme.colors.text }]}
                        placeholderTextColor={theme.colors.placeholder}
                        rightIcon={search.length > 0 ? (
                            <TouchableOpacity onPress={() => setSearch('')}>
                                <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        ) : null}
                    />
                </View>
            </View>

            <View style={styles.catBar}>
                {['Todos', 'Servicios', 'Hogar', 'Electrónica', 'Mascotas', 'Deporte', 'Otros'].map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[
                            styles.catChip,
                            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                            activeCategory === cat && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                        ]}
                        onPress={() => setActiveCategory(cat)}
                    >
                        <Text style={[
                            styles.catText,
                            { color: theme.colors.textSecondary },
                            activeCategory === cat && { color: '#fff' }
                        ]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    if (loading && !items.length) return <LoadingSpinner />;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <FlatList
                    key={activeCategory === 'Servicios' ? 'h' : 'v'}
                    data={filteredProducts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderProduct}
                    numColumns={activeCategory === 'Servicios' ? 1 : COLUMN_COUNT}
                    columnWrapperStyle={activeCategory === 'Servicios' ? null : styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={renderHeader}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        !loading && <EmptyState
                            icon="🏷️"
                            title="No hay artículos"
                            message="Sé el primero en vender algo que ya no uses."
                        />
                    }
                />

                <TouchableOpacity
                    style={styles.fab}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('CreateItem')}
                >
                    <MaterialCommunityIcons name="plus" size={32} color="#fff" />
                    <Text style={styles.fabText}>VENDER</Text>
                </TouchableOpacity>

                <FilterModal
                    isVisible={filterModalVisible}
                    onClose={() => setFilterModalVisible(false)}
                    onApplyFilters={handleApplyFilters}
                    initialFilters={filterConditions}
                />

                <Toast
                    visible={toast.visible}
                    message={toast.message}
                    onDismiss={() => setToast({ ...toast, visible: false })}
                    type={toast.type}
                />
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
        backgroundColor: '#f8fafc',
    },
    headerContainer: {
        backgroundColor: '#fff',
        paddingBottom: 8,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    premiumTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 8,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#ef4444',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        paddingHorizontal: 2,
    },
    badgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '900',
    },
    searchBox: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    searchInner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 48,
        gap: 12,
    },
    searchInnerInputContainer: {
        flex: 1,
        marginBottom: 0,
    },
    searchInnerInput: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        paddingHorizontal: 0,
        fontSize: 15,
    },
    catBar: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    catChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    catChipActive: {
        backgroundColor: '#1E3A8A',
        borderColor: '#1E3A8A',
    },
    catText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    catTextActive: {
        color: '#fff',
    },
    listContent: {
        paddingHorizontal: 8,
        paddingBottom: 120, // Space for Tab Bar and FAB
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    productCard: {
        flex: 1,
        marginHorizontal: 8,
        marginBottom: 24,
        minWidth: 150, // Asegura un tamaño mínimo razonable
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 24,
        backgroundColor: '#f1f5f9',
        position: 'relative',
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    favoriteBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteBadgeActive: {
        backgroundColor: '#fff',
    },
    deleteBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productInfo: {
        marginTop: 10,
        paddingHorizontal: 4,
    },
    price: {
        fontSize: 17,
        fontWeight: '900',
        color: '#0f172a',
    },
    productTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
        marginTop: 2,
    },
    sellerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 6,
    },
    sellerAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    sellerName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94a3b8',
    },
    serviceCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    serviceHeader: {
        flexDirection: 'row',
        padding: 16,
    },
    authorAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f1f5f9',
    },
    authorName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0f172a',
    },
    cardMeta: {
        fontSize: 12,
        color: '#94a3b8',
    },
    authorRowSpaceBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    serviceDeleteBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fef2f2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    serviceBody: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    serviceTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 6,
    },
    serviceContent: {
        fontSize: 14,
        lineHeight: 22,
        color: '#475569',
    },
    serviceImage: {
        width: '100%',
        height: 200,
    },
    serviceFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
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
        gap: 6,
    },
    statText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
    },
    cardActionBtn: {
        height: 40,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    cardActionBtnText: {
        fontSize: 12,
        fontWeight: '900',
    },
    fab: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 110 : 90,
        right: 20,
        backgroundColor: '#1E3A8A',
        width: 68,
        height: 68,
        borderRadius: 34,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            web: {
                boxShadow: '0px 10px 15px rgba(30, 58, 138, 0.4)',
            },
            default: {
                shadowColor: '#1E3A8A',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.4,
                shadowRadius: 15,
                elevation: 10,
            }
        }),
        zIndex: 9999,
    },
    fabText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#fff',
        marginTop: 2,
    },
    serviceTag: {
        position: 'absolute',
        top: 10,
        left: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        zIndex: 10,
    },
    serviceTagText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
    },
});
