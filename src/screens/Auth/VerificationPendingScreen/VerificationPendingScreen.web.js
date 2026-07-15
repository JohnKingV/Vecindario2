import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, ResponsiveContainer } from '../../../components';
import { useVerificationPendingScreen } from './useVerificationPendingScreen';

export default function VerificationPendingScreenWeb({ route, navigation }) {
    const logic = useVerificationPendingScreen(route, navigation);
    const { theme, isDark } = logic;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>
                <View style={styles.content}>
                    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff' }]}>
                            <MaterialCommunityIcons name="email-seal-outline" size={100} color={theme.colors.primary} />
                        </View>

                        <Text style={[styles.title, { color: theme.colors.text }]}>Verificación enviada</Text>

                        <View style={styles.messageBox}>
                            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                                Hemos enviado un enlace de confirmación a tu correo electrónico:
                            </Text>
                            <Text style={[styles.email, { color: theme.colors.text }]}>{logic.email}</Text>
                        </View>

                        <View style={[styles.infoBar, { backgroundColor: isDark ? 'rgba(148, 163, 184, 0.05)' : '#f8fafc' }]}>
                            <MaterialCommunityIcons name="information" size={20} color={theme.colors.textSecondary} />
                            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                                Revisa tu bandeja de entrada (y la carpeta de spam) para activar tu acceso a la comunidad.
                            </Text>
                        </View>

                        <View style={styles.actions}>
                            <Button onPress={logic.handleGoToLogin} style={styles.mainBtn}>
                                Volver al Iniciar Sesión
                            </Button>

                            <TouchableOpacity onPress={logic.handleResendEmail} style={styles.resendBtn}>
                                <Text style={[styles.resendLabel, { color: theme.colors.textSecondary }]}>¿No recibiste nada?</Text>
                                <Text style={[styles.resendAction, { color: theme.colors.primary }]}>Reenviar correo de confirmación</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ResponsiveContainer>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    card: {
        maxWidth: 500,
        width: '100%',
        padding: 50,
        borderRadius: 32,
        borderWidth: 1,
        alignItems: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
    },
    iconBox: {
        width: 160,
        height: 160,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 20,
    },
    messageBox: {
        alignItems: 'center',
        marginBottom: 40,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    email: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 10,
    },
    infoBar: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 16,
        gap: 16,
        marginBottom: 48,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    actions: {
        width: '100%',
        gap: 24,
    },
    mainBtn: {
        height: 56,
        borderRadius: 16,
    },
    resendBtn: {
        alignItems: 'center',
        gap: 4,
    },
    resendLabel: {
        fontSize: 14,
    },
    resendAction: {
        fontSize: 14,
        fontWeight: '700',
    }
});
