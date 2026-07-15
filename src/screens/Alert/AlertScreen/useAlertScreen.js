import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { authService } from '../../../services/authService';
import { postsService } from '../../../services/postsService';
import { useTheme } from '../../../context/ThemeContext';

export const useAlertScreen = () => {
    const { theme, isDark } = useTheme();
    const [showModal, setShowModal] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [tipoAlerta, setTipoAlerta] = useState('sospechoso');
    const [loading, setLoading] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        loadUserProfile();
        requestLocationPermission();
    }, []);

    const loadUserProfile = async () => {
        const { data } = await authService.getCurrentUserProfile();
        setUserProfile(data);
    };

    const requestLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permiso de ubicación',
                'Necesitamos tu ubicación para que los vecinos sepan dónde estás en caso de emergencia'
            );
        }
    };

    const getCurrentLocation = async () => {
        try {
            const loc = await Location.getCurrentPositionAsync({});
            return {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            };
        } catch (error) {
            return null;
        }
    };

    const handleEmergencyCall = () => {
        Alert.alert(
            '🚨 Llamar a Carabineros',
            '¿Deseas llamar al 133?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Llamar', onPress: () => Linking.openURL('tel:133') },
            ]
        );
    };

    const handlePanicButton = () => {
        setShowModal(true);
    };

    const sendAlert = async () => {
        if (!mensaje.trim()) {
            Alert.alert('Error', 'Por favor describe qué está ocurriendo');
            return;
        }

        if (!userProfile) {
            Alert.alert('Error', 'No se pudo cargar tu perfil');
            return;
        }

        setLoading(true);

        const ubicacion = await getCurrentLocation();
        const fullMessage = `[${tipoAlerta.toUpperCase()}] ${mensaje.trim()}`;

        const { error } = await postsService.createAlert(
            userProfile.id,
            userProfile.comunidad_id,
            fullMessage,
            ubicacion
        );

        setLoading(false);

        if (error) {
            Alert.alert('Error', 'No se pudo enviar la alerta. Intenta de nuevo.');
            return;
        }

        setShowModal(false);
        setMensaje('');
        Alert.alert(
            '✅ Alerta Enviada',
            'Todos los vecinos han sido notificados',
            [{ text: 'OK' }]
        );
    };

    const alertTypes = [
        { value: 'sospechoso', label: 'Persona sospechosa', icon: '👤' },
        { value: 'robo', label: 'Robo/Intento', icon: '🚨' },
        { value: 'emergencia', label: 'Emergencia médica', icon: '🏥' },
        { value: 'otro', label: 'Otro', icon: '⚠️' },
    ];

    return {
        theme,
        isDark,
        showModal,
        setShowModal,
        mensaje,
        setMensaje,
        tipoAlerta,
        setTipoAlerta,
        loading,
        handleEmergencyCall,
        handlePanicButton,
        sendAlert,
        alertTypes
    };
};
