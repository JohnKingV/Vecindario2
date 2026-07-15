import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Avatar } from '../../../components';
import { useBookingScreen } from './useBookingScreen';

export default function BookingScreenNative({ navigation }) {
    const logic = useBookingScreen(navigation);
    const { theme, isDark } = logic;

    if (logic.loading) return (
        <View style={[styles.container, { justifyContent: 'center', backgroundColor: theme.colors.background }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header Area */}
            <View style={[styles.appBar, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.colors.inputBackground }]}>
                    <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Reservar Amenidad</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Amenity Selector (Horizontal) */}
                {logic.amenities.length > 1 && (
                    <View style={styles.selectorSection}>
                        <Text style={[styles.sectionTitleTiny, { color: theme.colors.textSecondary }]}>TOCA PARA CAMBIAR AMENIDAD</Text>
                        <View style={styles.amenitySelectorList}>
                            {logic.amenities.map((item, index) => (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => logic.selectAmenity(index)}
                                    style={[
                                        styles.amenityTab,
                                        { backgroundColor: isDark ? theme.colors.card : '#f1f5f9', borderColor: theme.colors.border },
                                        logic.currentAmenityIndex === index && [styles.amenityTabSelected, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]
                                    ]}
                                >
                                    <Text style={[
                                        styles.amenityTabText,
                                        { color: theme.colors.textSecondary },
                                        logic.currentAmenityIndex === index && styles.amenityTabTextSelected
                                    ]}>
                                        {item.nombre}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Hero Image */}
                <View style={styles.heroContainer}>
                    <Image
                        source={{ uri: logic.currentAmenity.imagen_url }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <View style={styles.heroOverlay}>
                        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                            <Text style={styles.badgeText}>{logic.currentAmenity.ubicacion?.toUpperCase() || 'PISO 4'}</Text>
                        </View>
                        <Text style={styles.amenityName}>{logic.currentAmenity.nombre}</Text>
                        <Text style={styles.buildingName}>{logic.profile?.comunidades?.nombre || 'Vecindario Premium Club'}</Text>
                    </View>
                </View>

                {/* Date Picker */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Seleccionar Fecha</Text>
                        <Text style={[styles.monthLabel, { color: theme.colors.primary }]}>
                            {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                        </Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
                        {logic.dates.map((date) => (
                            <TouchableOpacity
                                key={date.date}
                                style={[
                                    styles.dateCard,
                                    { backgroundColor: theme.colors.card },
                                    logic.selectedDate === date.date && [styles.dateCardSelected, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]
                                ]}
                                onPress={() => logic.selectDate(date.date)}
                            >
                                <Text style={[styles.dateDay, { color: theme.colors.textSecondary }, logic.selectedDate === date.date && styles.textWhite]}>{date.day}</Text>
                                <Text style={[styles.dateNumber, { color: theme.colors.text }, logic.selectedDate === date.date && styles.textWhite]}>{date.date}</Text>
                                {logic.selectedDate === date.date && <View style={styles.whiteDot} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Time Picker */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Horarios Disponibles</Text>
                    <View style={styles.timeGrid}>
                        {logic.timeSlots.map((time) => {
                            const isSelected = logic.selectedTime === time;
                            return (
                                <TouchableOpacity
                                    key={time}
                                    style={[
                                        styles.timeSlot,
                                        { borderColor: theme.colors.border },
                                        isSelected && [styles.timeSlotSelected, { borderColor: theme.colors.primary, backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(19, 91, 236, 0.05)' }]
                                    ]}
                                    onPress={() => logic.selectTimeSlot(time)}
                                >
                                    <Text style={[
                                        styles.timeText,
                                        { color: theme.colors.textSecondary },
                                        isSelected && [styles.timeTextSelected, { color: theme.colors.primary }]
                                    ]}>
                                        {time}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Summary Card */}
                <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <View style={[styles.userRow, { borderBottomColor: theme.colors.border }]}>
                        <Avatar
                            uri={logic.profile?.foto_url}
                            size="md"
                        />
                        <View>
                            <Text style={[styles.labelSmall, { color: theme.colors.textSecondary }]}>Reserva para</Text>
                            <Text style={[styles.userName, { color: theme.colors.text }]}>{logic.profile?.nombre}</Text>
                        </View>
                    </View>
                    <View style={styles.summaryDetail}>
                        <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Duración sugerida</Text>
                        <Text style={[styles.detailValue, { color: theme.colors.text }]}>90 minutos</Text>
                    </View>
                    <View style={styles.summaryDetail}>
                        <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Costo</Text>
                        <Text style={[styles.detailValue, { color: theme.colors.primary, fontWeight: 'bold' }]}>Incluido</Text>
                    </View>
                </View>

                {/* My Reservations Section */}
                <View style={[styles.section, { paddingBottom: 40 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tus Reservas</Text>
                    <View style={styles.resList}>
                        {logic.myReservations.length === 0 ? (
                            <Text style={{ textAlign: 'center', color: theme.colors.textSecondary, marginTop: 10 }}>No tienes reservas activas</Text>
                        ) : logic.myReservations.map((res) => (
                            <View key={res.id} style={[styles.resItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                <View style={styles.resContent}>
                                    <View style={[styles.resIconBg, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(19, 91, 236, 0.1)' }]}>
                                        <MaterialCommunityIcons
                                            name="calendar-check"
                                            size={20}
                                            color={theme.colors.primary}
                                        />
                                    </View>
                                    <View>
                                        <Text style={[styles.resTitle, { color: theme.colors.text }]}>{res.amenity?.nombre}</Text>
                                        <Text style={[styles.resDate, { color: theme.colors.textSecondary }]}>{res.fecha} • {res.hora}</Text>
                                    </View>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: res.estado === 'confirmada' ? (isDark ? 'rgba(34, 197, 94, 0.2)' : '#f0fdf4') : (isDark ? 'rgba(234, 88, 12, 0.2)' : '#fff7ed') }]}>
                                    <Text style={[styles.statusText, { color: res.estado === 'confirmada' ? theme.colors.success : '#ea580c' }]}>
                                        {res.estado?.toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Footer Action */}
            <View style={[styles.footer, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255,255,255,0.9)', borderTopColor: theme.colors.border }]}>
                <Button
                    fullWidth
                    size="lg"
                    style={[styles.confirmBtn, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]}
                    loading={logic.isSubmitting}
                    onPress={logic.handleConfirmReservation}
                >
                    <View style={styles.btnContent}>
                        <Text style={styles.btnText}>Confirmar Reserva</Text>
                        <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                    </View>
                </Button>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingBottom: 120,
    },
    selectorSection: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    amenitySelectorList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingVertical: 12,
    },
    sectionTitleTiny: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    amenityTab: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 4,
    },
    amenityTabSelected: {
        backgroundColor: '#135bec',
        borderColor: '#135bec',
    },
    amenityTabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    amenityTabTextSelected: {
        color: '#fff',
    },
    heroContainer: {
        padding: 16,
    },
    heroImage: {
        width: '100%',
        height: 220,
        borderRadius: 24,
        backgroundColor: '#f1f5f9',
    },
    heroOverlay: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    amenityName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    buildingName: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    section: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    monthLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    dateList: {
        gap: 12,
        paddingBottom: 8,
    },
    dateCard: {
        width: 64,
        height: 84,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        gap: 4,
    },
    dateCardSelected: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    dateDay: {
        fontSize: 12,
        fontWeight: '500',
    },
    dateNumber: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    textWhite: {
        color: '#fff',
    },
    whiteDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#fff',
        marginTop: 2,
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 16,
    },
    timeSlot: {
        width: '30.5%',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    timeSlotSelected: {
        borderWidth: 2,
    },
    timeText: {
        fontSize: 13,
        fontWeight: '500',
    },
    timeTextSelected: {
        fontWeight: 'bold',
    },
    summaryCard: {
        margin: 16,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        gap: 16,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    labelSmall: {
        fontSize: 10,
        fontWeight: '500',
    },
    userName: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    summaryDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    resList: {
        gap: 12,
        marginTop: 16,
    },
    resItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    resContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    resIconBg: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resTitle: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    resDate: {
        fontSize: 12,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        borderTopWidth: 1,
    },
    confirmBtn: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
