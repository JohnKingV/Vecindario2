import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMeterReadingScreen } from './useMeterReadingScreen';
import { useTheme } from '../../../context/ThemeContext';
import { ResponsiveContainer } from '../../../components';

const MeterReadingScreen = () => {
    const { theme } = useTheme();
    const {
        image,
        loading,
        reading,
        setReading,
        meterType,
        setMeterType,
        pickImage,
        handleSave,
    } = useMeterReadingScreen();

    const METER_TYPES = [
        { id: 'agua', label: 'Agua', icon: 'water', color: '#3b82f6' },
        { id: 'gas', label: 'Gas', icon: 'fire', color: '#ef4444' },
        { id: 'electricidad', label: 'Luz', icon: 'flash', color: '#f59e0b' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>Lectura Inteligente</Text>
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                            Automatiza el cobro de suministros capturando la lectura de tu medidor con IA.
                        </Text>
                    </View>

                    <View style={styles.mainGrid}>
                        <View style={styles.leftCol}>
                            <Text style={styles.label}>1. SELECCIONA EL SUMINISTRO</Text>
                            <View style={styles.typeGrid}>
                                {METER_TYPES.map(type => (
                                    <TouchableOpacity
                                        key={type.id}
                                        style={[
                                            styles.typeCard,
                                            {
                                                backgroundColor: meterType === type.id ? type.color : theme.colors.card,
                                                borderColor: theme.colors.border
                                            }
                                        ]}
                                        onPress={() => setMeterType(type.id)}
                                    >
                                        <MaterialCommunityIcons
                                            name={type.icon}
                                            size={32}
                                            color={meterType === type.id ? '#fff' : type.color}
                                        />
                                        <Text style={[
                                            styles.typeLabel,
                                            { color: meterType === type.id ? '#fff' : theme.colors.text }
                                        ]}>
                                            {type.label.toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>2. ADJUNTA FOTO DEL MEDIDOR</Text>
                            <TouchableOpacity
                                style={[styles.dropzone, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                                onPress={pickImage}
                            >
                                {image ? (
                                    <Image source={{ uri: image }} style={styles.preview} />
                                ) : (
                                    <View style={styles.dropContent}>
                                        <MaterialCommunityIcons name="cloud-upload" size={48} color={theme.colors.primary} />
                                        <Text style={[styles.dropText, { color: theme.colors.text }]}>Haz clic para tomar o subir foto</Text>
                                        <Text style={{ color: theme.colors.textSecondary }}>JPG, PNG (máx 5MB)</Text>
                                    </View>
                                )}
                                {loading && (
                                    <View style={styles.overlay}>
                                        <ActivityIndicator size="large" color="#fff" />
                                        <Text style={styles.overlayText}>Analizando lectura...</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.rightCol}>
                            <View style={[styles.resultCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                <Text style={styles.label}>RESULTADO DEL ANÁLISIS</Text>
                                {reading !== null ? (
                                    <View style={styles.successBox}>
                                        <Text style={[styles.readingValue, { color: theme.colors.text }]}>{reading}</Text>
                                        <Text style={{ color: theme.colors.textSecondary }}>Unidades detectadas</Text>

                                        <View style={styles.editBox}>
                                            <Text style={{ fontSize: 12, marginBottom: 8 }}>¿Es incorrecto? Corrige aquí:</Text>
                                            <TextInput
                                                style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
                                                value={reading.toString()}
                                                onChangeText={t => setReading(parseInt(t) || 0)}
                                                keyboardType="number-pad"
                                            />
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.waitBox}>
                                        <MaterialCommunityIcons name="robot-confused" size={48} color={theme.colors.border} />
                                        <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginTop: 16 }}>
                                            Sube una foto para que nuestra IA procese la lectura automáticamente.
                                        </Text>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={[styles.saveBtn, { backgroundColor: reading ? theme.colors.primary : theme.colors.border }]}
                                    disabled={!reading || loading}
                                    onPress={handleSave}
                                >
                                    <Text style={styles.saveBtnText}>Confirmar y Enviar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </ResponsiveContainer>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingVertical: 80 },
    header: { marginBottom: 60 },
    title: { fontSize: 48, fontWeight: '900', letterSpacing: -2 },
    subtitle: { fontSize: 20, marginTop: 12, maxWidth: 600 },
    mainGrid: { flexDirection: 'row', gap: 40 },
    leftCol: { flex: 1.5 },
    rightCol: { flex: 1 },
    label: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 20, color: '#666' },
    typeGrid: { flexDirection: 'row', gap: 16, marginBottom: 40 },
    typeCard: { flex: 1, padding: 32, borderRadius: 24, borderWidth: 1, alignItems: 'center', gap: 12 },
    typeLabel: { fontSize: 12, fontWeight: '900' },
    dropzone: { height: 400, borderRadius: 32, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    preview: { width: '100%', height: '100%', resizeMode: 'cover' },
    dropContent: { alignItems: 'center', gap: 10 },
    dropText: { fontSize: 18, fontWeight: 'bold' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    overlayText: { color: '#fff', marginTop: 16, fontWeight: 'bold' },
    resultCard: { padding: 40, borderRadius: 32, borderWidth: 1, minHeight: 400 },
    waitBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    successBox: { flex: 1, alignItems: 'center', paddingTop: 20 },
    readingValue: { fontSize: 72, fontWeight: '900' },
    editBox: { width: '100%', marginTop: 40 },
    input: { height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    saveBtn: { height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 40, width: '100%' },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default MeterReadingScreen;
