import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LoadingSpinner, EmptyState, Toast, Badge, ResilientImage, ResponsiveContainer } from '../../../components';
import { useMyItemsScreen } from './useMyItemsScreen';

export default function MyItemsScreenWeb({ navigation }) {
    const logic = useMyItemsScreen(navigation);
    const { theme, isDark } = logic;

    const renderItem = ({ item }) => (
        <View style={[styles.gridItem, { width: '100%', maxWidth: 400 }]}>
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
        </View>
    );

    const renderHeader = (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Mis Publicaciones</Text>
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
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>
                {renderHeader}

                {logic.filteredItems.length === 0 ? (
                    <EmptyState
                        icon={logic.activeTab === 'active' ? "tag-outline" : "tag-off-outline"}
                        title={logic.activeTab === 'active' ? "Sin publicaciones activas" : "Sin publicaciones inactivas"}
                        message={logic.activeTab === 'active' ? "¡Sube algo que ya no uses!" : "Aquí verás tus artículos vendidos o retirados."}
                    />
                ) : (
                    <View style={styles.gridContainer}>
                        {logic.filteredItems.map(item => (
                            <React.Fragment key={item.id}>
                                {renderItem({ item })}
                            </React.Fragment>
                        ))}
                    </View>
                )}
            </ResponsiveContainer>

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
        minHeight: '100%',
        overflow: 'scroll',
    },
    header: {
        paddingVertical: 24,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 16,
    },
    backBtn: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
        cursor: 'pointer',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
    },
    tabContainer: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 12,
        gap: 4,
        maxWidth: 400, // Limit width on web
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
        cursor: 'pointer',
    },
    activeTab: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
    },
    gridItem: {
        flexGrow: 1,
        flexBasis: 350,
    },
    itemCard: {
        flexDirection: 'row',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        height: 140, // Slightly taller on web
        cursor: 'pointer',
    },
    itemImage: {
        width: 140,
        height: '100%',
    },
    itemInfo: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
    },
    itemPrice: {
        fontSize: 18,
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
        paddingVertical: 8,
        borderRadius: 8,
    },
    manageBtnText: {
        fontSize: 12,
        fontWeight: '700',
    },
});
