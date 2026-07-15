import React from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LoadingSpinner, EmptyState, Toast, Badge, ResilientImage } from '../../../components';
import { useMyItemsScreen } from './useMyItemsScreen';

export default function MyItemsScreenNative({ navigation }) {
    const logic = useMyItemsScreen(navigation);
    const { theme, isDark } = logic;

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.itemCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('ItemDetail', { item })}
        >
            <ResilientImage
                source={{ uri: item.imagen_url }}
                style={styles.itemImage}
                resizeMode="cover"
            />
            <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                    <Text style={[styles.itemTitle, { color: theme.colors.text }]} numberOfLines={1}>
                        {item.titulo}
                    </Text>
                    <Badge variant={item.vendido ? 'error' : 'success'}>
                        {item.vendido ? 'Inactivo' : 'Activo'}
                    </Badge>
                </View>

                <Text style={[styles.itemPrice, { color: theme.colors.primary }]}>
                    {logic.formatPrice(item.precio)}
                </Text>

                <View style={styles.itemFooter}>
                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <MaterialCommunityIcons name="heart-outline" size={16} color={theme.colors.textSecondary} />
                            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>{item.likes_count}</Text>
                        </View>
                        <View style={styles.stat}>
                            <MaterialCommunityIcons name="chat-outline" size={16} color={theme.colors.textSecondary} />
                            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>{item.comentarios_count}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.manageBtn, { backgroundColor: isDark ? theme.colors.inputBackground : '#f1f5f9' }]}
                        onPress={() => navigation.navigate('ItemDetail', { item })}
                    >
                        <Text style={[styles.manageBtnText, { color: theme.colors.text }]}>Gestionar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.colors.inputBackground }]}>
                    <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Mis Publicaciones</Text>
                <View style={{ width: 32 }} />
            </View>

            <View style={[styles.tabContainer, { backgroundColor: theme.colors.inputBackground }]}>
                <TouchableOpacity
                    style={[styles.tab, logic.activeTab === 'active' && [styles.activeTab, { backgroundColor: theme.colors.card }]]}
                    onPress={() => logic.setActiveTab('active')}
                >
                    <Text style={[styles.tabText, { color: theme.colors.textSecondary }, logic.activeTab === 'active' && { color: theme.colors.text, fontWeight: 'bold' }]}>
                        Activas ({logic.items.filter(i => !i.vendido).length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, logic.activeTab === 'inactive' && [styles.activeTab, { backgroundColor: theme.colors.card }]]}
                    onPress={() => logic.setActiveTab('inactive')}
                >
                    <Text style={[styles.tabText, { color: theme.colors.textSecondary }, logic.activeTab === 'inactive' && { color: theme.colors.text, fontWeight: 'bold' }]}>
                        Inactivas ({logic.items.filter(i => i.vendido).length})
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (logic.loading && !logic.items.length) return <LoadingSpinner />;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <View style={styles.container}>
                <FlatList
                    data={logic.filteredItems}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={renderHeader}
                    refreshControl={
                        <RefreshControl refreshing={logic.refreshing} onRefresh={logic.onRefresh} />
                    }
                    ListEmptyComponent={
                        <EmptyState
                            icon={logic.activeTab === 'active' ? "tag-outline" : "tag-off-outline"}
                            title={logic.activeTab === 'active' ? "Sin publicaciones activas" : "Sin publicaciones inactivas"}
                            message={logic.activeTab === 'active' ? "¡Sube algo que ya no uses!" : "Aquí verás tus artículos vendidos o retirados."}
                        />
                    }
                />
            </View>
            <Toast
                visible={logic.toast.visible}
                message={logic.toast.message}
                onDismiss={() => logic.setToast({ ...logic.toast, visible: false })}
                type={logic.toast.type}
            />
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
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
    },
    tabContainer: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 12,
        gap: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 40,
    },
    itemCard: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        height: 120,
    },
    itemImage: {
        width: 120,
        height: '100%',
    },
    itemInfo: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '700',
        flex: 1,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '900',
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 12,
        fontWeight: '600',
    },
    manageBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    manageBtnText: {
        fontSize: 12,
        fontWeight: '700',
    },
});
