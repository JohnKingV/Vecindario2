import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
    ScrollView,
} from 'react-native';
import { Input, ResponsiveContainer, Button } from '../../../components';
import { useAlertScreen } from './useAlertScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AlertScreenWeb() {
    const logic = useAlertScreen();
    const { theme, isDark } = logic;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.webHeader}>
                        <Text style={[styles.webTitle, { color: theme.colors.text }]}>Seguridad Comunitaria</Text>
                        <Text style={[styles.webSubtitle, { color: theme.colors.textSecondary }]}>
                            Sistema de alerta temprana para residentes
                        </Text>
                    </View>

                    <View style={styles.webGrid}>
                        {/* Main Interaction Area */}
                        <View style={styles.mainArea}>
                            <View style={[styles.alertCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                <View style={styles.alertIconBox}>
                                    <MaterialCommunityIcons name="shield-alert-outline" size={80} color="#ef4444" />
                                </View>
                                <Text style={[styles.alertCardTitle, { color: theme.colors.text }]}>¿Hay una emergencia?</Text>
                                <Text style={[styles.alertCardDesc, { color: theme.colors.textSecondary }]}>
                                    Si estás en peligro o presencias una actividad sospechosa, notifica de inmediato a todos tus vecinos.
                                </Text>
                                <Button
                                    onPress={logic.handlePanicButton}
                                    style={styles.panicBtnWeb}
                                    textStyle={{ fontSize: 18, fontWeight: '900' }}
                                >
                                    ACTIVAR ALERTA COMUNITARIA
                                </Button>
                            </View>

                            <View style={[styles.callCard, { backgroundColor: '#1e40af' }]}>
                                <View style={styles.callContent}>
                                    <MaterialCommunityIcons name="phone-alert" size={32} color="#fff" />
                                    <View>
                                        <Text style={styles.callTitle}>Emergencia Policial</Text>
                                        <Text style={styles.callDesc}>Llamada directa al 133 (Carabineros)</Text>
                                    </View>
                                </View>
                                <Button
                                    variant="outline"
                                    onPress={logic.handleEmergencyCall}
                                    style={{ borderColor: 'rgba(255,255,255,0.3)' }}
                                    textStyle={{ color: '#fff' }}
                                >
                                    Llamar ahora
                                </Button>
                            </View>
                        </View>

                        {/* Info/Rules Area */}
                        <View style={styles.infoArea}>
                            <View style={[styles.rulesCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                <Text style={[styles.rulesTitle, { color: theme.colors.text }]}>Protocolo de Alerta</Text>
                                <View style={styles.ruleItem}>
                                    <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
                                    <Text style={[styles.ruleText, { color: theme.colors.textSecondary }]}>Solo para situaciones reales que requieran atención inmediata.</Text>
                                </View>
                                <View style={styles.ruleItem}>
                                    <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
                                    <Text style={[styles.ruleText, { color: theme.colors.textSecondary }]}>Describe la situación de forma clara y concisa.</Text>
                                </View>
                                <View style={styles.ruleItem}>
                                    <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
                                    <Text style={[styles.ruleText, { color: theme.colors.textSecondary }]}>Tu ubicación será compartida automáticamente.</Text>
                                </View>

                                <View style={styles.warningBoxWeb}>
                                    <MaterialCommunityIcons name="information" size={20} color="#92400e" />
                                    <Text style={styles.warningTextWeb}>
                                        El mal uso de esta función puede resultar en la suspensión de tu cuenta.
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </ResponsiveContainer>

            {/* Emergency Modal Web */}
            <Modal
                visible={logic.showModal}
                transparent
                animationType="fade"
                onRequestClose={() => logic.setShowModal(false)}
            >
                <View style={styles.modalOverlayWeb}>
                    <View style={[styles.modalContentWeb, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <View style={styles.modalHeaderWeb}>
                            <Text style={[styles.modalTitleWeb, { color: theme.colors.text }]}>Nueva Alerta</Text>
                            <TouchableOpacity onPress={() => logic.setShowModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.labelWeb, { color: theme.colors.textSecondary }]}>SELECCIONA CATEGORÍA</Text>
                        <View style={styles.typeGridWeb}>
                            {logic.alertTypes.map((type) => (
                                <TouchableOpacity
                                    key={type.value}
                                    style={[
                                        styles.typeSquareWeb,
                                        { backgroundColor: theme.colors.inputBackground },
                                        logic.tipoAlerta === type.value && { backgroundColor: '#ef4444', borderColor: '#ef4444' }
                                    ]}
                                    onPress={() => logic.setTipoAlerta(type.value)}
                                >
                                    <Text style={styles.typeIconWeb}>{type.icon}</Text>
                                    <Text style={[styles.typeLabelWeb, { color: logic.tipoAlerta === type.value ? '#fff' : theme.colors.text }]}>
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.labelWeb, { color: theme.colors.textSecondary, marginTop: 32 }]}>DETALLES DE LA EMERGENCIA</Text>
                        <Input
                            placeholder="Ej: Hay un auto sospechoso fuera de la torre B..."
                            value={logic.mensaje}
                            onChangeText={logic.setMensaje}
                            multiline
                            numberOfLines={4}
                            containerStyle={{ marginTop: 8, marginBottom: 40 }}
                        />

                        <View style={styles.modalActionsWeb}>
                            <Button variant="outline" onPress={() => logic.setShowModal(false)} style={{ flex: 1 }}>
                                Cancelar
                            </Button>
                            <Button
                                onPress={logic.sendAlert}
                                loading={logic.loading}
                                style={{ flex: 2, backgroundColor: '#ef4444' }}
                            >
                                TRANSMITIR ALERTA
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingVertical: 80, paddingHorizontal: 20 },
    webHeader: { marginBottom: 56, alignItems: 'center' },
    webTitle: { fontSize: 48, fontWeight: '900', letterSpacing: -1 },
    webSubtitle: { fontSize: 18, marginTop: 8 },
    webGrid: { flexDirection: 'row', gap: 32 },
    mainArea: { flex: 2, gap: 24 },
    infoArea: { flex: 1 },
    alertCard: { padding: 56, borderRadius: 40, borderWidth: 1, alignItems: 'center', textAlign: 'center' },
    alertIconBox: { marginBottom: 32 },
    alertCardTitle: { fontSize: 32, fontWeight: '900', marginBottom: 16 },
    alertCardDesc: { fontSize: 18, lineHeight: 28, marginBottom: 48, maxWidth: 450, textAlign: 'center' },
    panicBtnWeb: { width: '100%', height: 72, borderRadius: 20, backgroundColor: '#ef4444' },
    callCard: { padding: 32, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    callContent: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    callTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    callDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 15 },
    rulesCard: { padding: 32, borderRadius: 32, borderWidth: 1, gap: 20 },
    rulesTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8 },
    ruleItem: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    ruleText: { fontSize: 14, fontWeight: '500' },
    warningBoxWeb: { marginTop: 12, padding: 16, backgroundColor: '#fef3c7', borderRadius: 12, flexDirection: 'row', gap: 12 },
    warningTextWeb: { fontSize: 12, color: '#92400e', fontWeight: '600', flex: 1 },
    modalOverlayWeb: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', alignItems: 'center' },
    modalContentWeb: { width: 550, padding: 48, borderRadius: 40, borderWidth: 1 },
    modalHeaderWeb: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
    modalTitleWeb: { fontSize: 28, fontWeight: '900' },
    labelWeb: { fontSize: 11, fontWeight: '800', letterSpacing: 2 },
    typeGridWeb: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
    typeSquareWeb: { width: 'calc(50% - 6px)', padding: 20, borderRadius: 16, borderWIdth: 2, borderColor: 'transparent', alignItems: 'center', gap: 8 },
    typeIconWeb: { fontSize: 24 },
    typeLabelWeb: { fontSize: 13, fontWeight: '700' },
    modalActionsWeb: { flexDirection: 'row', gap: 16 }
});
