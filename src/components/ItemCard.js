import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Avatar from './Avatar';
import ResilientImage from './ResilientImage';
import Button from './Button';
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

const ItemCard = React.memo(({
    item,
    userProfile,
    theme,
    onPress,
    onLike,
    isService,
    activeCategory,
    formatPrice
}) => {
    const [isHovered, setIsHovered] = React.useState(false);

    // Glimmer Animation Logic
    const shimmerX = useSharedValue(-100);
    const pulseValue = useSharedValue(0.9);

    React.useEffect(() => {
        shimmerX.value = withRepeat(
            withSequence(
                withTiming(100, { duration: 1500, easing: Easing.linear }),
                withDelay(3000, withTiming(-100, { duration: 0 }))
            ),
            -1,
            false
        );

        pulseValue.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1200 }),
                withTiming(0.7, { duration: 1200 })
            ),
            -1,
            true
        );
    }, []);

    const shimmerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: interpolate(shimmerX.value, [-100, 100], [-100, 300]) }],
    }));

    const pulseStyle = useAnimatedStyle(() => ({
        opacity: pulseValue.value,
    }));

    if (activeCategory === 'Servicios') {
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                style={[
                    styles.serviceCard,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                    Platform.OS === 'web' && isHovered && {
                        borderColor: theme.colors.primary,
                        transform: [{ translateY: -4 }],
                        boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.08)'
                    }
                ]}
                {...Platform.select({
                    web: {
                        onMouseEnter: () => setIsHovered(true),
                        onMouseLeave: () => setIsHovered(false),
                    }
                })}
            >
                <Reanimated.View style={[styles.cardTypeStrip, { backgroundColor: theme.colors.primary }, pulseStyle]}>
                    <Reanimated.View style={[StyleSheet.absoluteFill, shimmerStyle]}>
                        <LinearGradient
                            colors={['transparent', 'rgba(255,255,255,0.0)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.0)', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFill}
                        />
                    </Reanimated.View>
                </Reanimated.View>
                <View style={styles.serviceHeader}>
                    <View style={styles.authorRow}>
                        <Avatar
                            uri={item.user_id === userProfile?.id ? userProfile?.foto_url : item.profiles?.foto_url}
                            name={item.user_id === userProfile?.id ? userProfile?.nombre : item.profiles?.nombre}
                            size="md"
                            status={item.user_id === userProfile?.id ? userProfile?.status : item.profiles?.status}
                            featured={(item.user_id === userProfile?.id ? userProfile?.raiting_ventas : item.profiles?.raiting_ventas) >= 4.0}
                        />
                        <View style={{ flex: 1 }}>
                            <View style={styles.authorRowSpaceBetween}>
                                <View>
                                    <Text style={[styles.authorName, { color: theme.colors.text }]}>
                                        {(item.user_id === userProfile?.id ? userProfile?.nombre : item.profiles?.nombre) || 'Vecino'}
                                    </Text>
                                    <Text style={[styles.cardMeta, { color: theme.colors.textSecondary }]}>
                                        Publicado recientemente • {item.categoria}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.serviceBody}>
                    <Text style={[styles.serviceTitle, { color: theme.colors.text }]}>{item.titulo}</Text>
                    <Text style={[styles.serviceContent, { color: theme.colors.textSecondary }]}>{item.contenido || item.descripcion}</Text>
                </View>

                {item.imagen_url && (
                    <ResilientImage source={{ uri: item.imagen_url }} style={styles.serviceImage} resizeMode="cover" />
                )}

                <View style={[styles.serviceFooter, { borderTopColor: theme.colors.border }]}>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons
                                name={item.has_liked ? "heart" : "heart-outline"}
                                size={20}
                                color={item.has_liked ? "#FFA500" : theme.colors.textSecondary}
                            />
                            <Text style={[styles.statText, { color: item.has_liked ? "#FFA500" : theme.colors.textSecondary }]}>
                                {item.likes_count || 0}
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="chat-outline" size={20} color={theme.colors.textSecondary} />
                            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                                {item.comentarios_count || 0}
                            </Text>
                        </View>
                    </View>
                    <Button
                        variant="primary"
                        size="sm"
                        style={styles.cardActionBtn}
                        textStyle={styles.cardActionBtnText}
                        onPress={onPress}
                    >
                        ENVIAR MENSAJE
                    </Button>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={[
                styles.productCard,
                Platform.OS === 'web' && isHovered && {
                    transform: [{ scale: 1.02 }],
                }
            ]}
            {...Platform.select({
                web: {
                    onMouseEnter: () => setIsHovered(true),
                    onMouseLeave: () => setIsHovered(false),
                }
            })}
        >
            <View style={styles.imageContainer}>
                <ResilientImage
                    source={{ uri: item.imagen_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400' }}
                    style={styles.productImage}
                />
                <TouchableOpacity
                    style={[styles.favoriteBadge, item.has_liked && styles.favoriteBadgeActive]}
                    onPress={onLike}
                >
                    <MaterialCommunityIcons
                        name={item.has_liked ? "heart" : "heart-outline"}
                        size={16}
                        color={item.has_liked ? "#FFA500" : "#111418"}
                    />
                </TouchableOpacity>
                {isService && (
                    <Reanimated.View style={[styles.serviceTag, { backgroundColor: theme.colors.primary }, pulseStyle]}>
                        <Text style={styles.serviceTagText}>SERVICIO</Text>
                    </Reanimated.View>
                )}
            </View>

            <View style={styles.productInfo}>
                <Text style={[styles.price, { color: theme.colors.primary }]}>
                    {formatPrice(item.precio)}
                </Text>
                <Text numberOfLines={1} style={[styles.productTitle, { color: theme.colors.textSecondary }]}>
                    {item.titulo}
                </Text>
                <View style={styles.sellerRow}>
                    {item.profiles?.foto_url ? (
                        <Avatar
                            uri={item.profiles.foto_url}
                            name={item.profiles.nombre}
                            size="xs"
                            status={item.profiles.status}
                            featured={item.profiles.raiting_ventas >= 4.0}
                            style={styles.sellerAvatar}
                        />
                    ) : (
                        <View style={[styles.sellerAvatar, { backgroundColor: theme.colors.border }]} />
                    )}
                    <Text style={[styles.sellerName, { color: theme.colors.textSecondary }]}>
                        {item.profiles?.nombre?.split(' ')[0] || 'Vecino'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    productCard: {
        flex: 1,
        marginHorizontal: 8,
        marginBottom: 24,
        minWidth: 150,
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
    productInfo: {
        marginTop: 10,
        paddingHorizontal: 4,
    },
    price: {
        fontSize: 17,
        fontWeight: '900',
    },
    productTitle: {
        fontSize: 14,
        fontWeight: '500',
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
    },
    serviceCard: {
        borderRadius: 24,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
    },
    serviceHeader: {
        flexDirection: 'row',
        padding: 16,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    authorName: {
        fontSize: 16,
        fontWeight: '800',
    },
    cardMeta: {
        fontSize: 12,
    },
    authorRowSpaceBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    serviceBody: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    serviceTitle: {
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 6,
    },
    serviceContent: {
        fontSize: 14,
        lineHeight: 22,
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
    cardTypeStrip: {
        height: 4,
        width: '100%',
        overflow: 'hidden',
    },
});

export default ItemCard;
