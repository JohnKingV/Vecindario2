import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Image,
    TouchableOpacity,
    ScrollView,
    Switch,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useProfileScreen } from './useProfileScreen';
import { useTheme } from '../../../context/ThemeContext';
import LoadingModal from '../../../components/LoadingModal';
import { LogoutModal, SuccessModal } from '../../../components';
import Avatar from '../../../components/Avatar';

const { width } = Dimensions.get('window');

const InfoRow = ({ icon, label, value, isLast, theme }) => (
    <View style={[styles.infoRow, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}>
        <View style={[styles.iconContainer, { backgroundColor: theme.dark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(25, 127, 230, 0.08)' }]}>
            <MaterialCommunityIcons name={icon} size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.textContainer}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>{value}</Text>
        </View>
    </View>
);

const ProfileScreen = ({ navigation }) => {
    const logic = useProfileScreen(navigation);
    const {
        profile,
        isSuperAdmin,
        getMemberSince,
        stats,
        handleRemovePhoto,
        theme,
        isDark,
        syncOdooLoading,
        handleSyncUsersToOdoo
    } = logic;

    const scrollY = useRef(new Animated.Value(0)).current;

    // -- Header Animations --
    const headerHeight = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [280, 0],
        extrapolate: 'clamp'
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 150],
        outputRange: [1, 0],
        extrapolate: 'clamp'
    });

    const headerScale = scrollY.interpolate({
        inputRange: [-100, 0, 150],
        outputRange: [1.2, 1, 0.8],
        extrapolate: 'clamp'
    });

    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [0, -100],
        extrapolate: 'clamp'
    });

    if (!profile) {
        return <LoadingModal visible={true} text="Cargando perfil..." />;
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Fixed Navigation Header */}
            <View style={[styles.unifiedHeader, { backgroundColor: theme.colors.background, borderBottomColor: 'transparent', zIndex: 10 }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[styles.backBtn, { backgroundColor: theme.colors.inputBackground }]}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Mi Perfil</Text>
                </View>
            </View>

            <Animated.ScrollView
                style={{ flex: 1 }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Collapsible Header Section */}
                <Animated.View style={[
                    styles.header,
                    {
                        opacity: headerOpacity,
                        transform: [{ scale: headerScale }, { translateY: headerTranslateY }],
                        height: headerHeight,
                        overflow: 'hidden'
                    }
                ]}>
                    <View style={styles.avatarContainer}>
                        <View style={{ position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => profile?.foto_url && navigation.navigate('PhotoViewer', { imageUri: profile.foto_url })}
                                disabled={logic.uploading}
                            >
                                <Avatar
                                    uri={profile.foto_url}
                                    size={120}
                                    featured={true}
                                    status={profile.status}
                                    showStatus={false}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => navigation.navigate('PhotoSelect')}
                                disabled={logic.uploading}
                                activeOpacity={0.7}
                                style={[
                                    styles.cameraButton,
                                    {
                                        backgroundColor: profile.status === 'online' ? '#10b981' :
                                            profile.status === 'busy' ? '#f59e0b' :
                                                '#94a3b8',
                                        zIndex: 2
                                    }
                                ]}
                            >
                                <MaterialCommunityIcons name="camera" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={[styles.name, { color: theme.colors.text }]}>{profile.nombre} {profile.apellido}</Text>
                    <Text style={[styles.role, { color: theme.colors.textSecondary }]}>{getMemberSince()}</Text>

                    {/* Vecino Destacado Badge */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'rgba(251, 146, 60, 0.1)',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                        marginTop: 0,
                        borderWidth: 1,
                        borderColor: 'rgba(251, 146, 60, 0.2)'
                    }}>
                        <MaterialCommunityIcons name="star" size={14} color="#f97316" />
                        <Text style={{ color: '#f97316', fontWeight: '700', fontSize: 12, marginLeft: 4 }}>Vecino destacado</Text>
                    </View>

                    {/* Stats */}
                    {stats && (
                        <View style={[styles.statsContainer, { borderColor: 'transparent', paddingVertical: 24 }]}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.novedades || 0}</Text>
                                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>AVISOS</Text>
                            </View>
                            <View style={[styles.separator, { backgroundColor: theme.colors.border, height: 20 }]} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.ventas || 0}</Text>
                                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>VENTAS</Text>
                            </View>
                            <View style={[styles.separator, { backgroundColor: theme.colors.border, height: 20 }]} />
                            <View style={styles.statItem}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.rating ? stats.rating.toFixed(1) : '5.0'}</Text>
                                    <MaterialCommunityIcons name="star" size={14} color="#fb923c" style={{ marginLeft: 2 }} />
                                </View>
                                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>REPUTACIÓN</Text>
                            </View>
                        </View>
                    )}
                </Animated.View>

                {/* Content Sections */}
                <View style={styles.content}>

                    {/* 1. MI ESTADO */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>MI ESTADO</Text>
                        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <TouchableOpacity
                                style={[styles.statusOption, profile.status === 'online' && { backgroundColor: theme.colors.inputBackground }]}
                                onPress={() => logic.handleStatusChange('online')}
                            >
                                <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.statusLabel, { color: theme.colors.text }]}>En línea</Text>
                                    <Text style={[styles.statusDesc, { color: theme.colors.textSecondary }]}>Disponible para hablar</Text>
                                </View>
                                {profile.status === 'online' && <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />}
                            </TouchableOpacity>
                            <View style={{ height: 1, backgroundColor: theme.colors.border }} />
                            <TouchableOpacity
                                style={[styles.statusOption, profile.status === 'busy' && { backgroundColor: theme.colors.inputBackground }]}
                                onPress={() => logic.handleStatusChange('busy')}
                            >
                                <View style={[styles.statusDot, { backgroundColor: '#f59e0b' }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.statusLabel, { color: theme.colors.text }]}>Ocupado</Text>
                                    <Text style={[styles.statusDesc, { color: theme.colors.textSecondary }]}>No molestar por ahora</Text>
                                </View>
                                {profile.status === 'busy' && <MaterialCommunityIcons name="check-circle" size={24} color="#f59e0b" />}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 2. DATOS PERSONALES */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>DATOS PERSONALES</Text>
                        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <InfoRow icon="email-outline" label="Email" value={profile.email || 'No especificado'} theme={theme} />
                            <InfoRow icon="phone-outline" label="Teléfono" value={profile.telefono || 'No especificado'} isLast theme={theme} />
                        </View>
                    </View>

                    {/* 3. MI CLUB (MARKETPLACE) */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>MI CLUB (MARKETPLACE)</Text>
                        <TouchableOpacity
                            style={[styles.card, styles.actionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                            onPress={() => navigation.navigate('MyItems')}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#fff4e5' }]}>
                                <MaterialCommunityIcons name="storefront-outline" size={24} color="#f59e0b" />
                            </View>
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Text style={{ color: theme.colors.textSecondary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>MIS VENTAS</Text>
                                <Text style={[styles.actionText, { color: theme.colors.text, fontSize: 16, fontWeight: '400' }]}>Gestionar Publicaciones</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* 4. MI COMUNIDAD */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>MI COMUNIDAD</Text>
                        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <InfoRow icon="office-building" label="Mi Condominio" value={profile.comunidades?.nombre || 'Mi Condominio'} theme={theme} />
                            <InfoRow icon="map-marker-outline" label="Ubicación" value={profile.depto ? `Depto ${profile.depto}` : 'No especificado'} theme={theme} />
                            <InfoRow
                                icon="badge-account-outline"
                                label="Rol"
                                value={{
                                    'admin': 'Administrador del Sistema',
                                    'mayordomo': 'Mayordomo',
                                    'conserje': 'Conserje',
                                    'comite': 'Miembro del Comité',
                                    'vecino': 'Residente'
                                }[profile.role] || 'Residente'}
                                isLast
                                theme={theme}
                            />
                        </View>
                    </View>

                    {/* PANEL DE CONTROL (SuperAdmin) */}
                    {isSuperAdmin && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>PANEL DE CONTROL</Text>
                            <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                <TouchableOpacity
                                    style={[styles.actionCard, { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}
                                    onPress={() => navigation.navigate('CondoManagement')}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                                        <MaterialCommunityIcons name="shield-home-outline" size={24} color="#6366f1" />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={[styles.actionText, { color: theme.colors.textSecondary, fontSize: 10, textTransform: 'uppercase', fontWeight: '800' }]}>ADMINISTRACIÓN</Text>
                                        <Text style={[styles.infoValue, { color: theme.colors.text, fontWeight: '400', fontSize: 16 }]}>Gestionar Condominios</Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionCard, { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}
                                    onPress={() => navigation.navigate('RoleManagement')}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(236, 72, 153, 0.1)' }]}>
                                        <MaterialCommunityIcons name="account-cog-outline" size={24} color="#ec4899" />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={[styles.actionText, { color: theme.colors.textSecondary, fontSize: 10, textTransform: 'uppercase', fontWeight: '800' }]}>SEGURIDAD</Text>
                                        <Text style={[styles.infoValue, { color: theme.colors.text, fontWeight: '400', fontSize: 16 }]}>Gestionar Roles</Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.actionCard}
                                    onPress={handleSyncUsersToOdoo}
                                    disabled={syncOdooLoading}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                                        {syncOdooLoading ? (
                                            <ActivityIndicator size="small" color="#0ea5e9" />
                                        ) : (
                                            <MaterialCommunityIcons name="database-sync" size={24} color="#0ea5e9" />
                                        )}
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={[styles.actionText, { color: theme.colors.textSecondary, fontSize: 10, textTransform: 'uppercase', fontWeight: '800' }]}>INTEGRACIÓN ODOO</Text>
                                        <Text style={[styles.infoValue, { color: theme.colors.text, fontWeight: '400', fontSize: 16 }]}>
                                            {syncOdooLoading ? 'Sincronizando...' : 'Sincronizar Usuarios'}
                                        </Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* CONFIGURACIÓN */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>CONFIGURACIÓN</Text>
                        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                                <View style={[styles.iconContainer, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.1)' }]}>
                                    <MaterialCommunityIcons name="theme-light-dark" size={24} color={theme.colors.primary} />
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={[styles.actionText, { color: theme.colors.textSecondary, fontSize: 10, textTransform: 'uppercase', fontWeight: '800' }]}>APARIENCIA</Text>
                                    <Text style={{ fontSize: 16, fontWeight: '400', color: theme.colors.text }}>Modo Oscuro</Text>
                                </View>
                                <Switch value={isDark} onValueChange={logic.toggleTheme} />
                            </View>
                        </View>
                    </View>

                    {/* Final Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.button, { borderColor: theme.colors.primary, marginBottom: 12, borderWidth: 1.5, borderRadius: 16 }]}
                            onPress={() => navigation.navigate('EditProfile')}
                        >
                            <MaterialCommunityIcons name="pencil-outline" size={20} color={theme.colors.primary} />
                            <Text style={[styles.buttonText, { color: theme.colors.primary }]}>Editar Perfil</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, { borderColor: '#ef4444', borderWidth: 1.5, borderRadius: 16 }]}
                            onPress={logic.handleLogout}
                        >
                            <Text style={[styles.buttonText, { color: '#ef4444' }]}>Cerrar Sesión</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </Animated.ScrollView>

            <LogoutModal
                visible={logic.isLogoutModalVisible}
                onClose={() => logic.setIsLogoutModalVisible(false)}
                onConfirm={logic.performLogout}
            />

            <LoadingModal visible={logic.uploading} text="Actualizando foto..." />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    unifiedHeader: { paddingHorizontal: 16, paddingBottom: 16 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 56 },
    backBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
    header: { alignItems: 'center', paddingVertical: 24 },
    avatarContainer: { marginBottom: 16, position: 'relative' },
    avatar: { width: 120, height: 120, borderRadius: 60 },
    cameraButton: {
        position: 'absolute', bottom: 0, right: 0,
        width: 36, height: 36, borderRadius: 18,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 3, borderColor: '#fff',
    },
    name: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    role: { fontSize: 14, marginBottom: 12 },
    statsContainer: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 12, paddingHorizontal: 24,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: 'bold' },
    statLabel: { fontSize: 11, marginTop: 2, textTransform: 'uppercase' },
    separator: { width: 1, height: 24, opacity: 0.2 },

    content: { paddingHorizontal: 20 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
    card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
    infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    iconContainer: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    textContainer: { flex: 1, marginLeft: 12 },
    infoLabel: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
    infoValue: { fontSize: 15, fontWeight: '600' },

    statusOption: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
    statusLabel: { fontSize: 16, fontWeight: '600' },
    statusDesc: { fontSize: 13, marginTop: 2 },

    actionCard: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    actionText: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '600' },

    actions: { marginTop: 8, marginBottom: 32 },
    button: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 14, borderRadius: 12, borderWidth: 1,
    },
    buttonText: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
});

export default ProfileScreen;
