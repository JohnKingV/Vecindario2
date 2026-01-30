import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function SignUpScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { signInWithGoogle: googleSignIn } = useAuth();
    const { theme, isDark } = useTheme();
    const [nombre, setNombre] = useState('');
    const [torre, setTorre] = useState('');
    const [depto, setDepto] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [communityCode, setCommunityCode] = useState('');
    const [comunidades, setComunidades] = useState([]);
    const [selectedComunidad, setSelectedComunidad] = useState(null);
    const [showComunidadSelector, setShowComunidadSelector] = useState(false);

    React.useEffect(() => {
        loadComunidades();
    }, []);

    const loadComunidades = async () => {
        const { data } = await authService.getComunidades();
        if (data) setComunidades(data);
    };

    const handleSignUp = async () => {
        if (!nombre || !email || !password || !depto || !communityCode) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        setLoading(true);
        try {
            // 1. Verificar el código del condominio
            const { data: community, error: codeError } = await authService.verificarCodigoComunidad(communityCode);

            if (codeError || !community) {
                setLoading(false);
                Alert.alert('Error', 'El código de condominio no es válido. Por favor verifica con tu administración.');
                return;
            }

            // 2. Verificar que el código corresponda al condominio seleccionado
            if (community.id !== selectedComunidad.id) {
                setLoading(false);
                Alert.alert('Error', 'El código ingresado no corresponde al condominio seleccionado.');
                return;
            }

            // 3. Proceder con el registro
            const res = await authService.signUp(email, password, {
                nombre,
                depto,
                torre,
                comunidad_id: community.id
            });

            if (res.error) {
                Alert.alert('Error', res.error.message);
            } else if (res.verificationPending) {
                // Navegar a la pantalla de verificación pendiente
                navigation.navigate('VerificationPending', { email });
            } else {
                // Si Supabase inicia sesión automáticamente, el AuthProvider cambiará el stack.
                // Solo navegamos si aún no estamos autenticados.
                Alert.alert('¡Éxito!', 'Cuenta creada correctamente.');
                if (navigation.canGoBack()) {
                    navigation.goBack();
                }
            }
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}>
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
                        onPress={() => setShowComunidadSelector(!showComunidadSelector)}
                    >
                        <MaterialCommunityIcons name="office-building" size={20} color={theme.colors.textSecondary} />
                        <Text style={[styles.selectorText, !selectedComunidad ? { color: theme.colors.placeholder } : { color: theme.colors.text }]}>
                            {selectedComunidad ? selectedComunidad.nombre : 'Selecciona tu condominio'}
                        </Text>
                        <MaterialCommunityIcons name="chevron-down" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>

                    {showComunidadSelector && (
                        <View style={[styles.dropdown, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            {comunidades.map((c) => (
                                <TouchableOpacity
                                    key={c.id}
                                    style={[styles.dropdownItem, { borderBottomColor: theme.colors.border }]}
                                    onPress={() => {
                                        setSelectedComunidad(c);
                                        setShowComunidadSelector(false);
                                    }}
                                >
                                    <Text style={[styles.dropdownItemText, { color: theme.colors.text }]}>{c.nombre}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {selectedComunidad && (
                        <Input
                            label={`CÓDIGO DE ACCESO (${selectedComunidad.nombre.toUpperCase()})`}
                            placeholder="Ingresa el código secreto"
                            value={communityCode}
                            onChangeText={setCommunityCode}
                            autoCapitalize="characters"
                            leftIcon={<MaterialCommunityIcons name="shield-key-outline" size={20} color={theme.colors.textSecondary} />}
                            placeholderTextColor={theme.colors.placeholder}
                            inputStyle={{ color: theme.colors.text }}
                            labelStyle={{ color: theme.colors.textSecondary }}
                            containerStyle={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 16 }}
                        />
                    )}

                    <Input
                        label="Nombre Completo"
                        placeholder="Ej: Juan Pérez"
                        value={nombre}
                        onChangeText={setNombre}
                        placeholderTextColor={theme.colors.placeholder}
                        inputStyle={{ color: theme.colors.text }}
                        labelStyle={{ color: theme.colors.textSecondary }}
                        containerStyle={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 16 }}
                    />
                    <View style={styles.row}>
                        <View style={styles.flex1}>
                            <Input
                                label="Torre / Bloque"
                                placeholder="Ej: A, 2, B"
                                value={torre}
                                onChangeText={setTorre}
                                placeholderTextColor={theme.colors.placeholder}
                                inputStyle={{ color: theme.colors.text }}
                                labelStyle={{ color: theme.colors.textSecondary }}
                                containerStyle={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 16 }}
                            />
                        </View>
                        <View style={styles.flex1}>
                            <Input
                                label="Depto / Casa"
                                placeholder="Ej: 402, 15"
                                value={depto}
                                onChangeText={setDepto}
                                placeholderTextColor={theme.colors.placeholder}
                                inputStyle={{ color: theme.colors.text }}
                                labelStyle={{ color: theme.colors.textSecondary }}
                                containerStyle={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 16 }}
                            />
                        </View>
                    </View>
                    <Input
                        label="Email"
                        placeholder="tu@email.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor={theme.colors.placeholder}
                        inputStyle={{ color: theme.colors.text }}
                        labelStyle={{ color: theme.colors.textSecondary }}
                        containerStyle={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 16 }}
                    />
                    <Input
                        label="Contraseña"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor={theme.colors.placeholder}
                        inputStyle={{ color: theme.colors.text }}
                        labelStyle={{ color: theme.colors.textSecondary }}
                        containerStyle={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 16 }}
                    />

                    <Button
                        onPress={handleSignUp}
                        loading={loading}
                        disabled={googleLoading}
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
                        onPress={handleGoogleSignUp}
                        loading={googleLoading}
                        disabled={loading}
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
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    backButton: {
        width: 48,
        height: 48,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    backIcon: {
        fontSize: 24,
        color: '#64748b',
        fontWeight: '700',
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 34,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -1.5,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#64748b',
        lineHeight: 24,
        marginTop: 8,
    },
    form: {
        gap: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 4,
        marginLeft: 4,
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        padding: 16,
        borderRadius: 16,
        gap: 12,
        marginBottom: 8,
    },
    selectorText: {
        flex: 1,
        fontSize: 16,
        color: '#0f172a',
        fontWeight: '500',
    },
    dropdown: {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 16,
        overflow: 'hidden',
    },
    dropdownItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#0f172a',
        fontWeight: '500',
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    signUpButton: {
        marginTop: 24,
        ...Platform.select({
            web: {
                boxShadow: '0px 10px 15px rgba(37, 99, 235, 0.3)',
            },
            default: {
                shadowColor: '#2563eb',
                shadowOpacity: 0.3,
                shadowRadius: 15,
                shadowOffset: { width: 0, height: 10 },
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
        color: '#94a3b8',
        fontWeight: '500',
    },
    linkText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#2563eb',
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
        backgroundColor: '#dce0e5',
    },
    dividerText: {
        paddingHorizontal: 16,
        color: '#94a3b8',
        fontSize: 14,
        fontStyle: 'italic',
    },
    googleButton: {
        height: 56,
        borderRadius: 16,
        borderColor: '#dce0e5',
        borderWidth: 1,
        backgroundColor: '#fff',
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111418',
        letterSpacing: -0.5,
    },
});
