import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Avatar, ResponsiveContainer, PremiumHeader } from '../../../components';
import { useBookingScreen } from './useBookingScreen';

const SLATE_900 = '#0f172a';
const SLATE_800 = '#1e293b';
const SLATE_400 = '#94a3b8';
const SLATE_500 = '#64748b';
const PRIMARY_BLUE = '#3b82f6';

export default function BookingScreenWeb({ navigation }) {
    const logic = useBookingScreen(navigation);
    const { theme, isDark } = logic;

    const bgColor = SLATE_900;
    const cardBg = SLATE_800;
    const textColor = '#ffffff';
    const textSecondary = SLATE_400;
    const borderColor = 'rgba(255,255,255,0.1)';

    if (logic.loading) return (
        <View style={[styles.container, { justifyContent: 'center', backgroundColor: bgColor }]}>
            <ActivityIndicator size="large" color={PRIMARY_BLUE} />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <PremiumHeader navigation={navigation} activeTab="CONDOMINIO" />

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.scrollMain}>
                <ResponsiveContainer maxWidth={1600} style={styles.mainWrapper}>
                    <View style={styles.headerHero}>
                        <View>
                            <Text style={[styles.title, { color: textColor }]}>Reservas de Amenidades</Text>
                            <Text style={[styles.subtitle, { color: textSecondary }]}>Disfruta de los espacios comunes de tu comunidad</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { borderColor: borderColor }]}>
                            <MaterialCommunityIcons name="chevron-left" size={24} color={textColor} />
                            <Text style={[styles.backText, { color: textColor }]}>Volver</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.mainLayout}>
                        {/* Sidebar: Left Selection */}
                        <View style={styles.sidebar}>
                            <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                                <Text style={[styles.sidebarLabel, { color: SLATE_500 }]}>MI PERFIL</Text>
                                <View style={styles.userProfile}>
                                    <Avatar uri={logic.profile?.foto_url} size="xl" />
                                    <Text style={[styles.userNameLarge, { color: textColor }]}>{logic.profile?.nombre || 'Pedro Duarte'}</Text>
                                    <View style={[styles.statusTag, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                                        <Text style={[styles.statusTagText, { color: PRIMARY_BLUE }]}>RESIDENTE ACTIVO</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={[styles.card, { backgroundColor: cardBg, borderColor, marginTop: 32 }]}>
                                <Text style={[styles.sidebarLabel, { color: SLATE_500 }]}>AMENIDADES</Text>
                                <View style={styles.amenityList}>
                                    {logic.amenities.map((item, index) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={[
                                                styles.amenityItem,
                                                logic.currentAmenityIndex === index && { backgroundColor: 'rgba(255,255,255,0.05)' }
                                            ]}
                                            onPress={() => logic.selectAmenity(index)}
                                        >
                                            <View style={styles.amenityItemContent}>
                                                <MaterialCommunityIcons
                                                    name={index === 0 ? "pool" : index === 1 ? "grill" : "basketball"}
                                                    size={22}
                                                    color={logic.currentAmenityIndex === index ? PRIMARY_BLUE : SLATE_500}
                                                />
                                                <Text style={[
                                                    styles.amenityItemText,
                                                    { color: logic.currentAmenityIndex === index ? textColor : SLATE_400 }
                                                ]}>{item.nombre}</Text>
                                            </View>
                                            {logic.currentAmenityIndex === index && <MaterialCommunityIcons name="circle" size={8} color={PRIMARY_BLUE} />}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                        {/* Main Selection Content */}
                        <View style={styles.content}>
                            <View style={[styles.heroCard, { backgroundColor: cardBg, borderColor }]}>
                                <Image source={{ uri: logic.currentAmenity.imagen_url }} style={styles.heroImg} />
                                <View style={styles.heroInfo}>
                                    <Text style={[styles.heroName, { color: textColor }]}>{logic.currentAmenity.nombre}</Text>
                                    <View style={styles.locationRow}>
                                        <MaterialCommunityIcons name="map-marker-radius" size={18} color={PRIMARY_BLUE} />
                                        <Text style={[styles.locationText, { color: textSecondary }]}>{logic.currentAmenity.ubicacion}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Date Picker */}
                            <View style={[styles.pickerSection, { backgroundColor: cardBg, borderColor }]}>
                                <View style={styles.pickerHeader}>
                                    <Text style={[styles.pickerTitle, { color: textColor }]}>Programar Reserva</Text>
                                    <Text style={[styles.currentMonth, { color: PRIMARY_BLUE }]}>
                                        {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
                                    </Text>
                                </View>

                                <View style={styles.dateGrid}>
                                    {logic.dates.map((date) => (
                                        <TouchableOpacity
                                            key={date.date}
                                            style={[
                                                styles.dateBox,
                                                { backgroundColor: SLATE_900, borderColor: 'transparent' },
                                                logic.selectedDate === date.date && { backgroundColor: PRIMARY_BLUE, borderColor: PRIMARY_BLUE }
                                            ]}
                                            onPress={() => logic.selectDate(date.date)}
                                        >
                                            <Text style={[styles.dateDay, { color: SLATE_400 }, logic.selectedDate === date.date && { color: '#fff' }]}>{date.day}</Text>
                                            <Text style={[styles.dateNum, { color: textColor }, logic.selectedDate === date.date && { color: '#fff', fontWeight: '900' }]}>{date.date}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={styles.timeSection}>
                                    <Text style={[styles.subLabel, { color: SLATE_500 }]}>BLOQUES HORARIOS DISPONIBLES</Text>
                                    <View style={styles.timeGrid}>
                                        {logic.timeSlots.map((time) => (
                                            <TouchableOpacity
                                                key={time}
                                                style={[
                                                    styles.timeBox,
                                                    { backgroundColor: SLATE_900, borderColor: 'transparent' },
                                                    logic.selectedTime === time && { backgroundColor: PRIMARY_BLUE }
                                                ]}
                                                onPress={() => logic.selectTimeSlot(time)}
                                            >
                                                <Text style={[
                                                    styles.timeLabel,
                                                    { color: logic.selectedTime === time ? '#fff' : SLATE_400 }
                                                ]}>{time}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <Button
                                    onPress={logic.handleConfirmReservation}
                                    loading={logic.isSubmitting}
                                    style={styles.reserveBtn}
                                >
                                    Confirmar solicitud de reserva
                                </Button>
                            </View>
                        </View>

                        {/* Right Sidebar: My Reservations */}
                        <View style={styles.reservationsSide}>
                            <Text style={[styles.sidebarLabel, { color: SLATE_500, marginBottom: 24 }]}>PRÓXIMAS RESERVAS</Text>
                            {logic.myReservations.length === 0 ? (
                                <View style={[styles.emptyItem, { borderColor: borderColor }]}>
                                    <MaterialCommunityIcons name="calendar-blank" size={32} color={SLATE_800} />
                                    <Text style={{ color: SLATE_500, fontSize: 13, fontStyle: 'italic', marginTop: 12 }}>No tienes reservas vigentes</Text>
                                </View>
                            ) : (
                                <View style={styles.resListContainer}>
                                    {logic.myReservations.map((res) => (
                                        <View key={res.id} style={[styles.resMiniCard, { backgroundColor: cardBg, borderColor }]}>
                                            <View style={styles.resRow}>
                                                <View style={[styles.resIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                                                    <MaterialCommunityIcons name="calendar-check" size={24} color={PRIMARY_BLUE} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.resAmenity, { color: textColor }]}>{res.amenity?.nombre}</Text>
                                                    <Text style={[styles.resMeta, { color: textSecondary }]}>{res.fecha} • {res.hora}</Text>
                                                </View>
                                            </View>
                                            <View style={[styles.statusMini, { backgroundColor: res.estado === 'confirmada' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 88, 12, 0.1)' }]}>
                                                <Text style={[styles.statusTextMini, { color: res.estado === 'confirmada' ? '#22c55e' : '#ea580c' }]}>{res.estado.toUpperCase()}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
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
        width: 320,
    },
    card: {
        padding: 32,
        borderRadius: 32,
        borderWidth: 1,
    },
    sidebarLabel: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 24,
    },
    userProfile: {
        alignItems: 'center',
        gap: 16,
    },
    userNameLarge: {
        fontSize: 22,
        fontWeight: '900',
    },
    statusTag: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    statusTagText: {
        fontSize: 11,
        fontWeight: '800',
    },
    amenityList: {
        gap: 8,
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
    },
    amenityItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    amenityItemText: {
        fontSize: 15,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        gap: 40,
    },
    heroCard: {
        borderRadius: 40,
        borderWidth: 1,
        overflow: 'hidden',
        ...Platform.select({
            web: {
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }
        })
    },
    heroImg: {
        width: '100%',
        height: 480,
        resizeMode: 'cover',
    },
    heroInfo: {
        padding: 48,
    },
    heroName: {
        fontSize: 40,
        fontWeight: '900',
        marginBottom: 12,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    locationText: {
        fontSize: 18,
        fontWeight: '500',
    },
    pickerSection: {
        padding: 48,
        borderRadius: 40,
        borderWidth: 1,
        gap: 48,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerTitle: {
        fontSize: 28,
        fontWeight: '900',
    },
    currentMonth: {
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 1,
    },
    dateGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    dateBox: {
        flex: 1,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
    },
    dateDay: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 8,
    },
    dateNum: {
        fontSize: 28,
        fontWeight: '600',
    },
    timeSection: {
        gap: 24,
    },
    subLabel: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    timeBox: {
        width: '18.5%',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    timeLabel: {
        fontSize: 15,
        fontWeight: '700',
    },
    reserveBtn: {
        height: 72,
        borderRadius: 20,
        fontSize: 18,
        fontWeight: '900',
        ...Platform.select({
            web: {
                boxShadow: '0 10px 20px rgba(59, 130, 246, 0.4)',
            }
        })
    },
    reservationsSide: {
        width: 360,
    },
    emptyItem: {
        padding: 60,
        borderRadius: 32,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
        marginTop: 0,
    },
    resListContainer: {
        gap: 24,
    },
    resMiniCard: {
        padding: 28,
        borderRadius: 28,
        borderWidth: 1,
        gap: 20,
    },
    resRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    resIcon: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resAmenity: {
        fontSize: 16,
        fontWeight: '800',
    },
    resMeta: {
        fontSize: 14,
        marginTop: 4,
    },
    statusMini: {
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 10,
    },
    statusTextMini: {
        fontSize: 11,
        fontWeight: '900',
    }
});
