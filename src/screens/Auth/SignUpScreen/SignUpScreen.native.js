import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Input, SuccessModal, ConfirmModal } from '../../../components';
import { useSignUpScreen } from './useSignUpScreen';

export default function SignUpScreenNative({ navigation }) {
    const logic = useSignUpScreen(navigation);
    const { theme, insets } = logic;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
                keyboardShouldPersistTaps="handled"
            >
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: theme.colors.inputBackground }]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={[styles.backIcon, { color: theme.colors.text }]}>←</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>Únete a la Comunidad</Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Crea tu cuenta para conectar con tus vecinos de forma segura.</Text>
                </View>

                <View style={styles.form}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Tu Comunidad</Text>
                    <TouchableOpacity
                        style={[styles.selector, { backgroundColor: theme.colors.inputBackground }]}
                        onPress={logic.toggleComunidadSelector}
                    >
                        <MaterialCommunityIcons name="office-building" size={20} color={theme.colors.textSecondary} />
                        <Text style={[styles.selectorText, !logic.selectedComunidad ? { color: theme.colors.placeholder } : { color: theme.colors.text }]}>
                            {logic.selectedComunidad ? logic.selectedComunidad.nombre : 'Selecciona tu condominio'}
                        </Text>
                        <MaterialCommunityIcons name="chevron-down" size={20} color={theme.colors.textSecondary} />
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
                            label={`CÓDIGO DE ACCESO (${logic.selectedComunidad.nombre.toUpperCase()})`}
                            placeholder="Ingresa el código secreto"
                            value={logic.communityCode}
                            onChangeText={logic.setCommunityCode}
                            autoCapitalize="characters"
                            leftIcon={<MaterialCommunityIcons name="shield-key-outline" size={20} color={theme.colors.textSecondary} />}
                            placeholderTextColor={theme.colors.placeholder}
                            inputStyle={{ color: theme.colors.text }}
                            labelStyle={{ color: theme.colors.textSecondary }}
                            containerStyle={{ marginBottom: 16 }}
                        />
                    )}

                    <Input
                        label="Nombre Completo"
                        placeholder="Ej: Juan Pérez"
                        value={logic.nombre}
                        onChangeText={logic.setNombre}
                        placeholderTextColor={theme.colors.placeholder}
                        inputStyle={{ color: theme.colors.text }}
                        labelStyle={{ color: theme.colors.textSecondary }}
                        containerStyle={{ marginBottom: 16 }}
                    />
                    <View style={styles.row}>
                        <View style={styles.flex1}>
                            <Input
                                label="Torre / Bloque"
                                placeholder="Ej: A, 2, B"
                                value={logic.torre}
                                onChangeText={logic.setTorre}
                                placeholderTextColor={theme.colors.placeholder}
                                inputStyle={{ color: theme.colors.text }}
                                labelStyle={{ color: theme.colors.textSecondary }}
                                containerStyle={{ marginBottom: 16 }}
                            />
                        </View>
                        <View style={styles.flex1}>
                            <Input
                                label="Depto / Casa"
                                placeholder="Ej: 402, 15"
                                value={logic.depto}
                                onChangeText={logic.setDepto}
                                placeholderTextColor={theme.colors.placeholder}
                                inputStyle={{ color: theme.colors.text }}
                                labelStyle={{ color: theme.colors.textSecondary }}
                                containerStyle={{ marginBottom: 16 }}
                            />
                        </View>
                    </View>
                    <Input
                        label="Email"
                        placeholder="tu@email.com"
                        value={logic.email}
                        onChangeText={logic.setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor={theme.colors.placeholder}
                        inputStyle={{ color: theme.colors.text }}
                        labelStyle={{ color: theme.colors.textSecondary }}
                        containerStyle={{ marginBottom: 16 }}
                    />
                    <Input
                        label="Contraseña"
                        placeholder="••••••••"
                        value={logic.password}
                        onChangeText={logic.setPassword}
                        secureTextEntry
                        placeholderTextColor={theme.colors.placeholder}
                        inputStyle={{ color: theme.colors.text }}
                        labelStyle={{ color: theme.colors.textSecondary }}
                        containerStyle={{ marginBottom: 16 }}
                    />

                    <Button
                        onPress={logic.handleSignUp}
                        loading={logic.loading}
                        disabled={logic.googleLoading}
                        fullWidth
                        style={[styles.signUpButton, { backgroundColor: theme.colors.primary }]}
                    >
                        Registrarme con Email
                    </Button>

                    <View style={styles.dividerRow}>
                        <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                        <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>o</Text>
                        <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                    </View>

                    <Button
                        variant="outline"
                        onPress={logic.handleGoogleSignUp}
                        loading={logic.googleLoading}
                        disabled={logic.loading}
                        fullWidth
                        style={[styles.googleButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                        textStyle={[styles.googleButtonText, { color: theme.colors.text }]}
                        icon={
                            <Image
                                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }}
                                style={{ width: 22, height: 22 }}
                                resizeMode="contain"
                            />
                        }
                    >
                        Crear cuenta con Google
                    </Button>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>Al registrarte, aceptas nuestros</Text>
                    <TouchableOpacity>
                        <Text style={[styles.linkText, { color: theme.colors.primary }]}>Términos y Privacidad</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <SuccessModal
                visible={logic.successState.visible}
                onClose={logic.successState.onClose}
                message={logic.successState.message}
            />

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
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    backIcon: {
        fontSize: 24,
        fontWeight: '700',
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
        gap: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
        marginLeft: 4,
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 12,
        marginBottom: 8,
    },
    selectorText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    dropdown: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
        overflow: 'hidden',
    },
    dropdownItem: {
        padding: 16,
        borderBottomWidth: 1,
    },
    dropdownItemText: {
        fontSize: 16,
        fontWeight: '500',
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    flex1: {
        flex: 1,
    },
    signUpButton: {
        marginTop: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#2563eb',
                shadowOpacity: 0.3,
                shadowRadius: 15,
                shadowOffset: { width: 0, height: 10 },
            },
            android: {
                elevation: 4,
            }
        })
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
        paddingBottom: 20,
    },
    footerText: {
        fontSize: 13,
        fontWeight: '500',
    },
    linkText: {
        fontSize: 13,
        fontWeight: '800',
        marginTop: 4,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        paddingHorizontal: 16,
        fontSize: 14,
        fontStyle: 'italic',
    },
    googleButton: {
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
});
