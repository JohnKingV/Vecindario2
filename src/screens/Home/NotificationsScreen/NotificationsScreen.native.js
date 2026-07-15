import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    RefreshControl,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EmptyState, LoadingDots } from '../../../components';
import { useNotificationsScreen } from './useNotificationsScreen';
import { NotificationIcon } from './components';

const HEADER_HEIGHT = 60;

export default function NotificationsScreenNative({ navigation }) {
    const logic = useNotificationsScreen(navigation);
    const { theme, isDark } = logic;

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
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Notificaciones</Text>
                </View>
                <TouchableOpacity
                    onPress={logic.handleMarkAllRead}
                    style={[styles.markReadBtn, { backgroundColor: isDark ? 'rgba(19, 109, 236, 0.2)' : 'rgba(19, 109, 236, 0.08)' }]}
                >
                    <MaterialCommunityIcons name="check-all" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

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

    if (logic.loading && !logic.notifications.length) {
        return (
            <View style={styles.loadingContainer}>
                <LoadingDots size={12} color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Animated.FlatList
                    data={logic.flatData}
                    keyExtractor={(item, index) => item.id || `header-${index}`}
                    renderItem={({ item }) => item.type === 'header' ? renderSectionHeader(item.title) : renderItem({ item })}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    scrollEventThrottle={16}
                    contentContainerStyle={[
                        styles.listPadding,
                        { paddingTop: HEADER_HEIGHT }
                    ]}
                    refreshControl={
                        <RefreshControl refreshing={logic.refreshing} onRefresh={logic.onRefresh} tintColor={theme.colors.primary} progressViewOffset={HEADER_HEIGHT} />
                    }
                    ListEmptyComponent={
                        <EmptyState
                            icon="bell-off-outline"
                            title="Sin notificaciones"
                            message="Te avisaremos cuando suceda algo importante en tu comunidad."
                        />
                    }
                />
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    markReadBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeader: {
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
    },
    notificationItem: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 18,
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    unreadIndicator: {
        position: 'absolute',
        left: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
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
        flex: 1,
        marginRight: 8,
        lineHeight: 20,
    },
    unreadText: {
        fontWeight: '900',
    },
    timeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    itemBody: {
        fontSize: 14,
        lineHeight: 20,
    },
    listPadding: {
        paddingBottom: 100,
    },
});
