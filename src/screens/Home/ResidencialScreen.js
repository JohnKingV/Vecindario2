import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const ResidencialScreen = ({ navigation }) => {
    const { profile } = useAuth();
    const { theme, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const services = [
        {
            id: '1',
            title: 'Reserva de Amenidades',
            subtitle: 'Gym, Pool, BBQ',
            icon: 'calendar-month',
            color: '#135bec',
            bgColor: 'rgba(19, 91, 236, 0.1)',
            onPress: () => navigation.navigate('Booking')
        },
        {
            id: '2',
            title: 'Pagos y Expensas',
            subtitle: 'Estatus: Al día',
            icon: 'wallet-outline',
            color: '#16a34a',
            bgColor: '#f0fdf4',
            onPress: () => navigation.navigate('Payments')
        },
        {
            id: '3',
            title: 'Documentos',
            subtitle: 'Reglamentos, Actas',
            icon: 'file-document-outline',
            color: '#ea580c',
            bgColor: '#fff7ed',
            onPress: () => navigation.navigate('Documents')
        },
        {
            id: '4',
            title: 'Comunicados',
            subtitle: 'Novedades del edificio',
            icon: 'bullhorn-outline',
            color: '#9333ea',
            bgColor: '#faf5ff',
            badge: true,
            onPress: () => navigation.navigate('Announcements')
        },
    ];

    const reservations = [
        {
            id: '1',
            title: 'Piscina de Adultos',
            time: 'Mañana, 14:00 - 16:00',
            image: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&q=80&w=300'
        },
        {
            id: '2',
            title: 'Área de Parrilla #2',
            time: 'Sáb 24, 12:00 - 18:00',
            image: 'https://images.unsplash.com/photo-1551817738-f146be569106?auto=format&fit=crop&q=80&w=300'
        }
    ];

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />

            <View style={[styles.header, { paddingTop: insets.top, backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
                <View style={[styles.avatarContainer, { borderColor: theme.colors.border }]}>
                    {profile?.foto_url ? (
                        <Image
                            source={{ uri: profile.foto_url }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: theme.colors.border }]}>
                            <Text style={styles.avatarInitials}>
                                {profile?.nombre?.substring(0, 2).toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Mi Vivienda</Text>
                <TouchableOpacity
                    style={[styles.notificationButton, { backgroundColor: theme.colors.inputBackground }]}
                    onPress={() => navigation.navigate('Notifications')}
                >
                    <MaterialCommunityIcons name="bell-outline" size={24} color={theme.colors.text} />
                    <View style={[styles.notifBadge, { borderColor: theme.colors.card }]} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.welcomeSection}>
                    <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>Hola, {profile?.nombre?.split(' ')[0]}</Text>
                    <Text style={[styles.welcomeSubtitle, { color: theme.colors.textSecondary }]}>
                        {profile?.comunidades?.nombre || 'Vista Paraiso 2030'}
                    </Text>
                </View>

                <View style={styles.grid}>
                    {services.map((service) => (
                        <TouchableOpacity
                            key={service.id}
                            style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                            onPress={service.onPress}
                            activeOpacity={0.9}
                        >
                            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : service.bgColor }]}>
                                <MaterialCommunityIcons name={service.icon} size={28} color={isDark ? theme.colors.primary : service.color} />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{service.title}</Text>
                                <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>{service.subtitle}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Próximas Reservas</Text>
                    <TouchableOpacity>
                        <Text style={[styles.sectionAction, { color: theme.colors.primary }]}>Ver Todo</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.reservationsList}>
                    {reservations.map((res) => (
                        <TouchableOpacity
                            key={res.id}
                            style={[styles.resItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                            onPress={() => navigation.navigate('Booking')}
                        >
                            <View style={[styles.resDateBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2' }]}>
                                <Text style={[styles.resDay, { color: '#ef4444' }]}>{res.day}</Text>
                                <Text style={[styles.resMonth, { color: '#ef4444' }]}>{res.month}</Text>
                            </View>
                            <View style={styles.resInfo}>
                                <Text style={[styles.resTitle, { color: theme.colors.text }]}>{res.title}</Text>
                                <View style={styles.resTimeRow}>
                                    <MaterialCommunityIcons name="calendar-blank-outline" size={14} color={theme.colors.textSecondary} />
                                    <Text style={[styles.resTime, { color: theme.colors.textSecondary }]}>{res.time}</Text>
                                </View>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.border} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    avatarContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: 'rgba(19, 91, 236, 0.1)',
        padding: 2,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    avatarPlaceholder: {
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#64748b',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111418',
    },
    notificationButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    notifBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    welcomeSection: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 8,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111418',
        letterSpacing: -0.5,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        gap: 12,
    },
    card: {
        width: (Platform.OS === 'web' ? 200 : 180), // Simple responsive adjustment
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        gap: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#111418',
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
    blueDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#135bec',
    },
    reservationsSection: {
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
        color: '#111418',
    },
    viewAll: {
        fontSize: 14,
        fontWeight: '600',
        color: '#135bec',
    },
    resItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        gap: 12,
    },
    resImage: {
        width: 64,
        height: 64,
        borderRadius: 12,
        backgroundColor: '#e2e8f0',
    },
    resInfo: {
        flex: 1,
        gap: 4,
    },
    resTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111418',
    },
    resTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    resTime: {
        fontSize: 12,
        color: '#64748b',
    },
});

export default ResidencialScreen;
