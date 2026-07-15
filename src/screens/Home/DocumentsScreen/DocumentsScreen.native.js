import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    Platform,
    Linking,
    RefreshControl,
    Modal,
    TextInput,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Input, Button } from '../../../components';
import { useDocumentsScreen } from './useDocumentsScreen';

export default function DocumentsScreenNative({ navigation }) {
    const logic = useDocumentsScreen();
    const { theme, isDark } = logic;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.colors.inputBackground }]}>
                    <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Biblioteca</Text>
                {logic.canManageDocuments ? (
                    <TouchableOpacity style={styles.iconButton} onPress={() => logic.setAddModalVisible(true)}>
                        <View style={{ backgroundColor: theme.colors.primary, borderRadius: 20, width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 44 }} />
                )}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={logic.loading} onRefresh={logic.onRefresh} tintColor={theme.colors.primary} />
                }
            >
                <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Documentos</Text>

                {/* Search Bar Fixed - Removed extra container borders */}
                <View style={styles.searchContainer}>
                    <Input
                        placeholder="Buscar documentos..."
                        value={logic.searchQuery}
                        onChangeText={logic.handleSearch}
                        inputStyle={{ color: theme.colors.text }}
                        placeholderTextColor={theme.colors.placeholder}
                        leftIcon={<MaterialCommunityIcons name="magnify" size={20} color={theme.colors.placeholder} />}
                    />
                </View>

                {/* Sections */}
                {logic.documentSections.map((section, idx) => (
                    <View key={idx} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{section.title}</Text>
                        </View>

                        {section.docs.map((doc) => {
                            const handleOpenDoc = () => {
                                if (doc.url) Linking.openURL(doc.url).catch(err => console.error("Couldn't load page", err));
                            };

                            const confirmDelete = () => {
                                Alert.alert(
                                    "Eliminar Documento",
                                    "¿Estás seguro de que quieres eliminar este documento?",
                                    [
                                        { text: "Cancelar", style: "cancel" },
                                        { text: "Eliminar", style: "destructive", onPress: () => logic.handleDeleteDocument(doc.id) }
                                    ]
                                );
                            };

                            if (doc.type === 'plano' && doc.image) {
                                return (
                                    <View key={doc.id} style={[styles.flatCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                        <TouchableOpacity onPress={handleOpenDoc} style={[styles.previewContainer, { backgroundColor: theme.colors.inputBackground }]}>
                                            <Image source={{ uri: doc.image }} style={styles.previewImage} />
                                            <View style={styles.previewOverlay}>
                                                <MaterialCommunityIcons name="fullscreen" size={40} color="#fff" />
                                            </View>
                                        </TouchableOpacity>
                                        <View style={styles.flatFooter}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.flatTitle, { color: theme.colors.text }]}>{doc.title}</Text>
                                                <Text style={[styles.flatMeta, { color: theme.colors.textSecondary }]}>{doc.date}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row' }}>
                                                <TouchableOpacity onPress={handleOpenDoc} style={[styles.pdfBtn, { backgroundColor: theme.colors.primary, borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}>
                                                    <MaterialCommunityIcons name="download" size={16} color="#fff" />
                                                    <Text style={styles.pdfBtnText}>Abrir</Text>
                                                </TouchableOpacity>
                                                {logic.canManageDocuments && (
                                                    <TouchableOpacity onPress={confirmDelete} style={[styles.pdfBtn, { backgroundColor: '#ff4444', borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.3)', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}>
                                                        <MaterialCommunityIcons name="trash-can-outline" size={16} color="#fff" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                );
                            }

                            return (
                                <View key={doc.id} style={[styles.docCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                    <TouchableOpacity onPress={handleOpenDoc} style={styles.docInfo}>
                                        <View style={[styles.docIconContainer, { backgroundColor: isDark ? 'rgba(19, 91, 236, 0.2)' : 'rgba(19, 91, 236, 0.1)' }]}>
                                            <MaterialCommunityIcons name={doc.icon} size={24} color={theme.colors.primary} />
                                        </View>
                                        <View>
                                            <Text style={[styles.docTitle, { color: theme.colors.text }]}>{doc.title}</Text>
                                            <Text style={[styles.docMeta, { color: theme.colors.textSecondary }]}>{doc.size} • {doc.date}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <TouchableOpacity onPress={handleOpenDoc} style={[styles.downloadCircle, { backgroundColor: theme.colors.inputBackground, zIndex: 1 }]}>
                                            <MaterialCommunityIcons name="download" size={20} color={theme.colors.primary} />
                                        </TouchableOpacity>
                                        {logic.canManageDocuments && (
                                            <TouchableOpacity onPress={confirmDelete} style={[styles.downloadCircle, { backgroundColor: '#ffebee', marginLeft: -12 }]}>
                                                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ff4444" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ))}

                <View style={styles.footerInfo}>
                    <Text style={[styles.brandText, { color: theme.colors.placeholder }]}>Vecindario Premium Documents Cloud</Text>
                </View>
            </ScrollView>

            {/* Add Document Modal */}
            <Modal visible={logic.addModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card, maxHeight: '85%' }]}>
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Nuevo Documento</Text>

                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Título</Text>
                            <Input
                                placeholder="Ej: Reglamento Interno"
                                value={logic.newDoc.title}
                                onChangeText={(t) => logic.setNewDoc({ ...logic.newDoc, title: t })}
                            />

                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Archivo Local</Text>
                            <TouchableOpacity
                                onPress={logic.pickDocument}
                                style={[styles.filePickerBtn, { borderColor: theme.colors.primary, backgroundColor: isDark ? 'rgba(19, 91, 236, 0.1)' : 'rgba(19, 91, 236, 0.05)' }]}
                            >
                                <MaterialCommunityIcons name="file-upload-outline" size={24} color={theme.colors.primary} />
                                <Text style={[styles.filePickerText, { color: theme.colors.primary }]}>
                                    {logic.selectedFile ? logic.selectedFile.name : 'Seleccionar PDF o Imagen'}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.dividerContainer}>
                                <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                                <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>o usar enlace</Text>
                                <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                            </View>

                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>URL Directa</Text>
                            <Input
                                placeholder="https://..."
                                value={logic.newDoc.url}
                                onChangeText={(t) => logic.setNewDoc({ ...logic.newDoc, url: t })}
                                autoCapitalize="none"
                            />

                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Categoría</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                                {['reglamento', 'acta', 'plano', 'finanzas'].map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={{
                                            paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
                                            borderColor: logic.newDoc.category === cat ? theme.colors.primary : theme.colors.border,
                                            backgroundColor: logic.newDoc.category === cat ? theme.colors.primary : 'transparent'
                                        }}
                                        onPress={() => logic.setNewDoc({ ...logic.newDoc, category: cat })}
                                    >
                                        <Text style={{
                                            color: logic.newDoc.category === cat ? '#fff' : theme.colors.text,
                                            textTransform: 'capitalize',
                                            fontWeight: '600'
                                        }}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.modalActions}>
                                <Button
                                    title="Cancelar"
                                    type="outline"
                                    onPress={() => logic.setAddModalVisible(false)}
                                    style={{ flex: 1, marginRight: 8 }}
                                />
                                <Button
                                    title="Guardar"
                                    onPress={logic.handleAddDocument}
                                    loading={logic.isSaving}
                                    style={{ flex: 1 }}
                                />
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingBottom: 8,
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
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        paddingHorizontal: 16,
        paddingTop: 8,
        marginBottom: 16,
    },
    searchContainer: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderRadius: 12,
        paddingHorizontal: 16,
        gap: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewAll: {
        fontSize: 14,
        fontWeight: '500',
    },
    docCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    docInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    docIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    docTitle: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    docMeta: {
        fontSize: 12,
        marginTop: 2,
    },
    downloadCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    flatCard: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
    },
    previewContainer: {
        width: '100%',
        height: 200,
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    previewOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    flatFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: 16,
    },
    flatTitle: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    flatMeta: {
        fontSize: 12,
        marginTop: 2,
    },
    pdfBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    pdfBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
    },
    footerInfo: {
        marginTop: 24,
        alignItems: 'center',
        paddingBottom: 20,
    },
    updateText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1.5,
    },
    brandText: {
        fontSize: 10,
        marginTop: 4,
    },
    // --- Modal Styles ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: '900',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    filePickerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        marginBottom: 16,
        gap: 12,
    },
    filePickerText: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    }
});
