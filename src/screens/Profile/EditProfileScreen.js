import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { Input, Modal, Button } from '../../components';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function EditProfileScreen({ navigation }) {
    const { profile, refreshProfile } = useAuth();
    const { theme, isDark } = useTheme();
    const [nombre, setNombre] = useState(profile?.nombre || '');
    const [telefono, setTelefono] = useState(profile?.telefono || '');
    const [torre, setTorre] = useState(profile?.torre || '');
    const [depto, setDepto] = useState(profile?.depto || '');
    const [sexo, setSexo] = useState(profile?.sexo || 'hombre');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = async () => {
        if (!nombre.trim()) {
            Alert.alert('Error', 'El nombre no puede estar vacío');
            return;
        }

        setLoading(true);
        try {
            const { error } = await authService.updateProfile(profile.id, {
                nombre: nombre.trim(),
                telefono: telefono.trim(),
                torre: torre.trim(),
                depto: depto.trim(),
                sexo: sexo,
            });
            setLoading(false);

            if (error) {
                console.error('[EditProfile] Update error:', error);
                Alert.alert('Error', 'No se pudo actualizar el perfil');
            } else {
                console.log('[EditProfile] Update success');
                // Refrescar en segundo plano
                if (refreshProfile) {
                    refreshProfile().catch(e => console.error('[EditProfile] Refresh error:', e));
                }

                // Mostrar modal de éxito propio de la app
                setShowSuccess(true);
            }
        } catch (err) {
            setLoading(false);
            console.error('[EditProfile] Unexpected error:', err);
            Alert.alert('Error', 'Ocurrió un error inesperado al guardar');
        }
    };

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
                        <Text style={[styles.title, { color: theme.colors.text }]}>Editar Perfil</Text>
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Actualiza tu información personal</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Nombre Completo</Text>
                            <Input
                                inputStyle={[styles.input, { color: theme.colors.text }]}
                                value={nombre}
                                onChangeText={setNombre}
                                placeholder="Tu nombre"
                                placeholderTextColor={theme.colors.placeholder}
                                style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Teléfono de Contacto</Text>
                            <Input
                                inputStyle={[styles.input, { color: theme.colors.text }]}
                                value={telefono}
                                onChangeText={setTelefono}
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
                                    value={torre}
                                    onChangeText={setTorre}
                                    placeholder="Ej: A"
                                    placeholderTextColor={theme.colors.placeholder}
                                    style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                                />
                            </View>
                            <View style={styles.flex1}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Depto / Casa</Text>
                                <Input
                                    inputStyle={[styles.input, { color: theme.colors.text }]}
                                    value={depto}
                                    onChangeText={setDepto}
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
                                        sexo === 'hombre' && styles.genderOptionActive
                                    ]}
                                    onPress={() => setSexo('hombre')}
                                >
                                    <MaterialCommunityIcons
                                        name="face-man"
                                        size={24}
                                        color={sexo === 'hombre' ? '#fff' : theme.colors.textSecondary}
                                    />
                                    <Text style={[styles.genderText, { color: theme.colors.textSecondary }, sexo === 'hombre' && styles.genderTextActive]}>Hombre</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.genderOption,
                                        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                                        sexo === 'mujer' && styles.genderOptionActive
                                    ]}
                                    onPress={() => setSexo('mujer')}
                                >
                                    <MaterialCommunityIcons
                                        name="face-woman"
                                        size={24}
                                        color={sexo === 'mujer' ? '#fff' : theme.colors.textSecondary}
                                    />
                                    <Text style={[styles.genderText, { color: theme.colors.textSecondary }, sexo === 'mujer' && styles.genderTextActive]}>Mujer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: theme.colors.primary }, loading && styles.buttonDisabled]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        <Text style={styles.saveButtonText}>
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                        disabled={loading}
                    >
                        <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>Cancelar</Text>
                    </TouchableOpacity>
                </ScrollView>

                <Modal
                    isOpen={showSuccess}
                    onClose={() => { }}
                    title=""
                >
                    <View style={[styles.successModalContent, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.successIconWrapper}>
                            <MaterialCommunityIcons name="check-circle" size={80} color={theme.colors.success} />
                        </View>
                        <Text style={[styles.successTitle, { color: theme.colors.text }]}>¡Listo!</Text>
                        <Text style={[styles.successMessage, { color: theme.colors.textSecondary }]}>Cambios guardados con éxito</Text>
                        <Button
                            onPress={() => {
                                setShowSuccess(false);
                                navigation.goBack();
                            }}
                            style={styles.successBtn}
                        >
                            Entendido
                        </Button>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        padding: 24,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 4,
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
        color: '#475569',
        marginBottom: 8,
    },
    input: {
        fontSize: 16,
    },
    hint: {
        fontSize: 12,
        color: '#94a3b8',
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
        borderColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
    },
    genderOptionActive: {
        backgroundColor: '#135bec',
        borderColor: '#135bec',
    },
    genderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    genderTextActive: {
        color: '#fff',
    },
    saveButton: {
        backgroundColor: '#135bec',
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
        color: '#64748b',
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
        color: '#1e293b',
        marginBottom: 8,
    },
    successMessage: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 24,
    },
    successBtn: {
        width: '100%',
    }
});
