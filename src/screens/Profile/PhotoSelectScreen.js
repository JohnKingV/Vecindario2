import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SuccessModal from '../../components/SuccessModal';
import ConfirmModal from '../../components/ConfirmModal';

const PhotoSelectScreen = ({ navigation, route }) => {
    console.log('[PhotoSelectScreen] Rendered with mode:', route.params?.mode);
    const { profile, refreshProfile } = useAuth();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [uploading, setUploading] = useState(false);

    const [hasAttemptedMode, setHasAttemptedMode] = useState(false);
    const [isSuccessVisible, setIsSuccessVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'danger',
        onConfirm: () => { }
    });

    const showAlert = (title, message, type = 'danger', onConfirm = null) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            type,
            onConfirm: onConfirm || (() => setAlertConfig(prev => ({ ...prev, visible: false })))
        });
    };

    React.useEffect(() => {
        const mode = route.params?.mode;
        if (mode && !hasAttemptedMode) {
            setHasAttemptedMode(true);
            // Pequeño delay para permitir que la navegación se asiente 
            // y evitar el flash de sincronización
            const timer = setTimeout(() => {
                if (mode === 'gallery') {
                    handlePickImage();
                } else if (mode === 'camera') {
                    handleTakePhoto();
                }
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [route.params?.mode, hasAttemptedMode]);

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled) {
                await uploadAvatar(result.assets[0].uri);
            }
        } catch (error) {
            console.error('[PhotoSelectScreen] Gallery error:', error);
            showAlert('Galería', 'No se pudo acceder a la galería de fotos.', 'danger');
        }
    };

    const handleTakePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                showAlert('Permiso', 'Se necesita permiso para acceder a la cámara.', 'warning');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled) {
                await uploadAvatar(result.assets[0].uri);
            }
        } catch (error) {
            console.error('[PhotoSelectScreen] Camera error:', error);
            showAlert('Cámara', `No se pudo abrir la cámara: ${error.message || 'Error desconocido'}`, 'danger');
        }
    };

    const uploadAvatar = async (uri) => {
        setUploading(true);
        try {
            const { error } = await authService.uploadAvatar(profile?.id, uri);
            if (error) {
                showAlert('Actualización', 'No se pudo actualizar la foto de perfil en este momento.', 'danger');
            } else {
                console.log('[PhotoSelectScreen] Upload success, triggering refresh');
                if (refreshProfile) {
                    await refreshProfile();
                }
                setIsSuccessVisible(true);
            }
        } catch (err) {
            console.error('[PhotoSelectScreen] Upload catch:', err);
            showAlert('Error', 'Ocurrió un error inesperado al procesar la foto.', 'danger');
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { marginTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="close" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>Cambiar foto de perfil</Text>
            </View>

            <View style={styles.content}>
                {uploading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Subiendo foto...</Text>
                    </View>
                ) : (
                    <>
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                            Elige cómo quieres actualizar tu foto de perfil para que tu comunidad te reconozca más fácilmente.
                        </Text>
                        <TouchableOpacity
                            style={[styles.optionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                            onPress={handlePickImage}
                        >
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                                <MaterialCommunityIcons name="image-outline" size={32} color="#3b82f6" />
                            </View>
                            <View style={styles.optionTextContent}>
                                <Text style={[styles.optionTitle, { color: theme.colors.text }]}>Seleccionar desde dispositivo</Text>
                                <Text style={[styles.optionDesc, { color: theme.colors.textSecondary }]}>Busca una foto en tu galería</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.optionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                            onPress={handleTakePhoto}
                        >
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                <MaterialCommunityIcons name="camera-outline" size={32} color="#10b981" />
                            </View>
                            <View style={styles.optionTextContent}>
                                <Text style={[styles.optionTitle, { color: theme.colors.text }]}>Tomar foto con la cámara</Text>
                                <Text style={[styles.optionDesc, { color: theme.colors.textSecondary }]}>Usa la cámara de tu teléfono</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>

                        {profile?.foto_url && (
                            <TouchableOpacity
                                style={[styles.optionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                                onPress={() => {
                                    showAlert(
                                        "Eliminar foto",
                                        "¿Estás seguro de que deseas eliminar tu foto de perfil?",
                                        'danger',
                                        async () => {
                                            setAlertConfig(prev => ({ ...prev, visible: false }));
                                            setUploading(true);
                                            try {
                                                const { error } = await authService.uploadAvatar(profile?.id, null);
                                                if (error) {
                                                    showAlert('Eliminar', 'No se pudo eliminar la foto actual.', 'danger');
                                                } else {
                                                    if (refreshProfile) await refreshProfile();
                                                    setIsSuccessVisible(true);
                                                }
                                            } catch (err) {
                                                showAlert('Error', 'Error inesperado al eliminar la foto.', 'danger');
                                            } finally {
                                                setUploading(false);
                                            }
                                        }
                                    );
                                }}
                            >
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                                    <MaterialCommunityIcons name="delete-outline" size={32} color="#ef4444" />
                                </View>
                                <View style={styles.optionTextContent}>
                                    <Text style={[styles.optionTitle, { color: '#ef4444' }]}>Eliminar foto actual</Text>
                                    <Text style={[styles.optionDesc, { color: theme.colors.textSecondary }]}>Quitar tu foto de perfil actual</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </View>

            <SuccessModal
                visible={isSuccessVisible}
                message="Tu foto de perfil ha sido actualizada con éxito."
                onClose={() => {
                    setIsSuccessVisible(false);
                    navigation.navigate('Main', { screen: 'Profile' });
                }}
            />

            <ConfirmModal
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                onConfirm={alertConfig.onConfirm}
                confirmText={alertConfig.type === 'danger' ? 'Eliminar' : 'Aceptar'}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 60,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 32,
        paddingHorizontal: 4,
    },
    content: {
        flex: 1,
        padding: 24,
        paddingTop: 20,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 16,
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionTextContent: {
        flex: 1,
        marginLeft: 16,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    optionDesc: {
        fontSize: 13,
    },
    loadingContainer: {
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
    }
});

export default PhotoSelectScreen;
