import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Input, ResponsiveContainer } from '../../../components';
import { useCompleteProfileScreen } from './useCompleteProfileScreen';

export default function CompleteProfileScreenWeb() {
    const logic = useCompleteProfileScreen();
    const { theme } = logic;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>¡Bienvenido a Vecindario!</Text>
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Solo un paso más: completa tu información de residencia para conectar con tu comunidad.</Text>
                    </View>

                    <View style={[styles.mainLayout, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <View style={styles.formSection}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>UBICACIÓN</Text>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Condominio</Text>
                                <TouchableOpacity
                                    style={[styles.selector, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}
                                    onPress={logic.toggleComunidadSelector}
                                >
                                    <Text style={[styles.selectorText, { color: theme.colors.text }, !logic.selectedComunidad && { color: theme.colors.placeholder }]}>
                                        {logic.selectedComunidad ? logic.selectedComunidad.nombre : 'Selecciona tu condominio'}
                                    </Text>
                                    <MaterialCommunityIcons name="chevron-down" size={24} color={theme.colors.textSecondary} />
                                </TouchableOpacity>

                                {logic.showComunidadSelector && (
                                    <View style={[styles.dropdown, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                        {logic.comunidades.map((c) => (
                                            <TouchableOpacity
                                                key={c.id}
                                                style={[styles.dropdownItem, { borderBottomColor: theme.colors.border }]}
                                                onPress={() => logic.handleSelectComunidad(c)}
                                            >
                                                <Text style={[styles.dropdownItemText, { color: theme.colors.text }]}>{c.nombre}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {logic.selectedComunidad && (
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Código Secret</Text>
                                    <Input
                                        placeholder="Ingresa el código proporcionado por administración"
                                        value={logic.communityCode}
                                        onChangeText={logic.setCommunityCode}
                                        autoCapitalize="characters"
                                        style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                                    />
                                </View>
                            )}
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.formSection}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>IDENTIDAD</Text>

                            <Input
                                label="Nombre Completo"
                                placeholder="Juan Pérez"
                                value={logic.nombre}
                                onChangeText={logic.setNombre}
                                style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                            />

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Género</Text>
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

                            <View style={styles.row}>
                                <View style={styles.flex1}>
                                    <Input
                                        label="Torre / Bloque"
                                        placeholder="Ej: A"
                                        value={logic.torre}
                                        onChangeText={logic.setTorre}
                                        style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                                    />
                                </View>
                                <View style={styles.flex1}>
                                    <Input
                                        label="Depto / Casa"
                                        placeholder="402"
                                        value={logic.depto}
                                        onChangeText={logic.setDepto}
                                        style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <TouchableOpacity onPress={logic.signOut} style={styles.logoutBtn}>
                                <Text style={{ color: '#ef4444', fontWeight: '700' }}>Cerrar Sesión</Text>
                            </TouchableOpacity>
                            <Button
                                onPress={logic.handleCompleteProfile}
                                loading={logic.loading}
                                style={styles.mainBtn}
                            >
                                Guardar y Continuar
                            </Button>
                        </View>
                    </View>
                </ScrollView>
            </ResponsiveContainer>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 50,
        paddingHorizontal: 20,
    },
    header: {
        marginBottom: 40,
        maxWidth: 800,
        alignSelf: 'center',
        width: '100%',
    },
    title: {
        fontSize: 36,
        fontWeight: '900',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        marginTop: 12,
        textAlign: 'center',
        lineHeight: 28,
    },
    mainLayout: {
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
        borderRadius: 24,
        borderWidth: 1,
        padding: 60,
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    },
    formSection: {
        gap: 24,
    },
    sectionTitle: {
        fontSize: 11,
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
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        paddingHorizontal: 20,
        borderRadius: 14,
        borderWidth: 1,
        cursor: 'pointer',
    },
    selectorText: {
        fontSize: 16,
    },
    dropdown: {
        borderRadius: 14,
        borderWidth: 1,
        marginTop: 8,
        overflow: 'hidden',
    },
    dropdownItem: {
        padding: 16,
        borderBottomWidth: 1,
    },
    dropdownItemText: {
        fontSize: 15,
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
        marginVertical: 48,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 48,
    },
    logoutBtn: {
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    mainBtn: {
        width: 240,
        height: 56,
        borderRadius: 16,
    }
});
