import React from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button, Input, ConfirmModal, SuccessModal } from '../../../components';
import { useCreatePostScreen } from './useCreatePostScreen';

export default function CreatePostScreenNative({ navigation, route }) {
    const logic = useCreatePostScreen(navigation, route);
    const { theme } = logic;

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
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
            </ScrollView>

            <ConfirmModal
                visible={logic.alertState.visible}
                onClose={logic.hideAlert}
                onConfirm={logic.alertState.onConfirm}
                title={logic.alertState.title}
                message={logic.alertState.message}
                confirmText="Entendido"
                type={logic.alertState.type}
                showCancel={false}
            />

            <SuccessModal
                visible={logic.successState.visible}
                onClose={logic.successState.onClose}
                message={logic.successState.message}
            />
        </KeyboardAvoidingView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
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
