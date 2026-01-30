import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Image,
    Platform,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Input } from '../../components';
import { messagesService } from '../../services/messagesService';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';
import { useTheme } from '../../context/ThemeContext';

const MessageItem = ({ item, onPress }) => (
    <TouchableOpacity
        style={styles.messageItem}
        activeOpacity={0.7}
        onPress={onPress}
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
                <Text style={styles.name} numberOfLines={1}>
                    {item.sexo === 'mujer' ? 'Vecina: ' : 'Vecino: '}{item.name}
                </Text>
                <Text style={[styles.time, item.unreadCount > 0 && styles.timeUnread]}>
                    {item.time ? new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </Text>
            </View>
            <View style={styles.messageFooter}>
                <Text style={[styles.lastMessage, item.unreadCount > 0 && styles.lastMessageUnread]} numberOfLines={1}>
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
);

export default function MessagesScreen({ navigation }) {
    const { user, loading: authLoading } = useAuth();
    const { theme, isDark } = useTheme();
    const [search, setSearch] = useState('');
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return; // Wait for auth to initialize

        if (user) {
            loadConversations();

            const subscription = messagesService.subscribeToConversations(user.id, () => {
                loadConversations();
            });

            return () => {
                supabase.removeChannel(subscription);
            };
        } else {
            // Not logged in or auth failed, stop loading
            setLoading(false);
        }
    }, [user, authLoading]);

    const loadConversations = async () => {
        const { data, error } = await messagesService.getConversations(user.id);
        if (!error) setConversations(data || []);
        setLoading(false);
    };

    const handlePressConversation = (item) => {
        navigation.navigate('Chat', { conversation: item });
    };

    const renderHeader = (
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
            <View style={styles.topRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => navigation.navigate('NewMessage')}
                >
                    <MaterialCommunityIcons name="square-edit-outline" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Mensajes</Text>
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.colors.inputBackground }]}>
                    <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
                    <Input
                        placeholder="Buscar mensajes..."
                        value={search}
                        onChangeText={setSearch}
                        containerStyle={styles.searchInnerInputContainer}
                        style={[styles.searchInnerInput, { color: theme.colors.text }]}
                        placeholderTextColor={theme.colors.placeholder}
                        rightIcon={search.length > 0 ? (
                            <TouchableOpacity onPress={() => setSearch('')}>
                                <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        ) : null}
                    />
                </View>
            </View>
        </View>
    );

    if (loading && conversations.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                {renderHeader}
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#197fe6" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <FlatList
                    data={conversations.filter(c => c.name && c.name.toLowerCase().includes(search.toLowerCase()))}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={{ backgroundColor: theme.colors.background }}>
                            <TouchableOpacity
                                style={styles.messageItem}
                                activeOpacity={0.7}
                                onPress={() => handlePressConversation(item)}
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
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        paddingTop: Platform.OS === 'android' ? 8 : 0,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#181112',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    searchContainer: {
        paddingBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        height: 44,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInnerInputContainer: {
        flex: 1,
        marginBottom: 0,
    },
    searchInnerInput: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        paddingHorizontal: 0,
        fontSize: 16,
    },
    listContent: {
        paddingBottom: 120, // Aumentado para visibilidad sobre el tab bar
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
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: '#f0f0f0',
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
        color: '#181112',
        flex: 1,
    },
    time: {
        fontSize: 12,
        color: '#94a3b8',
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
        color: '#637588',
        flex: 1,
    },
    lastMessageUnread: {
        color: '#181112',
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
        backgroundColor: '#f3f4f6',
        marginLeft: 88,
        marginRight: 16,
    },
});
