import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    ImageBackground,
    Modal,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, LoadingDots } from '../../../components';
import { usePaymentsScreen } from './usePaymentsScreen';

export default function PaymentsScreenNative({ navigation }) {
    const logic = usePaymentsScreen(navigation);
    const { theme, isDark } = logic;

    if (logic.loading && logic.history.length === 0) {
        return (
            <SafeAreaView style={StyleSheet.flatten([styles.container, { backgroundColor: theme.colors.background }])}>
                <View style={styles.loadingContainer}>
                    <Text style={StyleSheet.flatten([styles.loadingText, { color: theme.colors.textSecondary }])}>
                        Estamos cargando su información de pagos de gastos comunes
                    </Text>
                    <LoadingDots size={12} color={theme.colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={StyleSheet.flatten([styles.container, { backgroundColor: theme.colors.background }])} edges={['top']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={StyleSheet.flatten([styles.appBar, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }])}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={StyleSheet.flatten([styles.backBtn, { backgroundColor: theme.colors.inputBackground }])}>
                    <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Pago de Gastos Comunes</Text>
                <TouchableOpacity style={styles.iconButton} onPress={logic.handleShowInfo}>
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
                                <Text style={[styles.amountText, { color: theme.colors.text }]}>{logic.formatPrice(logic.totalBalance)}</Text>
                                <Text style={[styles.currencyText, { color: theme.colors.textSecondary }]}>CLP</Text>
                            </View>

                            <View style={styles.cardFooter}>
                                <Text style={[styles.footerLabel, { color: theme.colors.textSecondary }]}>Balance Pendiente</Text>
                                {logic.totalBalance > 0 && (
                                    <Button
                                        contentStyle={[styles.payBtn, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]}
                                        textStyle={styles.payBtnText}
                                        onPress={logic.handlePayBalance}
                                        loading={logic.loading && logic.history.length > 0}
                                    >
                                        Pagar Ahora
                                    </Button>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Transfer Receipt History */}
                {logic.transferHistory.length > 0 && (
                    <View style={styles.transferHistorySection}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Comprobantes de Transferencias Bancarias</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
                            {logic.transferHistory.map((receipt) => (
                                <TouchableOpacity
                                    key={receipt.id}
                                    style={StyleSheet.flatten([styles.receiptCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }])}
                                    onPress={() => Linking.openURL(receipt.receipt_url)}
                                >
                                    <View style={{ marginTop: 20, alignItems: 'center' }}>
                                        <MaterialCommunityIcons name="file-document-outline" size={32} color={theme.colors.primary} />
                                        <Text style={[styles.receiptAmount, { color: theme.colors.text }]} numberOfLines={1}>
                                            {logic.formatPrice(receipt.amount)}
                                        </Text>
                                        <Text style={StyleSheet.flatten([styles.receiptDate, { color: theme.colors.textSecondary }])}>
                                            {new Date(receipt.created_at).toLocaleDateString()}
                                        </Text>

                                        <View style={StyleSheet.flatten([styles.receiptStatus, { backgroundColor: receipt.status === 'confirmed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(234, 88, 12, 0.1)', marginTop: 4 }])}>
                                            <MaterialCommunityIcons
                                                name={receipt.status === 'confirmed' ? 'check-decagram' : 'clock-outline'}
                                                size={10}
                                                color={receipt.status === 'confirmed' ? '#10b981' : '#ea580c'}
                                            />
                                            <Text style={[styles.statusMiniText, { color: receipt.status === 'confirmed' ? '#10b981' : '#ea580c' }]}>
                                                {receipt.status === 'confirmed' ? 'Listo' : 'Pendiente'}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Delete Button */}
                                    <TouchableOpacity
                                        style={styles.deleteReceiptBtn}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            logic.handleDeleteReceipt(receipt);
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        <MaterialCommunityIcons name="close" size={12} color="#fff" />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* History Section */}
                <View style={styles.historySection}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Historial de Pagos</Text>
                    </View>

                    <View style={styles.listContainer}>
                        {logic.history.length === 0 ? (
                            <View style={{ padding: 40, alignItems: 'center' }}>
                                <Text style={{ color: theme.colors.textSecondary }}>No hay movimientos registrados</Text>
                            </View>
                        ) : logic.history.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={StyleSheet.flatten([styles.historyItem, { backgroundColor: theme.colors.card }])}
                                activeOpacity={0.7}
                                onPress={() => { }}
                            >
                                <View style={styles.itemLeft}>
                                    <View style={StyleSheet.flatten([styles.iconBg, { backgroundColor: item.estado === 'pendiente' ? (isDark ? 'rgba(234, 88, 12, 0.2)' : '#fff7ed') : (isDark ? 'rgba(22, 163, 74, 0.2)' : '#f0fdf4') }])}>
                                        <MaterialCommunityIcons
                                            name={item.estado === 'pendiente' ? 'calendar-clock' : 'calendar-check'}
                                            size={24}
                                            color={item.estado === 'pendiente' ? '#ea580c' : theme.colors.success}
                                        />
                                    </View>
                                    <View>
                                        <Text style={[styles.itemMonth, { color: theme.colors.text }]}>{item.title}</Text>
                                        <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 }}>{item.mes_periodo.toLowerCase()}</Text>
                                        <View style={styles.itemMetaRow}>
                                            <Text style={[styles.itemAmount, { color: theme.colors.textSecondary }]}>{logic.formatPrice(item.monto)}</Text>
                                            <View style={[styles.dot, { backgroundColor: theme.colors.border }]} />
                                            <Text style={[styles.statusText, { color: item.estado === 'pendiente' ? '#ea580c' : theme.colors.success }]}>
                                                {item.estado?.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* PDF Button */}
                                <TouchableOpacity
                                    style={StyleSheet.flatten([styles.downloadBtn, { backgroundColor: isDark ? theme.colors.accent : '#f8fafc' }])}
                                    onPress={() => logic.handleGeneratePdf(item)}
                                    disabled={logic.generatingPdfId === item.id}
                                >
                                    {logic.generatingPdfId === item.id ? (
                                        <ActivityIndicator size="small" color={theme.colors.primary} />
                                    ) : (
                                        <MaterialCommunityIcons name="file-pdf-box" size={24} color={theme.colors.primary} />
                                    )}
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
            {/* Modal de Selección de Pago */}
            <Modal
                visible={logic.showPaymentModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => logic.setShowPaymentModal(false)}
            >
                <View style={StyleSheet.flatten([styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }])}>
                    <View style={StyleSheet.flatten([styles.modalContent, { backgroundColor: theme.colors.background }])}>
                        <View style={styles.modalHeader}>
                            <Text style={StyleSheet.flatten([styles.modalTitle, { color: theme.colors.text }])}>Selecciona Método de Pago</Text>
                            <TouchableOpacity onPress={() => logic.setShowPaymentModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={StyleSheet.flatten([styles.paymentOption, { borderColor: theme.colors.border }])}
                            onPress={logic.handlePortalPayment}
                        >
                            <View style={StyleSheet.flatten([styles.optionIcon, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }])}>
                                <MaterialCommunityIcons name="credit-card-outline" size={24} color="#2563eb" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={StyleSheet.flatten([styles.optionTitle, { color: theme.colors.text }])}>Pago en Línea</Text>
                                <Text style={StyleSheet.flatten([styles.optionSub, { color: theme.colors.textSecondary }])}>Débito o Crédito a través de Odoo</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={StyleSheet.flatten([styles.paymentOption, { borderColor: theme.colors.border }])}
                            onPress={logic.handleBankTransfer}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                <MaterialCommunityIcons name="bank-outline" size={24} color="#10b981" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.optionTitle, { color: theme.colors.text }]}>Transferencia Bancaria</Text>
                                <Text style={[styles.optionSub, { color: theme.colors.textSecondary }]}>Informa tu depósito hoy</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>

                        <Text style={StyleSheet.flatten([styles.balanceNotice, { color: theme.colors.textSecondary }])}>
                            Monto a Pagar: <Text style={StyleSheet.flatten([{ color: theme.colors.primary, fontWeight: '700' }])}>{logic.formatPrice(logic.totalBalance)}</Text>
                        </Text>
                    </View>
                </View>
            </Modal>

            {/* Modal Informativo del Módulo */}
            <Modal
                visible={logic.showInfoModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => logic.setShowInfoModal(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.background, paddingBottom: 24 }]}>
                        <View style={styles.modalHeader}>
                            <View style={[styles.optionIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)', marginRight: 12 }]}>
                                <MaterialCommunityIcons name="information-variant" size={24} color="#6366f1" />
                            </View>
                            <Text style={[styles.modalTitle, { color: theme.colors.text, flex: 1 }]}>Información del Módulo</Text>
                            <TouchableOpacity onPress={() => logic.setShowInfoModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.infoDescription, { color: theme.colors.textSecondary }]}>
                            Gestione sus compromisos financieros de forma simple y transparente.
                        </Text>

                        <View style={styles.infoFeatures}>
                            <InfoFeatureItem
                                icon="bank-transfer"
                                color="#2563eb"
                                title="Balance Actual"
                                desc="Visualice su saldo pendiente actualizado al instante."
                                theme={theme}
                            />
                            <InfoFeatureItem
                                icon="history"
                                color="#10b981"
                                title="Historial Completo"
                                desc="Acceda a todos sus cargos históricos desde Odoo."
                                theme={theme}
                            />
                            <InfoFeatureItem
                                icon="file-pdf-box"
                                color="#ef4444"
                                title="Comprobantes PDF"
                                desc="Descargue recibos oficiales con validez informativa."
                                theme={theme}
                            />
                            <InfoFeatureItem
                                icon="credit-card-check"
                                color="#f97316"
                                title="Pagos Flexibles"
                                desc="Pague vía portal web o informe transferencias."
                                theme={theme}
                            />
                        </View>

                        <Button
                            onPress={() => logic.setShowInfoModal(false)}
                            style={{ marginTop: 20 }}
                        >
                            Entendido
                        </Button>
                    </View>
                </View>
            </Modal>

            {/* Modal de Detalles de Transferencia */}
            <Modal
                visible={logic.showTransferModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => logic.setShowTransferModal(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.background, paddingBottom: 24 }]}>
                        <View style={styles.modalHeader}>
                            <View style={[styles.optionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)', marginRight: 12 }]}>
                                <MaterialCommunityIcons name="bank-outline" size={24} color="#10b981" />
                            </View>
                            <Text style={[styles.modalTitle, { color: theme.colors.text, flex: 1 }]}>Transferencia Bancaria</Text>
                            <TouchableOpacity onPress={() => logic.setShowTransferModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.infoDescription, { color: theme.colors.textSecondary, marginBottom: 15 }]}>
                            Por favor realice la transferencia con los siguientes datos:
                        </Text>

                        <View style={[styles.balanceCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, padding: 20, marginBottom: 20, overflow: 'visible', elevation: 0 }]}>
                            <View style={styles.transferRow}>
                                <Text style={[styles.transferLabel, { color: theme.colors.textSecondary }]}>BANCO:</Text>
                                <Text style={[styles.transferValue, { color: theme.colors.text }]}>BancoEstado</Text>
                            </View>
                            <View style={styles.transferRow}>
                                <Text style={[styles.transferLabel, { color: theme.colors.textSecondary }]}>CUENTA:</Text>
                                <Text style={[styles.transferValue, { color: theme.colors.text }]}>123456789</Text>
                            </View>
                            <View style={styles.transferRow}>
                                <Text style={[styles.transferLabel, { color: theme.colors.textSecondary }]}>RUT:</Text>
                                <Text style={[styles.transferValue, { color: theme.colors.text }]}>76.123.456-K</Text>
                            </View>
                            <View style={styles.transferRow}>
                                <Text style={[styles.transferLabel, { color: theme.colors.textSecondary }]}>EMAIL:</Text>
                                <Text style={[styles.transferValue, { color: theme.colors.text }]}>pagos@vecindario.cl</Text>
                            </View>
                        </View>

                        <Text style={[styles.infoDescription, { color: theme.colors.text, fontWeight: '600', textAlign: 'center' }]}>
                            ¿Deseas registrar este pago en el sistema ahora?
                        </Text>

                        <View style={{ gap: 12, marginTop: 12 }}>
                            <Button
                                onPress={logic.handleSelectReceipt}
                                variant="primary"
                                icon={<MaterialCommunityIcons name="file-plus" size={20} color="#fff" />}
                            >
                                {logic.selectedReceipt ? 'Cambiar Archivo' : 'Adjuntar Comprobante'}
                            </Button>
                            {logic.selectedReceipt && (
                                <View style={{ padding: 12, backgroundColor: 'rgba(37, 99, 235, 0.05)', borderRadius: 12, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 13, color: theme.colors.primary, fontWeight: '600' }}>
                                        📎 {logic.selectedReceipt.name}
                                    </Text>
                                    <Button
                                        onPress={logic.handleUploadReceipt}
                                        loading={logic.uploadingReceipt}
                                        style={{ marginTop: 12 }}
                                        fullWidth
                                    >
                                        Subir y Registrar Pago
                                    </Button>
                                </View>
                            )}
                            <Button
                                onPress={() => logic.setShowTransferModal(false)}
                                variant="outline"
                            >
                                Cancelar
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal de Feedback (Éxito/Error/Info) */}
            <Modal
                visible={logic.feedback.visible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => logic.setFeedback({ ...logic.feedback, visible: false })}
            >
                <View style={StyleSheet.flatten([styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }])}>
                    <View style={StyleSheet.flatten([styles.modalContent, { backgroundColor: theme.colors.background, paddingBottom: 24, alignItems: 'center' }])}>
                        <View style={StyleSheet.flatten([
                            styles.featureIcon,
                            {
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                marginBottom: 16,
                                backgroundColor: logic.feedback.type === 'success' ? 'rgba(16, 185, 129, 0.1)' :
                                    logic.feedback.type === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                                        'rgba(37, 99, 235, 0.1)'
                            }
                        ])}>
                            <MaterialCommunityIcons
                                name={logic.feedback.type === 'success' ? 'check-circle' :
                                    logic.feedback.type === 'error' ? 'alert-circle' :
                                        'information'}
                                size={40}
                                color={logic.feedback.type === 'success' ? '#10b981' :
                                    logic.feedback.type === 'error' ? '#ef4444' :
                                        '#2563eb'}
                            />
                        </View>

                        <Text style={StyleSheet.flatten([styles.modalTitle, { color: theme.colors.text, marginBottom: 8, textAlign: 'center' }])}>
                            {logic.feedback.title}
                        </Text>

                        <Text style={StyleSheet.flatten([styles.infoDescription, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 24 }])}>
                            {logic.feedback.message}
                        </Text>

                        <Button
                            onPress={() => logic.setFeedback({ ...logic.feedback, visible: false })}
                            variant="primary"
                            fullWidth
                        >
                            Entendido
                        </Button>
                    </View>
                </View>
            </Modal>

            {/* Modal de Confirmación Personalizado */}
            <Modal
                visible={logic.confirmDialog.visible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => logic.setConfirmDialog({ ...logic.confirmDialog, visible: false })}
            >
                <View style={StyleSheet.flatten([styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }])}>
                    <View style={StyleSheet.flatten([styles.modalContent, { backgroundColor: theme.colors.background, paddingBottom: 24, alignItems: 'center' }])}>
                        <View style={StyleSheet.flatten([
                            styles.featureIcon,
                            {
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                marginBottom: 16,
                                backgroundColor: 'rgba(239, 68, 68, 0.1)'
                            }
                        ])}>
                            <MaterialCommunityIcons
                                name="alert-outline"
                                size={40}
                                color="#ef4444"
                            />
                        </View>

                        <Text style={StyleSheet.flatten([styles.modalTitle, { color: theme.colors.text, marginBottom: 8, textAlign: 'center' }])}>
                            {logic.confirmDialog.title}
                        </Text>

                        <Text style={StyleSheet.flatten([styles.infoDescription, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 24 }])}>
                            {logic.confirmDialog.message}
                        </Text>

                        <View style={{ width: '100%', gap: 12 }}>
                            <Button
                                onPress={logic.confirmDialog.onConfirm}
                                variant="danger"
                                fullWidth
                            >
                                Eliminar
                            </Button>
                            <Button
                                onPress={() => logic.setConfirmDialog({ ...logic.confirmDialog, visible: false })}
                                variant="outline"
                                fullWidth
                            >
                                Cancelar
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
    );
}

const InfoFeatureItem = ({ icon, color, title, desc, theme }) => (
    <View style={styles.featureItem}>
        <View style={StyleSheet.flatten([styles.featureIcon, { backgroundColor: color + '15' }])}>
            <MaterialCommunityIcons name={icon} size={20} color={color} />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={StyleSheet.flatten([styles.featureTitle, { color: theme.colors.text }])}>{title}</Text>
            <Text style={StyleSheet.flatten([styles.featureDesc, { color: theme.colors.textSecondary }])}>{desc}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    iconButton: {
        padding: 8,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    loadingText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: '500',
        lineHeight: 24,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    balanceSection: {
        padding: 16,
    },
    balanceCard: {
        borderRadius: 24,
        borderWidth: 1,
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
    },
    currencyText: {
        fontSize: 14,
        fontWeight: '500',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    footerLabel: {
        fontSize: 14,
    },
    payBtn: {
        paddingHorizontal: 20,
        paddingVertical: 0,
        borderRadius: 100,
        height: 42,
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
    },
    itemMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    itemAmount: {
        fontSize: 13,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Nuevos estilos Modal de Pago
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 16,
    },
    optionIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    optionSub: {
        fontSize: 12,
    },
    balanceNotice: {
        textAlign: 'center',
        marginTop: 8,
        fontSize: 13,
    },
    infoDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },
    infoFeatures: {
        gap: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    featureDesc: {
        fontSize: 12,
        lineHeight: 16,
    },
    transferRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    transferLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    transferValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    transferHistorySection: {
        marginBottom: 24,
    },
    receiptCard: {
        width: 130,
        padding: 12,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        paddingTop: 16,
    },
    receiptStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusMiniText: {
        fontSize: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    receiptAmount: {
        fontSize: 13,
        fontWeight: 'bold',
        marginTop: 4,
    },
    receiptDate: {
        fontSize: 9,
    },
    deleteReceiptBtn: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#ef4444',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        zIndex: 10,
    }
});
