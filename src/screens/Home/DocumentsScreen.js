import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    StatusBar,
    Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Input } from '../../components';
import { useTheme } from '../../context/ThemeContext';

const DocumentsScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Biblioteca</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <MaterialCommunityIcons name="information-outline" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Documentos</Text>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={[styles.searchBar, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border, borderWidth: 1 }]}>
                        <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.placeholder} />
                        <Input
                            placeholder="Buscar documentos (ej. Acta 2023)"
                            value=""
                            inputStyle={{ color: theme.colors.text }}
                            placeholderTextColor={theme.colors.placeholder}
                            containerStyle={{ borderWidth: 0, backgroundColor: 'transparent', paddingHorizontal: 0, flex: 1 }}
                        />
                    </View>
                </View>

                {/* Section: Reglamentos */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Reglamentos</Text>
                        <TouchableOpacity>
                            <Text style={[styles.viewAll, { color: theme.colors.primary }]}>Ver todos</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.docCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <View style={styles.docInfo}>
                            <View style={[styles.docIconContainer, { backgroundColor: isDark ? 'rgba(19, 91, 236, 0.2)' : 'rgba(19, 91, 236, 0.1)' }]}>
                                <MaterialCommunityIcons name="file-document" size={24} color={theme.colors.primary} />
                            </View>
                            <View>
                                <Text style={[styles.docTitle, { color: theme.colors.text }]}>Manual de Convivencia</Text>
                                <Text style={[styles.docMeta, { color: theme.colors.textSecondary }]}>1.2 MB • 15/01/2024</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={[styles.downloadCircle, { backgroundColor: theme.colors.inputBackground }]}>
                            <MaterialCommunityIcons name="download" size={20} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.docCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <View style={styles.docInfo}>
                            <View style={[styles.docIconContainer, { backgroundColor: isDark ? 'rgba(19, 91, 236, 0.2)' : 'rgba(19, 91, 236, 0.1)' }]}>
                                <MaterialCommunityIcons name="gavel" size={24} color={theme.colors.primary} />
                            </View>
                            <View>
                                <Text style={[styles.docTitle, { color: theme.colors.text }]}>Estatutos del Condominio</Text>
                                <Text style={[styles.docMeta, { color: theme.colors.textSecondary }]}>3.5 MB • 20/12/2023</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={[styles.downloadCircle, { backgroundColor: theme.colors.inputBackground }]}>
                            <MaterialCommunityIcons name="download" size={20} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Section: Actas */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Actas de Asamblea</Text>
                    <View style={[styles.listCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <TouchableOpacity style={[styles.listItem, { borderBottomColor: theme.colors.border }]}>
                            <View style={styles.itemInner}>
                                <MaterialCommunityIcons name="history" size={20} color={theme.colors.primary} />
                                <View>
                                    <Text style={[styles.itemTitle, { color: theme.colors.text }]}>Acta Ordinaria 2023</Text>
                                    <Text style={[styles.itemMeta, { color: theme.colors.textSecondary }]}>850 KB • Oct 12, 2023</Text>
                                </View>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.listItem, { borderBottomWidth: 0 }]}>
                            <View style={styles.itemInner}>
                                <MaterialCommunityIcons name="history" size={20} color={theme.colors.primary} />
                                <View>
                                    <Text style={[styles.itemTitle, { color: theme.colors.text }]}>Extraordinaria Presupuesto</Text>
                                    <Text style={[styles.itemMeta, { color: theme.colors.textSecondary }]}>1.1 MB • Nov 05, 2023</Text>
                                </View>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Section: Planos */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Planos y Mapas</Text>
                    <View style={[styles.flatCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <View style={[styles.previewContainer, { backgroundColor: theme.colors.inputBackground }]}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1503387762-592dea58dc27?auto=format&fit=crop&q=80&w=800' }}
                                style={styles.previewImage}
                            />
                            <View style={styles.previewOverlay}>
                                <MaterialCommunityIcons name="fullscreen" size={40} color="#fff" />
                            </View>
                        </View>
                        <View style={styles.flatFooter}>
                            <View>
                                <Text style={[styles.flatTitle, { color: theme.colors.text }]}>Plano Hidráulico General</Text>
                                <Text style={[styles.flatMeta, { color: theme.colors.textSecondary }]}>Actualizado: hace 2 meses</Text>
                            </View>
                            <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: theme.colors.primary }]}>
                                <MaterialCommunityIcons name="download" size={16} color="#fff" />
                                <Text style={styles.pdfBtnText}>PDF</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.footerInfo}>
                    <Text style={[styles.updateText, { color: theme.colors.textSecondary }]}>ÚLTIMA ACTUALIZACIÓN: HOY, 08:30 AM</Text>
                    <Text style={[styles.brandText, { color: theme.colors.placeholder }]}>Vecindario Premium Documents Cloud</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f6f6f8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingBottom: 8,
        backgroundColor: 'rgba(246, 246, 248, 0.8)',
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
    pageTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111318',
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
        backgroundColor: '#fff',
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
    searchInput: {
        fontSize: 15,
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
        color: '#111318',
        marginBottom: 12,
    },
    viewAll: {
        fontSize: 14,
        fontWeight: '500',
        color: '#135bec',
    },
    docCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 1,
            },
        }),
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
        backgroundColor: 'rgba(19, 91, 236, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    docTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#111318',
    },
    docMeta: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
    downloadCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    itemInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111318',
    },
    itemMeta: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
    flatCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    previewContainer: {
        width: '100%',
        height: 200,
        backgroundColor: '#f1f5f9',
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
        color: '#111318',
    },
    flatMeta: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
    pdfBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#135bec',
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
        color: '#94a3b8',
        letterSpacing: 1.5,
    },
    brandText: {
        fontSize: 10,
        color: '#cbd5e1',
        marginTop: 4,
    },
});

export default DocumentsScreen;
