import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Platform,
    RefreshControl,
    Modal,
    Dimensions,
    Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '../../services/authService';
import { LoadingSpinner, Input, Button } from '../../components';
import { useTheme } from '../../context/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CondoManagementScreen({ navigation }) {
    const { theme, isDark } = useTheme();
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCondo, setSelectedCondo] = useState(null);
    const [newCode, setNewCode] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const { data, error } = await authService.getAllCommunitiesWithStats();
        if (error) {
            Alert.alert('Error', 'No se pudieron cargar las comunidades');
        } else {
            setCommunities(data || []);
        }
        setLoading(false);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const openEditModal = (condo) => {
        setSelectedCondo(condo);
        setNewCode(condo.codigo_verificacion || '');
    };

    const handleUpdateCode = async () => {
        if (!newCode.trim()) {
            Alert.alert('Error', 'El código no puede estar vacío');
            return;
        }

        setUpdating(true);
        const { error } = await authService.updateCommunityCode(selectedCondo.id, newCode.trim());
        setUpdating(false);

        if (error) {
            Alert.alert('Error', 'No se pudo actualizar el código: ' + error.message);
        } else {
            Alert.alert('¡Éxito!', 'Código de verificación actualizado correctamente');
            setSelectedCondo(null);
            loadData();
        }
    };

    if (loading && !refreshing) return <LoadingSpinner />;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Códigos de Condominio</Text>
                    <View style={{ width: 28 }} />
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
                }
            >
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Condominios Registrados</Text>

                {communities.map(condo => (
                    <View key={condo.id} style={[styles.condoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <View style={styles.condoMainInfo}>
                            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(30, 58, 138, 0.2)' : '#F1F5F9' }]}>
                                <MaterialCommunityIcons
                                    name="office-building"
                                    size={24}
                                    color={isDark ? theme.colors.primary : "#1e3a8a"}
                                />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={[styles.condoName, { color: theme.colors.text }]}>{condo.nombre}</Text>
                                <Text style={[styles.condoAddress, { color: theme.colors.textSecondary }]}>{condo.direccion}, {condo.ciudad}</Text>
                            </View>
                        </View>

                        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                        <View style={styles.codeContainer}>
                            <View>
                                <Text style={[styles.codeLabel, { color: theme.colors.textSecondary }]}>CÓDIGO SECRETO</Text>
                                <Text style={[styles.codeValue, { color: isDark ? theme.colors.primary : '#1e3a8a' }]}>{condo.codigo_verificacion || 'SIN CÓDIGO'}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.editButton, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff' }]}
                                onPress={() => openEditModal(condo)}
                            >
                                <MaterialCommunityIcons name="pencil" size={20} color="#3b82f6" />
                                <Text style={styles.editButtonText}>Editar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                {communities.length === 0 && (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="office-building-off" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No hay condominios registrados</Text>
                    </View>
                )}
            </ScrollView>

            {/* Edit Modal */}
            <Modal
                visible={!!selectedCondo}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedCondo(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Editar Código Secreto</Text>
                        <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                            Cambiando código para: {'\n'}
                            <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>{selectedCondo?.nombre}</Text>
                        </Text>

                        <Input
                            label="Nuevo Código de Verificación"
                            placeholder="Ej: VISTA2030"
                            value={newCode}
                            onChangeText={setNewCode}
                            autoCapitalize="characters"
                        />

                        <View style={styles.modalFooter}>
                            <Button
                                variant="outline"
                                onPress={() => setSelectedCondo(null)}
                                style={{ flex: 1 }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onPress={handleUpdateCode}
                                loading={updating}
                                style={{ flex: 1, marginLeft: 12 }}
                            >
                                Guardar
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        height: 56,
    },
    backBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    scrollContent: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: 1,
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    condoCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    condoMainInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    condoName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    condoAddress: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginVertical: 12,
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    codeLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: 0.5,
    },
    codeValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1e3a8a',
        marginTop: 2,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3b82f6',
        marginLeft: 4,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 64,
    },
    emptyText: {
        fontSize: 16,
        color: '#94a3b8',
        fontWeight: '600',
        marginTop: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 24,
        lineHeight: 20,
    },
    modalFooter: {
        flexDirection: 'row',
        marginTop: 24,
    },
});
