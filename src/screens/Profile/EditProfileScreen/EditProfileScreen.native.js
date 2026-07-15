import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Input, SuccessModal, ConfirmModal } from '../../../components';
import { useEditProfileScreen } from './useEditProfileScreen';

export default function EditProfileScreenNative({ navigation }) {
    const logic = useEditProfileScreen(navigation);
    const { theme } = logic;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <TouchableOpacity
                                style={[styles.backButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                                onPress={() => navigation.goBack()}
                            >
                                <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                            <Text style={[styles.title, { color: theme.colors.text }]}>Editar Perfil</Text>
                        </View>
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Actualiza tu información personal</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Nombre Completo</Text>
                            <Input
                                inputStyle={[styles.input, { color: theme.colors.text }]}
                                value={logic.nombre}
                                onChangeText={logic.setNombre}
                                placeholder="Tu nombre"
                                placeholderTextColor={theme.colors.placeholder}
                                style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Teléfono de Contacto</Text>
                            <Input
                                inputStyle={[styles.input, { color: theme.colors.text }]}
                                value={logic.telefono}
                                onChangeText={logic.setTelefono}
                                placeholder="+56 9 ..."
                                keyboardType="phone-pad"
                                placeholderTextColor={theme.colors.placeholder}
                                style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                            />
                            <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>Se usará para que te contacten en el Club</Text>
                        </View>

                        <View style={styles.inputsRow}>
                            <View style={styles.flex1}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Torre / Bloque</Text>
                                <Input
                                    inputStyle={[styles.input, { color: theme.colors.text }]}
                                    value={logic.torre}
                                    onChangeText={logic.setTorre}
                                    placeholder="Ej: A"
                                    placeholderTextColor={theme.colors.placeholder}
                                    style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                                />
                            </View>
                            <View style={styles.flex1}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Depto / Casa</Text>
                                <Input
                                    inputStyle={[styles.input, { color: theme.colors.text }]}
                                    value={logic.depto}
                                    onChangeText={logic.setDepto}
                                    placeholder="Ej: 402"
                                    placeholderTextColor={theme.colors.placeholder}
                                    style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Tú eres...</Text>
                            <View style={styles.genderContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.genderOption,
                                        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                                        logic.sexo === 'hombre' && styles.genderOptionActive
                                    ]}
                                    onPress={() => logic.setSexo('hombre')}
                                >
                                    <MaterialCommunityIcons
                                        name="face-man"
                                        size={24}
                                        color={logic.sexo === 'hombre' ? '#fff' : theme.colors.textSecondary}
                                    />
                                    <Text style={[styles.genderText, { color: theme.colors.textSecondary }, logic.sexo === 'hombre' && styles.genderTextActive]}>Hombre</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.genderOption,
                                        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                                        logic.sexo === 'mujer' && styles.genderOptionActive
                                    ]}
                                    onPress={() => logic.setSexo('mujer')}
                                >
                                    <MaterialCommunityIcons
                                        name="face-woman"
                                        size={24}
                                        color={logic.sexo === 'mujer' ? '#fff' : theme.colors.textSecondary}
                                    />
                                    <Text style={[styles.genderText, { color: theme.colors.textSecondary }, logic.sexo === 'mujer' && styles.genderTextActive]}>Mujer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: theme.colors.primary }, logic.loading && styles.buttonDisabled]}
                        onPress={logic.handleSave}
                        disabled={logic.loading}
                    >
                        <Text style={styles.saveButtonText}>
                            {logic.loading ? 'Guardando...' : 'Guardar Cambios'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                        disabled={logic.loading}
                    >
                        <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>Cancelar</Text>
                    </TouchableOpacity>
                </ScrollView>

                <SuccessModal
                    visible={logic.showSuccess}
                    onClose={logic.handleSuccessClose}
                    message="Cambios guardados con éxito"
                />

                <ConfirmModal
                    visible={logic.alertState.visible}
                    onClose={logic.hideAlert}
                    onConfirm={logic.hideAlert}
                    title={logic.alertState.title}
                    message={logic.alertState.message}
                    confirmText="Entendido"
                    type={logic.alertState.type}
                    showCancel={false}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    header: {
        marginBottom: 32,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 6,
        marginLeft: 60, // Align with title text
    },
    form: {
        marginBottom: 32,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    flex1: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        fontSize: 16,
    },
    hint: {
        fontSize: 12,
        marginTop: 6,
    },
    genderContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    genderOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    genderOptionActive: {
        backgroundColor: '#135bec',
        borderColor: '#135bec',
    },
    genderText: {
        fontSize: 14,
        fontWeight: '600',
    },
    genderTextActive: {
        color: '#fff',
    },
    saveButton: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    successModalContent: {
        padding: 24,
        alignItems: 'center',
    },
    successIconWrapper: {
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    successMessage: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
    },
    successBtn: {
        width: '100%',
    }
});
