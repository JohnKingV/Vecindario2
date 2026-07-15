import { useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';

export const useResidencialScreen = (navigation) => {
    const { profile, condoBadges, refreshCondoBadges } = useAuth();
    const { theme, isDark } = useTheme();

    // Refrescar badges al enfocar la pantalla
    // Usamos useFocusEffect de React Navigation si fuera necesario, 
    // pero como el AuthProvider maneja el estado global y actualizaciones en tiempo real, 
    // los badges deberían estar actualizados. 
    // Sin embargo, para forzar un check limpio al entrar:
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            refreshCondoBadges();
        });
        return unsubscribe;
    }, [navigation, refreshCondoBadges]);

    const allServices = [
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
            title: 'Pago de Gastos Comunes',
            subtitle: condoBadges?.paymentStatus === 'loading' ? 'Estatus: Cargando...' :
                condoBadges?.paymentStatus === 'overdue' ? 'Estatus: Atrasado' :
                    condoBadges?.paymentStatus === 'pending' ? 'Estatus: Pendiente' : 'Estatus: Al día',
            icon: 'wallet-outline',
            color: condoBadges?.paymentStatus === 'overdue' ? '#ef4444' :
                condoBadges?.paymentStatus === 'pending' ? '#f59e0b' : '#16a34a',
            bgColor: condoBadges?.paymentStatus === 'overdue' ? 'rgba(239, 68, 68, 0.1)' :
                condoBadges?.paymentStatus === 'pending' ? 'rgba(245, 158, 11, 0.1)' : '#f0fdf4',
            badgeCount: condoBadges?.payments || 0,
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
            badge: false, // Por ahora desactivado o manejado aparte
            onPress: () => navigation.navigate('Announcements')
        },
        {
            id: '5',
            title: 'Estacionamientos',
            subtitle: 'Visitas en tiempo real',
            icon: 'car-multiple',
            color: '#22c55e',
            bgColor: '#f0fdf4',
            onPress: () => navigation.navigate('ParkingMonitor')
        },
        {
            id: '6',
            title: 'Encomiendas',
            subtitle: profile?.role === 'vecino' ? 'Mis paquetes' : 'Recepción de paquetes',
            icon: 'package-variant-closed',
            color: '#3b82f6',
            bgColor: '#eff6ff',
            badgeCount: condoBadges?.packages || 0,
            onPress: () => navigation.navigate('LogisticsHub')
        },
        {
            id: '7',
            title: 'Libro de Novedades',
            subtitle: 'Bitácora de seguridad',
            icon: 'notebook-edit-outline',
            color: '#f59e0b',
            bgColor: '#fffbeb',
            roles: ['conserje', 'admin', 'mayordomo', 'comite'],
            onPress: () => navigation.navigate('NoticeLog')
        },
        {
            id: '8',
            title: 'Administración',
            subtitle: 'Cerebro financiero',
            icon: 'shield-star',
            color: '#64748b',
            bgColor: '#f1f5f9',
            roles: ['admin', 'mayordomo', 'comite', 'vecino'], // TEMPORTALMENTE DESBLOQUEADO PARA PRUEBAS
            onPress: () => navigation.navigate('FinanceHub')
        },
        {
            id: '9',
            title: 'Lectura de Medidores',
            subtitle: 'IA: Agua, Gas y Luz',
            icon: 'robot-outline',
            color: '#06b6d4',
            bgColor: '#ecfeff',
            onPress: () => navigation.navigate('MeterReading')
        },
        {
            id: '10',
            title: 'Votaciones',
            subtitle: 'Asambleas Digitales',
            icon: 'gavel',
            color: '#f43f5e',
            bgColor: '#fff1f2',
            badgeCount: condoBadges?.votings || 0,
            onPress: () => navigation.navigate('VotingAssembly')
        },
        {
            id: '11',
            title: 'Mantenimiento',
            subtitle: 'Calendario Preventivo',
            icon: 'hammer-wrench',
            color: '#8b5cf6',
            bgColor: '#f5f3ff',
            badgeCount: condoBadges?.maintenance || 0,
            onPress: () => navigation.navigate('MaintenanceCalendar')
        },
        {
            id: '12',
            title: 'Gestión de Roles',
            subtitle: 'Asignar permisos',
            icon: 'account-cog-outline',
            color: '#ec4899',
            bgColor: '#fdf2f8',
            roles: ['admin'],
            onPress: () => navigation.navigate('RoleManagement')
        }
    ];


    const services = allServices.filter(s => !s.roles || s.roles.includes(profile?.role));



    const reservations = [
        {
            id: '1',
            title: 'Piscina de Adultos',
            time: 'Mañana, 14:00 - 16:00',
            day: '23',
            month: 'OCT',
            image: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&q=80&w=300'
        },
        {
            id: '2',
            title: 'Área de Parrilla #2',
            time: 'Sáb 24, 12:00 - 18:00',
            day: '24',
            month: 'OCT',
            image: 'https://images.unsplash.com/photo-1551817738-f146be569106?auto=format&fit=crop&q=80&w=300'
        }
    ];

    return {
        profile,
        theme,
        isDark,
        services,
        reservations,
        navigation
    };
};
