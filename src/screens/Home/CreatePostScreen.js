import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { authService } from '../../services/authService';
import { postsService } from '../../services/postsService';
import { Button, Input } from '../../components';
import { useTheme } from '../../context/ThemeContext';

export default function CreatePostScreen({ navigation }) {
    const { theme, isDark } = useTheme();
    const [tipo, setTipo] = useState('aviso');
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [imagen, setImagen] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

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
            Alert.alert(
                'Permiso necesario',
                'Necesitamos acceso a tu galería para subir imágenes'
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
            Alert.alert('Error', 'El contenido no puede estar vacío');
            return;
        }

        if (!userProfile) {
            Alert.alert('Error', 'No se pudo cargar tu perfil');
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

        const { error } = await postsService.createPost(postData, imagen);

        setLoading(false);

        if (error) {
            Alert.alert('Error', 'No se pudo publicar. Intenta de nuevo.');
            return;
        }

        Alert.alert('¡Publicado!', 'Tu publicación se ha compartido con éxito', [
            { text: 'OK', onPress: () => navigation.goBack() },
        ]);
    };

    const tipos = [
        { value: 'aviso', label: 'Aviso', icon: '📢', color: '#3b82f6' },
        { value: 'alerta', label: 'Alerta', icon: '⚠️', color: '#ef4444' },
        { value: 'evento', label: 'Evento', icon: '📅', color: '#8b5cf6' },
        { value: 'pregunta', label: 'Comunicado', icon: '❓', color: '#f59e0b' },
    ];

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Nueva Publicación</Text>

                {/* Selector de tipo */}
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Tipo de publicación</Text>
                <View style={styles.typeSelector}>
                    {tipos.map((t) => (
                        <TouchableOpacity
                            key={t.value}
                            style={[
                                styles.typeButton,
                                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                                tipo === t.value && {
                                    backgroundColor: t.color,
                                    borderColor: t.color,
                                },
                            ]}
                            onPress={() => setTipo(t.value)}
                        >
                            <Text style={styles.typeIcon}>{t.icon}</Text>
                            <Text
                                style={[
                                    styles.typeLabel,
                                    { color: theme.colors.textSecondary },
                                    tipo === t.value && styles.typeLabelActive,
                                ]}
                            >
                                {t.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Título (opcional) */}
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Título (opcional)</Text>
                <Input
                    placeholder="Ej: Reunión de copropietarios"
                    value={titulo}
                    onChangeText={setTitulo}
                    maxLength={100}
                    inputStyle={[styles.titleInput, { color: theme.colors.text }]}
                    placeholderTextColor={theme.colors.placeholder}
                    style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                />

                {/* Contenido */}
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Contenido *</Text>
                <Input
                    placeholder="¿Qué quieres compartir con tu comunidad?"
                    value={contenido}
                    onChangeText={setContenido}
                    multiline
                    numberOfLines={8}
                    textAlignVertical="top"
                    maxLength={1000}
                    inputStyle={[styles.contentInput, { color: theme.colors.text }]}
                    placeholderTextColor={theme.colors.placeholder}
                    style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                />
                <Text style={[styles.charCount, { color: theme.colors.placeholder }]}>{contenido.length}/1000</Text>

                {/* Imagen */}
                <TouchableOpacity
                    style={[styles.imageButton, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}
                    onPress={pickImage}
                >
                    <Text style={styles.imageButtonIcon}>📷</Text>
                    <Text style={[styles.imageButtonText, { color: theme.colors.textSecondary }]}>
                        {imagen ? 'Cambiar imagen' : 'Agregar imagen'}
                    </Text>
                </TouchableOpacity>

                {imagen && (
                    <View style={styles.imagePreview}>
                        <Image source={{ uri: imagen }} style={[styles.previewImage, { backgroundColor: theme.colors.border }]} />
                        <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => setImagen(null)}
                        >
                            <Text style={styles.removeImageText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Botones de acción */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.cancelButton, { backgroundColor: theme.colors.inputBackground }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.publishButton,
                            { backgroundColor: theme.colors.primary },
                            loading && styles.publishButtonDisabled,
                        ]}
                        onPress={handlePublish}
                        disabled={loading}
                    >
                        <Text style={[styles.publishButtonText, { color: '#fff' }]}>
                            {loading ? 'Publicando...' : 'Publicar'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    typeButton: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
    },
    typeIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    typeLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    typeLabelActive: {
        color: '#fff',
    },
    titleInput: {
        fontSize: 16,
    },
    contentInput: {
        fontSize: 16,
        minHeight: 150,
    },
    charCount: {
        textAlign: 'right',
        fontSize: 12,
        marginTop: 4,
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
    },
    imageButtonIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    imageButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    imagePreview: {
        marginTop: 16,
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeImageText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
        marginBottom: 40,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    publishButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    publishButtonDisabled: {
        opacity: 0.5,
    },
    publishButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
