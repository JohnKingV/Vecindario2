import { useState, useEffect } from 'react';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../../../context/ThemeContext';
import { odooService } from '../../../services/odooService';
import { pdfService } from '../../../services/pdfService';
import { useAuth } from '../../../hooks/useAuth';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { Linking, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../../../config/supabase';
import { decode } from 'base64-arraybuffer';

export const usePaymentsScreen = (navigation) => {
    const { theme, isDark } = useTheme();
    const { user, profile } = useAuth(); // Get clean profile data
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generatingPdfId, setGeneratingPdfId] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [uploadingReceipt, setUploadingReceipt] = useState(false);
    const [transferHistory, setTransferHistory] = useState([]);
    const [feedback, setFeedback] = useState({ visible: false, type: 'info', title: '', message: '' });
    const [confirmDialog, setConfirmDialog] = useState({ visible: false, title: '', message: '', onConfirm: null });

    const showFeedback = (title, message, type = 'info') => {
        setFeedback({ visible: true, type, title, message });
    };

    useEffect(() => {
        if (user?.email) {
            loadPayments();
            loadTransferHistory();
        }
    }, [user]);

    const loadPayments = async () => {
        setLoading(true);
        try {
            // 1. Test de Conexión Básica (Opcional, lo mantenemos por diagnóstico)
            try {
                await odooService.getCompanyInfo();
            } catch (e) { /* ignore */ }

            // 2. Obtener Facturas
            const invoices = await odooService.getInvoices(user.email);

            // Mapeo de facturas Odoo al formato de la vista
            const formattedHistory = invoices.map(inv => {
                // Determinar descripción principal (ej. "Gasto Común" o la primera línea)
                let mainDescription = inv.name; // Fallback al ID de factura
                if (inv.lines && inv.lines.length > 0) {
                    const mainLine = inv.lines.reduce((prev, current) => (prev.price_total > current.price_total) ? prev : current);
                    mainDescription = mainLine.name;
                }

                const periodLabel = formatDate(inv.invoice_date);
                const capitalizedPeriod = periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1);
                const fullPeriodLabel = `Gasto Común: ${capitalizedPeriod}`;

                return {
                    id: inv.id,
                    mes_periodo: capitalizedPeriod,
                    title: fullPeriodLabel,
                    monto: inv.amount_total,
                    estado: inv.payment_state === 'not_paid' ? 'pendiente' : 'pagado',
                    name: inv.name, // Folio
                    dueDate: inv.invoice_date_due,
                    lines: inv.lines || [],
                    description: mainDescription,
                    accessUrl: inv.access_url,
                    accessToken: inv.access_token
                };
            });

            setHistory(formattedHistory);
        } catch (error) {
            console.error('Error loading payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePdf = async (invoiceItem) => {
        setGeneratingPdfId(invoiceItem.id);
        try {
            // Cargar el logo localmente y convertir a Base64
            let logoSrc = '';
            try {
                const logoAsset = Asset.fromModule(require('../../../../assets/images/icon.png'));
                if (!logoAsset.localUri) {
                    await logoAsset.downloadAsync();
                }
                const logoUri = logoAsset.localUri || logoAsset.uri;

                if (logoUri) {
                    const base64Logo = await FileSystem.readAsStringAsync(logoUri, {
                        encoding: FileSystem.EncodingType.Base64
                    });
                    logoSrc = `data:image/png;base64,${base64Logo}`;
                }
            } catch (e) {
                console.warn('Could not load logo for PDF, continuing without it', e);
            }

            // Datos del Condominio (Mock por ahora, idealmente vendría del perfil o config)
            const condoInfo = {
                nombre: profile?.comunidades?.nombre || 'Mi Condominio',
                direccion: profile?.comunidades?.direccion || 'Dirección del Condominio',
                ciudad: profile?.comunidades?.ciudad || ''
            };

            const uri = await pdfService.generateInvoicePDF(invoiceItem, profile, condoInfo, logoSrc);

            // Renombrar archivo para que al descargar tenga un nombre amigable
            const fileName = `Comprobante_${invoiceItem.mes_periodo.replace(/\s+/g, '_')}.pdf`;
            const newPath = FileSystem.documentDirectory + fileName;
            await FileSystem.copyAsync({ from: uri, to: newPath });

            await Sharing.shareAsync(newPath, {
                mimeType: 'application/pdf',
                dialogTitle: 'Descargar Comprobante',
                UTI: 'com.adobe.pdf'
            });
        } catch (error) {
            console.error('Error sharing PDF:', error);
            showFeedback('Error', 'No se pudo generar el PDF: ' + error.message, 'error');
        } finally {
            setGeneratingPdfId(null);
        }
    };

    const handlePayBalance = () => {
        if (totalBalance <= 0) return;
        setShowPaymentModal(true);
    };

    const handlePortalPayment = async () => {
        // Obtenemos la URL de pago de la primera factura pendiente
        const pendingInvoice = history.find(h => h.estado === 'pendiente');
        if (!pendingInvoice || !pendingInvoice.accessUrl) {
            // Fallback a la URL base de Odoo si no hay accessUrl
            const odooUrl = 'https://vecindario-app2.odoo.com'; // URL por defecto si falla
            showFeedback('Redirigiendo', 'Te llevaremos al portal de pagos de Odoo.', 'info');
            setTimeout(() => {
                Linking.openURL(odooUrl + '/my/invoices');
                setShowPaymentModal(false);
            }, 1500);
            return;
        }

        let fullUrl = `https://vecindario-app2.odoo.com${pendingInvoice.accessUrl}`;
        if (pendingInvoice.accessToken) {
            fullUrl += `?access_token=${pendingInvoice.accessToken}`;
        }

        setShowPaymentModal(false);

        try {
            await Linking.openURL(fullUrl);
        } catch (error) {
            showFeedback('Error', 'No se pudo abrir la página de pago: ' + error.message, 'error');
        }
    };

    const handleShowInfo = () => {
        setShowInfoModal(true);
    };

    const handleBankTransfer = () => {
        setShowPaymentModal(false);
        setShowTransferModal(true);
    };

    const handleSelectReceipt = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setSelectedReceipt(result.assets[0]);
            }
        } catch (error) {
            console.error('Error picking document:', error);
            showFeedback('Error', 'No se pudo seleccionar el archivo: ' + error.message, 'error');
        }
    };

    const handleUploadReceipt = async () => {
        if (!selectedReceipt) {
            showFeedback('Atención', 'Por favor seleccione un archivo primero.', 'info');
            return;
        }

        setUploadingReceipt(true);
        try {
            const fileUri = selectedReceipt.uri;
            const fileName = `${Date.now()}_${selectedReceipt.name}`;
            const filePath = `receipts/${user.id}/${fileName}`;

            // 1. Leer archivo como Base64
            const base64 = await FileSystem.readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // 2. Convertir Base64 a ArrayBuffer (Muy fiable en React Native)
            const arrayBuffer = decode(base64);

            // 3. Subir a Supabase Storage
            const { data, error: uploadError } = await supabase.storage
                .from('payments')
                .upload(filePath, arrayBuffer, {
                    contentType: selectedReceipt.mimeType,
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // 3. Obtener URL Pública
            const { data: { publicUrl } } = supabase.storage
                .from('payments')
                .getPublicUrl(filePath);

            // 4. Guardar en Base de Datos
            const { data: dbData, error: dbError } = await supabase
                .from('payment_receipts')
                .insert({
                    user_id: user.id,
                    user_email: user.email,
                    amount: totalBalance,
                    receipt_url: publicUrl,
                    file_name: selectedReceipt.name,
                    status: 'pending'
                })
                .select()
                .single();

            if (dbError) throw dbError;

            // 5. Notificar a Odoo y Limpiar
            await confirmBankTransfer(true);

            // 6. Actualización "Tiempo Real" local (Optimistic update)
            const newReceipt = dbData || {
                id: Date.now(),
                user_id: user.id,
                user_email: user.email,
                amount: totalBalance,
                receipt_url: publicUrl,
                file_name: selectedReceipt.name,
                status: 'pending',
                created_at: new Date().toISOString()
            };
            setTransferHistory(prev => [newReceipt, ...prev]);

            showFeedback('¡Éxito!', 'Comprobante enviado correctamente. Revisaremos tu pago a la brevedad.', 'success');
            setSelectedReceipt(null);
            setShowTransferModal(false);
            loadTransferHistory();
        } catch (error) {
            console.error('Error uploading receipt:', error);
            showFeedback('Error', 'No se pudo subir el comprobante: ' + error.message, 'error');
        } finally {
            setUploadingReceipt(false);
        }
    };

    const loadTransferHistory = async () => {
        if (!user?.id) return;
        try {
            const { data, error } = await supabase
                .from('payment_receipts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTransferHistory(data || []);
        } catch (e) {
            console.warn('Could not load transfer history:', e);
        }
    };

    const handleDeleteReceipt = (receipt) => {
        setConfirmDialog({
            visible: true,
            title: "Eliminar Comprobante",
            message: "¿Estás seguro de que deseas eliminar este comprobante? Esta acción no se puede deshacer.",
            onConfirm: () => processDeleteReceipt(receipt)
        });
    };

    const processDeleteReceipt = async (receipt) => {
        setConfirmDialog({ ...confirmDialog, visible: false });
        try {
            setLoading(true);

            // 1. Obtener el path correcto del archivo en Storage
            // La URL es: .../storage/v1/object/public/payments/receipts/userId/fileName
            // El path que necesita .remove() es: receipts/userId/fileName
            let filePath = '';
            if (receipt.receipt_url.includes('/payments/')) {
                filePath = receipt.receipt_url.split('/payments/')[1].split('?')[0];
            } else {
                // Fallback si la URL tiene otro formato
                const urlParts = receipt.receipt_url.split('/');
                const fileName = urlParts[urlParts.length - 1].split('?')[0];
                filePath = `receipts/${user.id}/${fileName}`;
            }

            // 2. Eliminar de Base de Datos PRIMERO (si falla RLS aquí, se detiene)
            const { error: dbError } = await supabase
                .from('payment_receipts')
                .delete()
                .eq('id', receipt.id);

            if (dbError) throw dbError;

            // 3. Eliminar de Storage (opcional/secundario, no bloqueante si falla el registro ya no existe)
            try {
                const { error: storageError } = await supabase.storage
                    .from('payments')
                    .remove([filePath]);
                if (storageError) console.warn('Storage delete warning:', storageError);
            } catch (se) {
                console.warn('Storage delete exception:', se);
            }

            // 4. Actualización "Tiempo Real" (Filtramos localmente de inmediato)
            setTransferHistory(prev => prev.filter(item => item.id !== receipt.id));

            showFeedback('Eliminado', 'El comprobante ha sido eliminado correctamente.', 'success');

            // Re-sincronizar por seguridad
            await loadTransferHistory();
        } catch (error) {
            console.error('Error deleting receipt:', error);
            showFeedback('Error', 'No se pudo eliminar el comprobante: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const confirmBankTransfer = async (fromUpload = false) => {
        if (!fromUpload) return; // Forzamos a que pase por el upload

        setLoading(true);
        try {
            const partners = await odooService.call('res.partner', 'search_read', [
                [['email', '=', user.email]]
            ], { fields: ['id'], limit: 1 });

            if (partners && partners.length > 0) {
                const partnerId = partners[0].id;

                await odooService.registerPayment({
                    amount: totalBalance,
                    partnerId: partnerId,
                    ref: `Transferencia - Revision Comprobante - ${new Date().toLocaleDateString()}`
                });
            }
            await loadPayments();
        } catch (e) {
            console.warn('Odoo registration failed, but receipt was uploaded', e);
        } finally {
            setLoading(false);
        }
    };


    const formatDate = (dateString) => {
        if (!dateString) return 'S/F';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
    };

    const formatPrice = (price) => {
        if (!price && price !== 0) return '$0';
        return '$' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const totalBalance = history
        .filter(h => h.estado === 'pendiente')
        .reduce((sum, h) => sum + h.monto, 0);

    return {
        theme,
        isDark,
        history,
        loading,
        totalBalance,
        formatPrice,
        loadPayments,
        handleGeneratePdf,
        handlePayBalance,
        handlePortalPayment,
        handleBankTransfer,
        confirmBankTransfer,
        handleSelectReceipt,
        handleUploadReceipt,
        handleDeleteReceipt,
        selectedReceipt,
        uploadingReceipt,
        transferHistory,
        handleShowInfo,
        showPaymentModal,
        setShowPaymentModal,
        showTransferModal,
        setShowTransferModal,
        showInfoModal,
        setShowInfoModal,
        feedback,
        setFeedback,
        confirmDialog,
        setConfirmDialog,
        generatingPdfId,
        navigation
    };
};
