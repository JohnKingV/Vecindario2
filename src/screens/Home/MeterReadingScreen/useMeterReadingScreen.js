import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ocrService } from '../../../services/ocrService';
import { authService } from '../../../services/authService';
import { useAuth } from '../../../hooks/useAuth';

export const useMeterReadingScreen = () => {
    const { profile } = useAuth();
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [reading, setReading] = useState(null);
    const [meterType, setMeterType] = useState('agua');
    const [isSuccessVisible, setIsSuccessVisible] = useState(false);
    const [alertState, setAlertState] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'danger',
        onConfirm: () => { }
    });

    const showAlert = (title, message, type = 'danger') => {
        setAlertState({
            visible: true,
            title,
            message,
            type,
            onConfirm: () => setAlertState(prev => ({ ...prev, visible: false }))
        });
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            processImage(result.assets[0].uri);
        }
    };

    const processImage = async (uri) => {
        setLoading(true);
        const { data, error } = await ocrService.processMeterImage(uri);

        if (error) {
            showAlert('Error', 'No se pudo procesar la imagen del medidor.', 'danger');
        } else {
            setReading(data.reading);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!reading || !image) return;

        setLoading(true);
        try {
            // 1. Subir imagen (usamos la misma lógica que avatar pero a otra carpeta)
            const { data: fileData, error: uploadError } = await authService.uploadAvatar(profile.id, image);
            if (uploadError) throw uploadError;

            // 2. Registrar en DB
            const { error: regError } = await ocrService.registerReading(
                profile.id,
                profile.comunidad_id,
                meterType,
                reading,
                fileData.foto_url
            );

            if (regError) throw regError;

            setIsSuccessVisible(true);
            setImage(null);
            setReading(null);
        } catch (error) {
            showAlert('Error', 'No se pudo guardar la lectura en este momento.', 'danger');
        }
        setLoading(false);
    };

    return {
        image,
        loading,
        reading,
        setReading,
        meterType,
        setMeterType,
        pickImage,
        handleSave,
        userRole: profile?.role,
        alertState,
        isSuccessVisible,
        setIsSuccessVisible
    };
};
