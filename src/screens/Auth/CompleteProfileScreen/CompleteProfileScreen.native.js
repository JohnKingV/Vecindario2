import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Input } from '../../../components';
import { useCompleteProfileScreen } from './useCompleteProfileScreen';

export default function CompleteProfileScreenNative() {
    const logic = useCompleteProfileScreen();
    const { theme, isDark } = logic;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.container, { backgroundColor: theme.colors.background }]}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>¡Casi listo!</Text>
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Para continuar, por favor completa tu información de residencia.</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Tu Comunidad</Text>
                        <TouchableOpacity
                            style={[styles.selector, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}
                            onPress={logic.toggleComunidadSelector}
                        >
                            <MaterialCommunityIcons name="office-building" size={20} color={theme.colors.textSecondary} />
                            <Text style={[styles.selectorText, { color: theme.colors.text }, !logic.selectedComunidad && { color: theme.colors.placeholder }]}>
                                {logic.selectedComunidad ? logic.selectedComunidad.nombre : 'Selecciona tu condominio'}
                            </Text>
                            <MaterialCommunityIcons name="chevron-down" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>

                        {logic.showComunidadSelector && (
                            <View style={[styles.dropdownContainer, { zIndex: 1000 }]}>
                                <ScrollView
                                    style={[styles.dropdown, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                                    nestedScrollEnabled={true}
                                >
                                    {logic.comunidades.map((c) => (
                                        <TouchableOpacity
                                            key={c.id}
                                            style={[styles.dropdownItem, { borderBottomColor: theme.colors.border }]}
                                            onPress={() => logic.handleSelectComunidad(c)}
                                        >
                                            <Text style={[styles.dropdownItemText, { color: theme.colors.text }]}>{c.nombre}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {logic.selectedComunidad && (
                            <Input
                                label={`CÓDIGO DE ACCESO (${logic.selectedComunidad.nombre.toUpperCase()})`}
                                placeholder="Ingresa el código secreto"
                                value={logic.communityCode}
                                onChangeText={logic.setCommunityCode}
                                autoCapitalize="characters"
                                leftIcon={<MaterialCommunityIcons name="shield-key-outline" size={20} color={theme.colors.textSecondary} />}
                            />
                        )}

                        <Input
                            label="Nombre Completo"
                            placeholder="Ej: Juan Pérez"
                            value={logic.nombre}
                            onChangeText={logic.setNombre}
                        />

                        <View style={styles.inputWrapper}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Tú eres...</Text>
                            <View style={styles.genderContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.genderOption,
                                        { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border },
                                        logic.sexo === 'hombre' && [styles.genderOptionActive, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]
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
                                        { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border },
                                        logic.sexo === 'mujer' && [styles.genderOptionActive, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]
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

                        <View style={styles.inputsRow}>
                            <View style={styles.flex1}>
                                <Input
                                    label="Torre / Bloque"
                                    placeholder="Ej: A, 2, B"
                                    value={logic.torre}
                                    onChangeText={logic.setTorre}
                                />
                            </View>
                            <View style={styles.flex1}>
                                <Input
                                    label="Departamento / Casa"
                                    placeholder="Ej: 402, 15"
                                    value={logic.depto}
                                    onChangeText={logic.setDepto}
                                />
                            </View>
                        </View>

                        <Button
                            onPress={logic.handleCompleteProfile}
                            loading={logic.loading}
                            fullWidth
                            style={styles.completeButton}
                        >
                            Finalizar Registro
                        </Button>

                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={logic.signOut}
                        >
                            <Text style={styles.logoutText}>Cerrar Sesión</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
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
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 10,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 34,
        fontWeight: '900',
        letterSpacing: -1.5,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 24,
        marginTop: 8,
    },
    form: {
        gap: 16,
    },
    inputsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    flex1: {
        flex: 1,
    },
    inputWrapper: {
        marginBottom: 8,
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
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    selectorText: {
        flex: 1,
        fontSize: 16,
    },
    dropdownContainer: {
        marginTop: -8,
        marginBottom: 8,
        zIndex: 1000,
    },
    dropdown: {
        borderRadius: 12,
        borderWidth: 1,
        maxHeight: 200,
    },
    dropdownItem: {
        padding: 16,
        borderBottomWidth: 1,
    },
    dropdownItemText: {
        fontSize: 14,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    completeButton: {
        marginTop: 12,
    },
    logoutButton: {
        padding: 16,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ef4444',
    }
});
