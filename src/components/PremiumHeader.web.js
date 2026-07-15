import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ResponsiveContainer from './ResponsiveContainer';
import { useAuth } from '../hooks/useAuth';

const SLATE_900 = '#0f172a';
const SLATE_800 = '#1e293b';
const SLATE_400 = '#94a3b8';
const SLATE_500 = '#64748b';
const PRIMARY_BLUE = '#3b82f6';

const PremiumHeader = ({ navigation, activeTab = 'INICIO' }) => {
    const { profile, unreadNotifications, unreadMessages } = useAuth();

    const textColor = '#ffffff';
    const borderColor = 'rgba(255,255,255,0.1)';

    const navLinks = [
        { name: 'INICIO', icon: 'home', route: 'Home' },
        { name: 'CLUB', icon: 'storefront', route: 'Club' },
        { name: 'CONDOMINIO', icon: 'office-building', route: 'Residencial' },
    ];

    return (
        <View style={[styles.webNav, { backgroundColor: 'rgba(15, 23, 42, 0.8)', borderBottomColor: borderColor }]}>
            <ResponsiveContainer maxWidth={1600}>
                <View style={styles.navContent}>
                    <View style={styles.navBrandGroup}>
                        <TouchableOpacity onPress={() => navigation.navigate('Announcements')}>
                            <Text style={styles.logo}>VECINDARIO</Text>
                        </TouchableOpacity>
                        <View style={styles.navLinksContainer}>
                            {navLinks.map((link) => {
                                const isActive = activeTab === link.name;
                                return (
                                    <TouchableOpacity
                                        key={link.name}
                                        style={[styles.navLink, isActive && styles.navLinkActive]}
                                        onPress={() => navigation.navigate(link.route)}
                                    >
                                        <MaterialCommunityIcons
                                            name={isActive ? link.icon : `${link.icon}-outline`}
                                            size={24}
                                            color={isActive ? PRIMARY_BLUE : SLATE_400}
                                        />
                                        <Text style={[
                                            styles.navLinkText,
                                            { color: isActive ? PRIMARY_BLUE : SLATE_400 },
                                            isActive && styles.activeText
                                        ]}>
                                            {link.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.navActions}>
                        <TouchableOpacity
                            style={styles.iconAction}
                            onPress={() => navigation.navigate('Messages')}
                        >
                            {unreadMessages > 0 && (
                                <View style={styles.notifBadge}>
                                    <Text style={styles.notifBadgeText}>{unreadMessages > 9 ? '9+' : unreadMessages}</Text>
                                </View>
                            )}
                            <MaterialCommunityIcons name="chat-outline" size={24} color={SLATE_400} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.iconAction}
                            onPress={() => navigation.navigate('Notifications')}
                        >
                            {unreadNotifications > 0 && (
                                <View style={styles.notifBadge}>
                                    <Text style={styles.notifBadgeText}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
                                </View>
                            )}
                            <MaterialCommunityIcons name="bell-outline" size={24} color={SLATE_400} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.navUser}
                            onPress={() => navigation.navigate('Profile')}
                        >
                            <Image
                                source={{ uri: profile?.foto_url || 'https://i.pravatar.cc/150?u=user' }}
                                style={styles.userAvatar}
                            />
                            <Text style={[styles.userName, { color: textColor }]}>
                                {profile?.nombre?.split(' ')[0] || 'Vecino'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ResponsiveContainer>
        </View>
    );
};

const styles = StyleSheet.create({
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
                WebkitBackdropFilter: 'blur(12px)',
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
    navLinksContainer: {
        flexDirection: 'row',
        gap: 8,
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
    activeText: {
        textDecorationLine: 'underline',
        textDecorationColor: PRIMARY_BLUE,
    },
    navActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconAction: {
        padding: 10,
        borderRadius: 50,
        position: 'relative',
    },
    notifBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: '#ef4444',
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        borderWidth: 2,
        borderColor: SLATE_900,
    },
    notifBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '900',
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
});

export default PremiumHeader;
