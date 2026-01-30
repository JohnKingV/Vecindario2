import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
    Alert,
    Linking,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { authService } from '../../services/authService';
import { postsService } from '../../services/postsService';
import { Input } from '../../components';

export default function AlertScreen() {
    const [showModal, setShowModal] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [tipoAlerta, setTipoAlerta] = useState('sospechoso');
    const [loading, setLoading] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        loadUserProfile();
        requestLocationPermission();
    }, []);

    const loadUserProfile = async () => {
        const { data } = await authService.getCurrentUserProfile();
        setUserProfile(data);
    };

    const requestLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permiso de ubicación',
                'Necesitamos tu ubicación para que los vecinos sepan dónde estás en caso de emergencia'
            );
        }
    };

    const getCurrentLocation = async () => {
        try {
            const loc = await Location.getCurrentPositionAsync({});
            return {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            };
        } catch (error) {
            return null;
        }
    };

    const handleEmergencyCall = () => {
        Alert.alert(
            '🚨 Llamar a Carabineros',
            '¿Deseas llamar al 133?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Llamar', onPress: () => Linking.openURL('tel:133') },
            ]
        );
    };

    const handlePanicButton = () => {
        setShowModal(true);
    };

    const sendAlert = async () => {
        if (!mensaje.trim()) {
            Alert.alert('Error', 'Por favor describe qué está ocurriendo');
            return;
        }

        if (!userProfile) {
            Alert.alert('Error', 'No se pudo cargar tu perfil');
            return;
        }

        setLoading(true);

        const ubicacion = await getCurrentLocation();

        const fullMessage = `[${tipoAlerta.toUpperCase()}] ${mensaje.trim()}`;

        const { error } = await postsService.createAlert(
            userProfile.id,
            userProfile.comunidad_id,
            fullMessage,
            ubicacion
        );

        setLoading(false);

        if (error) {
            Alert.alert('Error', 'No se pudo enviar la alerta. Intenta de nuevo.');
            return;
        }

        setShowModal(false);
        setMensaje('');
        Alert.alert(
            '✅ Alerta Enviada',
            'Todos los vecinos han sido notificados',
            [{ text: 'OK' }]
        );
    };

    const alertTypes = [
        { value: 'sospechoso', label: 'Persona sospechosa', icon: '👤' },
        { value: 'robo', label: 'Robo/Intento', icon: '🚨' },
        { value: 'emergencia', label: 'Emergencia médica', icon: '🏥' },
        { value: 'otro', label: 'Otro', icon: '⚠️' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Alertas de Seguridad</Text>
                <Text style={styles.headerSubtitle}>
                    Mantén a tu comunidad informada y segura
                </Text>
            </View>

            <View style={styles.content}>
                {/* Botón de pánico principal */}
                <TouchableOpacity
                    style={styles.panicButton}
                    onPress={handlePanicButton}
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

                {/* Botón llamar a carabineros */}
                <TouchableOpacity
                    style={styles.emergencyButton}
                    onPress={handleEmergencyCall}
                >
                    <Text style={styles.emergencyIcon}>📞</Text>
                    <Text style={styles.emergencyText}>Llamar a Carabineros (133)</Text>
                </TouchableOpacity>

                {/* Info */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>💡 Cuándo usar alertas</Text>
                    <Text style={styles.infoText}>
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

            {/* Modal de alerta */}
            <Modal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enviar Alerta de Seguridad</Text>

                        <Text style={styles.label}>Tipo de alerta</Text>
                        <View style={styles.typeSelector}>
                            {alertTypes.map((type) => (
                                <TouchableOpacity
                                    key={type.value}
                                    style={[
                                        styles.typeButton,
                                        tipoAlerta === type.value && styles.typeButtonActive,
                                    ]}
                                    onPress={() => setTipoAlerta(type.value)}
                                >
                                    <Text style={styles.typeIcon}>{type.icon}</Text>
                                    <Text
                                        style={[
                                            styles.typeLabel,
                                            tipoAlerta === type.value && styles.typeLabelActive,
                                        ]}
                                    >
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>¿Qué está ocurriendo?</Text>
                        <Input
                            placeholder="Describe la situación brevemente..."
                            value={mensaje}
                            onChangeText={setMensaje}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            maxLength={300}
                            inputStyle={styles.input}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    loading && styles.sendButtonDisabled,
                                ]}
                                onPress={sendAlert}
                                disabled={loading}
                            >
                                <Text style={styles.sendButtonText}>
                                    {loading ? 'Enviando...' : 'Enviar Alerta'}
                                </Text>
                            </TouchableOpacity>
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
        backgroundColor: '#f8fafc',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    panicButton: {
        marginBottom: 20,
    },
    panicButtonInner: {
        backgroundColor: '#ef4444',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    panicIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    panicText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    panicSubtext: {
        fontSize: 14,
        color: '#fee2e2',
        textAlign: 'center',
    },
    emergencyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1e40af',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    emergencyIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    emergencyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    infoBox: {
        backgroundColor: '#dbeafe',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e40af',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#1e3a8a',
        lineHeight: 20,
    },
    warningBox: {
        backgroundColor: '#fef3c7',
        borderRadius: 12,
        padding: 16,
    },
    warningText: {
        fontSize: 13,
        color: '#92400e',
        lineHeight: 18,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
        marginTop: 8,
    },
    typeSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    typeButton: {
        flex: 1,
        minWidth: '48%',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
    },
    typeButtonActive: {
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
    },
    typeIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    typeLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        textAlign: 'center',
    },
    typeLabelActive: {
        color: '#fff',
    },
    input: {
        fontSize: 16,
        minHeight: 100,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
    },
    sendButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#ef4444',
    },
    sendButtonDisabled: {
        backgroundColor: '#fca5a5',
    },
    sendButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
