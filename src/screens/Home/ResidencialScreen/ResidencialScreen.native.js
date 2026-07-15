import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useResidencialScreen } from './useResidencialScreen';

const HEADER_HEIGHT = 60;

export default function ResidencialScreenNative({ navigation }) {
    const logic = useResidencialScreen(navigation);
    const { theme, isDark, profile } = logic;

    const scrollY = useRef(new Animated.Value(0)).current;

    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [0, -HEADER_HEIGHT],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_HEIGHT / 2],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const renderHeader = (
        <Animated.View style={[
            styles.animatedHeader,
            {
                height: HEADER_HEIGHT,
                backgroundColor: theme.colors.background,
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslateY }],
                zIndex: 10,
            }
        ]}>
            <View style={styles.topRow}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[styles.roundBtn, { backgroundColor: theme.colors.inputBackground }]}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                        {profile?.torre && profile?.depto
                            ? `${profile.torre} - ${profile.depto}`
                            : (profile?.torre || profile?.depto || 'Mi Vivienda')}
                    </Text>
                </View>
                <View style={{ width: 44 }} />
            </View>
        </Animated.View>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Animated.ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingTop: HEADER_HEIGHT }
                    ]}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    scrollEventThrottle={16}
                >
                    <View style={styles.welcomeSection}>
                        <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>Hola, {profile?.nombre?.split(' ')[0]}</Text>
                        <Text style={[styles.welcomeSubtitle, { color: theme.colors.textSecondary }]}>
                            {profile?.comunidades?.nombre || 'Vista Paraiso 2030'}
                        </Text>
                    </View>

                    <View style={styles.grid}>
                        {logic.services.map((service) => (
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
                                {service.badgeCount > 0 && (
                                    <View style={[styles.cardBadge, { backgroundColor: '#ef4444', borderColor: theme.colors.card }]}>
                                        <Text style={styles.cardBadgeText}>
                                            {service.badgeCount > 9 ? '9+' : service.badgeCount}
                                        </Text>
                                    </View>
                                )}
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
                        {logic.reservations.map((res) => (
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
                </Animated.ScrollView>
                {renderHeader}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    animatedHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    roundBtn: {
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
        paddingBottom: 100,
    },
    welcomeSection: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    welcomeSubtitle: {
        fontSize: 16,
        marginTop: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        gap: 12,
    },
    card: {
        flex: 1,
        minWidth: '45%',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    cardSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    sectionAction: {
        fontSize: 14,
        fontWeight: '600',
    },
    reservationsList: {
        paddingHorizontal: 16,
    },
    resItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
    },
    resDateBox: {
        width: 54,
        height: 54,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resDay: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    resMonth: {
        fontSize: 10,
        fontWeight: '900',
    },
    resInfo: {
        flex: 1,
        gap: 4,
    },
    resTitle: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    resTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    resTime: {
        fontSize: 12,
    },
    cardBadge: {
        position: 'absolute',
        top: 30,
        right: 12,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
    },
    cardBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
