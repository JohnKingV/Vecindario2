import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Button, ImageViewerModal } from '../../../components';
import { useUserProfileScreen } from './useUserProfileScreen';

export default function UserProfileScreenNative({ route, navigation }) {
    const logic = useUserProfileScreen(route, navigation);
    const { profile, loading, theme, isDark, isMe } = logic;

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
                <Text style={{ color: theme.colors.text }}>No se pudo cargar el perfil</Text>
                <Button onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>Volver</Button>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
            <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.colors.inputBackground }]}>
                    <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Perfil del Vecino</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.profileCard, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.profileHeaderMain}>
                        <View style={styles.centeringWrapper}>
                            <TouchableOpacity
                                onPress={() => profile.foto_url && logic.setIsViewerVisible(true)}
                                activeOpacity={profile.foto_url ? 0.8 : 1}
                            >
                                <Avatar
                                    uri={profile.foto_url}
                                    name={profile.nombre}
                                    size="xl"
                                    border
                                    status={profile.status}
                                    featured={profile.raiting_ventas >= 4.0}
                                    style={{ alignSelf: 'center' }}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.nameArea}>
                            <Text style={[styles.userName, { color: theme.colors.text }]}>
                                {profile.nombre}
                            </Text>
                            <Text style={[styles.userRole, { color: theme.colors.textSecondary }]}>
                                {profile.torre ? `Torre ${profile.torre} • ` : ''}Depto {profile.depto || 'S/N'}
                            </Text>
                            <Text style={[styles.userRole, { color: theme.colors.primary, fontSize: 14, marginTop: 2 }]}>
                                {{
                                    'admin': 'Administrador del Sistema',
                                    'mayordomo': 'Mayordomo',
                                    'conserje': 'Conserje',
                                    'comite': 'Miembro del Comité',
                                    'vecino': 'Residente'
                                }[profile.role] || 'Residente'}
                            </Text>
                        </View>

                        {profile.raiting_ventas >= 4.0 && (
                            <View style={[styles.featuredBadgeContainer, { backgroundColor: isDark ? 'rgba(251, 146, 60, 0.2)' : '#fff7ed', borderColor: isDark ? '#fb923c' : '#ffedd5' }]}>
                                <MaterialCommunityIcons name="star" size={16} color="#fb923c" />
                                <Text style={[styles.featuredBadgeText, { color: isDark ? '#fb923c' : '#9a3412' }]}>Vecino destacado</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>{profile.stats?.novedades || 0}</Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Avisos</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>{profile.stats?.ventas || 0}</Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Ventas</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
                        <View style={styles.statItem}>
                            <View style={styles.ratingRow}>
                                <Text style={[styles.statValue, { color: theme.colors.text }]}>{profile.stats?.rating?.toFixed(1) || '5.0'}</Text>
                                <MaterialCommunityIcons name="star" size={16} color="#fb923c" />
                            </View>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Reputación</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>INFORMACIÓN Y CONTACTO</Text>
                    <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
                        {profile.telefono && (
                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons name="phone-outline" size={20} color={theme.colors.primary} />
                                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>{profile.telefono}</Text>
                            </View>
                        )}
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="email-outline" size={20} color={theme.colors.primary} />
                            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                                {profile.email}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="check-decagram" size={20} color={theme.colors.success} />
                            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                                {profile.ventas_exitosas || 0} Ventas completadas con éxito
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.textSecondary} />
                            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                                Miembro desde {new Date(profile.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                            </Text>
                        </View>
                    </View>
                </View>

                {!isMe && (
                    <Button
                        onPress={logic.handleStartChat}
                        style={[styles.chatButton, { backgroundColor: theme.colors.primary }]}
                        leftIcon={<MaterialCommunityIcons name="chat-outline" size={22} color="#fff" />}
                    >
                        Contactar Vecino
                    </Button>
                )}
            </ScrollView>

            <ImageViewerModal
                visible={logic.isViewerVisible}
                onClose={() => logic.setIsViewerVisible(false)}
                imageUri={profile.foto_url}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 60,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
    },
    scrollContent: {
        padding: 20,
    },
    profileCard: {
        borderRadius: 32,
        paddingHorizontal: 20,
        paddingVertical: 32,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.05,
                shadowRadius: 20,
            },
            android: {
                elevation: 5,
            },
        }),
        marginBottom: 24,
    },
    profileHeaderMain: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centeringWrapper: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    nameArea: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
    },
    userRole: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 4,
        textAlign: 'center',
    },
    featuredBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 12,
        borderWidth: 1,
    },
    featuredBadgeText: {
        fontSize: 13,
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: 32,
        width: '100%',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '900',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 30,
        alignSelf: 'center',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 12,
        marginLeft: 4,
    },
    infoCard: {
        borderRadius: 24,
        padding: 20,
        gap: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoText: {
        fontSize: 15,
        fontWeight: '600',
    },
    chatButton: {
        marginTop: 12,
        height: 56,
        borderRadius: 18,
    }
});
