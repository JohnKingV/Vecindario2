import React, { useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    ScrollView,
    StatusBar,
    Platform,
    Animated,
} from 'react-native';
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
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, LoadingSpinner, EmptyState, Input, FilterModal, Toast, ItemCard, LoadingDots, ModernFAB } from '../../../components';
import { useMarketplaceScreen } from './useMarketplaceScreen';

const HEADER_HEIGHT = 60;
const STICKY_HEIGHT = 155; // Search + Wrapped Categories
const COLUMN_COUNT = 2;

// ModernSellButton removed, using shared ModernFAB

export default function MarketplaceScreenNative({ navigation }) {
    const logic = useMarketplaceScreen(navigation);
    const { theme, isDark } = logic;



    const renderHeader = (
        <Animated.View style={[
            styles.animatedHeader,
            {
                height: logic.HEADER_HEIGHT + logic.STICKY_HEIGHT,
                transform: [{ translateY: logic.stickyTranslateY }],
                backgroundColor: theme.colors.background,
                zIndex: 10,
            }
        ]}>
            {/* Top Row: Back, Title, Favorites */}
            <Animated.View style={[
                styles.headerTop,
                {
                    opacity: logic.headerOpacity,
                    transform: [{ translateY: logic.headerTranslateY }],
                }
            ]}>
                <View style={styles.topRow}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.roundBtn, { backgroundColor: theme.colors.inputBackground }]}>
                            <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                            <Avatar
                                uri={logic.userProfile?.foto_url}
                                name={logic.userProfile?.nombre}
                                size={44}
                                status={logic.userProfile?.status}
                                featured={logic.userProfile?.is_featured || logic.userProfile?.raiting_ventas >= 4.0}
                            />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Club</Text>
                    </View>
                    <ModernFAB
                        onPress={() => navigation.navigate('Favorites')}
                        icon="heart"
                        size={48}
                        colors={['#ffffff', '#f8fafc', '#f1f5f9']}
                        iconColor="#FFA500"
                        style={{
                            borderWidth: 1,
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            borderRadius: 24,
                        }}
                    />
                </View>
            </Animated.View>

            {/* PREMIUM STICKY FAB */}
            <Animated.View style={[
                styles.stickyFabContainer,
                {
                    transform: [
                        { translateY: logic.fabTranslateY },
                        { translateX: logic.fabTranslateX },
                        { scale: logic.fabScale }
                    ]
                }
            ]}>
                <ModernFAB
                    onPress={() => navigation.navigate('CreateItem')}
                    label="VENDER"
                    size={48}
                />
            </Animated.View>

            {/* Sticky Section: Search & Categories */}
            <View style={styles.stickySection}>
                <View style={[
                    styles.searchSection,
                    { paddingRight: 80 }
                ]}>
                    <Input
                        placeholder="¿Qué buscas en tu barrio?"
                        value={logic.search}
                        onChangeText={logic.setSearch}
                        noMargin
                        leftIcon={<MaterialCommunityIcons name="magnify" size={22} color={theme.colors.textSecondary} />}
                    />
                </View>
                <View style={styles.catContainer}>
                    <View style={styles.catRowJustified}>
                        {logic.CATEGORIES.slice(0, 4).map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => logic.handleCategorySelect(cat)}
                                style={[
                                    styles.catChip,
                                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                                    logic.activeCategory === cat && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                ]}
                            >
                                <Text style={[
                                    styles.catText,
                                    { color: theme.colors.textSecondary },
                                    logic.activeCategory === cat && { color: '#fff' }
                                ]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.catRowCentered}>
                        {logic.CATEGORIES.slice(4).map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => logic.handleCategorySelect(cat)}
                                style={[
                                    styles.catChip,
                                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                                    logic.activeCategory === cat && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                ]}
                            >
                                <Text style={[
                                    styles.catText,
                                    { color: theme.colors.textSecondary },
                                    logic.activeCategory === cat && { color: '#fff' }
                                ]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Animated.View>
    );

    const renderProduct = ({ item }) => (
        <ItemCard
            item={item}
            userProfile={logic.userProfile}
            theme={theme}
            onPress={() => navigation.navigate('ItemDetail', { item })}
            onLike={(e) => {
                e.stopPropagation();
                logic.handleLike(item.id);
            }}
            isService={item.categoria === 'Servicios'}
            activeCategory={logic.activeCategory}
            formatPrice={logic.formatPrice}
        />
    );

    if (logic.loading && !logic.items.length) return <LoadingSpinner />;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />

                <Animated.FlatList
                    style={{ opacity: logic.contentOpacity }}
                    key={logic.activeCategory === 'Servicios' ? 'h' : 'v'}
                    data={logic.filteredProducts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderProduct}
                    numColumns={logic.activeCategory === 'Servicios' ? 1 : COLUMN_COUNT}
                    columnWrapperStyle={logic.activeCategory === 'Servicios' ? null : styles.columnWrapper}
                    contentContainerStyle={[
                        styles.listPadding,
                        { paddingTop: logic.HEADER_HEIGHT + logic.STICKY_HEIGHT }
                    ]}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: logic.scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    scrollEventThrottle={16}
                    refreshControl={
                        <RefreshControl
                            refreshing={logic.refreshing}
                            onRefresh={logic.onRefresh}
                            progressViewOffset={logic.HEADER_HEIGHT + logic.STICKY_HEIGHT}
                        />
                    }
                    ListEmptyComponent={
                        !logic.loading && (
                            <EmptyState
                                icon="🏷️"
                                title="No hay artículos"
                                message="Sé el primero en vender algo que ya no uses."
                            />
                        )
                    }
                />

                {renderHeader}


                <FilterModal
                    isVisible={logic.filterModalVisible}
                    onClose={() => logic.setFilterModalVisible(false)}
                    onApplyFilters={logic.handleApplyFilters}
                    initialFilters={logic.filterConditions}
                />

                <Toast
                    visible={logic.toast.visible}
                    message={logic.toast.message}
                    onDismiss={() => logic.setToast({ ...logic.toast, visible: false })}
                    type={logic.toast.type}
                />

                {logic.isFiltering && (
                    <View style={styles.loadingOverlay}>
                        <LoadingDots size={12} color={theme.colors.primary} />
                    </View>
                )}
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
    listPadding: {
        paddingHorizontal: 8,
        paddingBottom: 40,
    },
    animatedHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    headerTop: {
        height: 60,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    stickyFabContainer: {
        position: 'absolute',
        top: 6,
        right: 76,
        zIndex: 200,
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
    stickySection: {
        minHeight: STICKY_HEIGHT,
        paddingBottom: 8,
    },
    searchSection: {
        paddingHorizontal: 16,
        paddingTop: 4,
    },
    catContainer: {
        paddingTop: 8,
        paddingBottom: 10,
        paddingHorizontal: 16,
        gap: 8,
    },
    catRowJustified: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    catRowCentered: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    catChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
    },
    catText: {
        fontSize: 13,
        fontWeight: '800',
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    fabPosition: {
        bottom: Platform.OS === 'ios' ? 110 : 90,
        right: 20,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 220,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
});
