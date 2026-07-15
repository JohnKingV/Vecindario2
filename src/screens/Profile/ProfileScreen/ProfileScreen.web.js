import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, LoadingSpinner, Button, Modal, OptionsModal, ImageViewerModal, SuccessModal, ResponsiveContainer, ConfirmModal } from '../../../components';
import { useProfileScreen } from './useProfileScreen';
import { debugService } from '../../../services/debugService';
import { Alert } from 'react-native';

const InfoRow = ({ icon, label, value, isLast, theme }) => {
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

export default function ProfileScreenWeb({ navigation }) {
    const logic = useProfileScreen(navigation);
    const { theme, isDark, profile, stats } = logic;

    if (!profile) return <LoadingSpinner />;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>
                {/* Header Navigation */}
                <View style={[
                    styles.headerNav,
                    {
                        backgroundColor: theme.colors.background,
                        borderBottomColor: theme.colors.border
                    }
                ]}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.navButton}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerNavTitle, { color: theme.colors.text }]}>Mi Perfil</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.mainContent}>
                        {/* Profile Header Card */}
                        <View style={[styles.headerSection, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <View style={styles.avatarWrapper}>
                                <TouchableOpacity
                                    onPress={() => logic.setIsOptionsModalVisible(true)}
                                    disabled={logic.uploading}
                                    activeOpacity={0.8}
                                >
                                    <Avatar
                                        uri={profile.foto_url}
                                        name={profile?.nombre}
                                        size="xl"
                                        border
                                        status={profile?.status || 'online'}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.headerInfo}>
                                <Text style={[styles.userName, { color: theme.colors.text }]}>{profile?.nombre}</Text>
                                <Text style={[styles.memberSince, { color: theme.colors.textSecondary }]}>{logic.getMemberSince()}</Text>

                                <View style={styles.headerActions}>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        leftIcon="pencil-outline"
                                        onPress={() => navigation.navigate('EditProfile')}
                                    >
                                        Editar Perfil
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        color="#ef4444"
                                        leftIcon="logout"
                                        onPress={logic.handleLogout}
                                    >
                                        Salir
                                    </Button>
                                </View>
                            </View>

                            <View style={styles.headerStats}>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.novedades}</Text>
                                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Avisos</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.ventas}</Text>
                                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Ventas</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.rating.toFixed(1)}</Text>
                                        <MaterialCommunityIcons name="star" size={16} color="#fb923c" />
                                    </View>
                                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Reputación</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.gridContainer}>
                            {/* Column 1: Info */}
                            <View style={styles.gridColumn}>
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>DATOS PERSONALES</Text>
                                    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                        <InfoRow icon="email-outline" label="Email" value={profile.email || 'No especificado'} theme={theme} />
                                        <InfoRow icon="phone-outline" label="Teléfono" value={profile.telefono || 'No especificado'} isLast theme={theme} />
                                    </View>
                                </View>

                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>MI COMUNIDAD</Text>
                                    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                        <InfoRow icon="office-building" label="Mi Condominio" value={profile.comunidades?.nombre || 'Mi Condominio'} theme={theme} />
                                        <InfoRow icon="map-marker-outline" label="Ubicación" value={profile.depto ? `Depto ${profile.depto}` : 'No especificado'} theme={theme} />
                                        <InfoRow icon="badge-account-outline" label="Rol" value={profile.role === 'admin' ? 'Administrador' : 'Residente'} isLast theme={theme} />
                                    </View>
                                </View>
                            </View>

                            {/* Column 2: Status & Settings */}
                            <View style={styles.gridColumn}>
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>MI ESTADO</Text>
                                    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                        <TouchableOpacity
                                            style={[styles.statusOption, profile.status === 'online' && { backgroundColor: theme.colors.inputBackground }]}
                                            onPress={() => logic.handleStatusChange('online')}
                                        >
                                            <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
                                            <View style={styles.statusText}>
                                                <Text style={[styles.statusLabel, { color: theme.colors.text }]}>En línea</Text>
                                                <Text style={[styles.statusDesc, { color: theme.colors.textSecondary }]}>Disponible</Text>
                                            </View>
                                            {profile.status === 'online' && <MaterialCommunityIcons name="check" size={20} color="#10b981" />}
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.statusOption, profile.status === 'busy' && { backgroundColor: theme.colors.inputBackground }]}
                                            onPress={() => logic.handleStatusChange('busy')}
                                        >
                                            <View style={[styles.statusDot, { backgroundColor: '#f59e0b' }]} />
                                            <View style={styles.statusText}>
                                                <Text style={[styles.statusLabel, { color: theme.colors.text }]}>Ocupado</Text>
                                                <Text style={[styles.statusDesc, { color: theme.colors.textSecondary }]}>No molestar</Text>
                                            </View>
                                            {profile.status === 'busy' && <MaterialCommunityIcons name="check" size={20} color="#f59e0b" />}
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>MARKETPLACE</Text>
                                    <TouchableOpacity
                                        style={[styles.card, styles.actionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                                        onPress={() => navigation.navigate('MyItems')}
                                    >
                                        <MaterialCommunityIcons name="storefront-outline" size={24} color="#f59e0b" />
                                        <Text style={[styles.actionCardText, { color: theme.colors.text }]}>Gestionar mis ventas</Text>
                                        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>APARIENCIA</Text>
                                    <View style={[styles.card, styles.settingRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                        <MaterialCommunityIcons name="theme-light-dark" size={24} color={theme.colors.primary} />
                                        <Text style={[styles.settingText, { color: theme.colors.text }]}>Modo Oscuro</Text>
                                        <Switch value={isDark} onValueChange={logic.toggleTheme} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </ResponsiveContainer>

            {/* Modals */}
            <OptionsModal
                visible={logic.isOptionsModalVisible}
                onClose={() => logic.setIsOptionsModalVisible(false)}
                title="Foto de Perfil"
                options={[
                    { label: 'Ver foto de perfil', icon: 'image-outline', onPress: () => logic.setIsViewerVisible(true) },
                    { label: 'Cambiar foto de perfil', icon: 'camera-outline', onPress: logic.handlePickImage }
                ]}
            />

            <ImageViewerModal
                visible={logic.isViewerVisible}
                onClose={() => logic.setIsViewerVisible(false)}
                imageUri={profile.foto_url}
            />

            <SuccessModal
                visible={logic.isSuccessModalVisible}
                onClose={() => logic.setIsSuccessModalVisible(false)}
                message={logic.successMessage}
            />

            <ConfirmModal
                visible={logic.isLogoutModalVisible}
                onClose={() => logic.setIsLogoutModalVisible(false)}
                onConfirm={logic.confirmLogout}
                title="Cerrar Sesión"
                message="¿Estás seguro que deseas salir? Tu sesión se cerrará y tendrás que volver a ingresar."
                confirmText="Cerrar Sesión"
                cancelText="Cancelar"
                type="danger"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 70,
        borderBottomWidth: 1,
    },
    navButton: {
        padding: 8,
        cursor: 'pointer',
    },
    headerNavTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    scrollContent: {
        paddingVertical: 32,
    },
    mainContent: {
        paddingHorizontal: 20,
        gap: 32,
    },
    headerSection: {
        borderRadius: 24,
        padding: 32,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    },
    avatarWrapper: {
        marginRight: 32,
    },
    headerInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 4,
    },
    memberSince: {
        fontSize: 16,
        marginBottom: 20,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    headerStats: {
        flexDirection: 'row',
        gap: 24,
        paddingLeft: 32,
        borderLeftWidth: 1,
        borderLeftColor: '#f1f5f9',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '900',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    gridContainer: {
        flexDirection: 'row',
        gap: 32,
    },
    gridColumn: {
        flex: 1,
        gap: 32,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
        paddingLeft: 4,
    },
    card: {
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
    },
    infoRow: {
        flexDirection: 'row',
        padding: 20,
        gap: 16,
        alignItems: 'center',
    },
    rowBorder: {
        borderBottomWidth: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    statusOption: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
        gap: 16,
        cursor: 'pointer',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    statusText: {
        flex: 1,
    },
    statusLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    statusDesc: {
        fontSize: 13,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 16,
        cursor: 'pointer',
    },
    actionCardText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 16,
    },
    settingText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
    },
    modalContent: {
        padding: 24,
        gap: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'center',
    }
});
