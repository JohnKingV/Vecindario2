import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../../components';
import { useVerificationPendingScreen } from './useVerificationPendingScreen';

export default function VerificationPendingScreenNative({ route, navigation }) {
    const logic = useVerificationPendingScreen(route, navigation);
    const { theme, isDark } = logic;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff' }]}>
                    <MaterialCommunityIcons
                        name="email-check-outline"
                        size={80}
                        color={theme.colors.primary}
                    />
                </View>

                <Text style={[styles.title, { color: theme.colors.text }]}>¡Revisa tu correo!</Text>

                <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                    Hemos enviado un enlace de confirmación a:
                </Text>

                <Text style={[styles.emailText, { color: theme.colors.primary }]}>
                    {logic.email}
                </Text>

                <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <MaterialCommunityIcons name="information-outline" size={20} color={theme.colors.textSecondary} />
                    <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                        Para activar tu cuenta y poder ingresar, es necesario que confirmes tu dirección de correo electrónico haciendo clic en el enlace que te enviamos.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Button
                        fullWidth
                        onPress={logic.handleGoToLogin}
                        style={styles.button}
                    >
                        Volver al Inicio
                    </Button>

                    <TouchableOpacity
                        style={styles.resendButton}
                        onPress={logic.handleResendEmail}
                    >
                        <Text style={[styles.resendText, { color: theme.colors.textSecondary }]}>
                            ¿No recibiste el correo? <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Reintentar</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    iconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    emailText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 32,
        textAlign: 'center',
    },
    infoCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
        marginBottom: 40,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    footer: {
        width: '100%',
        gap: 16,
    },
    button: {
        height: 56,
    },
    resendButton: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    resendText: {
        fontSize: 14,
    }
});
