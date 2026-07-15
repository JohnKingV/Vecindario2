import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Button, ImageViewerModal, ResponsiveContainer } from '../../../components';
import { useUserProfileScreen } from './useUserProfileScreen';

export default function UserProfileScreenWeb({ route, navigation }) {
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
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>
                <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Perfil del Vecino</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.mainLayout}>
                        {/* Profile Header Side Card */}
                        <View style={[styles.profileCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
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
                                />
                            </TouchableOpacity>

                            <View style={styles.nameArea}>
                                <Text style={[styles.userName, { color: theme.colors.text }]}>{profile.nombre}</Text>
                                <Text style={[styles.userRole, { color: theme.colors.textSecondary }]}>
                                    {profile.sexo === 'mujer' ? 'Vecina' : 'Vecino'} • {profile.depto ? `Depto ${profile.depto}` : 'Residente'}
                                </Text>
                            </View>

                            {profile.raiting_ventas >= 4.0 && (
                                <View style={[styles.featuredBadge, { backgroundColor: isDark ? 'rgba(251, 146, 60, 0.2)' : '#fff7ed', borderColor: isDark ? '#fb923c' : '#ffedd5' }]}>
                                    <MaterialCommunityIcons name="star" size={16} color="#fb923c" />
                                    <Text style={[styles.featuredText, { color: isDark ? '#fb923c' : '#9a3412' }]}>Vecino destacado</Text>
                                </View>
                            )}

                            {!isMe && (
                                <Button
                                    onPress={logic.handleStartChat}
                                    style={styles.chatButton}
                                    leftIcon={<MaterialCommunityIcons name="chat-outline" size={20} color="#fff" />}
                                >
                                    Contactar
                                </Button>
                            )}
                        </View>

                        {/* Details Side */}
                        <View style={styles.detailsSide}>
                            <View style={styles.statsGrid}>
                                <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                    <Text style={[styles.statValue, { color: theme.colors.text }]}>{profile.stats?.novedades || 0}</Text>
                                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Avisos</Text>
                                </View>
                                <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                    <Text style={[styles.statValue, { color: theme.colors.text }]}>{profile.stats?.ventas || 0}</Text>
                                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Ventas</Text>
                                </View>
                                <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                    <View style={styles.ratingRow}>
                                        <Text style={[styles.statValue, { color: theme.colors.text }]}>{profile.stats?.rating?.toFixed(1) || '5.0'}</Text>
                                        <MaterialCommunityIcons name="star" size={20} color="#fb923c" />
                                    </View>
                                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Reputación</Text>
                                </View>
                            </View>

                            <View style={[styles.infoSection, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>INFORMACIÓN DE CONTACTO</Text>

                                <View style={styles.infoList}>
                                    {profile.telefono && (
                                        <View style={styles.infoRow}>
                                            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff' }]}>
                                                <MaterialCommunityIcons name="phone" size={20} color={theme.colors.primary} />
                                            </View>
                                            <View>
                                                <Text style={[styles.infoLabelText, { color: theme.colors.textSecondary }]}>Teléfono</Text>
                                                <Text style={[styles.infoValueText, { color: theme.colors.text }]}>{profile.telefono}</Text>
                                            </View>
                                        </View>
                                    )}

                                    <View style={styles.infoRow}>
                                        <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff' }]}>
                                            <MaterialCommunityIcons name="office-building" size={20} color={theme.colors.primary} />
                                        </View>
                                        <View>
                                            <Text style={[styles.infoLabelText, { color: theme.colors.textSecondary }]}>Ubicación</Text>
                                            <Text style={[styles.infoValueText, { color: theme.colors.text }]}>
                                                {profile.torre ? `Torre ${profile.torre} • ` : ''}Depto {profile.depto || 'S/N'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5' }]}>
                                            <MaterialCommunityIcons name="check-decagram" size={20} color={theme.colors.success} />
                                        </View>
                                        <View>
                                            <Text style={[styles.infoLabelText, { color: theme.colors.textSecondary }]}>Actividad</Text>
                                            <Text style={[styles.infoValueText, { color: theme.colors.text }]}>
                                                {profile.ventas_exitosas || 0} Ventas exitosas
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(148, 163, 184, 0.1)' : '#f8fafc' }]}>
                                            <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.textSecondary} />
                                        </View>
                                        <View>
                                            <Text style={[styles.infoLabelText, { color: theme.colors.textSecondary }]}>Miembro desde</Text>
                                            <Text style={[styles.infoValueText, { color: theme.colors.text }]}>
                                                {new Date(profile.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </ResponsiveContainer>

            <ImageViewerModal
                visible={logic.isViewerVisible}
                onClose={() => logic.setIsViewerVisible(false)}
                imageUri={profile.foto_url}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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
        height: 70,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
        cursor: 'pointer',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginLeft: 16,
    },
    scrollContent: {
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    mainLayout: {
        flexDirection: 'row',
        gap: 40,
    },
    profileCard: {
        width: 320,
        borderRadius: 24,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        alignSelf: 'flex-start',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    },
    nameArea: {
        alignItems: 'center',
        marginTop: 24,
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
    },
    featuredBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 20,
        borderWidth: 1,
    },
    featuredText: {
        fontSize: 13,
        fontWeight: '700',
    },
    chatButton: {
        width: '100%',
        marginTop: 32,
        height: 50,
        borderRadius: 14,
    },
    detailsSide: {
        flex: 1,
        gap: 32,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 20,
    },
    statCard: {
        flex: 1,
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '900',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoSection: {
        borderRadius: 24,
        padding: 32,
        borderWidth: 1,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: 24,
    },
    infoList: {
        gap: 24,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoLabelText: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 2,
    },
    infoValueText: {
        fontSize: 16,
        fontWeight: '700',
    }
});
