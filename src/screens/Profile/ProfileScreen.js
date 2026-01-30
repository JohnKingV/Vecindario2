import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Dimensions,
    Platform,
    StatusBar,
    Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Avatar, LoadingSpinner, Button, Modal } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { debugService } from '../../services/debugService';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const InfoRow = ({ icon, label, value, isLast }) => {
    const { theme } = useTheme();
    return (
        <View style={[styles.infoRow, !isLast && [styles.rowBorder, { borderBottomColor: theme.colors.border }]]}>
            <View style={[styles.iconContainer, { backgroundColor: theme.dark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(25, 127, 230, 0.08)' }]}>
                <MaterialCommunityIcons name={icon} size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>{value}</Text>
            </View>
        </View>
    );
};

export default function ProfileScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { profile, signOut, refreshProfile, updateStatus } = useAuth();
    const { theme, isDark, toggleTheme } = useTheme();
    const [uploading, setUploading] = useState(false);
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [stats, setStats] = useState({ novedades: 0, ventas: 0, rating: 5.0 });

    useFocusEffect(
        React.useCallback(() => {
            if (profile?.id) {
                loadStats();
            }
        }, [profile?.id, isDark])
    );

    const loadStats = async () => {
        const { data, error } = await authService.getUserPublicProfile(profile.id);
        if (data?.stats) {
            setStats(data.stats);
        }
    };

    const handleStatusChange = async (newStatus) => {
        console.log('[ProfileScreen] handleStatusChange requested:', newStatus, 'Current:', profile?.status);
        if (newStatus === profile?.status) {
            console.log('[ProfileScreen] Status already same, skipping');
            return;
        }
        setIsUpdatingStatus(true);
        const { error } = await updateStatus(newStatus);
        setIsUpdatingStatus(false);
        if (error) {
            console.error('[ProfileScreen] Status update failed:', error);
            Alert.alert('Error', 'No se pudo actualizar el estado');
        } else {
            console.log('[ProfileScreen] Status update triggered successfully');
        }
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            uploadAvatar(result.assets[0].uri);
        }
    };

    const uploadAvatar = async (uri) => {
        setUploading(true);
        const { error } = await authService.uploadAvatar(profile?.id, uri);

        if (error) {
            setUploading(false);
            Alert.alert('Error', 'No se pudo actualizar la foto de perfil');
        } else {
            // Refrescar el perfil globalmente antes de quitar el loading
            if (refreshProfile) await refreshProfile();
            setUploading(false);
            Alert.alert('¡Listo!', 'Foto de perfil actualizada');
        }
    };

    const handleLogout = () => {
        setIsLogoutModalVisible(true);
    };

    if (!profile) return <LoadingSpinner />;

    // Formatear fecha de creación si existe
    const getMemberSince = () => {
        if (!profile.created_at) return 'Miembro';
        const date = new Date(profile.created_at);
        const month = date.toLocaleString('es-ES', { month: 'long' });
        const year = date.getFullYear();
        return `Miembro desde ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={[styles.container, { backgroundColor: theme.colors.inputBackground }]}>
                {/* Header Navigation */}
                <View style={[
                    styles.headerNav,
                    {
                        paddingTop: insets.top,
                        backgroundColor: theme.colors.background,
                        borderBottomColor: theme.colors.border
                    }
                ]}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.navButton}
                    >
                        <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerNavTitle, { color: theme.colors.text }]}>Perfil</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {uploading && (
                        <View style={styles.uploadOverlay}>
                            <LoadingSpinner />
                            <Text style={styles.uploadText}>CARGANDO...</Text>
                        </View>
                    )}
                    {/* Profile Header */}
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarWrapper}>
                            <TouchableOpacity onPress={handlePickImage} disabled={uploading}>
                                <Avatar
                                    uri={profile.foto_url}
                                    name={profile?.nombre}
                                    size="xl"
                                    border
                                    status={profile?.status || 'online'}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.nameContainer}>
                            <Text style={[styles.userName, { color: theme.colors.text }]}>{profile?.nombre}</Text>
                            <Text style={[styles.memberSince, { color: theme.colors.textSecondary }]}>{getMemberSince()}</Text>
                            {stats.rating >= 4.0 && (
                                <View style={[styles.featuredBadgeContainer, { backgroundColor: isDark ? 'rgba(251, 146, 60, 0.2)' : '#fff7ed', borderColor: isDark ? '#fb923c' : '#ffedd5' }]}>
                                    <MaterialCommunityIcons name="star" size={14} color="#fb923c" />
                                    <Text style={[styles.featuredBadgeText, { color: isDark ? '#fb923c' : '#9a3412' }]}>Vecino destacado</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.novedades}</Text>
                                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Avisos</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.ventas}</Text>
                                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Ventas</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
                            <View style={styles.statItem}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.rating.toFixed(1)}</Text>
                                    <MaterialCommunityIcons name="star" size={16} color="#fb923c" />
                                </View>
                                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Reputación</Text>
                            </View>
                        </View>
                    </View>

                    {/* Status Selector Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>MI ESTADO</Text>
                        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <View style={styles.statusSelectorContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.statusOption,
                                        profile.status === 'online' && [styles.statusOptionActive, { backgroundColor: theme.colors.inputBackground }],
                                        isUpdatingStatus && styles.statusOptionDisabled
                                    ]}
                                    onPress={() => handleStatusChange('online')}
                                    disabled={isUpdatingStatus}
                                >
                                    <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
                                    <View style={styles.statusTextContainer}>
                                        <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }, profile.status === 'online' && [styles.statusLabelActive, { color: theme.colors.text }]]}>En línea</Text>
                                        <Text style={[styles.statusDesc, { color: theme.colors.placeholder }]}>Disponible para hablar</Text>
                                    </View>
                                    {profile.status === 'online' && (
                                        <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
                                    )}
                                </TouchableOpacity>

                                <View style={[styles.statusDivider, { backgroundColor: theme.colors.border }]} />

                                <TouchableOpacity
                                    style={[
                                        styles.statusOption,
                                        profile.status === 'busy' && [styles.statusOptionActive, { backgroundColor: theme.colors.inputBackground }],
                                        isUpdatingStatus && styles.statusOptionDisabled
                                    ]}
                                    onPress={() => handleStatusChange('busy')}
                                    disabled={isUpdatingStatus}
                                >
                                    <View style={[styles.statusDot, { backgroundColor: '#f59e0b' }]} />
                                    <View style={styles.statusTextContainer}>
                                        <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }, profile.status === 'busy' && [styles.statusLabelActive, { color: theme.colors.text }]]}>Ocupado</Text>
                                        <Text style={[styles.statusDesc, { color: theme.colors.placeholder }]}>No molestar por ahora</Text>
                                    </View>
                                    {profile.status === 'busy' && (
                                        <MaterialCommunityIcons name="check-circle" size={24} color="#f59e0b" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Marketplace Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>MI CLUB (MARKETPLACE)</Text>
                        <TouchableOpacity
                            style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                            onPress={() => navigation.navigate('MyItems')}
                        >
                            <View style={styles.infoRow}>
                                <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)' }]}>
                                    <MaterialCommunityIcons name="storefront-outline" size={20} color="#f59e0b" />
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>MIS VENTAS</Text>
                                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>Gestionar Publicaciones</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Personal Data Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>DATOS PERSONALES</Text>
                        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <InfoRow
                                icon="email-outline"
                                label="Email"
                                value={profile.email || 'No especificado'}
                            />
                            <InfoRow
                                icon="phone-outline"
                                label="Teléfono"
                                value={profile.telefono || 'No especificado'}
                                isLast
                            />
                        </View>
                    </View>

                    {/* Community Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>MI COMUNIDAD</Text>
                        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <InfoRow
                                icon="office-building"
                                label="Mi Condominio"
                                value={profile.comunidades?.nombre || 'Vista Paraiso 2030'}
                            />
                            <InfoRow
                                icon="map-marker-outline"
                                label="Ubicación"
                                value={profile.depto ? `${profile.torre ? `Torre ${profile.torre} • ` : ''}Depto ${profile.depto}` : 'No especificado'}
                            />
                            <InfoRow
                                icon="badge-account-outline"
                                label="Rol"
                                value={profile.role === 'admin' ? 'Administrador del Sistema' : 'Propietario / Residente'}
                                isLast
                            />
                        </View>
                    </View>

                    {/* Admin Section */}
                    {profile.role === 'admin' && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Panel de Control</Text>
                            <TouchableOpacity
                                style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                                onPress={() => navigation.navigate('AdminPanel')}
                            >
                                <View style={styles.infoRow}>
                                    <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(79, 70, 229, 0.2)' : 'rgba(79, 70, 229, 0.1)' }]}>
                                        <MaterialCommunityIcons name="shield-key-outline" size={20} color="#4f46e5" />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>ADMINISTRACIÓN</Text>
                                        <Text style={[styles.infoValue, { color: theme.colors.text }]}>Gestionar Condominios</Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* App Settings Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>CONFIGURACIÓN</Text>
                        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <View style={[styles.infoRow, { justifyContent: 'space-between' }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                    <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)' }]}>
                                        <MaterialCommunityIcons name="theme-light-dark" size={20} color={isDark ? '#818cf8' : '#6366f1'} />
                                    </View>
                                    <View>
                                        <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>APARIENCIA</Text>
                                        <Text style={[styles.infoValue, { color: theme.colors.text }]}>Modo Oscuro</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={isDark}
                                    onValueChange={toggleTheme}
                                    trackColor={{ false: '#e2e8f0', true: '#6366f1' }}
                                    thumbColor={'#fff'}
                                    ios_backgroundColor="#e2e8f0"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Maintenance Section (Seeding) */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>MANTENIMIENTO</Text>
                        <TouchableOpacity
                            style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                            onPress={async () => {
                                Alert.alert('Poblar Datos', 'Se insertarán vecinos, posts y artículos de prueba. ¿Continuar?', [
                                    { text: 'Cancelar', style: 'cancel' },
                                    {
                                        text: 'Sí, Poblar',
                                        onPress: async () => {
                                            const { success } = await debugService.seedCommunityData(profile.comunidad_id, profile.id);
                                            if (success) {
                                                Alert.alert('¡Éxito!', 'La comunidad ha sido poblada con datos realistas.');
                                            } else {
                                                Alert.alert('Error', 'No se pudieron insertar los datos. Verifica tu conexión.');
                                            }
                                        }
                                    }
                                ]);
                            }}
                        >
                            <View style={styles.infoRow}>
                                <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(25, 127, 230, 0.2)' : 'rgba(25, 127, 230, 0.1)' }]}>
                                    <MaterialCommunityIcons name="database-import" size={20} color="#197fe6" />
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>DEMO</Text>
                                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>Poblar con datos de prueba</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={[styles.editButton, { backgroundColor: isDark ? theme.colors.card : '#fff', borderColor: theme.colors.primary }]}
                            onPress={() => navigation.navigate('EditProfile')}
                        >
                            <MaterialCommunityIcons name="pencil-outline" size={20} color={theme.colors.primary} style={styles.btnIcon} />
                            <Text style={[styles.editButtonText, { color: theme.colors.primary }]}>Editar Perfil</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.logoutButton, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2', borderColor: isDark ? 'rgba(239, 68, 68, 0.5)' : '#fee2e2' }]}
                            onPress={handleLogout}
                        >
                            <MaterialCommunityIcons name="logout" size={20} color="#ef4444" style={styles.btnIcon} />
                            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>

            {/* Logout Confirmation Modal */}
            <Modal
                isOpen={isLogoutModalVisible}
                onClose={() => setIsLogoutModalVisible(false)}
                title="Cerrar Sesión"
                scrollable={false}
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalIconContainer}>
                        <MaterialCommunityIcons name="logout" size={48} color="#ef4444" />
                    </View>
                    <Text style={styles.modalTitle}>¿Estás seguro?</Text>
                    <Text style={styles.modalDescription}>
                        Tu sesión se cerrará y tendrás que volver a ingresar tus credenciales para acceder.
                    </Text>

                    <View style={styles.modalActions}>
                        <Button
                            variant="outline"
                            onPress={() => setIsLogoutModalVisible(false)}
                            style={styles.modalButton}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onPress={() => {
                                setIsLogoutModalVisible(false);
                                signOut();
                            }}
                            style={[styles.modalButton, styles.modalLogoutBtn]}
                        >
                            Cerrar Sesión
                        </Button>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    headerNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    navButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerNavTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
    },
    scrollContent: {
        paddingBottom: 120, // Aumentado para asegurar que el botón de cerrar sesión sea visible sobre el tab bar
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 20,
    },
    mainAvatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        borderColor: '#fff',
        borderWidth: 4,
        borderColor: '#fff',
        ...Platform.select({
            web: { boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1)' },
            default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 15,
            }
        }),
        elevation: 6,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: '#197fe6',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    nameContainer: {
        alignItems: 'center',
    },
    userName: {
        fontSize: 26,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    memberSince: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 6,
        fontWeight: '600',
    },
    featuredBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#fff7ed',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#ffedd5',
    },
    featuredBadgeText: {
        fontSize: 12,
        color: '#9a3412',
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: 24,
        width: '100%',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#0f172a',
    },
    statLabel: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#e2e8f0',
        alignSelf: 'center',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: 2,
        marginBottom: 12,
        paddingHorizontal: 4,
        textTransform: 'uppercase',
    },
    card: {
        backgroundColor: '#fff', // Default, will be overridden
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        statCard: {
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 16,
            alignItems: 'center',
            flex: 1,
            borderWidth: 1,
            borderColor: '#f1f5f9',
            ...Platform.select({
                web: { boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.03)' },
                default: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.03,
                    shadowRadius: 10,
                }
            }),
        },
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        gap: 16,
    },
    rowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(25, 127, 230, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
    },
    actionsContainer: {
        paddingHorizontal: 20,
        paddingTop: 8,
        gap: 16,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#197fe6',
    },
    btnIcon: {
        marginRight: 10,
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#197fe6',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 20,
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fee2e2',
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ef4444',
    },
    uploadOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '900',
        color: '#197fe6',
        letterSpacing: 1,
    },
    modalContent: {
        padding: 24,
        alignItems: 'center',
    },
    modalIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fef2f2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 12,
        textAlign: 'center',
    },
    modalDescription: {
        fontSize: 16,
        color: '#64748b',
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 32,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Padding extra en iOS para safe area si es necesario
    },
    modalButton: {
        flex: 1,
        // Eliminamos el height fijo si lo tuviera, el componente Button lo maneja
    },
    modalLogoutBtn: {
        // Estilo vacío para mantener la flexibilidad pero sin fondo rojo residual
    },
    modalLogoutBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    statusSelectorContainer: {
        padding: 4,
    },
    statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        gap: 16,
    },
    statusOptionActive: {
        backgroundColor: '#f8fafc',
    },
    statusOptionDisabled: {
        opacity: 0.5,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    statusTextContainer: {
        flex: 1,
    },
    statusLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748b',
    },
    statusLabelActive: {
        color: '#0f172a',
    },
    statusDesc: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '500',
        marginTop: 2,
    },
    statusDivider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginHorizontal: 16,
    },
});
