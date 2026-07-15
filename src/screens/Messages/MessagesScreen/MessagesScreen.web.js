import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Input, ResponsiveContainer } from '../../../components';
import { useMessagesScreen } from './useMessagesScreen';

export default function MessagesScreenWeb({ navigation }) {
    const logic = useMessagesScreen(navigation);
    const { theme, isDark } = logic;

    const renderHeader = (
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
            <View style={styles.topRow}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconButton, { backgroundColor: theme.colors.inputBackground }]}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Mensajes</Text>
                </View>
                <TouchableOpacity
                    style={[styles.iconButton, { backgroundColor: theme.colors.inputBackground }]}
                    onPress={logic.handleNewMessage}
                >
                    <MaterialCommunityIcons name="square-edit-outline" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
                <Input
                    placeholder="Buscar mensajes..."
                    value={logic.search}
                    onChangeText={logic.setSearch}
                    noMargin
                    leftIcon={<MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textSecondary} />}
                    rightIcon={logic.search.length > 0 ? (
                        <TouchableOpacity onPress={() => logic.setSearch('')}>
                            <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    ) : null}
                />
            </View>
        </View>
    );

    if (logic.loading && logic.conversations.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <ResponsiveContainer>
                    {renderHeader}
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                </ResponsiveContainer>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>
                <FlatList
                    data={logic.filteredConversations}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={{ backgroundColor: theme.colors.background }}>
                            <TouchableOpacity
                                style={styles.messageItem}
                                activeOpacity={0.7}
                                onPress={() => logic.handlePressConversation(item)}
                            >
                                <View style={styles.avatarContainer}>
                                    <Avatar
                                        uri={item.avatar}
                                        name={item.name}
                                        size="lg"
                                        status={item.status}
                                    />
                                </View>
                                <View style={styles.messageContent}>
                                    <View style={styles.messageHeader}>
                                        <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
                                            {item.sexo === 'mujer' ? 'Vecina: ' : 'Vecino: '}{item.name}
                                        </Text>
                                        <Text style={[styles.time, { color: theme.colors.textSecondary }, item.unreadCount > 0 && styles.timeUnread]}>
                                            {item.time ? new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
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
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />}
                    ListEmptyComponent={
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Text style={{ color: theme.colors.textSecondary }}>No hay conversaciones aún</Text>
                        </View>
                    }
                />
            </ResponsiveContainer>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: '100%',
        overflow: 'scroll',
    },
    header: {
        paddingVertical: 16,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
    },
    searchContainer: {
        paddingBottom: 16,
    },
    listContent: {
        paddingBottom: 40,
    },
    messageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16, // More padding for web
        paddingHorizontal: 16,
        gap: 16,
        cursor: 'pointer',
        borderRadius: 12,
        transition: 'background-color 0.2s',
    },
    // Hover effect can be added with pseudo-classes in pure CSS, but not easily in RN Web style objects without extra libs.
    // Keeping it simple.

    avatarContainer: {
        position: 'relative',
    },
    messageContent: {
        flex: 1,
        gap: 4,
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
    },
    separator: {
        height: 1,
        marginLeft: 88,
        marginRight: 16,
    },
});
