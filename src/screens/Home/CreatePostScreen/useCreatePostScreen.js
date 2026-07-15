import { useState, useEffect } from 'react';

import * as ImagePicker from 'expo-image-picker';
import { authService } from '../../../services/authService';
import { postsService } from '../../../services/postsService';
import { useTheme } from '../../../context/ThemeContext';

export const useCreatePostScreen = (navigation, route) => {
    const { theme, isDark } = useTheme();
    const editingPost = route?.params?.post || null;

    const [tipo, setTipo] = useState(editingPost?.tipo || 'aviso');
    const [titulo, setTitulo] = useState(editingPost?.titulo || '');
    const [contenido, setContenido] = useState(editingPost?.contenido || '');
    const [imagen, setImagen] = useState(editingPost?.imagen_url || null);
    const [loading, setLoading] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    const tipos = [
        { value: 'aviso', label: 'Aviso', icon: '📢', color: '#3b82f6' },
        { value: 'alerta', label: 'Alerta', icon: '⚠️', color: '#ef4444' },
        { value: 'evento', label: 'Evento', icon: '📅', color: '#8b5cf6' },
        { value: 'pregunta', label: 'Comunicado', icon: '❓', color: '#f59e0b' },
    ];

    const [alertState, setAlertState] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { }
    });

    const [successState, setSuccessState] = useState({
        visible: false,
        message: '',
        onClose: () => { }
    });

    const hideAlert = () => {
        setAlertState(prev => ({ ...prev, visible: false }));
    };

    const showAlert = (title, message, type = 'info', onConfirm = null) => {
        setAlertState({
            visible: true,
            title,
            message,
            type,
            onConfirm: onConfirm || hideAlert
        });
    };

    const showSuccess = (message, onClose) => {
        setSuccessState({
            visible: true,
            message,
            onClose: onClose || (() => setSuccessState(prev => ({ ...prev, visible: false })))
        });
    };

    useEffect(() => {
        loadUserProfile();
        requestPermissions();
    }, []);

    const loadUserProfile = async () => {
        const { data } = await authService.getCurrentUserProfile();
        setUserProfile(data);
    };

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            showAlert(
                'Permiso necesario',
                'Necesitamos acceso a tu galería para subir imágenes',
                'warning'
            );
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImagen(result.assets[0].uri);
        }
    };

    const handlePublish = async () => {
        if (!contenido.trim()) {
            showAlert('Error', 'El contenido no puede estar vacío', 'danger');
            return;
        }

        if (!userProfile) {
            showAlert('Error', 'No se pudo cargar tu perfil', 'danger');
            return;
        }

        setLoading(true);

        const postData = {
            user_id: userProfile.id,
            comunidad_id: userProfile.comunidad_id,
            tipo,
            titulo: titulo.trim() || null,
            contenido: contenido.trim(),
        };

        let result;
        if (editingPost) {
            // Update existing post
            result = await postsService.updatePost(editingPost.id, postData, imagen);
        } else {
            // Create new post
            result = await postsService.createPost(postData, imagen);
        }

        setLoading(false);

        if (result.error) {
            showAlert('Error', 'No se pudo realizar la publicación. Intenta de nuevo.', 'danger');
            return;
        }

        showSuccess(
            editingPost ? 'Los cambios se han guardado con éxito' : 'Tu publicación se ha compartido con éxito',
            () => {
                setSuccessState(prev => ({ ...prev, visible: false }));
                navigation.goBack();
            }
        );
    };

    return {
        // State
        tipo, setTipo,
        titulo, setTitulo,
        contenido, setContenido,
        imagen, setImagen,
        loading,
        userProfile,
        editingPost,

        // Constants
        tipos,
        theme,
        isDark,

        // Handlers
        pickImage,
        handlePublish,
        alertState,
        hideAlert,
        successState
    };
};
