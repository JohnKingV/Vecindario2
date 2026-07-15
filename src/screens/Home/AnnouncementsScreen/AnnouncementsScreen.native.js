import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Reanimated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    interpolate
} from 'react-native-reanimated';
import { useUnifiedFeed } from '../../../hooks/useUnifiedFeed';
import { useTheme } from '../../../context/ThemeContext';
import { Avatar, Input } from '../../../components';

const HEADER_HEIGHT = 60;
const STICKY_HEIGHT = 100; // Search + Chips

// Memoized Card Component for maximum performance
const AnnouncementCard = React.memo(({ item, theme, navigation, formatDate }) => {
    const isMarketplace = item.unifiedType === 'marketplace';
    const typeLabel = (item.tipo || (isMarketplace ? 'club' : 'anuncio')).toUpperCase();

    // Glimmer Animation Logic
    const shimmerX = useSharedValue(-100);
    const pulseValue = useSharedValue(0.9);

    React.useEffect(() => {
        shimmerX.value = withRepeat(
            withSequence(
                withTiming(100, { duration: 1500, easing: Easing.linear }),
                withDelay(3500, withTiming(-100, { duration: 0 }))
            ),
            -1,
            false
        );

        pulseValue.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1500 }),
                withTiming(0.8, { duration: 1500 })
            ),
            -1,
            true
        );
    }, []);

    const shimmerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: interpolate(shimmerX.value, [-100, 100], [-80, 180]) }],
    }));

    const pulseStyle = useAnimatedStyle(() => ({
        opacity: pulseValue.value,
    }));


    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate(isMarketplace ? 'ItemDetail' : 'PostDetail', {
                item: isMarketplace ? item : undefined,
                post: !isMarketplace ? item : undefined
            })}
        >
            <Image
                source={{ uri: item.imagen_url || item.image || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=800' }}
                style={styles.cardImage}
            />
            <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                    <Reanimated.View style={[styles.categoryBadge, { backgroundColor: theme.colors.primary + '20' }, pulseStyle]}>
                        <Reanimated.View style={[StyleSheet.absoluteFill, shimmerStyle, { overflow: 'hidden', borderRadius: 8 }]}>
                            <LinearGradient
                                colors={['transparent', 'rgba(255,255,255,0.0)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.0)', 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                        </Reanimated.View>
                        <Text style={[styles.categoryText, { color: theme.colors.primary }]}>{typeLabel}</Text>
                    </Reanimated.View>
                    <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>{formatDate(item.created_at)}</Text>
                </View>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.titulo || item.title}</Text>
                <Text style={[styles.cardContent, { color: theme.colors.textSecondary }]} numberOfLines={3}>
                    {item.contenido || item.content}
                </Text>
                <View style={styles.cardFooter}>
                    <View style={styles.authorRow}>
                        <Avatar uri={item.profiles?.foto_url} size={24} />
                        <Text style={[styles.authorName, { color: theme.colors.textSecondary }]}>
                            {item.profiles?.nombre || 'Administración'}
                        </Text>
                    </View>
                    <View style={styles.readMoreBtn}>
                        <Text style={[styles.readMoreText, { color: theme.colors.primary }]}>Leer más</Text>
                        <MaterialCommunityIcons name="chevron-right" size={18} color={theme.colors.primary} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

export default function AnnouncementsScreenNative({ navigation }) {
    const { theme } = useTheme();
    const { data, loading, refreshing, onRefresh, userProfile, user } = useUnifiedFeed({ includeMarketplace: true });
    const [activeTab, setActiveTab] = useState('Todos');
    const [searchQuery, setSearchQuery] = useState('');

    const scrollY = useRef(new Animated.Value(0)).current;

    const tabs = ['Todos', 'Seguridad', 'Eventos', 'Mejoras', 'Club'];

    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [0, -HEADER_HEIGHT],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_HEIGHT / 2],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const stickyTranslateY = scrollY.interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [0, -HEADER_HEIGHT],
        extrapolate: 'clamp',
    });

    const filteredData = useMemo(() => {
        let result = data;
        if (activeTab === 'Club') {
            result = result.filter(item => item.unifiedType === 'marketplace');
        } else if (activeTab !== 'Todos') {
            result = result.filter(item => item.tipo?.toLowerCase() === activeTab.toLowerCase());
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item =>
                (item.titulo || item.title || '').toLowerCase().includes(query) ||
                (item.contenido || item.content || '').toLowerCase().includes(query)
            );
        }
        return result;
    }, [data, activeTab, searchQuery]);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'Reciente';
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        if (diffInHours < 1) return 'Ahora';
        if (diffInHours < 24) return `Hace ${diffInHours}h`;
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${d}/${m}/${date.getFullYear()}`;
    }, []);

    const renderItem = useCallback(({ item }) => (
        <AnnouncementCard item={item} theme={theme} navigation={navigation} formatDate={formatDate} />
    ), [theme, navigation, formatDate]);

    const renderHeader = (
        <Animated.View style={[
            styles.animatedHeader,
            {
                height: HEADER_HEIGHT + STICKY_HEIGHT,
                transform: [{ translateY: stickyTranslateY }],
                backgroundColor: theme.colors.background,
                zIndex: 10,
            }
        ]}>
            <Animated.View style={[
                styles.headerTop,
                {
                    opacity: headerOpacity,
                    transform: [{ translateY: headerTranslateY }],
                }
            ]}>
                <View style={styles.topRow}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.roundBtn, { backgroundColor: theme.colors.inputBackground }]}>
                            <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Comunicados</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.roundBtn, styles.accentBtn]}
                        onPress={() => navigation.navigate('Feed', { openCreateModal: true })}
                    >
                        <MaterialCommunityIcons name="plus" size={26} color="#fff" />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <View style={styles.stickySection}>
                <View style={styles.searchSection}>
                    <Input
                        placeholder="Buscar en comunicados"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        noMargin
                        leftIcon={<MaterialCommunityIcons name="magnify" size={22} color={theme.colors.textSecondary} />}
                    />
                </View>
                <View style={styles.tabBar}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                        {tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                style={[
                                    styles.tabChip,
                                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                                    activeTab === tab && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                ]}
                            >
                                <Text style={[
                                    styles.tabText,
                                    { color: theme.colors.textSecondary },
                                    activeTab === tab && { color: '#fff' }
                                ]}>{tab}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Animated.View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Animated.FlatList
                    data={filteredData}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    scrollEventThrottle={16}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingTop: HEADER_HEIGHT + STICKY_HEIGHT }
                    ]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} progressViewOffset={HEADER_HEIGHT + STICKY_HEIGHT} />
                    }
                />
                {renderHeader}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    animatedHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    headerTop: {
        height: HEADER_HEIGHT,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    roundBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    accentBtn: {
        backgroundColor: '#3b82f6',
        shadowColor: '#3b82f6',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 4,
    },
    stickySection: {
        height: STICKY_HEIGHT,
    },
    searchSection: {
        paddingHorizontal: 16,
        paddingTop: 4,
    },
    tabBar: {
        paddingTop: 8,
        paddingBottom: 10,
    },
    tabScroll: {
        paddingHorizontal: 16,
        gap: 8,
    },
    tabChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '800',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        marginHorizontal: 16,
        marginBottom: 20,
    },
    cardImage: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#f1f5f9',
    },
    cardBody: {
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    dateText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '900',
        lineHeight: 26,
    },
    cardContent: {
        fontSize: 15,
        marginTop: 8,
        lineHeight: 22,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    authorName: {
        fontSize: 13,
        fontWeight: '700',
    },
    readMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    readMoreText: {
        fontSize: 13,
        fontWeight: '900',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
