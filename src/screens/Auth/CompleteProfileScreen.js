import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input } from '../../components';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function CompleteProfileScreen() {
    const { theme, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { user, profile, refreshProfile, signOut } = useAuth();
    const [nombre, setNombre] = useState('');
    const [torre, setTorre] = useState('');
    const [depto, setDepto] = useState('');
    const [communityCode, setCommunityCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [comunidades, setComunidades] = useState([]);
    const [selectedComunidad, setSelectedComunidad] = useState(null);
    const [showComunidadSelector, setShowComunidadSelector] = useState(false);
    const [sexo, setSexo] = useState('hombre'); // Default to 'hombre'

    useEffect(() => {
        loadComunidades();
        // Intentar usar el nombre del perfil (ya procesado) o de la metadata
        if (profile?.nombre) {
            setNombre(profile.nombre);
        } else if (user?.user_metadata?.nombre || user?.user_metadata?.full_name || user?.user_metadata?.name) {
            setNombre(user.user_metadata.nombre || user.user_metadata.full_name || user.user_metadata.name);
        }
    }, [user, profile]);

    const loadComunidades = async () => {
        const { data } = await authService.getComunidades();
        if (data) {
            // Filtrar duplicados por nombre por si acaso
            const unique = data.filter((v, i, a) => a.findIndex(t => t.nombre === v.nombre) === i);
            setComunidades(unique);
        }
    };

    const handleCompleteProfile = async () => {
        if (!nombre || !depto || !communityCode) {
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

            // 3. Proceder con la actualización
            const { error } = await authService.updateProfile(user.id, {
                nombre,
                torre,
                depto,
                sexo,
                comunidad_id: community.id,
                email: user.email,
            });

            if (error) {
                Alert.alert('Error', error.message);
            } else {
                await refreshProfile();
            }
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.container, { backgroundColor: theme.colors.background }]}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>¡Casi listo!</Text>
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Para continuar, por favor completa tu información de residencia.</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Tu Comunidad</Text>
                        <TouchableOpacity
                            style={[styles.selector, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}
                            onPress={() => setShowComunidadSelector(!showComunidadSelector)}
                        >
                            <MaterialCommunityIcons name="office-building" size={20} color={theme.colors.textSecondary} />
                            <Text style={[styles.selectorText, { color: theme.colors.text }, !selectedComunidad && { color: theme.colors.placeholder }]}>
                                {selectedComunidad ? selectedComunidad.nombre : 'Selecciona tu condominio'}
                            </Text>
                            <MaterialCommunityIcons name="chevron-down" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>

                        {showComunidadSelector && (
                            <View style={[styles.dropdownContainer, { zIndex: 1000 }]}>
                                <ScrollView
                                    style={[styles.dropdown, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                                    nestedScrollEnabled={true}
                                >
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
                                </ScrollView>
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
                            />
                        )}

                        <Input
                            label="Nombre Completo"
                            placeholder="Ej: Juan Pérez"
                            value={nombre}
                            onChangeText={setNombre}
                        />

                        <View style={styles.inputWrapper}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Tú eres...</Text>
                            <View style={styles.genderContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.genderOption,
                                        { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border },
                                        sexo === 'hombre' && [styles.genderOptionActive, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]
                                    ]}
                                    onPress={() => setSexo('hombre')}
                                >
                                    <MaterialCommunityIcons
                                        name="face-man"
                                        size={24}
                                        color={sexo === 'hombre' ? '#fff' : theme.colors.textSecondary}
                                    />
                                    <Text style={[styles.genderText, { color: theme.colors.textSecondary }, sexo === 'hombre' && styles.genderTextActive]}>Hombre</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.genderOption,
                                        { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border },
                                        sexo === 'mujer' && [styles.genderOptionActive, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]
                                    ]}
                                    onPress={() => setSexo('mujer')}
                                >
                                    <MaterialCommunityIcons
                                        name="face-woman"
                                        size={24}
                                        color={sexo === 'mujer' ? '#fff' : theme.colors.textSecondary}
                                    />
                                    <Text style={[styles.genderText, { color: theme.colors.textSecondary }, sexo === 'mujer' && styles.genderTextActive]}>Mujer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputsRow}>
                            <View style={styles.flex1}>
                                <Input
                                    label="Torre / Bloque"
                                    placeholder="Ej: A, 2, B"
                                    value={torre}
                                    onChangeText={setTorre}
                                />
                            </View>
                            <View style={styles.flex1}>
                                <Input
                                    label="Departamento / Casa"
                                    placeholder="Ej: 402, 15"
                                    value={depto}
                                    onChangeText={setDepto}
                                />
                            </View>
                        </View>

                        <Button
                            onPress={handleCompleteProfile}
                            loading={loading}
                            fullWidth
                            style={styles.completeButton}
                        >
                            Finalizar Registro
                        </Button>

                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={signOut}
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
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        borderColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
    },
    genderOptionActive: {
        backgroundColor: '#135bec',
        borderColor: '#135bec',
    },
    genderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
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
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    selectorText: {
        flex: 1,
        fontSize: 16,
        color: '#0f172a',
    },
    dropdownContainer: {
        marginTop: -8,
        marginBottom: 8,
        zIndex: 1000,
    },
    dropdown: {
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        maxHeight: 200,
    },
    dropdownItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#0f172a',
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748b',
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
