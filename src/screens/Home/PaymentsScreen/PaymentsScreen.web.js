import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ResponsiveContainer, Button, PremiumHeader } from '../../../components';
import { usePaymentsScreen } from './usePaymentsScreen';

const SLATE_900 = '#0f172a';
const SLATE_800 = '#1e293b';
const SLATE_400 = '#94a3b8';
const SLATE_500 = '#64748b';
const PRIMARY_BLUE = '#3b82f6';

export default function PaymentsScreenWeb({ navigation }) {
    const logic = usePaymentsScreen(navigation);
    const { theme, isDark } = logic;

    const bgColor = SLATE_900;
    const cardBg = SLATE_800;
    const textColor = '#ffffff';
    const textSecondary = SLATE_400;
    const borderColor = 'rgba(255,255,255,0.1)';

    if (logic.loading && logic.history.length === 0) {
        return (
            <View style={[styles.container, { justifyContent: 'center', backgroundColor: bgColor }]}>
                <ActivityIndicator size="large" color={PRIMARY_BLUE} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <PremiumHeader navigation={navigation} activeTab="CONDOMINIO" />

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.scrollMain}>
                <ResponsiveContainer maxWidth={1600} style={styles.mainWrapper}>
                    <View style={styles.headerHero}>
                        <View>
                            <Text style={[styles.title, { color: textColor }]}>Mis Pagos y Expensas</Text>
                            <Text style={[styles.subtitle, { color: textSecondary }]}>Gestiona tus cuentas, descarga boletas y paga en línea de forma segura</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { borderColor: borderColor }]}>
                            <MaterialCommunityIcons name="chevron-left" size={24} color={textColor} />
                            <Text style={[styles.backText, { color: textColor }]}>Volver</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.mainLayout}>
                        {/* Summary Sidebar */}
                        <View style={styles.sidebar}>
                            <View style={[styles.balanceCardWeb, { backgroundColor: cardBg, borderColor }]}>
                                <Text style={[styles.sidebarLabel, { color: SLATE_500 }]}>TOTAL PENDIENTE</Text>
                                <View style={styles.amountBox}>
                                    <Text style={[styles.amountWeb, { color: textColor }]}>{logic.formatPrice(logic.totalBalance)}</Text>
                                    <View style={styles.currencyRow}>
                                        <MaterialCommunityIcons name="currency-usd" size={16} color={PRIMARY_BLUE} />
                                        <Text style={[styles.currencyWeb, { color: SLATE_500 }]}>Pesos Chilenos (CLP)</Text>
                                    </View>
                                </View>

                                {logic.totalBalance > 0 ? (
                                    <Button
                                        style={styles.payNowBtnWeb}
                                        icon={<MaterialCommunityIcons name="credit-card-outline" size={22} color="#fff" />}
                                    >
                                        Pagar saldo ahora
                                    </Button>
                                ) : (
                                    <View style={[styles.paidBadge, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                                        <MaterialCommunityIcons name="check-decagram" size={24} color="#22c55e" />
                                        <Text style={styles.paidBadgeText}>Al día con tus pagos</Text>
                                    </View>
                                )}

                                <View style={[styles.dividerSection, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />

                                <TouchableOpacity style={styles.supportRow}>
                                    <MaterialCommunityIcons name="message-question-outline" size={20} color={PRIMARY_BLUE} />
                                    <Text style={[styles.supportText, { color: textSecondary }]}>¿Dudas con un cobro? Contacta soporte</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.infoCardWeb, { backgroundColor: 'rgba(59, 130, 246, 0.05)', borderColor }]}>
                                <View style={styles.infoIconBox}>
                                    <MaterialCommunityIcons name="shield-lock-outline" size={36} color={PRIMARY_BLUE} />
                                </View>
                                <Text style={[styles.infoTitle, { color: textColor }]}>Pago 100% Seguro</Text>
                                <Text style={[styles.infoDesc, { color: textSecondary }]}>Tus transacciones están protegidas con los más altos estándares de seguridad bancaria.</Text>
                            </View>
                        </View>

                        {/* History Feed */}
                        <View style={styles.feed}>
                            <View style={styles.feedHeader}>
                                <View>
                                    <Text style={[styles.feedTitle, { color: textColor }]}>Historial de Movimientos</Text>
                                    <View style={styles.titleUnderline} />
                                </View>
                                <TouchableOpacity style={[styles.exportBtn, { borderColor }]}>
                                    <MaterialCommunityIcons name="file-excel-outline" size={20} color={SLATE_400} />
                                    <Text style={[styles.exportBtnText, { color: SLATE_400 }]}>Exportar Excel</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.historyListWeb}>
                                {logic.history.length === 0 ? (
                                    <View style={[styles.emptyStateWeb, { borderColor }]}>
                                        <MaterialCommunityIcons name="receipt" size={64} color={SLATE_800} />
                                        <Text style={{ color: SLATE_500, marginTop: 16, fontSize: 15 }}>No hay registros de pagos disponibles</Text>
                                    </View>
                                ) : (
                                    logic.history.map((item) => (
                                        <View key={item.id} style={[styles.historyRowWeb, { backgroundColor: cardBg, borderColor }]}>
                                            <View style={[
                                                styles.statusIconWeb,
                                                { backgroundColor: item.estado === 'pendiente' ? 'rgba(234, 88, 12, 0.1)' : 'rgba(34, 197, 94, 0.1)' }
                                            ]}>
                                                <MaterialCommunityIcons
                                                    name={item.estado === 'pendiente' ? 'alert-circle-outline' : 'check-circle-outline'}
                                                    size={28}
                                                    color={item.estado === 'pendiente' ? '#ea580c' : '#22c55e'}
                                                />
                                            </View>
                                            <View style={styles.rowMain}>
                                                <Text style={[styles.rowPeriod, { color: textColor }]}>Gasto Común: {item.mes_periodo}</Text>
                                                <View style={styles.rowMeta}>
                                                    <MaterialCommunityIcons name="calendar-range" size={14} color={SLATE_500} />
                                                    <Text style={[styles.rowDate, { color: textSecondary }]}>Período de Facturación Mensual</Text>
                                                </View>
                                            </View>
                                            <View style={styles.rowAmount}>
                                                <Text style={[styles.amountVal, { color: textColor }]}>{logic.formatPrice(item.monto)}</Text>
                                                <View style={[
                                                    styles.statusTagWeb,
                                                    { backgroundColor: item.estado === 'pendiente' ? 'rgba(234, 88, 12, 0.1)' : 'rgba(34, 197, 94, 0.1)' }
                                                ]}>
                                                    <Text style={[
                                                        styles.statusTagTextWeb,
                                                        { color: item.estado === 'pendiente' ? '#ea580c' : '#22c55e' }
                                                    ]}>{item.estado.toUpperCase()}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.rowActions}>
                                                {item.estado === 'pagado' ? (
                                                    <TouchableOpacity style={[styles.circleBtn, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                                                        <MaterialCommunityIcons name="file-pdf-box" size={26} color="#ef4444" />
                                                    </TouchableOpacity>
                                                ) : (
                                                    <Button size="sm" style={styles.payRowBtn}>Pagar</Button>
                                                )}
                                            </View>
                                        </View>
                                    ))
                                )}
                            </View>
                        </View>
                    </View>
                </ResponsiveContainer>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webNav: {
        height: 80,
        borderBottomWidth: 1,
        justifyContent: 'center',
        zIndex: 1000,
        ...Platform.select({
            web: {
                position: 'sticky',
                top: 0,
                backdropFilter: 'blur(12px)',
            }
        })
    },
    navContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
    },
    navBrandGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 40,
    },
    logo: {
        fontSize: 26,
        fontWeight: '900',
        color: PRIMARY_BLUE,
        letterSpacing: -1.5,
    },
    navLinks: {
        flexDirection: 'row',
        gap: 10,
    },
    navLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    navLinkActive: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    navLinkText: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    navActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconAction: {
        padding: 10,
        borderRadius: 50,
    },
    divider: {
        width: 1,
        height: 32,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 8,
    },
    navUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingLeft: 6,
        paddingRight: 16,
        paddingVertical: 6,
        borderRadius: 30,
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
    },
    scrollMain: {
        flex: 1,
    },
    mainWrapper: {
        paddingHorizontal: 24,
    },
    headerHero: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 60,
        marginBottom: 60,
    },
    title: {
        fontSize: 56,
        fontWeight: '900',
        letterSpacing: -2,
    },
    subtitle: {
        fontSize: 22,
        marginTop: 12,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 16,
        borderWidth: 1,
    },
    backText: {
        fontWeight: '700',
        fontSize: 16,
    },
    mainLayout: {
        flexDirection: 'row',
        gap: 48,
        marginBottom: 100,
    },
    sidebar: {
        width: 360,
        gap: 32,
    },
    balanceCardWeb: {
        padding: 48,
        borderRadius: 40,
        borderWidth: 1,
        ...Platform.select({
            web: {
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }
        })
    },
    sidebarLabel: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 32,
    },
    amountBox: {
        marginBottom: 40,
    },
    amountWeb: {
        fontSize: 56,
        fontWeight: '900',
        letterSpacing: -2,
    },
    currencyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
    },
    currencyWeb: {
        fontSize: 15,
        fontWeight: '700',
    },
    payNowBtnWeb: {
        height: 72,
        borderRadius: 20,
        fontSize: 18,
        fontWeight: '900',
        ...Platform.select({
            web: {
                boxShadow: '0 10px 20px rgba(59, 130, 246, 0.4)',
            }
        })
    },
    paidBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        height: 72,
        borderRadius: 20,
        justifyContent: 'center',
    },
    paidBadgeText: {
        color: '#22c55e',
        fontWeight: '900',
        fontSize: 16,
    },
    dividerSection: {
        height: 1,
        marginVertical: 32,
    },
    supportRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        justifyContent: 'center',
    },
    supportText: {
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    infoCardWeb: {
        padding: 40,
        borderRadius: 40,
        borderWidth: 1,
        alignItems: 'center',
    },
    infoIconBox: {
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    infoTitle: {
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 12,
    },
    infoDesc: {
        fontSize: 15,
        lineHeight: 24,
        textAlign: 'center',
    },
    feed: {
        flex: 1,
    },
    feedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
    },
    feedTitle: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    titleUnderline: {
        width: 60,
        height: 4,
        backgroundColor: PRIMARY_BLUE,
        marginTop: 8,
        borderRadius: 2,
    },
    exportBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 16,
        borderWidth: 1,
    },
    exportBtnText: {
        fontSize: 14,
        fontWeight: '800',
    },
    historyListWeb: {
        gap: 20,
    },
    historyRowWeb: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 32,
        borderRadius: 32,
        borderWidth: 1,
        ...Platform.select({
            web: {
                transition: 'transform 0.3s ease',
                ':hover': { transform: 'scale(1.01)' }
            }
        })
    },
    statusIconWeb: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowMain: {
        flex: 1,
        marginLeft: 28,
    },
    rowPeriod: {
        fontSize: 20,
        fontWeight: '800',
    },
    rowMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 6,
    },
    rowDate: {
        fontSize: 15,
    },
    rowAmount: {
        alignItems: 'flex-end',
        marginHorizontal: 48,
    },
    amountVal: {
        fontSize: 22,
        fontWeight: '900',
    },
    statusTagWeb: {
        marginTop: 8,
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    statusTagTextWeb: {
        fontSize: 11,
        fontWeight: '900',
    },
    rowActions: {
        width: 140,
        alignItems: 'flex-end',
    },
    circleBtn: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    payRowBtn: {
        height: 48,
        paddingHorizontal: 32,
        borderRadius: 14,
    },
    emptyStateWeb: {
        padding: 80,
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 40,
    }
});
