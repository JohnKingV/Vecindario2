import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { useFinanceHubScreen } from './useFinanceHubScreen';
import { useTheme } from '../../../context/ThemeContext';
import { Avatar } from '../../../components';

const screenWidth = Dimensions.get("window").width;

const FinanceHubScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const { loading, stats, gastosData, staffList, userRole } = useFinanceHubScreen();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    };

    const KPICard = ({ title, amount, icon, color }) => (
        <View style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={[styles.kpiIcon, { backgroundColor: color + '15' }]}>
                <MaterialCommunityIcons name={icon} size={24} color={color} />
            </View>
            <View style={{ marginTop: 12 }}>
                <Text style={[styles.kpiTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
                <Text style={[styles.kpiAmount, { color: theme.colors.text }]}>{formatCurrency(amount)}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>Administración</Text>
                <TouchableOpacity style={[styles.configBtn, { backgroundColor: theme.colors.inputBackground }]}>
                    <MaterialCommunityIcons name="cog-outline" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.kpiGrid}>
                    <KPICard title="Recaudado" amount={stats.total_recaudado} icon="cash-check" color="#22c55e" />
                    <KPICard title="Por Cobrar" amount={stats.total_por_cobrar} icon="clock-time-four-outline" color="#f59e0b" />
                </View>

                <TouchableOpacity
                    style={[styles.automationsCard, { backgroundColor: theme.colors.primary, borderColor: theme.colors.border }]}
                    onPress={() => navigation.navigate('BankReconciliation')}
                >
                    <View style={styles.automationsInfo}>
                        <MaterialCommunityIcons name="lightning-bolt" size={24} color="#fff" />
                        <View style={{ marginLeft: 12 }}>
                            <Text style={styles.automationsTitle}>Conciliación Bancaria</Text>
                            <Text style={styles.automationsSubtitle}>Automatiza el cierre de mes con IA</Text>
                        </View>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
                </TouchableOpacity>

                <View style={[styles.chartSection, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Distribución de Gastos</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Providers')}>
                            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Ver proveedores</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.chartRow}>
                        <PieChart
                            data={gastosData}
                            width={screenWidth * 0.45}
                            height={180}
                            chartConfig={{
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            }}
                            accessor={"amount"}
                            backgroundColor={"transparent"}
                            paddingLeft={"0"}
                            center={[45, 0]}
                            absolute
                            hasLegend={false}
                        />
                        <View style={styles.legendContainer}>
                            {gastosData.map((item, index) => (
                                <View key={index} style={styles.legendItem}>
                                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                                    <View>
                                        <Text style={[styles.legendAmount, { color: theme.colors.text }]}>
                                            {formatCurrency(item.amount)}
                                        </Text>
                                        <Text style={[styles.legendName, { color: theme.colors.textSecondary }]}>
                                            {item.name}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                <View style={[styles.sectionHeader]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Nómina de Personal</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Payroll')}>
                        <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Ver todo</Text>
                    </TouchableOpacity>
                </View>

                {staffList.map((staff) => (
                    <TouchableOpacity key={staff.id} style={[styles.staffRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <Avatar uri={staff.profiles?.foto_url} size="sm" />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={[styles.staffName, { color: theme.colors.text }]}>{staff.profiles?.nombre}</Text>
                            <Text style={[styles.staffRole, { color: theme.colors.textSecondary }]}>{staff.profiles?.role}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={[styles.staffPay, { color: theme.colors.text }]}>{formatCurrency(staff.salario_base)}</Text>
                            <Text style={[styles.payStatus, { color: '#22c55e' }]}>Pagado</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, justifyContent: 'space-between' },
    title: { fontSize: 24, fontWeight: '900' },
    configBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20 },
    kpiGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    kpiCard: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1 },
    kpiIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    kpiTitle: { fontSize: 12, fontWeight: '600' },
    kpiAmount: { fontSize: 18, fontWeight: '900', marginTop: 4 },
    automationsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        marginBottom: 24,
        justifyContent: 'space-between'
    },
    automationsInfo: { flexDirection: 'row', alignItems: 'center' },
    automationsTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    automationsSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
    chartSection: { padding: 20, borderRadius: 32, borderWidth: 1, marginBottom: 24 },
    chartRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
    legendContainer: { flex: 1, paddingLeft: 20 },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    legendColor: { width: 12, height: 12, borderRadius: 6, marginRight: 8, marginTop: 4 },
    legendAmount: { fontSize: 13, fontWeight: 'bold' },
    legendName: { fontSize: 11, fontWeight: '500' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold' },
    staffRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 10 },
    staffName: { fontSize: 15, fontWeight: 'bold' },
    staffRole: { fontSize: 12 },
    staffPay: { fontSize: 14, fontWeight: '900' },
    payStatus: { fontSize: 10, fontWeight: 'bold' },
    center: { justifyContent: 'center', alignItems: 'center' }
});

export default FinanceHubScreen;
