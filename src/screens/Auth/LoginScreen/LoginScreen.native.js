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
    Animated as RNAnimated, // Renamed for background slideshow legacy support if needed, or replace entirely
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    interpolate,
    withSequence
} from 'react-native-reanimated';
import { Button, Input, ConfirmModal } from '../../../components';
import { useLoginScreen } from './useLoginScreen';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BUILDING_IMAGES = [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200',
    'https://images.unsplash.com/photo-1460317442991-0ec239f3674d?q=80&w=1200',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200'
];

const BackgroundSlideshow = React.memo(() => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const fadeAnims = useRef(BUILDING_IMAGES.map(() => new RNAnimated.Value(0))).current;

    useEffect(() => {
        RNAnimated.timing(fadeAnims[0], {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        const timer = setInterval(() => {
            const nextIndex = (currentImageIndex + 1) % BUILDING_IMAGES.length;

            RNAnimated.timing(fadeAnims[currentImageIndex], {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start();

            RNAnimated.timing(fadeAnims[nextIndex], {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();

            setCurrentImageIndex(nextIndex);
        }, 3000);

        return () => clearInterval(timer);
    }, [currentImageIndex]);

    return (
        <View style={styles.slideshowContainer} pointerEvents="none">
            {BUILDING_IMAGES.map((image, index) => (
                <RNAnimated.Image
                    key={index}
                    source={{ uri: image }}
                    style={[
                        styles.backgroundImage,
                        { opacity: fadeAnims[index] }
                    ]}
                    resizeMode="cover"
                />
            ))}
            {/* Removed gradientOverlay to show full building colors */}
        </View>
    );
});

// Componente para el Borde Plateado Animado (Reanimated)
const SilverBorder = ({ children, style }) => {
    const rotation = useSharedValue(0);

    React.useEffect(() => {
        rotation.value = withRepeat(
            withTiming(1, {
                duration: 4000,
                easing: Easing.linear,
            }),
            -1, // Loop infinito
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${rotation.value * 360}deg` }
        ],
    }));

    return (
        <View style={[styles.borderContainer, style]}>
            <Animated.View style={[styles.rotatingGradient, animatedStyle]}>
                <LinearGradient
                    colors={['#C0C0C0', '#E8E8E8', '#808080', '#D3D3D3', '#C0C0C0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
            <SafeBlur intensity={45} tint="light" style={styles.innerContent}>
                {children}
            </SafeBlur>
        </View>
    );
};

// Safe Blur Component to prevent crashes if native module is not compiled
const SafeBlur = ({ children, intensity, tint, style }) => {
    try {
        return (
            <BlurView intensity={intensity} tint={tint} style={style}>
                {children}
            </BlurView>
        );
    } catch (e) {
        // Fallback with a more opaque glass color
        return <View style={[style, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>{children}</View>;
    }
};



// Helper to calculate position on a smooth, constant horizontal oscillation
const getPositionOnCurve = (t) => {
    'worklet';
    // Constrained width to stay within text bounds
    // Y position is centered in the gap between title and subtitle (~30px down)
    const width = 120;
    const height = 15; // Vertical oscillation to give it some "swing"
    const x = width * Math.sin(t);
    const y = 30 + height * Math.cos(t);
    return { x, y };
};

// Shooting Star Component (Simplified Infinite Orbit)
const ShootingStar = () => {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withRepeat(
            withTiming(2 * Math.PI, {
                duration: 5000,
                easing: Easing.linear,
            }),
            -1,
            false
        );
    }, []);

    const particles = Array.from({ length: 40 }).map((_, index) => index);

    return (
        <View style={styles.starContainer} pointerEvents="none">
            {particles.map((i) => {
                const lag = (i + 1) * 0.015;
                return <TailParticle key={i} progress={progress} lag={lag} index={i} total={particles.length} />;
            })}
            <HeadComponent progress={progress} />
        </View>
    );
};

const TailParticle = ({ progress, lag, index, total }) => {
    const animatedStyle = useAnimatedStyle(() => {
        const t = progress.value - lag;
        const { x, y } = getPositionOnCurve(t);

        const sizeFactor = 1 - (index / total);
        const z = Math.sin(t);

        const scale = interpolate(z, [-1, 1], [0.6, 1]) * sizeFactor;
        const opacity = interpolate(z, [-1, 1], [0.4, 0.9]) * sizeFactor;

        return {
            transform: [{ translateX: x }, { translateY: y }, { scale }],
            opacity,
            zIndex: z > 0 ? 10 : 0,
        };
    });

    return <Animated.View style={[styles.starParticle, animatedStyle]} />;
};

const HeadComponent = ({ progress }) => {
    const animatedStyle = useAnimatedStyle(() => {
        const t = progress.value;
        const { x, y } = getPositionOnCurve(t);

        const z = Math.sin(t);
        const scale = interpolate(z, [-1, 1], [0.8, 1.4]);
        const zIndex = z > 0 ? 30 : 5;

        return {
            transform: [
                { translateX: x },
                { translateY: y },
                { scale }
            ],
            zIndex,
        };
    });

    return (
        <Animated.View style={[styles.starHeadWrapper, animatedStyle]}>
            <View style={styles.meteorSharpCore} />
        </Animated.View>
    );
};

export default function LoginScreenNative({ navigation }) {
    const logic = useLoginScreen(navigation);
    const { theme, insets } = logic;

    // Futuristic Title Animation Values
    const titleOpacity = useSharedValue(0);
    const titleScale = useSharedValue(0.9);

    useEffect(() => {
        // Entrance
        titleOpacity.value = withTiming(1, { duration: 1000 });
        titleScale.value = withTiming(1, { duration: 1000 }, () => {
            // Continuous Breathing
            titleScale.value = withRepeat(
                withSequence(
                    withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        });
    }, []);

    const animatedTitleStyle = useAnimatedStyle(() => ({
        opacity: titleOpacity.value,
        transform: [{ scale: titleScale.value }],
    }));

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Full Screen Background Slideshow */}
            <BackgroundSlideshow />

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
                    <View style={styles.heroSection}>
                        <View style={styles.titleContainer}>
                            <ShootingStar />
                            <Animated.Text style={[styles.brandTitle, animatedTitleStyle]}>
                                Vecindario
                            </Animated.Text>
                            <Animated.Text style={[styles.brandSubtitle, animatedTitleStyle]}>
                                TU COMUNIDAD EN LAS ALTURAS
                            </Animated.Text>
                        </View>
                    </View>

                    <SilverBorder style={styles.silverWrapper}>
                        {/* Light Background Content */}
                        <View style={styles.formContent}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: '#64748b' }]}>CORREO ELECTRÓNICO</Text>
                                <Input
                                    placeholder="nombre@ejemplo.com"
                                    value={logic.email}
                                    onChangeText={logic.setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <View style={styles.labelRow}>
                                    <Text style={[styles.label, { color: '#64748b' }]}>CONTRASEÑA</Text>
                                    <TouchableOpacity>
                                        <Text style={[styles.forgotText, { color: theme.colors.primary }]}>¿Olvidaste tu contraseña?</Text>
                                    </TouchableOpacity>
                                </View>
                                <Input
                                    placeholder="••••••••"
                                    value={logic.password}
                                    onChangeText={logic.setPassword}
                                    secureTextEntry
                                />
                            </View>

                            <Button
                                onPress={logic.handleLogin}
                                loading={logic.loading}
                                disabled={logic.googleLoading}
                                fullWidth
                                style={styles.loginButton}
                                textStyle={styles.loginButtonText}
                            >
                                INGRESAR
                            </Button>

                            <View style={styles.dividerRow}>
                                <View style={[styles.dividerLine, { backgroundColor: '#e2e8f0' }]} />
                                <Text style={[styles.dividerText, { color: '#94a3b8' }]}>O CONTINUAR CON</Text>
                                <View style={[styles.dividerLine, { backgroundColor: '#e2e8f0' }]} />
                            </View>

                            <Button
                                variant="outline"
                                onPress={logic.handleGoogleSignIn}
                                loading={logic.googleLoading}
                                disabled={logic.loading}
                                fullWidth
                                style={styles.googleButton}
                                textStyle={styles.googleButtonText}
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
                    </SilverBorder>
                </ScrollView>

                <View style={[
                    styles.signUpFooter,
                    {
                        backgroundColor: 'rgba(255,255,255,0.1)', // Unified Glass Air
                        paddingBottom: insets.bottom > 0 ? insets.bottom + 10 : 15,
                        paddingTop: 15,
                        borderTopWidth: 0,
                    }
                ]}>
                    <Text style={[styles.noAccountText, { color: '#64748b' }]}>¿No tienes una cuenta? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={[styles.signUpLinkText, { color: theme.colors.primary }]}>Regístrate</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#cbd5e1', // Metallic Silver (Slate) Background
    },
    slideshowContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: SCREEN_HEIGHT * 0.55, // Occupy top 55%
        zIndex: 0,
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
        height: SCREEN_HEIGHT * 0.45, // Slightly taller to allow more space
        paddingHorizontal: 48,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 50, // 30px overlap + 20px space
    },
    titleContainer: {
        alignItems: 'center',
    },
    brandTitle: {
        fontSize: 58, // Larger since script fonts occupy less visual weight
        fontFamily: Platform.select({ ios: 'SnellRoundhand-Bold', android: 'cursive' }),
        color: '#FFFFFF',
        letterSpacing: 1,
        textShadowColor: '#000000', // Black outline
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        marginBottom: 8,
        textAlign: 'center',
        paddingHorizontal: 10,
        transform: [{ rotate: '-3deg' }] // Slight tilt for more "Exotic" feel
    },
    brandSubtitle: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
        letterSpacing: 3,
        textAlign: 'center',
        textTransform: 'uppercase',
        textShadowColor: '#000000', // Black outline
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
    // Silver Border Styles
    silverWrapper: {
        marginTop: -30,
        marginHorizontal: 20,
        borderRadius: 42,
        height: SCREEN_HEIGHT * 0.55,
        elevation: 20,
        shadowColor: '#C0C0C0', // Silver Shadow
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    borderContainer: {
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 42,
    },
    rotatingGradient: {
        position: 'absolute',
        width: SCREEN_WIDTH * 1.5,
        height: SCREEN_WIDTH * 1.5,
        top: -SCREEN_WIDTH * 0.25,
        left: -SCREEN_WIDTH * 0.25,
        zIndex: 0,
        opacity: 0.8, // Softer border
    },
    innerContent: {
        margin: 2,
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)', // Translucent for Glass Effect
        borderRadius: 40,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    formContent: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 30,
        paddingBottom: 20,
    },
    // Form Elements
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
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 1,
        marginLeft: 4,
    },
    inputGlass: {
        // Removed glass styles
    },
    forgotText: {
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 8,
    },
    loginButton: {
        height: 56,
        borderRadius: 18,
        marginTop: 12,
        backgroundColor: '#3b82f6', // Original Blue (Sky 500)
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    loginButtonText: {
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 1,
        color: '#fff', // White text for blue background
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        paddingHorizontal: 16,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    googleButton: {
        height: 54,
        borderRadius: 18,
        borderWidth: 1,
        backgroundColor: '#fff',
        borderColor: '#e2e8f0',
    },
    googleButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    noAccountText: {
        fontSize: 14,
    },
    signUpLinkText: {
        fontSize: 14,
        fontWeight: '800',
    },
    signUpFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    // Shooting Star Styles
    starContainer: {
        position: 'absolute',
        top: 25,
        left: '50%',
        width: 0,
        height: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
    },
    starParticle: {
        position: 'absolute',
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#E8E8E8', // Silver/White star
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
    },
    meteorSharpCore: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFF',
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8, // Concentrated glow
        elevation: 10,
    },
    starHeadWrapper: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        zIndex: 100,
    }
});
