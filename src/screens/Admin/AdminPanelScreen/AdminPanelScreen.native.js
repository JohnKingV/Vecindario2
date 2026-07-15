import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    Modal,
    KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Input, Button } from '../../../components';
import { useAdminPanelScreen } from './useAdminPanelScreen';

export default function AdminPanelScreenNative({ navigation }) {
    const logic = useAdminPanelScreen(navigation);
    const { theme, isDark } = logic;
    const insets = useSafeAreaInsets();

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
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.colors.inputBackground }]}>
                    <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>Administración</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {logic.isSuperAdmin && (
                    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Nuevo Condominio</Text>
                        <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>Registra una nueva comunidad en el sistema.</Text>

                        <View style={styles.form}>
                            <Input
                                label="Nombre del Condominio"
                                placeholder="Ej: Vista Paraiso 2030"
                                value={logic.nombre}
                                onChangeText={logic.setNombre}
                            />
                            <Input
                                label="Dirección"
                                placeholder="Ej: Av. Las Condes 2030"
                                value={logic.direccion}
                                onChangeText={logic.setDireccion}
                            />
                            <Input
                                label="Ciudad"
                                placeholder="Ej: Santiago"
                                value={logic.ciudad}
                                onChangeText={logic.setCiudad}
                            />
                            <Input
                                label="Código de Verificación"
                                placeholder="Ej: VISTA2030"
                                value={logic.codigo}
                                onChangeText={logic.setCodigo}
                                autoCapitalize="characters"
                            />

                            <Button
                                onPress={logic.handleCreateCommunity}
                                loading={logic.loading}
                                fullWidth
                                style={styles.actionBtn}
                            >
                                Crear Condominio
                            </Button>
                        </View>
                    </View>
                )}

                {logic.isSuperAdmin && (
                    <View style={[styles.card, { marginTop: 24, backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Mantenimiento</Text>
                        <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>Recupera publicaciones y productos antiguos.</Text>

                        <Button
                            onPress={logic.handleSyncData}
                            loading={logic.syncLoading}
                            variant="secondary"
                            fullWidth
                            leftIcon={<MaterialCommunityIcons name="sync" size={20} color={isDark ? theme.colors.text : '#1E3A8A'} />}
                        >
                            Sincronizar Datos Antiguos
                        </Button>
                    </View>
                )}

                <View style={[styles.card, { marginTop: 24, backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Gestión de Condominios</Text>
                    <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>Administra usuarios y códigos.</Text>

                    <Button
                        onPress={() => navigation.navigate('UserManagement')}
                        fullWidth
                        leftIcon={<MaterialCommunityIcons name="account-group-outline" size={22} color="#fff" />}
                        style={{ marginBottom: 12 }}
                    >
                        Gestionar Usuarios {logic.pendingCount > 0 ? `(${logic.pendingCount} pendientes)` : ''}
                    </Button>

                    <Button
                        onPress={() => navigation.navigate('CondoManagement')}
                        variant="secondary"
                        fullWidth
                        leftIcon={<MaterialCommunityIcons name="key-variant" size={22} color={isDark ? theme.colors.text : '#1E3A8A'} />}
                    >
                        Códigos de Verificación
                    </Button>

                    {logic.pendingCount > 0 && (
                        <Text style={styles.pendingHint}>Hay usuarios esperando asignación.</Text>
                    )}
                </View>
            </ScrollView>

            <Modal
                visible={logic.showSuccess}
                transparent
                animationType="fade"
                onRequestClose={() => logic.setShowSuccess(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.successModal, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.successIconBox}>
                            <MaterialCommunityIcons name="check-bold" size={40} color="#fff" />
                        </View>
                        <Text style={[styles.successTitle, { color: theme.colors.text }]}>¡Creado con éxito!</Text>
                        <Text style={[styles.successMessage, { color: theme.colors.textSecondary }]}>
                            El nuevo condominio ha sido registrado correctamente.
                        </Text>
                        <Button
                            onPress={() => logic.setShowSuccess(false)}
                            fullWidth
                            style={[styles.successBtn, { backgroundColor: theme.colors.primary }]}
                        >
                            Excelente
                        </Button>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 20,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
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
        borderRadius: 32,
        padding: 32,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
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
        marginBottom: 12,
        textAlign: 'center',
    },
    successMessage: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        fontWeight: '500',
    },
});
