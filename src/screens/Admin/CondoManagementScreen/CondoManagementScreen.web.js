import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LoadingSpinner, Input, Button, ResponsiveContainer } from '../../../components';
import { useCondoManagementScreen } from './useCondoManagementScreen';

export default function CondoManagementScreenWeb({ navigation }) {
    const logic = useCondoManagementScreen(navigation);
    const { theme, isDark } = logic;

    if (logic.loading && !logic.refreshing) return <LoadingSpinner />;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={logic.refreshing} onRefresh={logic.handleRefresh} tintColor={theme.colors.primary} />
                    }
                >
                    {/* Web Header */}
                    <View style={styles.webHeader}>
                        <View>
                            <Text style={[styles.title, { color: theme.colors.text }]}>Códigos de Acceso</Text>
                            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Administra los códigos de verificación para cada comunidad registrada</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { borderColor: theme.colors.border }]}>
                            <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.text} />
                            <Text style={[styles.backText, { color: theme.colors.text }]}>Volver al Panel</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.webGrid}>
                        {logic.communities.map(condo => (
                            <View key={condo.id} style={[styles.webCondoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                <View style={styles.cardTop}>
                                    <View style={[styles.iconBoxWeb, { backgroundColor: theme.colors.primary + '15' }]}>
                                        <MaterialCommunityIcons name="id-card-outline" size={32} color={theme.colors.primary} />
                                    </View>
                                    <View style={styles.cardHeaderInfo}>
                                        <Text style={[styles.condoNameWeb, { color: theme.colors.text }]}>{condo.nombre}</Text>
                                        <Text style={[styles.condoMetaWeb, { color: theme.colors.textSecondary }]}>
                                            <MaterialCommunityIcons name="map-marker-outline" size={14} /> {condo.direccion}, {condo.ciudad}
                                        </Text>
                                    </View>
                                </View>

                                <View style={[styles.codeDisplayWeb, { backgroundColor: theme.colors.inputBackground }]}>
                                    <View>
                                        <Text style={[styles.codeLabelWeb, { color: theme.colors.textSecondary }]}>CÓDIGO DE VERIFICACIÓN</Text>
                                        <Text style={[styles.codeValueWeb, { color: theme.colors.primary }]}>{condo.codigo_verificacion || 'PISO_LIBRE_2024'}</Text>
                                    </View>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onPress={() => logic.openEditModal(condo)}
                                        leftIcon={<MaterialCommunityIcons name="pencil-outline" size={18} />}
                                    >
                                        Modificar
                                    </Button>
                                </View>

                                <View style={styles.cardStatsWeb}>
                                    <View style={styles.statItemWeb}>
                                        <MaterialCommunityIcons name="account-group-outline" size={18} color={theme.colors.textSecondary} />
                                        <Text style={[styles.statTextWeb, { color: theme.colors.textSecondary }]}>
                                            {condo.residentes_count || 0} residentes activos
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>

                    {logic.communities.length === 0 && (
                        <View style={styles.emptyStateWeb}>
                            <MaterialCommunityIcons name="office-building-off" size={80} color={theme.colors.border} />
                            <Text style={[styles.emptyTextWeb, { color: theme.colors.textSecondary }]}>No se encontraron comunidades registradas para administrar.</Text>
                        </View>
                    )}
                </ScrollView>
            </ResponsiveContainer>

            {/* Edit Modal Web (Centered and smaller) */}
            <Modal
                visible={!!logic.selectedCondo}
                transparent
                animationType="fade"
                onRequestClose={() => logic.setSelectedCondo(null)}
            >
                <View style={styles.modalOverlayWeb}>
                    <View style={[styles.modalContentWeb, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <View style={styles.modalHeaderWeb}>
                            <Text style={[styles.modalTitleWeb, { color: theme.colors.text }]}>Actualizar Código Secreto</Text>
                            <TouchableOpacity onPress={() => logic.setSelectedCondo(null)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.modalDescWeb, { color: theme.colors.textSecondary }]}>
                            Estás modificando el acceso para: <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>{logic.selectedCondo?.nombre}</Text>
                        </Text>

                        <Input
                            label="Nuevo Código de Verificación"
                            placeholder="Ej: NUEVO_CODIGO_2025"
                            value={logic.newCode}
                            onChangeText={logic.setNewCode}
                            autoCapitalize="characters"
                            containerStyle={{ marginBottom: 32 }}
                        />

                        <View style={styles.modalActionsWeb}>
                            <Button
                                variant="outline"
                                onPress={() => logic.setSelectedCondo(null)}
                                style={{ flex: 1 }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onPress={logic.handleUpdateCode}
                                loading={logic.updating}
                                style={{ flex: 1 }}
                            >
                                Confirmar Cambio
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    webHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 64,
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        letterSpacing: -1.5,
    },
    subtitle: {
        fontSize: 20,
        marginTop: 10,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 14,
        borderWidth: 1,
    },
    backText: {
        fontWeight: '700',
        fontSize: 15,
    },
    webGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
    },
    webCondoCard: {
        width: 'calc(50% - 12px)',
        padding: 32,
        borderRadius: 32,
        borderWidth: 1,
        boxShadow: '0 4px 25px rgba(0,0,0,0.03)',
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        marginBottom: 32,
    },
    iconBoxWeb: {
        width: 72,
        height: 72,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardHeaderInfo: {
        flex: 1,
    },
    condoNameWeb: {
        fontSize: 22,
        fontWeight: '900',
    },
    condoMetaWeb: {
        fontSize: 15,
        marginTop: 4,
    },
    codeDisplayWeb: {
        padding: 24,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    codeLabelWeb: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 6,
    },
    codeValueWeb: {
        fontSize: 24,
        fontWeight: '950',
    },
    cardStatsWeb: {
        flexDirection: 'row',
        gap: 24,
    },
    statItemWeb: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statTextWeb: {
        fontSize: 13,
        fontWeight: '700',
    },
    emptyStateWeb: {
        padding: 100,
        alignItems: 'center',
        gap: 24,
    },
    emptyTextWeb: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        maxWidth: 400,
    },
    modalOverlayWeb: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContentWeb: {
        width: 500,
        padding: 48,
        borderRadius: 40,
        borderWidth: 1,
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
    },
    modalHeaderWeb: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitleWeb: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -1,
    },
    modalDescWeb: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 40,
    },
    modalActionsWeb: {
        flexDirection: 'row',
        gap: 20,
    }
});
