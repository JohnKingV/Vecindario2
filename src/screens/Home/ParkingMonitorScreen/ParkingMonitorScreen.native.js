import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    Modal,
    TextInput
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useParkingMonitorScreen } from './useParkingMonitorScreen';
import { useTheme } from '../../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - 48) / COLUMN_COUNT;

const ParkingMonitorScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const {
        parkingSlots,
        loading,
        refreshing,
        onRefresh,
        handleToggleStatus,
        availableCount,
        totalCount,
        handleUpdateCapacity,
        userRole
    } = useParkingMonitorScreen();

    const [isConfigVisible, setIsConfigVisible] = React.useState(false);
    const [newCapacity, setNewCapacity] = React.useState('');
    const [feedbackModal, setFeedbackModal] = React.useState({ visible: false, type: 'success', message: '' });

    // Only admins/staff can see config
    const canEdit = ['admin', 'conserje', 'mayordomo'].includes(userRole);

    const handleSaveCapacity = async () => {
        const result = await handleUpdateCapacity(parseInt(newCapacity));
        setIsConfigVisible(false);
        setFeedbackModal({
            visible: true,
            type: result.success ? 'success' : 'error',
            message: result.message
        });
    };

    const renderTopBar = () => (
        <View style={[styles.appBar, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.colors.inputBackground }]}>
                <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Estacionamientos</Text>

            {canEdit ? (
                <TouchableOpacity
                    onPress={() => {
                        setNewCapacity(totalCount.toString());
                        setIsConfigVisible(true);
                    }}
                    style={[styles.backButton, { backgroundColor: theme.colors.inputBackground, marginLeft: 'auto' }]}
                >
                    <MaterialCommunityIcons name="cog" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            ) : (
                <View style={{ width: 44, marginLeft: 'auto' }} />
            )}
        </View>
    );

    const renderDashboardInfo = () => (
        <View style={styles.headerContent}>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Monitoreo de disponibilidad en tiempo real
            </Text>

            <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#f59e0b', fontSize: 13, fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f59e0b20', padding: 8, borderRadius: 8 }}>
                    ⚠️ Uso máximo 24 hrs por visita
                </Text>
            </View>

            <View style={styles.statsRow}>
                <BlurView intensity={isDark ? 20 : 40} tint={isDark ? "dark" : "light"} style={styles.statCard}>
                    <Text style={[styles.statValue, { color: theme.colors.primary }]}>{availableCount}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>DISPONIBLES</Text>
                </BlurView>
                <BlurView intensity={isDark ? 20 : 40} tint={isDark ? "dark" : "light"} style={styles.statCard}>
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>{totalCount}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>TOTAL CUPO</Text>
                </BlurView>
            </View>
        </View>
    );

    const renderSlot = ({ item }) => {
        const isAvailable = item.estado === 'disponible';
        const canEditSlot = userRole === 'conserje' || userRole === 'admin' || userRole === 'mayordomo';

        return (
            <TouchableOpacity
                activeOpacity={canEditSlot ? 0.7 : 1}
                onPress={() => handleToggleStatus(item)}
                style={[styles.slotCard, { width: ITEM_WIDTH }]}
            >
                <BlurView
                    intensity={isDark ? 30 : 60}
                    tint={isDark ? "dark" : "light"}
                    style={[
                        styles.slotBlur,
                        { borderColor: isAvailable ? '#22c55e44' : '#ef444444' }
                    ]}
                >
                    <View style={[styles.statusIndicator, { backgroundColor: isAvailable ? '#22c55e' : '#ef4444' }]} />
                    <MaterialCommunityIcons
                        name={isAvailable ? "car-side" : "car-connected"}
                        size={32}
                        color={isAvailable ? theme.colors.primary : '#ef4444'}
                    />
                    <Text style={[styles.slotId, { color: theme.colors.text }]}>{item.identificador}</Text>
                    <Text style={[styles.slotStatusText, { color: isAvailable ? '#22c55e' : '#ef4444' }]}>
                        {item.estado.toUpperCase()}
                    </Text>

                    {canEditSlot && (
                        <View style={styles.editBadge}>
                            <MaterialCommunityIcons name="pencil-circle" size={16} color={theme.colors.textSecondary} />
                        </View>
                    )}
                </BlurView>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
            <LinearGradient
                colors={isDark ? ['#1e293b', '#0f172a'] : ['#f8fafc', '#f1f5f9']}
                style={StyleSheet.absoluteFill}
            />

            {renderTopBar()}

            <FlatList
                data={parkingSlots}
                keyExtractor={(item) => item.id}
                renderItem={renderSlot}
                numColumns={COLUMN_COUNT}
                ListHeaderComponent={renderDashboardInfo}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="car-off" size={64} color={theme.colors.textSecondary} opacity={0.5} />
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            No hay estacionamientos registrados en esta comunidad.
                        </Text>
                    </View>
                }
            />

            {/* Config Modal */}
            <Modal visible={isConfigVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Configurar Capacidad</Text>
                        <Text style={{ color: theme.colors.textSecondary, marginBottom: 20 }}>
                            Define la cantidad total de estacionamientos de visita disponibles.
                        </Text>

                        <Text style={[styles.label, { color: theme.colors.text }]}>Cantidad Total</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
                            value={newCapacity}
                            onChangeText={setNewCapacity}
                            keyboardType="number-pad"
                            placeholder="Ej: 10"
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setIsConfigVisible(false)}
                            >
                                <Text style={{ color: theme.colors.text }}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: theme.colors.primary }]}
                                onPress={handleSaveCapacity}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Feedback Modal */}
            <Modal visible={feedbackModal.visible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card, alignItems: 'center' }]}>
                        <View style={{
                            width: 60, height: 60, borderRadius: 30,
                            backgroundColor: feedbackModal.type === 'success' ? '#22c55e20' : '#ef444420',
                            justifyContent: 'center', alignItems: 'center', marginBottom: 16
                        }}>
                            <MaterialCommunityIcons
                                name={feedbackModal.type === 'success' ? "check" : "alert-circle-outline"}
                                size={32}
                                color={feedbackModal.type === 'success' ? '#22c55e' : '#ef4444'}
                            />
                        </View>

                        <Text style={[styles.modalTitle, { color: theme.colors.text, textAlign: 'center' }]}>
                            {feedbackModal.type === 'success' ? '¡Éxito!' : 'Error'}
                        </Text>
                        <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 24 }}>
                            {feedbackModal.message}
                        </Text>

                        <TouchableOpacity
                            style={[styles.confirmBtn, { backgroundColor: theme.colors.primary, width: '100%' }]}
                            onPress={() => setFeedbackModal({ ...feedbackModal, visible: false })}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Entendido</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        // paddingHorizontal: 20, // Replaced by specific contents
        // paddingBottom: 24,
    },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'space-between', // Removed to align title left
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 12,
    },
    headerContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 20,
        marginLeft: 4,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: 4,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    slotCard: {
        height: 140,
        borderRadius: 24,
        overflow: 'hidden',
    },
    slotBlur: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 24,
    },
    statusIndicator: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    slotId: {
        fontSize: 18,
        fontWeight: '800',
        marginTop: 8,
    },
    slotStatusText: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: 2,
    },
    editBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        marginTop: 60,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 16,
        fontSize: 14,
    },
    topButtons: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { padding: 24, borderRadius: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    label: { fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
    input: { padding: 16, borderRadius: 12, fontSize: 18, marginBottom: 24 },
    modalActions: { flexDirection: 'row', gap: 12 },
    cancelBtn: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(150,150,150,0.3)' },
    confirmBtn: { flex: 2, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
});

export default ParkingMonitorScreen;
