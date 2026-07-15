import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ResponsiveContainer, Button, PremiumHeader, Avatar, LoadingSpinner } from '../../../components';
import { useUnifiedFeed } from '../../../hooks/useUnifiedFeed';

const SLATE_900 = '#0f172a';
const SLATE_800 = '#1e293b';
const SLATE_400 = '#94a3b8';
const SLATE_500 = '#64748b';
const PRIMARY_BLUE = '#3b82f6';

export default function AnnouncementsScreenWeb({ navigation }) {
    const { data: unifiedData, loading, onRefresh } = useUnifiedFeed({ includeMarketplace: true });

    // Configuración estética
    const bgColor = SLATE_900;
    const cardBg = SLATE_800;
    const textColor = '#ffffff';
    const textSecondary = SLATE_400;
    const borderColor = 'rgba(255,255,255,0.1)';

    const getTypeColor = (tipo) => {
        const colors = {
            aviso: '#16a34a',
            alerta: '#ef4444',
            evento: '#3b82f6',
            marketplace: '#f59e0b',
            pregunta: '#8b5cf6'
        };
        return colors[tipo?.toLowerCase()] || PRIMARY_BLUE;
    };

    const renderCard = (item) => {
        const isMarketplace = item.unifiedType === 'marketplace';
        const typeLabel = isMarketplace ? 'CLUB' : (item.tipo || 'ANUNCIO').toUpperCase();
        const typeColor = getTypeColor(item.tipo || (isMarketplace ? 'marketplace' : 'aviso'));

        return (
            <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                onPress={() => navigation.navigate(isMarketplace ? 'ItemDetail' : 'PostDetail', {
                    item: isMarketplace ? item : undefined,
                    post: !isMarketplace ? item : undefined
                })}
                style={[styles.card, { backgroundColor: cardBg, borderColor }]}
            >
                <View style={styles.cardImageContainer}>
                    <Image
                        source={{ uri: item.imagen_url || item.image || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=800' }}
                        style={styles.cardImage}
                    />
                    <View style={styles.categoryBadgeContainer}>
                        <View style={[styles.categoryBadge, { backgroundColor: typeColor }]}>
                            <Text style={styles.categoryBadgeText}>{typeLabel}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.cardBody}>
                    <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={2}>
                        {item.titulo}
                    </Text>
                    <Text style={[styles.cardExcerpt, { color: textSecondary }]} numberOfLines={3}>
                        {item.contenido || item.content}
                    </Text>

                    <View style={[styles.cardFooter, { borderTopColor: borderColor }]}>
                        <View style={styles.authorInfo}>
                            <Avatar
                                uri={item.profiles?.foto_url || 'https://i.pravatar.cc/150'}
                                size={32}
                            />
                            <View>
                                <Text style={[styles.authorName, { color: textColor }]}>{item.profiles?.nombre || 'Vecino'}</Text>
                                <Text style={styles.postDate}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Reciente'}</Text>
                            </View>
                        </View>
                        {isMarketplace && item.precio !== undefined && (
                            <Text style={{ color: PRIMARY_BLUE, fontWeight: 'bold' }}>
                                ${item.precio.toLocaleString()}
                            </Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <PremiumHeader navigation={navigation} activeTab="INICIO" />

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                <ResponsiveContainer maxWidth={1600} style={styles.mainWrapper}>
                    <View style={styles.mainLayout}>
                        {/* Sidebar */}
                        <View style={styles.sidebar}>
                            <Text style={[styles.sidebarTitle, { color: textColor }]}>Filtrar Novedades</Text>

                            <View style={styles.sidebarSection}>
                                <Text style={styles.sidebarLabel}>CATEGORÍAS</Text>
                                {['Todas', 'Seguridad', 'Eventos', 'Club'].map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={styles.checkboxRow}
                                    >
                                        <View style={[
                                            styles.checkbox,
                                            { borderColor: SLATE_800 },
                                            cat === 'Todas' && { backgroundColor: PRIMARY_BLUE, borderColor: PRIMARY_BLUE }
                                        ]}>
                                            {cat === 'Todas' && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
                                        </View>
                                        <Text style={[styles.checkboxLabel, { color: cat === 'Todas' ? PRIMARY_BLUE : SLATE_400 }]}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.sidebarSection}>
                                <Text style={styles.sidebarLabel}>RANGO DE FECHA</Text>
                                <View style={[styles.dateInput, { backgroundColor: SLATE_800, borderColor: 'transparent' }]}>
                                    <MaterialCommunityIcons name="calendar-month-outline" size={18} color={SLATE_400} />
                                    <Text style={{ color: SLATE_400, fontSize: 13 }}>Desde</Text>
                                </View>
                                <View style={[styles.dateInput, { backgroundColor: SLATE_800, borderColor: 'transparent', marginTop: 8 }]}>
                                    <MaterialCommunityIcons name="calendar-month-outline" size={18} color={SLATE_400} />
                                    <Text style={{ color: SLATE_400, fontSize: 13 }}>Hasta</Text>
                                </View>
                            </View>

                            <View style={[styles.promoCard, { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }]}>
                                <Text style={[styles.promoTitle, { color: PRIMARY_BLUE }]}>¿Algo que informar?</Text>
                                <Text style={[styles.promoDesc, { color: SLATE_400 }]}>Comparte noticias, alertas o eventos con tus vecinos al instante.</Text>
                                <Button
                                    style={styles.promoBtn}
                                    onPress={() => navigation.navigate('Feed', { openCreateModal: true })}
                                >
                                    CREAR PUBLICACIÓN
                                </Button>
                            </View>
                        </View>

                        {/* Main Content */}
                        <View style={styles.content}>
                            <View style={[styles.searchBarRow, { marginBottom: 24 }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                                        <Text style={{ fontSize: 14, fontWeight: '900', color: PRIMARY_BLUE }}>NOVEDADES</Text>
                                    </View>
                                    <View style={{ width: 1, height: 20, backgroundColor: borderColor }} />
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('Feed')}
                                        style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                    >
                                        <Text style={{ fontSize: 14, fontWeight: '900', color: textSecondary }}>FEED SOCIAL</Text>
                                    </TouchableOpacity>
                                </View>
                                <Button
                                    onPress={() => navigation.navigate('Feed', { openCreateModal: true })}
                                    style={styles.mainActionBtn}
                                    icon={<MaterialCommunityIcons name="plus-circle" size={22} color="#fff" />}
                                >
                                    PUBLICAR
                                </Button>
                            </View>

                            <View style={styles.searchBarRow}>
                                <View style={[styles.searchWrapper, { backgroundColor: SLATE_800 }]}>
                                    <MaterialCommunityIcons name="magnify" size={24} color={SLATE_400} />
                                    <TextInput
                                        placeholder="Buscar noticias o anuncios..."
                                        placeholderTextColor={SLATE_500}
                                        style={[styles.searchInput, { color: textColor }]}
                                    />
                                </View>
                            </View>

                            {loading ? (
                                <LoadingSpinner />
                            ) : (
                                <View style={styles.grid}>
                                    {unifiedData.map(renderCard)}
                                </View>
                            )}
                        </View>
                    </View>
                </ResponsiveContainer>

                {/* Web Footer */}
                <View style={[styles.footer, { backgroundColor: SLATE_900, borderTopColor: borderColor }]}>
                    <ResponsiveContainer maxWidth={1600}>
                        <View style={styles.footerGrid}>
                            <View style={styles.footerBrand}>
                                <Text style={styles.footerLogo}>VECINDARIO</Text>
                                <Text style={styles.footerTagline}>
                                    La plataforma definitiva para conectar con tu comunidad, enterarte de las novedades e interactuar con tus vecinos de forma segura.
                                </Text>
                                <View style={styles.socialRow}>
                                    <View style={styles.socialIcon}><MaterialCommunityIcons name="account-group" size={20} color={SLATE_400} /></View>
                                    <View style={styles.socialIcon}><MaterialCommunityIcons name="earth" size={20} color={SLATE_400} /></View>
                                </View>
                            </View>
                            <View style={styles.footerCol}>
                                <Text style={styles.footerColTitle}>PLATAFORMA</Text>
                                <Text style={styles.footerLink}>Novedades</Text>
                                <Text style={styles.footerLink}>Marketplace</Text>
                                <Text style={styles.footerLink}>Condominios</Text>
                                <Text style={styles.footerLink}>Chat Vecinal</Text>
                            </View>
                            <View style={styles.footerCol}>
                                <Text style={styles.footerColTitle}>SOPORTE</Text>
                                <Text style={styles.footerLink}>Ayuda</Text>
                                <Text style={styles.footerLink}>Seguridad</Text>
                                <Text style={styles.footerLink}>Privacidad</Text>
                                <Text style={styles.footerLink}>Contacto</Text>
                            </View>
                        </View>
                        <View style={[styles.footerBottom, { borderTopColor: borderColor }]}>
                            <Text style={styles.copyright}>© 2026 Vecindario Platform. Todos los derechos reservados.</Text>
                            <View style={styles.legalLinks}>
                                <Text style={styles.legalLink}>Términos</Text>
                                <Text style={styles.legalLink}>Privacidad</Text>
                                <Text style={styles.legalLink}>Cookies</Text>
                            </View>
                        </View>
                    </ResponsiveContainer>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webNav: {
        height: 80,
        borderBottomWidth: 1,
        justifyContent: 'center',
        zIndex: 1000,
        ...Platform.select({
            web: {
                position: 'sticky',
                top: 0,
                backdropFilter: 'blur(12px)',
            }
        })
    },
    navContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
    },
    navBrandGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 40,
    },
    logo: {
        fontSize: 26,
        fontWeight: '900',
        color: PRIMARY_BLUE,
        letterSpacing: -1.5,
    },
    navLinks: {
        flexDirection: 'row',
        gap: 10,
    },
    navLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    navLinkActive: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    navLinkText: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    navActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconAction: {
        padding: 10,
        borderRadius: 50,
        position: 'relative',
    },
    notifBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#ef4444',
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    notifBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
    },
    divider: {
        width: 1,
        height: 32,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 8,
    },
    navUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingLeft: 6,
        paddingRight: 16,
        paddingVertical: 6,
        borderRadius: 30,
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
    },
    mainWrapper: {
        paddingHorizontal: 24,
    },
    mainLayout: {
        flexDirection: 'row',
        paddingVertical: 40,
        gap: 48,
    },
    sidebar: {
        width: 280,
        gap: 40,
        ...Platform.select({
            web: {
                position: 'sticky',
                top: 120,
                alignSelf: 'flex-start',
            }
        })
    },
    sidebarTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: -10,
    },
    sidebarSection: {
        gap: 16,
    },
    sidebarLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: SLATE_500,
        letterSpacing: 2,
        marginBottom: 4,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 2,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderWidth: 1,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 12,
    },
    promoCard: {
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        gap: 16,
    },
    promoTitle: {
        fontSize: 18,
        fontWeight: '800',
        fontStyle: 'italic',
    },
    promoDesc: {
        fontSize: 14,
        lineHeight: 22,
    },
    promoBtn: {
        height: 48,
        borderRadius: 14,
    },
    content: {
        flex: 1,
        gap: 40,
    },
    searchBarRow: {
        flexDirection: 'row',
        gap: 20,
    },
    searchWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderRadius: 20,
        height: 64,
        ...Platform.select({
            web: {
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }
        })
    },
    searchInput: {
        flex: 1,
        marginLeft: 16,
        fontSize: 18,
        fontWeight: '500',
        ...Platform.select({
            web: {
                outlineStyle: 'none',
            }
        })
    },
    mainActionBtn: {
        height: 64,
        paddingHorizontal: 40,
        borderRadius: 20,
        ...Platform.select({
            web: {
                boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)',
            }
        })
    },
    chipsContainer: {
        height: 48,
    },
    chipsRow: {
        gap: 12,
        paddingBottom: 4,
    },
    chip: {
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 30,
        ...Platform.select({
            web: {
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }
        })
    },
    chipText: {
        fontSize: 15,
        fontWeight: '700',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 32,
    },
    card: {
        width: '31.3%',
        minWidth: 320,
        borderRadius: 32,
        borderWidth: 1,
        overflow: 'hidden',
        ...Platform.select({
            web: {
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                ':hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                }
            }
        })
    },
    cardImageContainer: {
        height: 220,
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    categoryBadgeContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
    },
    categoryBadge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    categoryBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.2,
    },
    cardBody: {
        padding: 28,
        flex: 1,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '800',
        lineHeight: 30,
        marginBottom: 14,
    },
    cardExcerpt: {
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 32,
    },
    cardFooter: {
        paddingTop: 20,
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    authorAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    authorName: {
        fontSize: 15,
        fontWeight: '700',
    },
    postDate: {
        fontSize: 12,
        color: SLATE_500,
        marginTop: 2,
    },
    shareBtn: {
        padding: 10,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginTop: 20,
    },
    pageBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pageBtnActive: {
        backgroundColor: PRIMARY_BLUE,
    },
    pageBtnTextActive: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    footer: {
        marginTop: 100,
        paddingVertical: 80,
        borderTopWidth: 1,
    },
    footerGrid: {
        flexDirection: 'row',
        gap: 100,
        flexWrap: 'wrap',
        paddingHorizontal: 24,
    },
    footerBrand: {
        flex: 3,
        minWidth: 320,
    },
    footerLogo: {
        fontSize: 28,
        fontWeight: '900',
        color: PRIMARY_BLUE,
        marginBottom: 32,
    },
    footerTagline: {
        color: SLATE_400,
        fontSize: 16,
        lineHeight: 26,
        marginBottom: 32,
        maxWidth: 450,
    },
    socialRow: {
        flexDirection: 'row',
        gap: 20,
    },
    socialIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerCol: {
        flex: 1,
        minWidth: 180,
        gap: 20,
    },
    footerColTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    footerLink: {
        color: SLATE_400,
        fontSize: 15,
        fontWeight: '500',
    },
    footerBottom: {
        marginTop: 80,
        paddingTop: 40,
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 24,
        paddingHorizontal: 24,
    },
    copyright: {
        fontSize: 13,
        color: SLATE_500,
    },
    legalLinks: {
        flexDirection: 'row',
        gap: 32,
    },
    legalLink: {
        fontSize: 13,
        color: SLATE_500,
    }
});
