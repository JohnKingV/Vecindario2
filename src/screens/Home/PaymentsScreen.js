import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    ActivityIndicator,
    Platform,
    ImageBackground,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { marketplaceService } from '../../services/marketplaceService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const formatPriceLocal = (price) => {
    if (!price && price !== 0) return '$0';
    return '$' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
import { Button } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { residentialService } from '../../services/residentialService';

const PaymentsScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadPayments();
        }
    }, [user]);

    const loadPayments = async () => {
        setLoading(true);
        const { data, error } = await residentialService.getPaymentHistory(user.id);
        if (!error) {
            setHistory(data || []);
        }
        setLoading(false);
    };

    const pendingPayment = history.find(h => h.estado === 'pendiente');
    const totalBalance = pendingPayment ? pendingPayment.monto : 0;

    const formatPrice = (price) => {
        return formatPriceLocal(price);
    };

    if (loading && history.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.appBar, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Pagos y Expensas</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <MaterialCommunityIcons name="information-outline" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Balance Card */}
                <View style={styles.balanceSection}>
                    <View style={[styles.balanceCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <ImageBackground
                            source={{ uri: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800' }}
                            style={styles.cardImage}
                            imageStyle={{ borderRadius: 20 }}
                        >
                            <View style={styles.cardOverlay} />
                        </ImageBackground>

                        <View style={styles.cardContent}>
                            <Text style={[styles.labelCaps, { color: theme.colors.textSecondary }]}>ESTADO DE CUENTA</Text>
                            <View style={styles.amountRow}>
                                <Text style={[styles.amountText, { color: theme.colors.text }]}>{formatPrice(totalBalance)}</Text>
                                <Text style={[styles.currencyText, { color: theme.colors.textSecondary }]}>CLP</Text>
                            </View>

                            <View style={styles.cardFooter}>
                                <Text style={[styles.footerLabel, { color: theme.colors.textSecondary }]}>Balance Pendiente</Text>
                                {totalBalance > 0 && (
                                    <Button
                                        size="sm"
                                        style={[styles.payBtn, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]}
                                        textStyle={styles.payBtnText}
                                    >
                                        Pagar Ahora
                                    </Button>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* History Section */}
                <View style={styles.historySection}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Historial de Pagos</Text>
                    </View>

                    <View style={styles.listContainer}>
                        {history.length === 0 ? (
                            <View style={{ padding: 40, alignItems: 'center' }}>
                                <Text style={{ color: theme.colors.textSecondary }}>No hay movimientos registrados</Text>
                            </View>
                        ) : history.map((item) => (
                            <TouchableOpacity key={item.id} style={[styles.historyItem, { backgroundColor: theme.colors.card }]} activeOpacity={0.7}>
                                <View style={styles.itemLeft}>
                                    <View style={[styles.iconBg, { backgroundColor: item.estado === 'pendiente' ? (isDark ? 'rgba(234, 88, 12, 0.2)' : '#fff7ed') : (isDark ? 'rgba(22, 163, 74, 0.2)' : '#f0fdf4') }]}>
                                        <MaterialCommunityIcons
                                            name={item.estado === 'pendiente' ? 'calendar-clock' : 'calendar-check'}
                                            size={24}
                                            color={item.estado === 'pendiente' ? '#ea580c' : theme.colors.success}
                                        />
                                    </View>
                                    <View>
                                        <Text style={[styles.itemMonth, { color: theme.colors.text }]}>{item.mes_periodo}</Text>
                                        <View style={styles.itemMetaRow}>
                                            <Text style={[styles.itemAmount, { color: theme.colors.textSecondary }]}>{formatPrice(item.monto)}</Text>
                                            <View style={[styles.dot, { backgroundColor: theme.colors.border }]} />
                                            <Text style={[styles.statusText, { color: item.estado === 'pendiente' ? '#ea580c' : theme.colors.success }]}>
                                                {item.estado?.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {item.estado === 'pendiente' ? (
                                    <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.border} />
                                ) : (
                                    <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: isDark ? theme.colors.accent : '#f8fafc' }]}>
                                        <MaterialCommunityIcons name="download-outline" size={20} color={theme.colors.primary} />
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingBottom: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    iconButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111318',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    balanceSection: {
        padding: 16,
    },
    balanceCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 140,
    },
    cardOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 20,
    },
    cardContent: {
        padding: 20,
    },
    labelCaps: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748b',
        letterSpacing: 1,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
        marginTop: 4,
    },
    amountText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111318',
    },
    currencyText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    footerLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    payBtn: {
        paddingHorizontal: 20,
        borderRadius: 100,
        height: 40,
        backgroundColor: '#135bec',
        shadowColor: '#135bec',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    payBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    historySection: {
        marginTop: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111318',
    },
    viewAll: {
        fontSize: 14,
        fontWeight: '600',
        color: '#135bec',
    },
    listContainer: {
        paddingHorizontal: 8,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        marginHorizontal: 8,
        marginBottom: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        hover: {
            backgroundColor: '#f8fafc',
        }
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconBg: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemMonth: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111318',
    },
    itemMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    itemAmount: {
        fontSize: 13,
        color: '#64748b',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#cbd5e1',
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    downloadBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PaymentsScreen;
