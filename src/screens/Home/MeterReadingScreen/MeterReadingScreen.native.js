import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    TextInput,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useMeterReadingScreen } from './useMeterReadingScreen';
import { useTheme } from '../../../context/ThemeContext';
import SuccessModal from '../../../components/SuccessModal';
import ConfirmModal from '../../../components/ConfirmModal';

const MeterReadingScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const {
        image,
        loading,
        reading,
        setReading,
        meterType,
        setMeterType,
        pickImage,
        handleSave,
        alertState,
        isSuccessVisible,
        setIsSuccessVisible
    } = useMeterReadingScreen();

    const METER_TYPES = [
        { id: 'agua', label: 'Agua', icon: 'water' },
        { id: 'gas', label: 'Gas', icon: 'fire' },
        { id: 'electricidad', label: 'Luz', icon: 'flash' },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>Lectura de Medidor</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                    Selecciona el tipo de medidor y toma una foto clara de la lectura.
                </Text>

                <View style={styles.typeGrid}>
                    {METER_TYPES.map(type => (
                        <TouchableOpacity
                            key={type.id}
                            style={[
                                styles.typeCard,
                                {
                                    backgroundColor: meterType === type.id ? theme.colors.primary : theme.colors.card,
                                    borderColor: theme.colors.border
                                }
                            ]}
                            onPress={() => setMeterType(type.id)}
                        >
                            <MaterialCommunityIcons
                                name={type.icon}
                                size={24}
                                color={meterType === type.id ? '#fff' : theme.colors.textSecondary}
                            />
                            <Text style={[
                                styles.typeLabel,
                                { color: meterType === type.id ? '#fff' : theme.colors.text }
                            ]}>
                                {type.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.imageUpload, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                    onPress={pickImage}
                >
                    {image ? (
                        <Image source={{ uri: image }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.uploadPlaceholder}>
                            <MaterialCommunityIcons name="camera-plus" size={48} color={theme.colors.primary} />
                            <Text style={[styles.uploadText, { color: theme.colors.textSecondary }]}>Tomar foto del medidor</Text>
                        </View>
                    )}
                    {loading && (
                        <BlurView intensity={30} style={styles.loaderOverlay}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                            <Text style={{ marginTop: 12, color: '#fff', fontWeight: 'bold' }}>Procesando con IA...</Text>
                        </BlurView>
                    )}
                </TouchableOpacity>

                {reading !== null && (
                    <View style={[styles.resultCard, { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary }]}>
                        <Text style={[styles.resultLabel, { color: theme.colors.textSecondary }]}>LECTURA DETECTADA</Text>
                        <TextInput
                            style={[styles.resultInput, { color: theme.colors.text }]}
                            value={reading.toString()}
                            onChangeText={t => setReading(parseInt(t) || 0)}
                            keyboardType="number-pad"
                        />
                        <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 8 }}>
                            Verifica que el número coincida con tu medidor.
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    style={[
                        styles.saveBtn,
                        { backgroundColor: reading ? theme.colors.primary : theme.colors.border }
                    ]}
                    disabled={!reading || loading}
                    onPress={handleSave}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveBtnText}>Registrar Lectura</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            <SuccessModal
                visible={isSuccessVisible}
                title="Lectura Exitosa"
                message="La lectura del medidor ha sido registrada y procesada correctamente."
                onClose={() => {
                    setIsSuccessVisible(false);
                    navigation.goBack();
                }}
            />

            <ConfirmModal
                visible={alertState.visible}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
                onConfirm={alertState.onConfirm}
                onClose={alertState.onConfirm}
                confirmText="Entendido"
                showCancel={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    title: { fontSize: 20, fontWeight: 'bold' },
    scrollContent: { padding: 20 },
    subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
    typeGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    typeCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, gap: 8 },
    typeLabel: { fontSize: 12, fontWeight: 'bold' },
    imageUpload: { height: 250, borderRadius: 32, borderWidth: 2, borderStyle: 'dashed', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
    previewImage: { width: '100%', height: '100%' },
    uploadPlaceholder: { alignItems: 'center', gap: 12 },
    uploadText: { fontSize: 14, fontWeight: '600' },
    loaderOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
    resultCard: { padding: 24, borderRadius: 24, borderWidth: 1, marginTop: 24, alignItems: 'center' },
    resultLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    resultInput: { fontSize: 32, fontWeight: '900', marginTop: 12, textAlign: 'center', width: '100%' },
    saveBtn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default MeterReadingScreen;
