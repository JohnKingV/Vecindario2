import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LoadingSpinner, EmptyState, Input, FilterModal, Toast, ItemCard, ResponsiveContainer, PremiumHeader } from '../../../components';
import { useMarketplaceScreen } from './useMarketplaceScreen';

const COLUMN_COUNT_WEB = 3;

export default function MarketplaceScreenWeb({ navigation }) {
    const logic = useMarketplaceScreen(navigation);
    const { theme, width } = logic;
    const isLargeScreen = width > 1024;
    const numColumns = logic.activeCategory === 'Servicios' ? 1 : (isLargeScreen ? 4 : 3);

    const renderProduct = ({ item }) => (
        <View style={logic.activeCategory !== 'Servicios' ? styles.gridItem : styles.listItem}>
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
                style={styles.card}
            />
        </View>
    );

    const renderHeader = (
        <View style={[styles.headerContainer, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24, marginTop: 12 }}>
                    <View style={{ flex: 1 }}>
                        <Input
                            placeholder="¿Qué buscas en tu barrio?"
                            value={logic.search}
                            onChangeText={logic.setSearch}
                            noMargin
                            leftIcon={<MaterialCommunityIcons name="magnify" size={24} color={theme.colors.textSecondary} />}
                            rightIcon={logic.search.length > 0 ? (
                                <TouchableOpacity onPress={() => logic.setSearch('')}>
                                    <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            ) : null}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.iconBtn, { backgroundColor: theme.colors.inputBackground }]}
                        onPress={() => navigation.navigate('Favorites')}
                    >
                        <MaterialCommunityIcons name="heart-outline" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.iconBtn, { backgroundColor: theme.colors.inputBackground }]}
                        onPress={() => logic.setIsFilterModalVisible(true)}
                    >
                        <MaterialCommunityIcons name="filter-variant" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.catBar}>
                    {logic.CATEGORIES.map((cat) => (
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
            </ResponsiveContainer>
        </View>
    );

    if (logic.loading && !logic.items.length) return <LoadingSpinner />;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <PremiumHeader navigation={navigation} activeTab="CLUB" />
            {renderHeader}

            <ResponsiveContainer>
                <FlatList
                    key={numColumns} // Force re-render on column change
                    data={logic.filteredProducts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderProduct}
                    numColumns={numColumns}
                    columnWrapperStyle={logic.activeCategory === 'Servicios' ? null : styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        !logic.loading && <EmptyState
                            icon="🏷️"
                            title="No hay artículos"
                            message="Sé el primero en vender algo que ya no uses."
                        />
                    }
                />
            </ResponsiveContainer>

            <TouchableOpacity
                style={[styles.fab, { right: (width > 800 ? (width - 800) / 2 + 20 : 20) }]}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('CreateItem')}
            >
                <MaterialCommunityIcons name="plus" size={32} color="#fff" />
                <Text style={styles.fabText}>VENDER</Text>
            </TouchableOpacity>

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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: '100%',
    },
    headerContainer: {
        paddingBottom: 16,
        paddingTop: 16,
        borderBottomWidth: 1,
        borderColor: '#e2e8f0',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    premiumTitle: {
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 12,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
    },
    searchSection: {
        marginBottom: 16,
    },
    catBar: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    catChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        cursor: 'pointer',
    },
    catText: {
        fontSize: 14,
        fontWeight: '700',
    },
    listContent: {
        paddingVertical: 24,
    },
    columnWrapper: {
        gap: 16,
    },
    gridItem: {
        flex: 1,
        marginBottom: 16,
        maxWidth: '33%', // Approximate, handled by FlatList logic but good for safety
    },
    listItem: {
        flex: 1,
        marginBottom: 16,
    },
    fab: {
        position: 'absolute',
        bottom: 40,
        backgroundColor: '#1E3A8A',
        width: 68,
        height: 68,
        borderRadius: 34,
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0px 10px 15px rgba(30, 58, 138, 0.4)',
        zIndex: 9999,
        cursor: 'pointer',
    },
    fabText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#fff',
        marginTop: 2,
    },
});
