import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EmptyState, ResponsiveContainer, PremiumHeader } from '../../../components';
import { useNotificationsScreen } from './useNotificationsScreen';
import { NotificationIcon } from './components';

export default function NotificationsScreenWeb({ navigation }) {
    const logic = useNotificationsScreen(navigation);
    const { theme, isDark } = logic;


    const renderSectionHeader = (title) => (
        <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>{title.toUpperCase()}</Text>
        </View>
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.notificationItem,
                { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border },
                !item.read && { backgroundColor: isDark ? 'rgba(19, 127, 230, 0.1)' : '#f0f7ff' }
            ]}
            onPress={() => logic.handlePressNotification(item)}
            activeOpacity={0.7}
        >
            {!item.read && <View style={[styles.unreadIndicator, { backgroundColor: theme.colors.primary }]} />}
            <NotificationIcon type={item.type} />
            <View style={styles.contentContainer}>
                <View style={styles.itemHeader}>
                    <Text style={[styles.itemTitle, { color: theme.colors.text }, !item.read && styles.unreadText]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>{logic.formatTime(item.created_at)}</Text>
                </View>
                <Text style={[styles.itemBody, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {item.message}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <PremiumHeader navigation={navigation} activeTab="INICIO" />
            <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
                <View style={styles.headerInner}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={[styles.backBtn, { backgroundColor: theme.colors.inputBackground }]}
                        >
                            <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: theme.colors.text }]}>Notificaciones</Text>
                        <TouchableOpacity
                            onPress={logic.handleMarkAllRead}
                            style={[styles.markReadContainer, { backgroundColor: isDark ? 'rgba(19, 109, 236, 0.2)' : 'rgba(19, 109, 236, 0.08)' }]}
                        >
                            <MaterialCommunityIcons name="check-all" size={18} color={theme.colors.primary} style={{ marginRight: 4 }} />
                            <Text style={[styles.markReadBtn, { color: theme.colors.primary }]}>Marcar leídas</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ResponsiveContainer>
                {logic.loading && !logic.notifications.length ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#136dec" />
                    </View>
                ) : (
                    <FlatList
                        data={logic.flatData}
                        keyExtractor={(item, index) => item.id || `header-${index}`}
                        renderItem={({ item }) => item.type === 'header' ? renderSectionHeader(item.title) : renderItem({ item })}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listPadding}
                        ListEmptyComponent={
                            <EmptyState
                                icon="bell-off-outline"
                                title="Sin notificaciones"
                                message="Te avisaremos cuando suceda algo importante en tu comunidad."
                            />
                        }
                    />
                )}
            </ResponsiveContainer>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerInner: {
        width: '100%',
        marginHorizontal: 'auto',
        maxWidth: 800,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    markReadContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(19, 109, 236, 0.08)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        cursor: 'pointer',
    },
    markReadBtn: {
        fontSize: 14,
        color: '#136dec',
        fontWeight: '700',
    },
    sectionHeader: {
        paddingHorizontal: 0,
        paddingVertical: 12,
        backgroundColor: '#fff',
        marginTop: 10,
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: '#94a3b8',
        letterSpacing: 2,
    },
    notificationItem: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 18,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        borderRadius: 12,
        marginBottom: 8,
        cursor: 'pointer',
    },
    unreadIndicator: {
        position: 'absolute',
        left: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#136dec',
    },
    contentContainer: {
        flex: 1,
        marginLeft: 16,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0f172a',
        flex: 1,
        marginRight: 8,
        lineHeight: 20,
    },
    unreadText: {
        fontWeight: '900',
    },
    timeText: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
    },
    itemBody: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    listPadding: {
        paddingVertical: 20,
        paddingBottom: 100,
    },
});
