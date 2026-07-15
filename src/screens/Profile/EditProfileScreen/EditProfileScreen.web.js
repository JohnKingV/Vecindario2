import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Input, Modal, Button, ResponsiveContainer } from '../../../components';
import { useEditProfileScreen } from './useEditProfileScreen';

export default function EditProfileScreenWeb({ navigation }) {
    const logic = useEditProfileScreen(navigation);
    const { theme } = logic;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                        <View>
                            <Text style={[styles.title, { color: theme.colors.text }]}>Configuración de Perfil</Text>
                            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Actualiza tu información para la comunidad</Text>
                        </View>
                    </View>

                    <View style={styles.mainContent}>
                        <View style={[styles.formCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <View style={styles.formSection}>
                                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>INFORMACIÓN PERSONAL</Text>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Nombre Completo</Text>
                                    <Input
                                        value={logic.nombre}
                                        onChangeText={logic.setNombre}
                                        placeholder="Tu nombre completo"
                                        style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Teléfono de Contacto</Text>
                                    <Input
                                        value={logic.telefono}
                                        onChangeText={logic.setTelefono}
                                        placeholder="+56 9 ..."
                                        style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                                    />
                                    <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>Visible para vecinos interesados en tus artículos</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.formSection}>
                                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>UBICACIÓN EN CONDOMINIO</Text>
                                <View style={styles.row}>
                                    <View style={styles.flex1}>
                                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Torre / Bloque</Text>
                                        <Input
                                            value={logic.torre}
                                            onChangeText={logic.setTorre}
                                            placeholder="Ej: A"
                                            style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                                        />
                                    </View>
                                    <View style={styles.flex1}>
                                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Depto / Casa</Text>
                                        <Input
                                            value={logic.depto}
                                            onChangeText={logic.setDepto}
                                            placeholder="Ej: 402"
                                            style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.formSection}>
                                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>GÉNERO</Text>
                                <View style={styles.row}>
                                    <TouchableOpacity
                                        style={[styles.genderBtn, logic.sexo === 'hombre' && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
                                        onPress={() => logic.setSexo('hombre')}
                                    >
                                        <MaterialCommunityIcons name="face-man" size={24} color={logic.sexo === 'hombre' ? '#fff' : theme.colors.textSecondary} />
                                        <Text style={[styles.genderBtnText, { color: logic.sexo === 'hombre' ? '#fff' : theme.colors.textSecondary }]}>Hombre</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.genderBtn, logic.sexo === 'mujer' && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
                                        onPress={() => logic.setSexo('mujer')}
                                    >
                                        <MaterialCommunityIcons name="face-woman" size={24} color={logic.sexo === 'mujer' ? '#fff' : theme.colors.textSecondary} />
                                        <Text style={[styles.genderBtnText, { color: logic.sexo === 'mujer' ? '#fff' : theme.colors.textSecondary }]}>Mujer</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <Button
                                variant="outline"
                                onPress={() => navigation.goBack()}
                                style={styles.cancelBtn}
                                disabled={logic.loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onPress={logic.handleSave}
                                style={styles.saveBtn}
                                loading={logic.loading}
                            >
                                Guardar Cambios
                            </Button>
                        </View>
                    </View>
                </ScrollView>
            </ResponsiveContainer>

            <Modal
                isOpen={logic.showSuccess}
                onClose={() => { }}
                title=""
            >
                <View style={styles.successModal}>
                    <MaterialCommunityIcons name="check-circle" size={64} color={theme.colors.success} />
                    <Text style={[styles.successTitle, { color: theme.colors.text }]}>¡Perfil Actualizado!</Text>
                    <Text style={[styles.successText, { color: theme.colors.textSecondary }]}>Tu información ha sido guardada correctamente.</Text>
                    <Button onPress={logic.handleSuccessClose} style={{ width: '100%' }}>Entendido</Button>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 48,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 40,
    },
    backButton: {
        padding: 8,
        cursor: 'pointer',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 4,
    },
    mainContent: {
        maxWidth: 800,
        width: '100%',
    },
    formCard: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 40,
    },
    formSection: {
        gap: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 2,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
    },
    hint: {
        fontSize: 12,
        marginTop: 4,
    },
    row: {
        flexDirection: 'row',
        gap: 20,
    },
    flex1: {
        flex: 1,
    },
    genderBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        height: 56,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        cursor: 'pointer',
    },
    genderBtnText: {
        fontSize: 16,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginVertical: 40,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 16,
        marginTop: 40,
    },
    cancelBtn: {
        width: 150,
    },
    saveBtn: {
        width: 200,
    },
    successModal: {
        padding: 32,
        alignItems: 'center',
        gap: 16,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '900',
    },
    successText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    }
});
