import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Input, ResponsiveContainer } from '../../../components';
import { useSignUpScreen } from './useSignUpScreen';

export default function SignUpScreenWeb({ navigation }) {
    const logic = useSignUpScreen(navigation);
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
                            <Text style={[styles.title, { color: theme.colors.text }]}>Crea tu cuenta</Text>
                            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Únete a la red exclusiva de tu condominio</Text>
                        </View>
                    </View>

                    <View style={[styles.mainLayout, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        {/* Stepper / Progress (Optional UI enhancement) */}
                        <View style={styles.stepsSide}>
                            <View style={styles.stepItem}>
                                <View style={[styles.stepDot, { backgroundColor: theme.colors.primary }]} />
                                <Text style={[styles.stepText, { color: theme.colors.text, fontWeight: '700' }]}>Datos de acceso</Text>
                            </View>
                            <View style={styles.stepConnector} />
                            <View style={styles.stepItem}>
                                <View style={[styles.stepDot, { backgroundColor: logic.selectedComunidad ? theme.colors.primary : theme.colors.border }]} />
                                <Text style={[styles.stepText, { color: logic.selectedComunidad ? theme.colors.text : theme.colors.textSecondary }]}>Ubicación</Text>
                            </View>
                            <View style={styles.stepConnector} />
                            <View style={styles.stepItem}>
                                <View style={[styles.stepDot, { backgroundColor: logic.nombre ? theme.colors.primary : theme.colors.border }]} />
                                <Text style={[styles.stepText, { color: logic.nombre ? theme.colors.text : theme.colors.textSecondary }]}>Perfil vecino</Text>
                            </View>
                        </View>

                        <View style={styles.formSide}>
                            <View style={styles.formSection}>
                                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>SELECCIONA TU COMUNIDAD</Text>
                                <TouchableOpacity
                                    style={[styles.selector, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}
                                    onPress={logic.toggleComunidadSelector}
                                >
                                    <Text style={[styles.selectorText, !logic.selectedComunidad ? { color: theme.colors.placeholder } : { color: theme.colors.text }]}>
                                        {logic.selectedComunidad ? logic.selectedComunidad.nombre : 'Busca tu condominio...'}
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

                                {logic.selectedComunidad && (
                                    <Input
                                        label="CÓDIGO DE ACCESO"
                                        placeholder="Ingresa el código proporcionado por administración"
                                        value={logic.communityCode}
                                        onChangeText={logic.setCommunityCode}
                                        style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                                    />
                                )}
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.formSection}>
                                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>TUS DATOS</Text>
                                <Input
                                    label="Nombre Completo"
                                    placeholder="Juan Pérez"
                                    value={logic.nombre}
                                    onChangeText={logic.setNombre}
                                    style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                                />
                                <View style={styles.row}>
                                    <View style={styles.flex1}>
                                        <Input
                                            label="Torre / Bloque"
                                            placeholder="Ej: Torre A"
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
                                <Input
                                    label="Email"
                                    placeholder="juan@ejemplo.com"
                                    value={logic.email}
                                    onChangeText={logic.setEmail}
                                    style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                                />
                                <Input
                                    label="Contraseña"
                                    placeholder="••••••••"
                                    value={logic.password}
                                    onChangeText={logic.setPassword}
                                    secureTextEntry
                                    style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                                />
                            </View>

                            <Button
                                onPress={logic.handleSignUp}
                                loading={logic.loading}
                                style={styles.mainBtn}
                            >
                                Crear mi cuenta
                            </Button>

                            <View style={styles.googleDivider}>
                                <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
                                <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>O REGÍSTRATE CON</Text>
                                <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
                            </View>

                            <Button
                                variant="outline"
                                onPress={logic.handleGoogleSignUp}
                                loading={logic.googleLoading}
                                style={[styles.googleBtn, { borderColor: theme.colors.border }]}
                                textStyle={{ color: theme.colors.text }}
                                icon={
                                    <Image
                                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }}
                                        style={{ width: 22, height: 22 }}
                                    />
                                }
                            >
                                Google
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
    mainLayout: {
        flexDirection: 'row',
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
        minHeight: 800,
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    },
    stepsSide: {
        width: 300,
        backgroundColor: '#f8fafc',
        padding: 60,
        display: Platform.select({ web: 'flex', default: 'none' }),
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    stepDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    stepText: {
        fontSize: 14,
    },
    stepConnector: {
        width: 2,
        height: 40,
        backgroundColor: '#e2e8f0',
        marginLeft: 5,
        marginVertical: 4,
    },
    formSide: {
        flex: 1,
        padding: 60,
    },
    formSection: {
        gap: 20,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
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
        fontWeight: '500',
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
        fontWeight: '500',
    },
    row: {
        flexDirection: 'row',
        gap: 20,
    },
    flex1: {
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginVertical: 40,
    },
    mainBtn: {
        height: 60,
        borderRadius: 16,
        marginTop: 20,
    },
    googleDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 32,
    },
    line: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        paddingHorizontal: 16,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    googleBtn: {
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
    }
});
