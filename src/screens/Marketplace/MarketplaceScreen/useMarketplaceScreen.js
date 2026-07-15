import { useState, useCallback, useMemo, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useWindowDimensions, Platform, LayoutAnimation, UIManager, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { marketplaceService } from '../../../services/marketplaceService';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import * as Haptics from 'expo-haptics';

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

const CATEGORIES = ['Todos', 'Servicios', 'Hogar', 'Electrónica', 'Mascotas', 'Deporte', 'Otros'];

export const useMarketplaceScreen = (navigation) => {
    const { theme, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const { profile: userProfile } = useAuth();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filterConditions, setFilterConditions] = useState({
        condicion: null,
        priceRange: [0, 999999999],
    });
    const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

    const scrollY = useRef(new Animated.Value(0)).current;

    const HEADER_HEIGHT = 60;
    const STICKY_HEIGHT = 155;
    const SCROLL_DISTANCE = 60;

    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [0, -HEADER_HEIGHT],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE / 2],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const stickyTranslateY = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [0, -HEADER_HEIGHT],
        extrapolate: 'clamp',
    });

    const fabTranslateY = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [0, 62],
        extrapolate: 'clamp',
    });

    const fabTranslateX = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [0, 60],
        extrapolate: 'clamp',
    });

    const fabScale = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [1, 1],
        extrapolate: 'clamp',
    });

    useFocusEffect(
        useCallback(() => {
            if (userProfile) {
                loadItems();

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

    const contentOpacity = useRef(new Animated.Value(1)).current;

    const loadItems = useCallback(async () => {
        if (!userProfile?.comunidad_id) {
            setLoading(false);
            return;
        }

        if (items.length === 0) setLoading(true);

        try {
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

            if (!error && data) {
                setItems(data);
                setIsFiltering(false);
                // Animate In
                Animated.timing(contentOpacity, {
                    toValue: 1,
                    duration: 80,
                    useNativeDriver: true
                }).start();
            } else if (error) {
                console.error('[Marketplace] load error:', error);
                setToast({
                    visible: true,
                    message: error.message || 'No pudimos cargar los artículos.',
                    type: 'error'
                });
            }
        } catch (err) {
            console.error('[Marketplace] Unexpected load error:', err);
        } finally {
            setLoading(false);
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

    // Enable LayoutAnimation for Android
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    const handleCategorySelect = (cat) => {
        if (activeCategory === cat) return;

        // Animate Out before changing filter
        Animated.timing(contentOpacity, {
            toValue: 0,
            duration: 10,
            useNativeDriver: true
        }).start(() => {
            setIsFiltering(true);
            setActiveCategory(cat);
        });
    };

    return {
        // State
        items,
        loading,
        isFiltering,
        refreshing,
        search, setSearch,
        activeCategory, setActiveCategory,
        filterModalVisible, setFilterModalVisible,
        filterConditions,
        toast, setToast,

        // Data
        filteredProducts,
        userProfile,
        CATEGORIES,

        // Utils
        theme,
        isDark,
        insets,
        width,
        formatPrice,
        contentOpacity,
        scrollY,
        headerTranslateY,
        headerOpacity,
        stickyTranslateY,
        fabTranslateY,
        fabTranslateX,
        fabScale,
        HEADER_HEIGHT,
        STICKY_HEIGHT,

        // Handlers
        onRefresh,
        handleApplyFilters,
        handleLike,
        handleCategorySelect,
    };
};
