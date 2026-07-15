import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { financeService } from '../../../services/financeService';
import { useAuth } from '../../../hooks/useAuth';
import * as DocumentPicker from 'expo-document-picker';

const BankReconciliationScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { profile } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [matches, setMatches] = useState([]);
    const [orphans, setOrphans] = useState([]);
    const [hasData, setHasData] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    };

    const handleUploadBankStatement = async () => {
        try {
            const res = await DocumentPicker.getDocumentAsync({
                type: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
                copyToCacheDirectory: true,
            });

            if (res.canceled) return;

            setAnalyzing(true);
            
            // Simulación de lectura de CSV y parsing
            setTimeout(() => {
                const mockTransactions = [
                    {
                        comunidad_id: profile?.comunidades?.id,
                        fecha_transaccion: new Date().toISOString().split('T')[0],
                        descripcion_banco: 'Traspaso MANTENIMIENTO SPA',
                        cargo: 1200000,
                        abono: 0,
                        referencia_bancaria: 'TRX-' + Math.floor(Math.random() * 10000),
                        estado: 'pendiente' // Pendiente a conciliar
                    },
                    {
                        comunidad_id: profile?.comunidades?.id,
                        fecha_transaccion: new Date().toISOString().split('T')[0],
                        descripcion_banco: 'PAGO SUELDO JUAN PEREZ',
                        cargo: 500000,
                        abono: 0,
                        referencia_bancaria: 'TRX-' + Math.floor(Math.random() * 10000),
                        estado: 'pendiente'
                    },
                    {
                        comunidad_id: profile?.comunidades?.id,
                        fecha_transaccion: new Date().toISOString().split('T')[0],
                        descripcion_banco: 'Gasto desconocido cafeteria',
                        cargo: 15000,
                        abono: 0,
                        referencia_bancaria: 'TRX-' + Math.floor(Math.random() * 10000),
                        estado: 'pendiente'
                    }
                ];

                financeService.importBankTransactions(profile?.comunidades?.id, mockTransactions).then(() => {
                    executeSmartAI();
                });
            }, 2000);

        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo leer el archivo bancario");
            setAnalyzing(false);
        }
    };

    const executeSmartAI = async () => {
        setAnalyzing(true);
        const { data, error } = await financeService.runSmartReconciliation(profile?.comunidades?.id);
        setAnalyzing(false);
        
        if (error) {
            Alert.alert("Error", "Falló el motor de IA");
            return;
        }

        if (data) {
            setMatches(data.matches || []);
            setOrphans(data.orphans || []);
            setHasData(true);
        }
    };

    const approveReconciliation = async () => {
        setLoading(true);
        const { data, error } = await financeService.saveReconciliations(profile?.comunidades?.id, matches, profile?.id);
        setLoading(false);

        if (error) {
            Alert.alert("Error", "No se pudo guardar la conciliación");
        } else {
            Alert.alert("¡Éxito!", `Se han conciliado ${data?.count || matches.length} movimientos de manera automática.`);
            navigation.goBack();
        }
    };

    const EmptyStateUpload = () => (
        <View style={styles.uploadContainer}>
            <View style={[styles.dragArea, { borderColor: theme.colors.border, backgroundColor: theme.colors.inputBackground }]}>
                <MaterialCommunityIcons name="cloud-upload-outline" size={64} color={theme.colors.primary} />
                <Text style={[styles.dragTitle, { color: theme.colors.text }]}>Sube la Cartola Bancaria</Text>
                <Text style={[styles.dragSub, { color: theme.colors.textSecondary }]}>Archivos soportados: CSV, Excel (.xlsx)</Text>
                <TouchableOpacity onPress={handleUploadBankStatement} style={[styles.btnAction, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.btnActionText}>Seleccionar Archivo</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const AnalyzingState = () => (
        <View style={styles.uploadContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.dragTitle, { color: theme.colors.text, marginTop: 20 }]}>Motor IA Analizando...</Text>
            <Text style={[styles.dragSub, { color: theme.colors.textSecondary }]}>Cruzando datos bancarios con egresos de la comunidad</Text>
        </View>
    );

    const MatchRow = ({ match }) => (
        <View style={[styles.matchCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.matchSide}>
                <MaterialCommunityIcons name="bank-outline" size={20} color="#3b82f6" />
                <View style={{ marginLeft: 8, flex: 1 }}>
                    <Text style={[styles.matchTitle, { color: theme.colors.text }]} numberOfLines={1}>{match.transaccion.descripcion_banco}</Text>
                    <Text style={[styles.matchSub, { color: theme.colors.textSecondary }]}>{match.transaccion.fecha_transaccion}</Text>
                </View>
                <Text style={[styles.matchAmount, { color: '#ef4444' }]}>- {formatCurrency(match.transaccion.cargo)}</Text>
            </View>

            <View style={styles.linkBridge}>
                <View style={[styles.linkLine, { backgroundColor: match.metodo === 'ia_exacto' ? '#22c55e' : '#f59e0b' }]} />
                <View style={[styles.badgeBase, { backgroundColor: match.metodo === 'ia_exacto' ? '#22c55e' : '#f59e0b' }]}>
                    <MaterialCommunityIcons name={match.metodo === 'ia_exacto' ? "check-decagram" : "star-shooting-outline"} size={14} color="#fff" />
                    <Text style={styles.badgeText}>{match.nivel_confianza}%</Text>
                </View>
                <View style={[styles.linkLine, { backgroundColor: match.metodo === 'ia_exacto' ? '#22c55e' : '#f59e0b' }]} />
            </View>

            <View style={styles.matchSide}>
                <MaterialCommunityIcons name={match.match_type === 'egreso' ? "file-document-outline" : "account-tie"} size={20} color={theme.colors.primary} />
                <View style={{ marginLeft: 8, flex: 1 }}>
                    <Text style={[styles.matchTitle, { color: theme.colors.text }]} numberOfLines={1}>
                        {match.match_type === 'egreso' ? match.target.proveedor?.razon_social : match.target.empleado?.nombre_completo}
                    </Text>
                    <Text style={[styles.matchSub, { color: theme.colors.textSecondary }]}>Reg. Interno</Text>
                </View>
                <Text style={[styles.matchAmount, { color: theme.colors.text }]}>{formatCurrency(match.match_type === 'egreso' ? match.target.monto : match.target.total_a_pagar)}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconBtn, { backgroundColor: theme.colors.inputBackground }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Conciliación con IA</Text>
                    <Text style={[styles.headerSub, { color: theme.colors.primary }]}>Vecindario Elite ERP</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {!analyzing && !hasData && <EmptyStateUpload />}
                {analyzing && <AnalyzingState />}

                {!analyzing && hasData && (
                    <View>
                        <View style={styles.resultsHeader}>
                            <Text style={[styles.resultsTitle, { color: theme.colors.text }]}>Coincidencias Encontradas ({matches.length})</Text>
                            <TouchableOpacity onPress={executeSmartAI}>
                                <MaterialCommunityIcons name="refresh" size={24} color={theme.colors.primary} />
                            </TouchableOpacity>
                        </View>

                        {matches.length === 0 && (
                            <Text style={{ color: theme.colors.textSecondary, marginBottom: 20 }}>No se encontraron matches automáticos.</Text>
                        )}
                        
                        {matches.map((m, idx) => (
                            <MatchRow key={idx} match={m} />
                        ))}

                        <Text style={[styles.resultsTitle, { color: theme.colors.text, marginTop: 24 }]}>Movimientos Huérfanos ({orphans.length})</Text>
                        <Text style={{ color: theme.colors.textSecondary, marginBottom: 16 }}>Requieres conciliar estos registros bancarios de forma manual.</Text>

                        {orphans.map((o, idx) => (
                            <View key={idx} style={[styles.orphanCard, { backgroundColor: theme.colors.inputBackground }]}>
                                <Text style={[styles.matchTitle, { color: theme.colors.text }]}>{o.descripcion_banco}</Text>
                                <Text style={[styles.matchAmount, { color: '#ef4444' }]}>- {formatCurrency(o.cargo)}</Text>
                                <TouchableOpacity style={styles.manualBtn}>
                                    <Text style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: 13 }}>Buscar Match Manual</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {!analyzing && hasData && matches.length > 0 && (
                <View style={[styles.footer, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
                    <TouchableOpacity onPress={approveReconciliation} style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="check-all" size={20} color="#fff" />
                                <Text style={styles.saveBtnText}>Aprobar Conciliación Automática</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, justifyContent: 'space-between' },
    iconBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
    headerSub: { fontSize: 12, fontWeight: '800', textAlign: 'center', marginTop: 2 },
    content: { padding: 20, paddingBottom: 100 },
    uploadContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 400 },
    dragArea: { width: '100%', borderWidth: 2, borderStyle: 'dashed', borderRadius: 24, padding: 40, alignItems: 'center' },
    dragTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16 },
    dragSub: { fontSize: 13, marginTop: 8, marginBottom: 24, textAlign: 'center' },
    btnAction: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 16 },
    btnActionText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    resultsTitle: { fontSize: 18, fontWeight: '900' },
    matchCard: { padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12 },
    matchSide: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    matchTitle: { fontSize: 15, fontWeight: 'bold' },
    matchSub: { fontSize: 11 },
    matchAmount: { fontSize: 14, fontWeight: '900' },
    linkBridge: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, paddingHorizontal: 20 },
    linkLine: { flex: 1, height: 2, opacity: 0.5 },
    badgeBase: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, gap: 4 },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: '900' },
    orphanCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, marginBottom: 8 },
    manualBtn: { padding: 8, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 8 },
    footer: { padding: 20, borderTopWidth: 1 },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 8 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default BankReconciliationScreen;
