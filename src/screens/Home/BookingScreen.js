import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    Platform,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Avatar } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { residentialService } from '../../services/residentialService';

const { width } = Dimensions.get('window');

const BookingScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { user, profile } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());
    const [selectedTime, setSelectedTime] = useState('09:00 AM');
    const [amenities, setAmenities] = useState([]);
    const [myReservations, setMyReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentAmenityIndex, setCurrentAmenityIndex] = useState(0);

    useEffect(() => {
        if (profile?.comunidad_id) {
            loadData();
        }
    }, [profile]);

    const loadData = async () => {
        setLoading(true);
        const [amenitiesRes, reservationsRes] = await Promise.all([
            residentialService.getAmenities(profile.comunidad_id),
            residentialService.getReservations(user.id)
        ]);

        if (!amenitiesRes.error) {
            setAmenities(amenitiesRes.data || []);
            // Si hay amenidades, seleccionar la primera por defecto
            if (amenitiesRes.data && amenitiesRes.data.length > 0) {
                setCurrentAmenityIndex(0);
            }
        }
        if (!reservationsRes.error) setMyReservations(reservationsRes.data || []);
        setLoading(false);
    };

    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            day: d.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase().substring(0, 3),
            date: d.getDate(),
            fullDate: d.toISOString().split('T')[0]
        };
    });

    const timeSlots = [
        '07:00 AM', '08:30 AM', '10:00 AM',
        '11:30 AM', '01:00 PM', '02:30 PM',
        '04:00 PM', '05:30 PM', '07:00 PM'
    ];

    const currentAmenity = amenities[currentAmenityIndex] || {
        id: 'mock-1',
        nombre: 'Cancha de Paddle',
        ubicacion: 'PISO 4',
        imagen_url: 'https://images.unsplash.com/photo-1626248801379-51a0748a5f96?auto=format&fit=crop&q=80&w=800'
    };

    const handleConfirmReservation = async () => {
        if (!user || isSubmitting) return;

        setIsSubmitting(true);
        const selectedFullDate = dates.find(d => d.date === selectedDate)?.fullDate;

        const reservationData = {
            user_id: user.id,
            comunidad_id: profile.comunidad_id,
            amenity_id: currentAmenity.id,
            fecha: selectedFullDate,
            hora: selectedTime,
            estado: 'confirmada'
        };

        const { error } = await residentialService.createReservation(reservationData);
        setIsSubmitting(false);

        if (!error) {
            Alert.alert('¡Éxito!', 'Tu reserva ha sido confirmada correctamente.');
            loadData();
        } else {
            Alert.alert('Error', 'No pudimos crear tu reserva. Por favor intenta de nuevo.');
        }
    };

    if (loading) return (
        <View style={[styles.container, { justifyContent: 'center', backgroundColor: theme.colors.background }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header Area */}
            <View style={[styles.appBar, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Reservar Amenidad</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Amenity Selector (Horizontal) */}
                {amenities.length > 1 && (
                    <View style={styles.selectorSection}>
                        <Text style={[styles.sectionTitleTiny, { color: theme.colors.textSecondary }]}>TOCA PARA CAMBIAR AMENIDAD</Text>
                        <View style={styles.amenitySelectorList}>
                            {amenities.map((item, index) => (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => setCurrentAmenityIndex(index)}
                                    style={[
                                        styles.amenityTab,
                                        { backgroundColor: isDark ? theme.colors.card : '#f1f5f9', borderColor: theme.colors.border },
                                        currentAmenityIndex === index && [styles.amenityTabSelected, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]
                                    ]}
                                >
                                    <Text style={[
                                        styles.amenityTabText,
                                        { color: theme.colors.textSecondary },
                                        currentAmenityIndex === index && styles.amenityTabTextSelected
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
                        source={{ uri: currentAmenity.imagen_url }}
                        style={styles.heroImage}
                        resizeMode="cover"
                        onError={(e) => {
                            console.log('[BookingScreen] Image load error, using fallback');
                            // Si la imagen falla, forzamos un fallback visual
                        }}
                    />
                    <View style={styles.heroOverlay}>
                        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                            <Text style={styles.badgeText}>{currentAmenity.ubicacion?.toUpperCase() || 'PISO 4'}</Text>
                        </View>
                        <Text style={styles.amenityName}>{currentAmenity.nombre}</Text>
                        <Text style={styles.buildingName}>{profile?.comunidades?.nombre || 'Vecindario Premium Club'}</Text>
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
                        {dates.map((date) => (
                            <TouchableOpacity
                                key={date.date}
                                style={[
                                    styles.dateCard,
                                    { backgroundColor: theme.colors.card },
                                    selectedDate === date.date && [styles.dateCardSelected, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]
                                ]}
                                onPress={() => setSelectedDate(date.date)}
                            >
                                <Text style={[styles.dateDay, { color: theme.colors.textSecondary }, selectedDate === date.date && styles.textWhite]}>{date.day}</Text>
                                <Text style={[styles.dateNumber, { color: theme.colors.text }, selectedDate === date.date && styles.textWhite]}>{date.date}</Text>
                                {selectedDate === date.date && <View style={styles.whiteDot} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Time Picker */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Horarios Disponibles</Text>
                    <View style={styles.timeGrid}>
                        {timeSlots.map((time) => {
                            const isSelected = selectedTime === time;
                            return (
                                <TouchableOpacity
                                    key={time}
                                    style={[
                                        styles.timeSlot,
                                        { borderColor: theme.colors.border },
                                        isSelected && [styles.timeSlotSelected, { borderColor: theme.colors.primary, backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(19, 91, 236, 0.05)' }]
                                    ]}
                                    onPress={() => setSelectedTime(time)}
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
                            uri={profile?.foto_url}
                            size="md"
                        />
                        <View>
                            <Text style={[styles.labelSmall, { color: theme.colors.textSecondary }]}>Reserva para</Text>
                            <Text style={[styles.userName, { color: theme.colors.text }]}>{profile?.nombre}</Text>
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
                        {myReservations.length === 0 ? (
                            <Text style={{ textAlign: 'center', color: theme.colors.textSecondary, marginTop: 10 }}>No tienes reservas activas</Text>
                        ) : myReservations.map((res) => (
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
                    loading={isSubmitting}
                    onPress={handleConfirmReservation}
                >
                    <View style={styles.btnContent}>
                        <Text style={styles.btnText}>Confirmar Reserva</Text>
                        <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                    </View>
                </Button>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111318',
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
        color: '#94a3b8',
        letterSpacing: 1,
    },
    amenityTab: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 4,
    },
    amenityTabSelected: {
        backgroundColor: '#135bec',
        borderColor: '#135bec',
    },
    amenityTabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
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
        resizeMode: 'cover',
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
        backgroundColor: '#135bec',
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
        color: '#111318',
    },
    monthLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#135bec',
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
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        gap: 4,
    },
    dateCardSelected: {
        backgroundColor: '#135bec',
        shadowColor: '#135bec',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    dateDay: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748b',
    },
    dateNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111318',
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
        width: (width - 56) / 3,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    timeSlotSelected: {
        borderWidth: 2,
        borderColor: '#135bec',
        backgroundColor: 'rgba(19, 91, 236, 0.05)',
    },
    timeSlotDisabled: {
        backgroundColor: '#f1f5f9',
        borderColor: '#f1f5f9',
    },
    timeText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#475569',
    },
    timeTextSelected: {
        color: '#135bec',
        fontWeight: 'bold',
    },
    timeTextDisabled: {
        color: '#cbd5e1',
        textDecorationLine: 'line-through',
    },
    summaryCard: {
        margin: 16,
        padding: 16,
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        gap: 16,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    miniAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#fff',
    },
    labelSmall: {
        fontSize: 10,
        color: '#94a3b8',
        fontWeight: '500',
    },
    userName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#111318',
    },
    summaryDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111318',
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
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
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
        color: '#111318',
    },
    resDate: {
        fontSize: 12,
        color: '#94a3b8',
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
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    confirmBtn: {
        shadowColor: '#135bec',
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

export default BookingScreen;
