import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ResponsiveContainer, Button, PremiumHeader } from '../../../components';
import { useResidencialScreen } from './useResidencialScreen';

const SLATE_900 = '#0f172a';
const SLATE_800 = '#1e293b';
const SLATE_400 = '#94a3b8';
const SLATE_500 = '#64748b';
const PRIMARY_BLUE = '#3b82f6';

export default function ResidencialScreenWeb({ navigation }) {
    const logic = useResidencialScreen(navigation);
    const { theme, isDark, profile } = logic;

    const bgColor = SLATE_900;
    const cardBg = SLATE_800;
    const textColor = '#ffffff';
    const textSecondary = SLATE_400;
    const borderColor = 'rgba(255,255,255,0.1)';

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <PremiumHeader navigation={navigation} activeTab="CONDOMINIO" />

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.scrollMain}>
                <ResponsiveContainer maxWidth={1600} style={styles.mainWrapper}>
                    <View style={styles.headerHero}>
                        <View>
                            <Text style={[styles.title, { color: textColor }]}>Servicios Residenciales</Text>
                            <Text style={[styles.subtitle, { color: textSecondary }]}>
                                Gestiona tu hogar en {profile?.comunidades?.nombre || 'Vista Paraiso 2030'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { borderColor: borderColor }]}>
                            <MaterialCommunityIcons name="monitor-dashboard" size={20} color={textColor} />
                            <Text style={[styles.backText, { color: textColor }]}>Panel Principal</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.mainLayout}>
                        {/* Sidebar */}
                        <View style={styles.sidebar}>
                            <View style={[styles.unitCard, { backgroundColor: cardBg, borderColor }]}>
                                <View style={[styles.unitIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                                    <MaterialCommunityIcons name="office-building-marker" size={40} color={PRIMARY_BLUE} />
                                </View>
                                <Text style={[styles.unitLabel, { color: SLATE_500 }]}>MI UNIDAD</Text>
                                <Text style={[styles.unitValue, { color: textColor }]}>
                                    {profile?.torre ? `Torre ${profile.torre} • ` : ''} Depto {profile?.depto || '1101'}
                                </Text>
                                <View style={[styles.tag, { backgroundColor: 'rgba(22, 163, 74, 0.1)' }]}>
                                    <Text style={[styles.tagText, { color: '#4ade80' }]}>Propiedad Verificada</Text>
                                </View>
                            </View>

                            <View style={[styles.adCard, { backgroundColor: PRIMARY_BLUE, marginTop: 32 }]}>
                                <View style={styles.adHeader}>
                                    <MaterialCommunityIcons name="star-circle" size={32} color="#fff" />
                                    <Text style={styles.adTitle}>Vecindario Premium</Text>
                                </View>
                                <Text style={styles.adDesc}>Disfruta de beneficios exclusivos por ser residente activo de nuestra red de condominios.</Text>
                                <TouchableOpacity style={styles.adBtn}>
                                    <Text style={{ color: PRIMARY_BLUE, fontWeight: '800' }}>Ver Beneficios</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Services Grid */}
                        <View style={styles.feed}>
                            <Text style={[styles.sectionHeading, { color: textColor }]}>Acceso Rápido</Text>
                            <View style={styles.servicesGrid}>
                                {logic.services.map((service) => (
                                    <TouchableOpacity
                                        key={service.id}
                                        style={[styles.webCard, { backgroundColor: cardBg, borderColor }]}
                                        onPress={service.onPress}
                                    >
                                        <View style={[styles.webIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                                            <MaterialCommunityIcons name={service.icon} size={36} color={PRIMARY_BLUE} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.webCardTitle, { color: textColor }]}>{service.title}</Text>
                                            <Text style={[styles.webCardSubtitle, { color: textSecondary }]}>{service.subtitle}</Text>
                                        </View>
                                        <MaterialCommunityIcons name="chevron-right" size={24} color={SLATE_500} />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Active Reservations */}
                            <View style={styles.resContainerWeb}>
                                <View style={styles.resHeaderWeb}>
                                    <Text style={[styles.sectionHeading, { color: textColor, marginBottom: 0 }]}>Mis Reservas Activas</Text>
                                    <TouchableOpacity>
                                        <Text style={{ color: PRIMARY_BLUE, fontWeight: '700' }}>Gestionar todas</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.resGridWeb}>
                                    {logic.reservations.map((res) => (
                                        <View key={res.id} style={[styles.resCardWeb, { backgroundColor: cardBg, borderColor }]}>
                                            <Image source={{ uri: res.image }} style={styles.resImgWeb} />
                                            <View style={styles.resBodyWeb}>
                                                <Text style={[styles.resTitleWeb, { color: textColor }]}>{res.title}</Text>
                                                <View style={styles.resMetaWeb}>
                                                    <MaterialCommunityIcons name="calendar-clock" size={18} color={PRIMARY_BLUE} />
                                                    <Text style={{ color: textSecondary, fontSize: 13 }}>{res.time}</Text>
                                                </View>
                                                <TouchableOpacity style={[styles.cancelBtn, { borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
                                                    <Text style={{ color: '#ef4444', fontWeight: '800', fontSize: 13 }}>Cancelar Reserva</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>
                </ResponsiveContainer>
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
    scrollMain: {
        flex: 1,
    },
    mainWrapper: {
        paddingHorizontal: 24,
    },
    headerHero: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 60,
        marginBottom: 60,
    },
    title: {
        fontSize: 56,
        fontWeight: '900',
        letterSpacing: -2,
    },
    subtitle: {
        fontSize: 22,
        marginTop: 12,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 16,
        borderWidth: 1,
    },
    backText: {
        fontWeight: '700',
        fontSize: 16,
    },
    mainLayout: {
        flexDirection: 'row',
        gap: 48,
        marginBottom: 80,
    },
    sidebar: {
        width: 340,
        gap: 32,
    },
    unitCard: {
        padding: 40,
        borderRadius: 32,
        borderWidth: 1,
        alignItems: 'center',
        ...Platform.select({
            web: {
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            }
        })
    },
    unitIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    unitLabel: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 8,
    },
    unitValue: {
        fontSize: 26,
        fontWeight: '900',
        marginBottom: 20,
        textAlign: 'center',
    },
    tag: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '800',
    },
    adCard: {
        padding: 40,
        borderRadius: 32,
        gap: 20,
        ...Platform.select({
            web: {
                boxShadow: '0 10px 20px rgba(59, 130, 246, 0.2)',
            }
        })
    },
    adHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    adTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '900',
    },
    adDesc: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 15,
        lineHeight: 24,
    },
    adBtn: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    feed: {
        flex: 1,
    },
    sectionHeading: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 32,
        letterSpacing: -0.5,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
        marginBottom: 80,
    },
    webCard: {
        width: 'calc(50% - 12px)',
        padding: 32,
        borderRadius: 32,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        ...Platform.select({
            web: {
                transition: 'transform 0.3s ease',
                ':hover': { transform: 'scale(1.02)' }
            }
        })
    },
    webIconBox: {
        width: 72,
        height: 72,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    webCardTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    webCardSubtitle: {
        fontSize: 15,
        marginTop: 6,
    },
    resContainerWeb: {
        gap: 32,
    },
    resHeaderWeb: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resGridWeb: {
        flexDirection: 'row',
        gap: 24,
    },
    resCardWeb: {
        flex: 1,
        borderRadius: 32,
        borderWidth: 1,
        overflow: 'hidden',
        ...Platform.select({
            web: {
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
            }
        })
    },
    resImgWeb: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
    },
    resBodyWeb: {
        padding: 24,
        gap: 16,
    },
    resTitleWeb: {
        fontSize: 18,
        fontWeight: '900',
    },
    resMetaWeb: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    cancelBtn: {
        marginTop: 8,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    }
});
