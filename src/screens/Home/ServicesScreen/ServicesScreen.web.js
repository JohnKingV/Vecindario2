import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Platform,
    RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Button, ResponsiveContainer, LoadingSpinner, EmptyState, PremiumHeader } from '../../../components';
import { useServicesScreen } from './useServicesScreen';

const SLATE_900 = '#0f172a';
const SLATE_800 = '#1e293b';
const SLATE_400 = '#94a3b8';
const SLATE_500 = '#64748b';
const PRIMARY_BLUE = '#3b82f6';

const WebPostCard = ({ item, onToggleLike, theme }) => (
    <View style={[styles.webCard, { backgroundColor: SLATE_800, borderColor: 'rgba(255,255,255,0.1)' }]}>
        <View style={styles.webCardHeader}>
            <Avatar uri={item.profiles?.foto_url} size="lg" />
            <View style={styles.webAuthorInfo}>
                <Text style={[styles.webAuthorName, { color: '#fff' }]}>{item.profiles?.nombre || 'Vecino'}</Text>
                <Text style={[styles.webAuthorMeta, { color: SLATE_400 }]}>
                    {item.profiles?.torre && `Torre ${item.profiles.torre} • `} Depto {item.profiles?.depto || 'N/A'}
                </Text>
            </View>
            <View style={[styles.typeBadgeWeb, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Text style={[styles.typeBadgeText, { color: PRIMARY_BLUE }]}>{item.tipo?.toUpperCase()}</Text>
            </View>
        </View>

        <View style={styles.webCardBody}>
            <Text style={[styles.webPostTitle, { color: '#fff' }]}>{item.titulo}</Text>
            <Text style={[styles.webPostContent, { color: SLATE_400 }]}>{item.contenido}</Text>

            {item.imagen_url && (
                <View style={styles.imgWrapper}>
                    <Image source={{ uri: item.imagen_url }} style={styles.webPostImg} resizeMode="cover" />
                </View>
            )}
        </View>

        <View style={[styles.webCardFooter, { borderTopColor: 'rgba(255,255,255,0.05)' }]}>
            <View style={styles.webStats}>
                <TouchableOpacity style={styles.webStatBtn} onPress={() => onToggleLike(item.id)}>
                    <MaterialCommunityIcons
                        name={item.isLiked ? "heart" : "heart-outline"}
                        size={24}
                        color={item.isLiked ? "#ef4444" : SLATE_400}
                    />
                    <Text style={[styles.webStatNum, { color: item.isLiked ? '#ef4444' : SLATE_400 }]}>{item.likes_count || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.webStatBtn}>
                    <MaterialCommunityIcons name="chat-bubble-outline" size={22} color={SLATE_400} />
                    <Text style={[styles.webStatNum, { color: SLATE_400 }]}>{item.comments_count || 0}</Text>
                </TouchableOpacity>
            </View>
            <Button size="sm" style={styles.detailBtn}>Ver detalles</Button>
        </View>
    </View>
);

export default function ServicesScreenWeb({ navigation }) {
    const logic = useServicesScreen(navigation);
    const { theme, isDark, profile } = logic;

    const bgColor = SLATE_900;
    const cardBg = SLATE_800;
    const textColor = '#ffffff';
    const textSecondary = SLATE_400;
    const borderColor = 'rgba(255,255,255,0.1)';

    if (logic.loading && !logic.refreshing) return (
        <View style={[styles.container, { justifyContent: 'center', backgroundColor: bgColor }]}>
            <LoadingSpinner color={PRIMARY_BLUE} />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <PremiumHeader navigation={navigation} activeTab="CONDOMINIO" />

            <ResponsiveContainer maxWidth={1600}>
                <View style={styles.webLayout}>
                    {/* Sticky Sidebar */}
                    <View style={styles.webSidebar}>
                        <View style={[styles.locCardWeb, { backgroundColor: cardBg, borderColor }]}>
                            <View style={styles.locIconBox}>
                                <MaterialCommunityIcons name="map-marker-radius" size={48} color={PRIMARY_BLUE} />
                            </View>
                            <Text style={[styles.locNameWeb, { color: textColor }]}>{profile?.comunidades?.nombre || 'Mi Vecindario'}</Text>
                            <Text style={[styles.locDescWeb, { color: textSecondary }]}>Estás viendo publicaciones y servicios de tu comunidad actual.</Text>
                            <Button
                                variant="outline"
                                style={styles.changeLocBtn}
                                textStyle={{ fontSize: 13, fontWeight: '800' }}
                            >
                                CAMBIAR COMUNIDAD
                            </Button>
                        </View>

                        <View style={styles.webFilters}>
                            <Text style={[styles.filterHeading, { color: SLATE_500 }]}>FILTRAR CATEGORÍA</Text>
                            <View style={styles.filterList}>
                                {['Todo', 'Aviso', 'Evento', 'Alerta'].map(tab => (
                                    <TouchableOpacity
                                        key={tab}
                                        style={[
                                            styles.filterItemWeb,
                                            logic.activeTab === tab && { backgroundColor: 'rgba(255,255,255,0.05)' }
                                        ]}
                                        onPress={() => logic.setActiveTab(tab)}
                                    >
                                        <View style={[styles.dot, { backgroundColor: logic.activeTab === tab ? PRIMARY_BLUE : SLATE_800 }]} />
                                        <Text style={[
                                            styles.filterLabelWeb,
                                            { color: logic.activeTab === tab ? textColor : SLATE_400 }
                                        ]}>{tab}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Main Feed */}
                    <View style={styles.webFeed}>
                        <View style={styles.webFeedHeader}>
                            <View>
                                <Text style={[styles.webFeedTitle, { color: textColor }]}>Servicios y Avisos</Text>
                                <View style={styles.titleUnderline} />
                            </View>
                            <Button
                                leftIcon={<MaterialCommunityIcons name="plus" size={24} color="#fff" />}
                                onPress={() => navigation.navigate('CreatePost')}
                                style={styles.webPostBtn}
                            >
                                Nueva Publicación
                            </Button>
                        </View>

                        <FlatList
                            data={logic.posts}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => <WebPostCard item={item} onToggleLike={logic.handleToggleLike} theme={theme} />}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <MaterialCommunityIcons name="bullhorn-outline" size={80} color={SLATE_800} />
                                    <Text style={{ color: SLATE_500, marginTop: 20, fontSize: 18, fontWeight: '600' }}>Sin publicaciones aún</Text>
                                    <Text style={{ color: SLATE_500, fontSize: 14, textAlign: 'center', marginTop: 8 }}>Sé el primero en compartir algo con la comunidad.</Text>
                                </View>
                            }
                            contentContainerStyle={styles.webListContent}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl refreshing={logic.refreshing} onRefresh={logic.handleRefresh} tintColor={PRIMARY_BLUE} />
                            }
                        />
                    </View>
                </View>
            </ResponsiveContainer>
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
    webLayout: {
        flexDirection: 'row',
        gap: 60,
        paddingTop: 60,
        paddingBottom: 100,
        paddingHorizontal: 24,
    },
    webSidebar: {
        width: 360,
        gap: 40,
    },
    locCardWeb: {
        padding: 40,
        borderRadius: 40,
        borderWidth: 1,
        alignItems: 'center',
        ...Platform.select({
            web: {
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }
        })
    },
    locIconBox: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    locNameWeb: {
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    locDescWeb: {
        fontSize: 15,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 24,
        marginBottom: 32,
    },
    changeLocBtn: {
        width: '100%',
        height: 56,
        borderRadius: 16,
    },
    webFilters: {
        gap: 20,
    },
    filterHeading: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
        marginLeft: 16,
    },
    filterList: {
        gap: 8,
    },
    filterItemWeb: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderRadius: 16,
        gap: 16,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    filterLabelWeb: {
        fontSize: 16,
        fontWeight: '700',
    },
    webFeed: {
        flex: 1,
    },
    webFeedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 60,
    },
    webFeedTitle: {
        fontSize: 48,
        fontWeight: '900',
        letterSpacing: -1.5,
    },
    titleUnderline: {
        width: 80,
        height: 6,
        backgroundColor: PRIMARY_BLUE,
        marginTop: 12,
        borderRadius: 3,
    },
    webPostBtn: {
        paddingHorizontal: 32,
        height: 64,
        borderRadius: 20,
        fontSize: 16,
        fontWeight: '900',
        ...Platform.select({
            web: {
                boxShadow: '0 10px 20px rgba(59, 130, 246, 0.4)',
            }
        })
    },
    webListContent: {
        gap: 40,
    },
    webCard: {
        borderRadius: 40,
        borderWidth: 1,
        padding: 40,
        ...Platform.select({
            web: {
                transition: 'transform 0.3s ease',
                ':hover': { transform: 'scale(1.01)' }
            }
        })
    },
    webCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    webAuthorInfo: {
        marginLeft: 20,
        flex: 1,
    },
    webAuthorName: {
        fontSize: 18,
        fontWeight: '800',
    },
    webAuthorMeta: {
        fontSize: 14,
        marginTop: 4,
    },
    typeBadgeWeb: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    typeBadgeText: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    webCardBody: {
        gap: 20,
        marginBottom: 40,
    },
    webPostTitle: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    webPostContent: {
        fontSize: 18,
        lineHeight: 28,
    },
    imgWrapper: {
        borderRadius: 32,
        overflow: 'hidden',
        marginTop: 16,
        ...Platform.select({
            web: {
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            }
        })
    },
    webPostImg: {
        width: '100%',
        height: 480,
    },
    webCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 32,
        borderTopWidth: 1,
    },
    webStats: {
        flexDirection: 'row',
        gap: 40,
    },
    webStatBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    webStatNum: {
        fontSize: 16,
        fontWeight: '800',
    },
    detailBtn: {
        borderRadius: 14,
        height: 48,
        paddingHorizontal: 24,
    },
    emptyContainer: {
        padding: 100,
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: 'rgba(255,255,255,0.05)',
        borderRadius: 40,
    }
});
