import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Platform,
    TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ResponsiveContainer, Button, PremiumHeader } from '../../../components';
import { useDocumentsScreen } from './useDocumentsScreen';

const SLATE_900 = '#0f172a';
const SLATE_800 = '#1e293b';
const SLATE_400 = '#94a3b8';
const SLATE_500 = '#64748b';
const PRIMARY_BLUE = '#3b82f6';

export default function DocumentsScreenWeb({ navigation }) {
    const logic = useDocumentsScreen();
    const { theme, isDark } = logic;

    const bgColor = SLATE_900;
    const cardBg = SLATE_800;
    const textColor = '#ffffff';
    const textSecondary = SLATE_400;
    const borderColor = 'rgba(255,255,255,0.1)';

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <PremiumHeader navigation={navigation} activeTab="CONDOMINIO" />

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.scrollMain}>
                <ResponsiveContainer maxWidth={1600} style={styles.mainWrapper}>
                    <View style={styles.headerHero}>
                        <View>
                            <Text style={[styles.title, { color: textColor }]}>Biblioteca de Documentos</Text>
                            <Text style={[styles.subtitle, { color: textSecondary }]}>Accede a actas, reglamentos y recursos oficiales de tu comunidad</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { borderColor: borderColor }]}>
                            <MaterialCommunityIcons name="chevron-left" size={24} color={textColor} />
                            <Text style={[styles.backText, { color: textColor }]}>Volver</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.topToolbar}>
                        <View style={[styles.searchBox, { backgroundColor: cardBg }]}>
                            <MaterialCommunityIcons name="magnify" size={28} color={SLATE_500} />
                            <TextInput
                                placeholder="Buscar por nombre de documento, fecha o categoría..."
                                placeholderTextColor={SLATE_500}
                                value={logic.searchQuery}
                                onChangeText={logic.handleSearch}
                                style={[styles.searchInput, { color: textColor }]}
                            />
                        </View>
                        <TouchableOpacity style={[styles.filterBtn, { backgroundColor: PRIMARY_BLUE }]}>
                            <MaterialCommunityIcons name="tune" size={22} color="#fff" />
                            <Text style={styles.filterBtnText}>Filtros Avanzados</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.mainGrid}>
                        {/* Main Feed */}
                        <View style={styles.feed}>
                            {logic.documentSections.map((section, sIdx) => (
                                <View key={sIdx} style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={[styles.sectionHeading, { color: textColor }]}>{section.title}</Text>
                                        <View style={styles.sectionDivider} />
                                    </View>
                                    <View style={styles.docsGrid}>
                                        {section.docs.map((doc) => (
                                            <TouchableOpacity
                                                key={doc.id}
                                                style={[
                                                    styles.webDocCard,
                                                    { backgroundColor: cardBg, borderColor },
                                                    doc.type === 'plano' && styles.planoCard
                                                ]}
                                            >
                                                {doc.type === 'plano' ? (
                                                    <View style={styles.planoLayout}>
                                                        <Image source={{ uri: doc.image }} style={styles.planoImg} />
                                                        <View style={styles.planoInfo}>
                                                            <Text style={[styles.docTitleWeb, { color: textColor }]}>{doc.title}</Text>
                                                            <Text style={[styles.docMetaWeb, { color: textSecondary }]}>Actualizado: {doc.updated} • {doc.size}</Text>
                                                            <View style={styles.actions}>
                                                                <TouchableOpacity style={[styles.btnIcon, { backgroundColor: PRIMARY_BLUE }]}>
                                                                    <MaterialCommunityIcons name="fullscreen" size={20} color="#fff" />
                                                                </TouchableOpacity>
                                                                <TouchableOpacity style={[styles.btnIcon, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                                                                    <MaterialCommunityIcons name="download" size={20} color={PRIMARY_BLUE} />
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                    </View>
                                                ) : (
                                                    <View style={styles.stdLayout}>
                                                        <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                                                            <MaterialCommunityIcons name={doc.icon || "file-pdf-box"} size={36} color={PRIMARY_BLUE} />
                                                        </View>
                                                        <View style={styles.stdInfo}>
                                                            <Text style={[styles.docTitleWeb, { color: textColor }]} numberOfLines={1}>{doc.title}</Text>
                                                            <Text style={[styles.docMetaWeb, { color: textSecondary }]}>{doc.size} • {doc.date}</Text>
                                                        </View>
                                                        <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                                                            <MaterialCommunityIcons name="download" size={24} color={PRIMARY_BLUE} />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Sidebar */}
                        <View style={styles.sidebar}>
                            <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor }]}>
                                <View style={styles.summaryIconBox}>
                                    <MaterialCommunityIcons name="shield-check" size={48} color={PRIMARY_BLUE} />
                                </View>
                                <Text style={[styles.summaryTitle, { color: textColor }]}>Repositorio Seguro</Text>
                                <Text style={[styles.summaryDesc, { color: textSecondary }]}>Todos los documentos están firmados digitalmente por la administración para tu seguridad.</Text>
                                <View style={styles.stats}>
                                    <View style={styles.statItem}>
                                        <Text style={[styles.statNum, { color: textColor }]}>124</Text>
                                        <Text style={[styles.statLabel, { color: SLATE_500 }]}>Archivos</Text>
                                    </View>
                                    <View style={styles.dividerStat} />
                                    <View style={styles.statItem}>
                                        <Text style={[styles.statNum, { color: textColor }]}>12.5GB</Text>
                                        <Text style={[styles.statLabel, { color: SLATE_500 }]}>Espacio</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={[styles.helpCard, { borderColor }]}>
                                <Text style={{ color: textColor, fontWeight: '800', marginBottom: 8 }}>¿No encuentras algo?</Text>
                                <Text style={{ color: textSecondary, fontSize: 13, lineHeight: 18 }}>Solicita copias físicas o aclaraciones en la oficina de administración.</Text>
                                <Button style={styles.helpBtn} size="sm">CONTACTAR ADMIN</Button>
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
    topToolbar: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 60,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 28,
        borderRadius: 24,
        height: 72,
        gap: 20,
        ...Platform.select({
            web: {
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            }
        })
    },
    searchInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        ...Platform.select({
            web: {
                outlineStyle: 'none',
            }
        })
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 40,
        borderRadius: 24,
        ...Platform.select({
            web: {
                boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)',
            }
        })
    },
    filterBtnText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 16,
    },
    mainGrid: {
        flexDirection: 'row',
        gap: 60,
        marginBottom: 100,
    },
    feed: {
        flex: 1,
        gap: 80,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        marginBottom: 32,
    },
    sectionHeading: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    sectionDivider: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    docsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
    },
    webDocCard: {
        width: 'calc(50% - 12px)',
        borderRadius: 32,
        borderWidth: 1,
        padding: 32,
        ...Platform.select({
            web: {
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                ':hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 30px rgba(0,0,0,0.3)',
                }
            }
        })
    },
    planoCard: {
        width: '100%',
    },
    stdLayout: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    iconBox: {
        width: 72,
        height: 72,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stdInfo: {
        flex: 1,
    },
    docTitleWeb: {
        fontSize: 20,
        fontWeight: '800',
    },
    docMetaWeb: {
        fontSize: 14,
        marginTop: 6,
    },
    downloadBtn: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    planoLayout: {
        flexDirection: 'row',
        gap: 40,
    },
    planoImg: {
        width: 280,
        height: 180,
        borderRadius: 24,
        resizeMode: 'cover',
    },
    planoInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 24,
    },
    btnIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sidebar: {
        width: 360,
        gap: 32,
    },
    summaryCard: {
        padding: 48,
        borderRadius: 40,
        borderWidth: 1,
        alignItems: 'center',
        gap: 24,
    },
    summaryIconBox: {
        width: 96,
        height: 96,
        borderRadius: 30,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryTitle: {
        fontSize: 24,
        fontWeight: '900',
    },
    summaryDesc: {
        fontSize: 15,
        lineHeight: 26,
        textAlign: 'center',
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 32,
        marginTop: 16,
        width: '100%',
        justifyContent: 'center',
    },
    dividerStat: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    statItem: {
        alignItems: 'center',
    },
    statNum: {
        fontSize: 22,
        fontWeight: '900',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
    },
    helpCard: {
        padding: 32,
        borderRadius: 32,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    helpBtn: {
        marginTop: 20,
        width: '100%',
    }
});
