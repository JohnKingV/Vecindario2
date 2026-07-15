import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LoadingSpinner, EmptyState, Toast, ResponsiveContainer } from '../../../components';
import { useFavoritesScreen } from './useFavoritesScreen';

export default function FavoritesScreenWeb({ navigation }) {
    const logic = useFavoritesScreen(navigation);
    const { theme, isDark } = logic;

    const renderItem = ({ item }) => (
        <View style={[styles.productItemContainer, { width: '100%', maxWidth: 350 }]}>
            <View style={[styles.productCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                {/* Same card content as native */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: item.imagen_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400' }}
                        style={styles.productImage}
                    />
                    <TouchableOpacity
                        style={[styles.favoriteBadge, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255,255,255,0.9)' }]}
                        onPress={() => logic.handleToggleLike(item.id)}
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
        </View>
    );

    const renderHeader = (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.marketplaceText, { color: theme.colors.text }]}>Club</Text>
            </View>
            <View style={styles.titleSection}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Mis Favoritos</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Cosas que te encantaron en tu comunidad.</Text>
            </View>
        </View>
    );

    if (logic.loading && !logic.items.length) return <LoadingSpinner />;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>
                {renderHeader}

                {logic.items.length === 0 ? (
                    <EmptyState
                        icon="heart-off-outline"
                        title="Aún no tienes favoritos"
                        message="Explora el marketplace y guarda lo que te guste."
                    />
                ) : (
                    <View style={styles.gridContainer}>
                        {logic.items.map((item) => (
                            <View key={item.id} style={styles.gridItem}>
                                {renderItem({ item })}
                            </View>
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
    marketplaceText: {
        fontSize: 22,
        fontWeight: '900',
    },
    titleSection: {
        marginTop: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
        fontWeight: '500',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
        marginTop: 24,
    },
    gridItem: {
        flexGrow: 1,
        flexBasis: 300,
        maxWidth: 350,
    },
    productItemContainer: {
        marginBottom: 24,
    },
    productCard: {
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        height: '100%', // ensure full height filling
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
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
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
        cursor: 'pointer',
    },
    contactBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    }
});
