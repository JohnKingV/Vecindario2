import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useFinanceHubScreen } from './useFinanceHubScreen';
import { useTheme } from '../../../context/ThemeContext';
import { Avatar, ResponsiveContainer } from '../../../components';

const FinanceHubScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const { loading, stats, gastosData, staffList, userRole } = useFinanceHubScreen();
    const width = Dimensions.get('window').width;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    };

    if (loading) return <ActivityIndicator style={{ marginTop: 100 }} size="large" color={theme.colors.primary} />;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.title, { color: theme.colors.text }]}>Cerebro Financiero</Text>
                            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                                Panel de control administrativo y transparencia de gastos del condominio.
                            </Text>
                        </View>
                        <TouchableOpacity style={[styles.exportBtn, { backgroundColor: theme.colors.primary }]}>
                            <MaterialCommunityIcons name="file-excel" size={20} color="#fff" />
                            <Text style={styles.exportText} >Exportar Reporte</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={[styles.webAutomationBanner, { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary }]}>
                        <View style={styles.automationIconBox}>
                            <MaterialCommunityIcons name="auto-fix" size={32} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 24 }}>
                            <Text style={[styles.automationTitle, { color: theme.colors.text }]}>Conciliación Bancaria con IA</Text>
                            <Text style={[styles.automationSubtitle, { color: theme.colors.textSecondary }]}>
                                Sube tu archivo de transacciones y deja que nuestra IA empareje automáticamente los pagos con las unidades.
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('BankReconciliation')} style={[styles.automationBtn, { backgroundColor: theme.colors.primary }]}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Iniciar Conciliación</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>

                    <View style={styles.kpiRow}>
                        <View style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>RECAUDACIÓN TOTAL</Text>
                            <Text style={[styles.kpiValue, { color: '#22c55e' }]}>{formatCurrency(stats.total_recaudado)}</Text>
                            <View style={styles.progressTray}>
                                <View style={[styles.progressBar, { width: '85%', backgroundColor: '#22c55e' }]} />
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => navigation?.navigate('Providers')} style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>EGRESOS / PROVEEDORES</Text>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                            </View>
                            <Text style={[styles.kpiValue, { color: '#ef4444' }]}>{formatCurrency(stats.gastos_comunes_periodo)}</Text>
                            <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 8 }}>Ver facturas y mantenciones</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation?.navigate('Payroll')} style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>PAGO NÓMINA STAFF</Text>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                            </View>
                            <Text style={[styles.kpiValue, { color: theme.colors.text }]}>{formatCurrency(stats.pago_staff)}</Text>
                            <Text style={{ fontSize: 12, color: '#3b82f6', marginTop: 8 }}>{staffList.length} Colaboradores registrados</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.chartGrid}>
                        <View style={[styles.chartContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Distribución de Egresos</Text>
                            <PieChart
                                data={gastosData}
                                width={500}
                                height={220}
                                chartConfig={{ color: () => theme.colors.primary }}
                                accessor={"amount"}
                                backgroundColor={"transparent"}
                                paddingLeft={"15"}
                                absolute
                            />
                        </View>
                        <View style={[styles.chartContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Histórico de Recaudación</Text>
                            <BarChart
                                data={{
                                    labels: ["Ago", "Sep", "Oct", "Nov", "Dic", "Ene"],
                                    datasets: [{ data: [7.2, 8.1, 7.9, 8.5, 9.2, 8.5] }]
                                }}
                                width={500}
                                height={220}
                                yAxisLabel="M$"
                                chartConfig={{
                                    backgroundColor: theme.colors.card,
                                    backgroundGradientFrom: theme.colors.card,
                                    backgroundGradientTo: theme.colors.card,
                                    decimalPlaces: 1,
                                    color: (opacity = 1) => theme.colors.primary,
                                    labelColor: () => theme.colors.textSecondary,
                                }}
                                style={{ borderRadius: 16 }}
                            />
                        </View>
                    </View>
                </View>
            </ResponsiveContainer>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingVertical: 60, paddingHorizontal: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 60 },
    title: { fontSize: 48, fontWeight: '900', letterSpacing: -2 },
    subtitle: { fontSize: 20, marginTop: 12 },
    exportBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, gap: 10 },
    exportText: { color: '#fff', fontWeight: 'bold' },
    webAutomationBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 40,
        borderRadius: 32,
        borderWidth: 1,
        marginBottom: 60,
        borderStyle: 'dashed'
    },
    automationIconBox: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2 },
    automationTitle: { fontSize: 24, fontWeight: '900' },
    automationSubtitle: { fontSize: 16, marginTop: 4 },
    automationBtn: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
    kpiRow: { flexDirection: 'row', gap: 24, marginBottom: 48 },
    kpiCard: { flex: 1, padding: 40, borderRadius: 32, borderWidth: 1 },
    kpiLabel: { fontSize: 13, fontWeight: '900', letterSpacing: 1.5, marginBottom: 16 },
    kpiValue: { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
    progressTray: { height: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 3, marginTop: 24 },
    progressBar: { height: '100%', borderRadius: 3 },
    chartGrid: { flexDirection: 'row', gap: 24 },
    chartContainer: { flex: 1, padding: 32, borderRadius: 32, borderWidth: 1, alignItems: 'center' },
    chartTitle: { fontSize: 20, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: 32 }
});

export default FinanceHubScreen;
