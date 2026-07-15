import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { residentialService } from '../../../services/residentialService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useBookingScreen = (navigation) => {
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
            if (amenitiesRes.data && amenitiesRes.data.length > 0) {
                setCurrentAmenityIndex(0);
            }
        }
        if (!reservationsRes.error) setMyReservations(reservationsRes.data || []);
        setLoading(false);
    };

    const dates = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            return {
                day: d.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase().substring(0, 3),
                date: d.getDate(),
                fullDate: d.toISOString().split('T')[0]
            };
        });
    }, []);

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

    const selectAmenity = (index) => setCurrentAmenityIndex(index);
    const selectDate = (date) => setSelectedDate(date);
    const selectTimeSlot = (time) => setSelectedTime(time);

    return {
        theme,
        isDark,
        insets,
        profile,
        loading,
        isSubmitting,
        amenities,
        currentAmenity,
        currentAmenityIndex,
        dates,
        selectedDate,
        timeSlots,
        selectedTime,
        myReservations,
        handleConfirmReservation,
        selectAmenity,
        selectDate,
        selectTimeSlot,
        navigation
    };
};
