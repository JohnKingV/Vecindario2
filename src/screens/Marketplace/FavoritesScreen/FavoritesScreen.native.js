import React from 'react';
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
import { LoadingSpinner, EmptyState, Toast } from '../../../components';
import { useFavoritesScreen } from './useFavoritesScreen';

export default function FavoritesScreenNative({ navigation }) {
    const logic = useFavoritesScreen(navigation);
    const { theme, isDark } = logic;

    const renderItem = ({ item }) => (
        <View style={[styles.productCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.imagen_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400' }}
                    style={styles.productImage}
                />
                <TouchableOpacity
                    style={[styles.favoriteBadge, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255,255,255,0.9)' }]}
                    onPress={() => logic.handleToggleLike(item.id)}
                >
                    <MaterialCommunityIcons name="heart" size={20} color="#FFA500" />
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
                    <Text style={[styles.price, { color: theme.colors.text }]}>{logic.formatPrice(item.precio)}</Text>
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
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.colors.inputBackground }]}>
                    <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.marketplaceText, { color: theme.colors.text }]}>Club</Text>
                <View style={styles.headerIcons}>
                    <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(225, 29, 72, 0.1)' : '#fef2f2', borderColor: 'transparent' }]}>
                        <MaterialCommunityIcons name="heart" size={24} color="#FFA500" />
                    </View>
                </View>
            </View>
            <View style={styles.titleSection}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Mis Favoritos</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Cosas que te encantaron en tu comunidad.</Text>
            </View>
        </View>
    );

    if (logic.loading && !logic.items.length) return <LoadingSpinner />;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <View style={styles.container}>
                <FlatList
                    data={logic.items}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={renderHeader}
                    refreshControl={
                        <RefreshControl refreshing={logic.refreshing} onRefresh={logic.onRefresh} />
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
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    marketplaceText: {
        fontSize: 22,
        fontWeight: '900',
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
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    titleSection: {
        marginTop: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 40,
    },
    productCard: {
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
        flex: 1,
        marginRight: 10,
    },
    price: {
        fontSize: 18,
        fontWeight: '900',
    },
    metaText: {
        fontSize: 14,
        marginBottom: 20,
        fontWeight: '500',
    },
    contactBtn: {
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
