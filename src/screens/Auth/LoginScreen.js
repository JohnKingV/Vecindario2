import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
    Animated,
    Alert,
    useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Input } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BUILDING_IMAGES = [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200',
    'https://images.unsplash.com/photo-1460317442991-0ec239f3674d?q=80&w=1200',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200'
];

// Componente de Slideshow independiente para evitar re-renders innecesarios de toda la pantalla
const BackgroundSlideshow = React.memo(() => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const fadeAnims = useRef(BUILDING_IMAGES.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        // Initial fade in first image
        Animated.timing(fadeAnims[0], {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        const timer = setInterval(() => {
            const nextIndex = (currentImageIndex + 1) % BUILDING_IMAGES.length;

            // Fade out current
            Animated.timing(fadeAnims[currentImageIndex], {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start();

            // Fade in next
            Animated.timing(fadeAnims[nextIndex], {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();

            setCurrentImageIndex(nextIndex);
        }, 3000); // Aumentado a 3s para menos estrés visual

        return () => clearInterval(timer);
    }, [currentImageIndex]);

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {BUILDING_IMAGES.map((image, index) => (
                <Animated.Image
                    key={index}
                    source={{ uri: image }}
                    style={[
                        styles.backgroundImage,
                        { opacity: fadeAnims[index] }
                    ]}
                    resizeMode="cover"
                />
            ))}
            <LinearGradient
                colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
                style={styles.gradientOverlay}
            />
        </View>
    );
});

export default function LoginScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { signIn, signInWithGoogle: googleSignIn } = useAuth();
    const { theme, isDark } = useTheme();
    // Ya no usamos el hook local para evitar re-renders de todo el layout al abrir teclado


    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        setLoading(true);
        try {
            const { error } = await signIn(email, password);
            if (error) {
                if (error.message?.includes('Email not confirmed')) {
                    Alert.alert(
                        'Confirmación Pendiente',
                        'Tu correo electrónico aún no ha sido confirmado. Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación.'
                    );
                } else {
                    Alert.alert('Error', error.message);
                }
            }
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            const { error } = await googleSignIn();
            if (error) {
                Alert.alert('Error', error.message);
            }
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                enabled={Platform.OS === 'ios'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Hero Section with Integrated Slideshow */}
                    <View style={styles.heroSection}>
                        <BackgroundSlideshow />

                        <View style={styles.titleContainer}>
                            <Text style={styles.brandTitle}>Vecindario</Text>
                            <Text style={styles.brandSubtitle}>Tu comunidad en las alturas</Text>
                        </View>
                    </View>

                    {/* Form Card */}
                    <View style={[styles.formCard, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>CORREO ELECTRÓNICO</Text>
                            <Input
                                placeholder="nombre@ejemplo.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
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
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <Button
                            onPress={handleLogin}
                            loading={loading}
                            disabled={googleLoading}
                            fullWidth
                            style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
                            textStyle={styles.loginButtonText}
                        >
                            Ingresar
                        </Button>

                        <View style={styles.dividerRow}>
                            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                            <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>O CONTINUAR CON</Text>
                            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                        </View>

                        <Button
                            variant="outline"
                            onPress={handleGoogleSignIn}
                            loading={googleLoading}
                            disabled={loading}
                            fullWidth
                            style={[styles.googleButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                            textStyle={[styles.googleButtonText, { color: theme.colors.text }]}
                            icon={
                                <Image
                                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }}
                                    style={{ width: 20, height: 20 }}
                                    resizeMode="contain"
                                />
                            }
                        >
                            Google
                        </Button>

                    </View>
                </ScrollView>

                {/* Sticky Sign Up Footer */}
                <View style={[
                    styles.signUpFooter,
                    {
                        backgroundColor: theme.colors.card,
                        paddingBottom: insets.bottom > 0 ? insets.bottom + 10 : 15
                    }
                ]}>
                    <Text style={[styles.noAccountText, { color: theme.colors.textSecondary }]}>¿No tienes una cuenta? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={[styles.signUpLinkText, { color: theme.colors.primary }]}>Regístrate</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc', // Cambiado a color de fondo claro para evitar parpadeo negro
    },
    backgroundContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#111',
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    scrollContent: {
        flexGrow: 1,
    },
    heroSection: {
        height: SCREEN_HEIGHT * 0.45,
        paddingHorizontal: 48,
        justifyContent: 'flex-end',
        paddingBottom: 60,
        backgroundColor: '#000',
    },
    titleContainer: {
        marginBottom: 0,
    },
    brandTitle: {
        fontSize: 44,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: -1,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
        marginBottom: -5,
    },
    brandSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.95)',
        marginTop: 0,
        fontWeight: '400',
        letterSpacing: 0.2,
    },
    formCard: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 32,
        paddingTop: 30,
        paddingBottom: 10,
        marginTop: -40,
        minHeight: SCREEN_HEIGHT * 0.6,
        zIndex: 10,
        elevation: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -20 },
                shadowOpacity: 0.15,
                shadowRadius: 50,
            },
            web: {
                boxShadow: '0px -20px 50px rgba(0,0,0,0.15)',
            }
        })
    },
    inputGroup: {
        marginBottom: 16,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 4,
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        color: '#94a3b8',
        marginBottom: 10,
        letterSpacing: 1.2,
        marginLeft: 4,
    },
    forgotText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#135bec',
        marginBottom: 10,
    },
    premiumInputContainer: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        // Eliminado height fijo para que el componente Input interno lo maneje
    },
    loginButton: {
        backgroundColor: '#0f172a',
        height: 60,
        borderRadius: 20,
        marginTop: 12,
        ...Platform.select({
            web: { boxShadow: '0px 10px 20px rgba(15, 23, 42, 0.2)' },
            default: {
                shadowColor: '#0f172a',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.2,
                shadowRadius: 20,
                elevation: 8,
            }
        })
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#f1f5f9',
    },
    dividerText: {
        paddingHorizontal: 16,
        color: '#94a3b8',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    googleButton: {
        height: 58,
        borderRadius: 20,
        borderColor: '#f1f5f9',
        borderWidth: 1,
        backgroundColor: '#fff',
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#334155',
    },
    noAccountText: {
        color: '#64748b',
        fontSize: 14,
    },
    signUpLinkText: {
        color: '#135bec',
        fontSize: 14,
        fontWeight: '800',
    },
    signUpFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: 0,
        backgroundColor: '#ffffff',
    }
});
