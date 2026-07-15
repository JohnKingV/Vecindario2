import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Input, ResponsiveContainer } from '../../../components';
import { useLoginScreen } from './useLoginScreen';

const BUILDING_IMAGES = [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200',
    'https://images.unsplash.com/photo-1460317442991-0ec239f3674d?q=80&w=1200',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200'
];

export default function LoginScreenWeb({ navigation }) {
    const logic = useLoginScreen(navigation);
    const { theme } = logic;
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage(prev => (prev + 1) % BUILDING_IMAGES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar style="dark" />

            <View style={styles.mainLayout}>
                {/* Left Side: Visual/Slideshow */}
                <View style={styles.visualSide}>
                    <Image
                        source={{ uri: BUILDING_IMAGES[currentImage] }}
                        style={styles.bgImage}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['rgba(19, 91, 236, 0.4)', 'rgba(15, 23, 42, 0.8)']}
                        style={styles.overlay}
                    />
                    <View style={styles.visualContent}>
                        <Text style={styles.brandTitle}>Vecindario</Text>
                        <Text style={styles.brandSubtitle}>Tu comunidad en las alturas</Text>
                        <View style={styles.featureList}>
                            <View style={styles.featureItem}>
                                <View style={styles.dot} />
                                <Text style={styles.featureText}>Gestión de gastos comunes</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <View style={styles.dot} />
                                <Text style={styles.featureText}>Marketplace entre vecinos</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <View style={styles.dot} />
                                <Text style={styles.featureText}>Comunicación instantánea</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Right Side: Logic/Form */}
                <View style={[styles.formSide, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.formContainer}>
                        <View style={styles.formHeader}>
                            <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>¡Hola de nuevo!</Text>
                            <Text style={[styles.welcomeSubtitle, { color: theme.colors.textSecondary }]}>Ingresa tus credenciales para continuar</Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>CORREO ELECTRÓNICO</Text>
                                <Input
                                    placeholder="nombre@ejemplo.com"
                                    value={logic.email}
                                    onChangeText={logic.setEmail}
                                    style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <View style={styles.labelRow}>
                                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>CONTRASEÑA</Text>
                                    <TouchableOpacity>
                                        <Text style={[styles.forgotText, { color: theme.colors.primary }]}>¿Olvidaste tu contraseña?</Text>
                                    </TouchableOpacity>
                                </View>
                                <Input
                                    placeholder="••••••••"
                                    value={logic.password}
                                    onChangeText={logic.setPassword}
                                    secureTextEntry
                                    style={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                                />
                            </View>

                            <Button
                                onPress={logic.handleLogin}
                                loading={logic.loading}
                                disabled={logic.googleLoading}
                                style={styles.loginBtn}
                            >
                                Ingresar a mi cuenta
                            </Button>

                            <View style={styles.dividerRow}>
                                <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
                                <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>O CONTINUAR CON</Text>
                                <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
                            </View>

                            <Button
                                variant="outline"
                                onPress={logic.handleGoogleSignIn}
                                loading={logic.googleLoading}
                                disabled={logic.loading}
                                style={[styles.googleBtn, { borderColor: theme.colors.border }]}
                                textStyle={{ color: theme.colors.text }}
                                icon={
                                    <Image
                                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }}
                                        style={{ width: 20, height: 20 }}
                                    />
                                }
                            >
                                Google
                            </Button>
                        </View>

                        <View style={styles.formFooter}>
                            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>¿No tienes una cuenta yet? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                                <Text style={[styles.signUpLink, { color: theme.colors.primary }]}>Regístrate gratis</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainLayout: {
        flex: 1,
        flexDirection: 'row',
    },
    visualSide: {
        flex: 1,
        position: 'relative',
        display: Platform.select({ web: 'flex', default: 'none' }),
    },
    bgImage: {
        ...StyleSheet.absoluteFillObject,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    visualContent: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 80,
        zIndex: 1,
    },
    brandTitle: {
        fontSize: 64,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -2,
    },
    brandSubtitle: {
        fontSize: 20,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 8,
    },
    featureList: {
        marginTop: 60,
        gap: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3b82f6',
    },
    featureText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    formSide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        maxWidth: 440,
        width: '100%',
        paddingHorizontal: 40,
    },
    formHeader: {
        marginBottom: 40,
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    welcomeSubtitle: {
        fontSize: 16,
        marginTop: 8,
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        gap: 10,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
    },
    forgotText: {
        fontSize: 12,
        fontWeight: '700',
    },
    loginBtn: {
        height: 56,
        borderRadius: 14,
        marginTop: 8,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
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
        borderRadius: 14,
        borderWidth: 1,
    },
    formFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
    },
    footerText: {
        fontSize: 14,
    },
    signUpLink: {
        fontSize: 14,
        fontWeight: '800',
    }
});
