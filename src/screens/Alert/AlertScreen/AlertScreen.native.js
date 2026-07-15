import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
} from 'react-native';
import { Input } from '../../../components';
import { useAlertScreen } from './useAlertScreen';

export default function AlertScreenNative() {
    const logic = useAlertScreen();
    const { theme } = logic;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Alertas de Seguridad</Text>
                <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
                    Mantén a tu comunidad informada y segura
                </Text>
            </View>

            <View style={styles.content}>
                <TouchableOpacity
                    style={styles.panicButton}
                    onPress={logic.handlePanicButton}
                    activeOpacity={0.8}
                >
                    <View style={styles.panicButtonInner}>
                        <Text style={styles.panicIcon}>⚠️</Text>
                        <Text style={styles.panicText}>ALERTA DE SEGURIDAD</Text>
                        <Text style={styles.panicSubtext}>
                            Toca para notificar a todos los vecinos
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.emergencyButton}
                    onPress={logic.handleEmergencyCall}
                >
                    <Text style={styles.emergencyIcon}>📞</Text>
                    <Text style={styles.emergencyText}>Llamar a Carabineros (133)</Text>
                </TouchableOpacity>

                <View style={[styles.infoBox, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Text style={[styles.infoTitle, { color: theme.colors.primary }]}>💡 Cuándo usar alertas</Text>
                    <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                        • Actividad sospechosa en el área{'\n'}
                        • Intento de robo o robo en curso{'\n'}
                        • Emergencia médica{'\n'}
                        • Cualquier situación que requiera atención inmediata
                    </Text>
                </View>

                <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                        ⚠️ Las alertas notificarán a TODOS los vecinos. Usa esta función
                        responsablemente.
                    </Text>
                </View>
            </View>

            <Modal
                visible={logic.showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => logic.setShowModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => logic.setShowModal(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Enviar Alerta de Seguridad</Text>

                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Tipo de alerta</Text>
                        <View style={styles.typeSelector}>
                            {logic.alertTypes.map((type) => (
                                <TouchableOpacity
                                    key={type.value}
                                    style={[
                                        styles.typeButton,
                                        { backgroundColor: theme.colors.inputBackground },
                                        logic.tipoAlerta === type.value && styles.typeButtonActive,
                                    ]}
                                    onPress={() => logic.setTipoAlerta(type.value)}
                                >
                                    <Text style={styles.typeIcon}>{type.icon}</Text>
                                    <Text
                                        style={[
                                            styles.typeLabel,
                                            logic.tipoAlerta === type.value && styles.typeLabelActive,
                                        ]}
                                    >
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>¿Qué está ocurriendo?</Text>
                        <Input
                            placeholder="Describe la situación brevemente..."
                            value={logic.mensaje}
                            onChangeText={logic.setMensaje}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            maxLength={300}
                            inputStyle={styles.input}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.cancelButton, { backgroundColor: theme.colors.inputBackground }]}
                                onPress={() => logic.setShowModal(false)}
                            >
                                <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    logic.loading && styles.sendButtonDisabled,
                                ]}
                                onPress={logic.sendAlert}
                                disabled={logic.loading}
                            >
                                <Text style={styles.sendButtonText}>
                                    {logic.loading ? 'Enviando...' : 'Enviar Alerta'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, borderBottomWidth: 1 },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    headerSubtitle: { fontSize: 14, marginTop: 4 },
    content: { flex: 1, padding: 20 },
    panicButton: { marginBottom: 20 },
    panicButtonInner: { backgroundColor: '#ef4444', borderRadius: 20, padding: 40, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
    panicIcon: { fontSize: 64, marginBottom: 16 },
    panicText: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    panicSubtext: { fontSize: 14, color: '#fee2e2', textAlign: 'center' },
    emergencyButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e40af', borderRadius: 12, padding: 16, marginBottom: 20 },
    emergencyIcon: { fontSize: 24, marginRight: 12 },
    emergencyText: { fontSize: 16, fontWeight: '600', color: '#fff' },
    infoBox: { borderRadius: 12, padding: 16, marginBottom: 16 },
    infoTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
    infoText: { fontSize: 14, lineHeight: 20 },
    warningBox: { backgroundColor: '#fef3c7', borderRadius: 12, padding: 16 },
    warningText: { fontSize: 13, color: '#92400e', lineHeight: 18 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 8 },
    typeSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    typeButton: { flex: 1, minWidth: '48%', alignItems: 'center', padding: 12, borderRadius: 12 },
    typeButtonActive: { backgroundColor: '#ef4444' },
    typeIcon: { fontSize: 24, marginBottom: 4 },
    typeLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
    typeLabelActive: { color: '#fff' },
    input: { fontSize: 16, minHeight: 100, marginBottom: 20 },
    modalButtons: { flexDirection: 'row', gap: 12 },
    cancelButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
    cancelButtonText: { fontSize: 16, fontWeight: '600' },
    sendButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#ef4444' },
    sendButtonDisabled: { backgroundColor: '#fca5a5' },
    sendButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
