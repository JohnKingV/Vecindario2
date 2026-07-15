import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
} from 'react-native';
import { Button, Input, ResponsiveContainer } from '../../../components';
import { useCreatePostScreen } from './useCreatePostScreen';

export default function CreatePostScreenWeb({ navigation, route }) {
    const logic = useCreatePostScreen(navigation, route);
    const { theme } = logic;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ResponsiveContainer>
                    <View style={styles.contentWrapper}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>
                            {logic.editingPost ? 'Editar Publicación' : 'Nueva Publicación'}
                        </Text>

                        {/* Selector de tipo */}
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Tipo de publicación</Text>
                        <View style={styles.typeSelector}>
                            {logic.tipos.map((t) => (
                                <TouchableOpacity
                                    key={t.value}
                                    style={[
                                        styles.typeButton,
                                        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                                        logic.tipo === t.value && {
                                            backgroundColor: t.color,
                                            borderColor: t.color,
                                        },
                                    ]}
                                    onPress={() => logic.setTipo(t.value)}
                                >
                                    <Text style={styles.typeIcon}>{t.icon}</Text>
                                    <Text
                                        style={[
                                            styles.typeLabel,
                                            { color: theme.colors.textSecondary },
                                            logic.tipo === t.value && styles.typeLabelActive,
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
                            value={logic.titulo}
                            onChangeText={logic.setTitulo}
                            maxLength={100}
                            inputStyle={[styles.titleInput, { color: theme.colors.text }]}
                            placeholderTextColor={theme.colors.placeholder}
                            style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                        />

                        {/* Contenido */}
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Contenido *</Text>
                        <Input
                            placeholder="¿Qué quieres compartir con tu comunidad?"
                            value={logic.contenido}
                            onChangeText={logic.setContenido}
                            multiline
                            numberOfLines={8}
                            textAlignVertical="top"
                            maxLength={1000}
                            inputStyle={[styles.contentInput, { color: theme.colors.text }]}
                            placeholderTextColor={theme.colors.placeholder}
                            style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                        />
                        <Text style={[styles.charCount, { color: theme.colors.placeholder }]}>{logic.contenido.length}/1000</Text>

                        {/* Imagen */}
                        <TouchableOpacity
                            style={[styles.imageButton, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}
                            onPress={logic.pickImage}
                        >
                            <Text style={styles.imageButtonIcon}>📷</Text>
                            <Text style={[styles.imageButtonText, { color: theme.colors.textSecondary }]}>
                                {logic.imagen ? 'Cambiar imagen' : 'Agregar imagen'}
                            </Text>
                        </TouchableOpacity>

                        {logic.imagen && (
                            <View style={styles.imagePreview}>
                                <Image source={{ uri: logic.imagen }} style={[styles.previewImage, { backgroundColor: theme.colors.border }]} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => logic.setImagen(null)}
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
                                    logic.loading && styles.publishButtonDisabled,
                                ]}
                                onPress={logic.handlePublish}
                                disabled={logic.loading}
                            >
                                <Text style={[styles.publishButtonText, { color: '#fff' }]}>
                                    {logic.loading ? 'Guardando...' : (logic.editingPost ? 'Guardar Cambios' : 'Publicar')}
                                </Text>
                            </TouchableOpacity>
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
        height: '100%',
    },
    scrollContent: {
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    contentWrapper: {
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 32,
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        marginTop: 24,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    typeButton: {
        flex: 1,
        alignItems: 'center',
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        cursor: 'pointer',
    },
    typeIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    typeLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    typeLabelActive: {
        color: '#fff',
    },
    titleInput: {
        fontSize: 18,
        padding: 16,
    },
    contentInput: {
        fontSize: 18,
        minHeight: 200,
        padding: 16,
    },
    charCount: {
        textAlign: 'right',
        fontSize: 14,
        marginTop: 8,
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        padding: 32,
        marginTop: 24,
        borderWidth: 2,
        borderStyle: 'dashed',
        cursor: 'pointer',
    },
    imageButtonIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    imageButtonText: {
        fontSize: 18,
        fontWeight: '600',
    },
    imagePreview: {
        marginTop: 24,
        position: 'relative',
        height: 400,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    removeImageText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 40,
        marginBottom: 40,
        justifyContent: 'flex-end',
    },
    cancelButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        alignItems: 'center',
        cursor: 'pointer',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    publishButton: {
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 16,
        alignItems: 'center',
        cursor: 'pointer',
    },
    publishButtonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    publishButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
});
