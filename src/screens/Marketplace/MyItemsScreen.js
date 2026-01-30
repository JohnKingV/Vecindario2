import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LoadingSpinner, EmptyState, Toast, Badge, ResilientImage } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { marketplaceService } from '../../services/marketplaceService';

const formatPrice = (price) => {
    if (!price && price !== 0) return '$0';
    return '$' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const { width } = Dimensions.get('window');

export default function MyItemsScreen({ navigation }) {
    const { theme, isDark } = useTheme();
    const { profile: userProfile } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('active'); // 'active' o 'inactive'
    const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

    useFocusEffect(
        useCallback(() => {
            if (userProfile) {
                loadMyItems();
            }
        }, [userProfile])
    );

    const loadMyItems = async () => {
        setLoading(true);
        const { data, error } = await marketplaceService.getMyItems(userProfile.id);
        setLoading(false);

        if (!error) {
            setItems(data);
        } else {
            setToast({
                visible: true,
                message: 'No pudimos cargar tus publicaciones.',
                type: 'error'
            });
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMyItems();
        setRefreshing(false);
    };

    const filteredItems = items.filter(item =>
        activeTab === 'active' ? !item.vendido : item.vendido
    );

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
                    {formatPrice(item.precio)}
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
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Mis Publicaciones</Text>
                <View style={{ width: 32 }} />
            </View>

            <View style={[styles.tabContainer, { backgroundColor: theme.colors.inputBackground }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'active' && [styles.activeTab, { backgroundColor: theme.colors.card }]]}
                    onPress={() => setActiveTab('active')}
                >
                    <Text style={[styles.tabText, { color: theme.colors.textSecondary }, activeTab === 'active' && { color: theme.colors.text, fontWeight: 'bold' }]}>
                        Activas ({items.filter(i => !i.vendido).length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'inactive' && [styles.activeTab, { backgroundColor: theme.colors.card }]]}
                    onPress={() => setActiveTab('inactive')}
                >
                    <Text style={[styles.tabText, { color: theme.colors.textSecondary }, activeTab === 'inactive' && { color: theme.colors.text, fontWeight: 'bold' }]}>
                        Inactivas ({items.filter(i => i.vendido).length})
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading && !items.length) return <LoadingSpinner />;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <View style={styles.container}>
                <FlatList
                    data={filteredItems}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={renderHeader}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <EmptyState
                            icon={activeTab === 'active' ? "tag-outline" : "tag-off-outline"}
                            title={activeTab === 'active' ? "Sin publicaciones activas" : "Sin publicaciones inactivas"}
                            message={activeTab === 'active' ? "¡Sube algo que ya no uses!" : "Aquí verás tus artículos vendidos o retirados."}
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
        marginLeft: -8,
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
