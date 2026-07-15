import React, { useMemo, useRef, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
    ActivityIndicator,
    TextInput,
    Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Input, LoadingDots, OptionsModal, ConfirmModal } from '../../../components';
import { useMessagesScreen } from './useMessagesScreen';
import { Alert } from 'react-native';

const HEADER_HEIGHT = 60;
const SEARCH_BAR_HEIGHT = 72;

export default function MessagesScreenNative({ navigation }) {
    const logic = useMessagesScreen(navigation);
    const { theme, isDark } = logic;
    const insets = useSafeAreaInsets();
    const searchInputRef = useRef(null);

    useEffect(() => {
        console.log('[MessagesScreen] Modal visibility changed:', logic.isOptionsModalVisible);
    }, [logic.isOptionsModalVisible]);

    const handleBack = () => {
        if (logic.isArchivedView) {
            logic.handleToggleView();
        } else {
            navigation.goBack();
        }
    };

    // Animation logic
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

    const searchBarTranslateY = scrollY.interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [0, -HEADER_HEIGHT],
        extrapolate: 'clamp',
    });

    if (logic.loading && logic.conversations.length === 0) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
                    <View style={styles.topRow}>
                        <View style={styles.headerLeft}>
                            <TouchableOpacity onPress={handleBack} style={[styles.iconButton, { backgroundColor: theme.colors.inputBackground }]}>
                                <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
                            </TouchableOpacity>
                            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                                {logic.isArchivedView ? 'Archivados' : 'Mensajes'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: theme.colors.inputBackground }]}
                            onPress={logic.handleNewMessage}
                        >
                            <MaterialCommunityIcons name="square-edit-outline" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LoadingDots size={12} color={theme.colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />

            {/* Header Animado */}
            <Animated.View style={[
                styles.animatedHeader,
                {
                    height: HEADER_HEIGHT + SEARCH_BAR_HEIGHT,
                    transform: [{ translateY: searchBarTranslateY }],
                    backgroundColor: theme.colors.background,
                    zIndex: 10,
                }
            ]}>
                {/* Titulo y Botones */}
                <Animated.View style={[
                    styles.header,
                    {
                        opacity: headerOpacity,
                        transform: [{ translateY: headerTranslateY }],
                    }
                ]}>
                    <View style={styles.topRow}>
                        <View style={styles.headerLeft}>
                            <TouchableOpacity onPress={handleBack} style={[styles.iconButton, { backgroundColor: theme.colors.inputBackground }]}>
                                <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
                            </TouchableOpacity>
                            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                                {logic.isArchivedView ? 'Archivados' : 'Mensajes'}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity
                                style={[
                                    styles.iconButton,
                                    { backgroundColor: theme.colors.inputBackground },
                                    logic.isArchivedView && { backgroundColor: theme.colors.primary + '20' }
                                ]}
                                onPress={logic.handleToggleView}
                            >
                                <MaterialCommunityIcons
                                    name={logic.isArchivedView ? "archive" : "archive-outline"}
                                    size={24}
                                    color={logic.isArchivedView ? theme.colors.primary : theme.colors.text}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.iconButton, { backgroundColor: theme.colors.inputBackground }]}
                                onPress={logic.handleNewMessage}
                            >
                                <MaterialCommunityIcons name="square-edit-outline" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>

                {/* Buscador - Se mantiene arriba */}
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => searchInputRef.current?.focus()}
                    style={[
                        styles.searchBarContainer,
                        {
                            backgroundColor: theme.colors.inputBackground,
                            borderColor: theme.colors.border
                        }
                    ]}
                >
                    <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textSecondary} style={{ marginLeft: 16 }} />
                    <TextInput
                        ref={searchInputRef}
                        style={[styles.searchInput, { color: theme.colors.text }]}
                        placeholder="Buscar vecin@..."
                        placeholderTextColor={theme.colors.placeholder}
                        value={logic.search}
                        onChangeText={logic.setSearch}
                        autoCapitalize="none"
                    />
                    {logic.search.length > 0 && (
                        <TouchableOpacity onPress={() => logic.setSearch('')} style={{ paddingHorizontal: 16 }}>
                            <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>
            </Animated.View>

            <Animated.FlatList
                data={logic.filteredConversations}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingTop: HEADER_HEIGHT + SEARCH_BAR_HEIGHT }
                ]}
                renderItem={({ item }) => (
                    <View style={{ backgroundColor: theme.colors.background }}>
                        <TouchableOpacity
                            style={styles.messageItem}
                            activeOpacity={0.7}
                            onPress={() => logic.handlePressConversation(item)}
                            onLongPress={() => {
                                console.log('[MessagesScreen] Long press triggered on item:', item.name);
                                logic.handleLongPressConversation(item);
                            }}
                        >
                            <View style={styles.avatarContainer}>
                                <Avatar
                                    uri={item.avatar}
                                    name={item.name}
                                    size="lg"
                                    status={item.status}
                                    featured={item.raiting_ventas >= 4.0}
                                />
                            </View>
                            <View style={styles.messageContent}>
                                <View style={styles.messageHeader}>
                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Text style={[styles.name, { color: theme.colors.text, flex: 0 }]} numberOfLines={1}>
                                            {item.sexo === 'mujer' ? 'Vecina: ' : 'Vecino: '}{item.name}
                                        </Text>
                                        {item.raiting_ventas >= 4.0 && (
                                            <MaterialCommunityIcons name="star-circle" size={14} color="#F59E0B" />
                                        )}
                                    </View>
                                    <Text style={[styles.time, { color: theme.colors.textSecondary }, item.unreadCount > 0 && styles.timeUnread]}>
                                        {logic.formatDate(item.time)}
                                    </Text>
                                </View>
                                <View style={styles.messageFooter}>
                                    <Text style={[
                                        styles.lastMessage,
                                        { color: theme.colors.textSecondary },
                                        item.unreadCount > 0 && [styles.lastMessageUnread, { color: theme.colors.text }]
                                    ]} numberOfLines={1}>
                                        {item.lastMessage || 'Inicia una conversación'}
                                    </Text>
                                    {item.unreadCount > 0 && (
                                        <View style={styles.unreadBadge}>
                                            <Text style={styles.unreadText}>{item.unreadCount}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />}
                ListEmptyComponent={
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <Text style={{ color: theme.colors.textSecondary }}>
                            {logic.isArchivedView ? 'No tienes chats archivados' : 'No hay conversaciones aún'}
                        </Text>
                    </View>
                }
            />

            <OptionsModal
                visible={logic.isOptionsModalVisible}
                onClose={() => logic.setIsOptionsModalVisible(false)}
                title={logic.selectedConversation?.name || 'Opciones'}
                options={[
                    {
                        label: logic.isArchivedView ? 'Desarchivar chat' : 'Archivar chat',
                        icon: logic.isArchivedView ? 'archive-arrow-up-outline' : 'archive-arrow-down-outline',
                        onPress: logic.handleArchiveToggle,
                    },
                    {
                        label: 'Eliminar chat',
                        icon: 'trash-can-outline',
                        destructive: true,
                        onPress: logic.handleDeleteConversation,
                    },
                ]}
            />

            <ConfirmModal
                visible={logic.alertState.visible}
                title={logic.alertState.title}
                message={logic.alertState.message}
                type={logic.alertState.type}
                onConfirm={logic.alertState.onConfirm}
                onClose={() => logic.setAlertState(prev => ({ ...prev, visible: false }))}
                confirmText={logic.alertState.type === 'danger' ? 'Eliminar' : 'Aceptar'}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    animatedHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    header: {
        paddingHorizontal: 16,
        height: HEADER_HEIGHT,
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
    iconButton: {
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
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderRadius: 16,
        borderWidth: 2,
        marginBottom: 16,
        marginHorizontal: 16,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 12,
        fontSize: 16,
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 40,
    },
    messageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 16,
    },
    avatarContainer: {
        position: 'relative',
    },
    messageContent: {
        flex: 1,
        gap: 2,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    time: {
        fontSize: 12,
    },
    timeUnread: {
        color: '#197fe6',
        fontWeight: '600',
    },
    messageFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
    },
    lastMessage: {
        fontSize: 14,
        flex: 1,
    },
    lastMessageUnread: {
        fontWeight: '500',
    },
    unreadBadge: {
        backgroundColor: '#197fe6',
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    unreadText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        paddingHorizontal: 1,
    },
    separator: {
        height: 1,
        marginLeft: 88,
        marginRight: 16,
    },
});
