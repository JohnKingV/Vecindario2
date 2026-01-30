import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Input, Button } from '../../components';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

export default function AdminPanelScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();
    const [nombre, setNombre] = useState('');
    const [direccion, setDireccion] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [codigo, setCodigo] = useState('');
    const [loading, setLoading] = useState(false);
    const [syncLoading, setSyncLoading] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const { profile } = useAuth();

    useEffect(() => {
        const fetchPendingCount = async () => {
            const [comRes, profRes] = await Promise.all([
                authService.getAllCommunitiesWithStats(),
                authService.getAllProfiles()
            ]);

            if (comRes.data && profRes.data) {
                const communityIds = new Set(comRes.data.map(c => c.id));
                const pending = profRes.data.filter(user =>
                    !user.comunidad_id || !communityIds.has(user.comunidad_id)
                );
                setPendingCount(pending.length);
            }
        };
        fetchPendingCount();
    }, []);

    const handleCreateCommunity = async () => {
        if (!nombre || !direccion || !ciudad || !codigo) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        setLoading(true);
        try {
            // Usaremos una nueva función en authService o directamente supabase aquí por simplicidad
            const { error } = await authService.createCommunity({
                nombre,
                direccion,
                ciudad,
                codigo_verificacion: codigo.toUpperCase(),
            });

            if (error) {
                Alert.alert('Error', error.message);
            } else {
                setShowSuccess(true);
                setNombre('');
                setDireccion('');
                setCiudad('');
                setCodigo('');
            }
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSyncData = async () => {
        if (!profile?.comunidad_id) {
            Alert.alert('Error', 'No tienes una comunidad asignada');
            return;
        }

        Alert.alert(
            'Confirmar Sincronización',
            'Esto vinculará todas las publicaciones y productos antiguos (sin condominio) al condominio actual "Vista Paraiso 2030". ¿Deseas continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sincronizar',
                    onPress: async () => {
                        setSyncLoading(true);
                        try {
                            const { error } = await authService.syncCommunityContent(profile.comunidad_id);
                            if (error) throw error;
                            Alert.alert('¡Éxito!', 'Los datos antiguos han sido recuperados y ya son visibles en el Feed y Club.');
                        } catch (err) {
                            Alert.alert('Error', 'No se pudieron sincronizar los datos: ' + err.message);
                        } finally {
                            setSyncLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
            <View style={[styles.header, {
                paddingTop: insets.top,
                backgroundColor: theme.colors.background,
                borderBottomColor: theme.colors.border
            }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>Administración</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Nuevo Condominio</Text>
                    <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>Registra una nueva comunidad en el sistema.</Text>

                    <View style={styles.form}>
                        <Input
                            label="Nombre del Condominio"
                            placeholder="Ej: Vista Paraiso 2030"
                            value={nombre}
                            onChangeText={setNombre}
                        />
                        <Input
                            label="Dirección"
                            placeholder="Ej: Av. Las Condes 2030"
                            value={direccion}
                            onChangeText={setDireccion}
                        />
                        <Input
                            label="Ciudad"
                            placeholder="Ej: Santiago"
                            value={ciudad}
                            onChangeText={setCiudad}
                        />
                        <Input
                            label="Código de Verificación"
                            placeholder="Ej: VISTA2030"
                            value={codigo}
                            onChangeText={setCodigo}
                            autoCapitalize="characters"
                        />

                        <Button
                            onPress={handleCreateCommunity}
                            loading={loading}
                            fullWidth
                            style={styles.actionBtn}
                        >
                            Crear Condominio
                        </Button>
                    </View>
                </View>

                <View style={[styles.card, { marginTop: 24, backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Mantenimiento</Text>
                    <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>Recupera publicaciones y productos antiguos para que sean visibles en el condominio.</Text>

                    <Button
                        onPress={handleSyncData}
                        loading={syncLoading}
                        variant="secondary"
                        fullWidth
                        leftIcon={<MaterialCommunityIcons name="sync" size={20} color={isDark ? theme.colors.text : '#1E3A8A'} />}
                    >
                        Sincronizar Datos Antiguos
                    </Button>
                </View>

                {/* Lista de comunidades existentes (Opcional simplificado) */}
                <View style={[styles.card, { marginTop: 24, backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Gestión de Condominios</Text>
                    <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>Administra usuarios, códigos de verificación y visualiza estadísticas.</Text>

                    <Button
                        onPress={() => navigation.navigate('UserManagement')}
                        fullWidth
                        leftIcon={<MaterialCommunityIcons name="account-group-outline" size={22} color="#fff" />}
                        style={{ marginBottom: 12 }}
                    >
                        Gestionar Usuarios {pendingCount > 0 ? `(${pendingCount} pendientes)` : ''}
                    </Button>

                    <Button
                        onPress={() => navigation.navigate('CondoManagement')}
                        variant="secondary"
                        fullWidth
                        leftIcon={<MaterialCommunityIcons name="key-variant" size={22} color={isDark ? theme.colors.text : '#1E3A8A'} />}
                    >
                        Códigos de Verificación
                    </Button>

                    {pendingCount > 0 && (
                        <Text style={styles.pendingHint}>Hay usuarios esperando asignación de condominio.</Text>
                    )}
                </View>
            </ScrollView>

            <Modal
                visible={showSuccess}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSuccess(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.successModal, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.successIconBox}>
                            <MaterialCommunityIcons name="check-bold" size={40} color="#fff" />
                        </View>
                        <Text style={[styles.successTitle, { color: theme.colors.text }]}>¡Creado con éxito!</Text>
                        <Text style={[styles.successMessage, { color: theme.colors.textSecondary }]}>
                            El nuevo condominio ha sido registrado correctamente en el sistema.
                        </Text>
                        <Button
                            onPress={() => setShowSuccess(false)}
                            fullWidth
                            style={[styles.successBtn, { backgroundColor: theme.colors.primary }]}
                        >
                            Excelente
                        </Button>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backBtn: {
        marginRight: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        color: '#0f172a',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
        marginBottom: 24,
    },
    form: {
        gap: 8,
    },
    actionBtn: {
        marginTop: 16,
    },
    pendingHint: {
        fontSize: 12,
        color: '#ef4444',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    successModal: {
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 32,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    successIconBox: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 12,
        textAlign: 'center',
    },
    successMessage: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        fontWeight: '500',
    },
    successBtn: {
        backgroundColor: '#0f172a',
    },
});
