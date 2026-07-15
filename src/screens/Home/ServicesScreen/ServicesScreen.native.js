import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Platform,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Button, LoadingSpinner, EmptyState } from '../../../components';
import { useServicesScreen } from './useServicesScreen';

const ServiceCard = ({ item, onToggleLike, theme }) => (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.cardHeader}>
            <View style={styles.authorRow}>
                <Avatar uri={item.profiles?.foto_url} size="sm" />
                <View>
                    <Text style={[styles.authorName, { color: theme.colors.text }]}>{item.profiles?.nombre || 'Vecino'}</Text>
                    <Text style={[styles.cardMeta, { color: theme.colors.textSecondary }]}>{item.profiles?.depto || 'Vecindario'} • {item.tipo?.toUpperCase()}</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.moreButton}>
                <MaterialCommunityIcons name="dots-horizontal" size={20} color={theme.colors.border} />
            </TouchableOpacity>
        </View>

        <View style={styles.cardBody}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.titulo}</Text>
            <Text style={[styles.cardContent, { color: theme.colors.textSecondary }]}>{item.contenido}</Text>
        </View>

        {item.imagen_url && (
            <Image source={{ uri: item.imagen_url }} style={styles.cardImage} resizeMode="cover" />
        )}

        <View style={[styles.cardFooter, { borderTopColor: theme.colors.border }]}>
            <View style={styles.statsRow}>
                <TouchableOpacity style={styles.statItem} onPress={() => onToggleLike(item.id)}>
                    <MaterialCommunityIcons
                        name={item.isLiked ? "heart" : "heart-outline"}
                        size={20}
                        color={item.isLiked ? "#ef4444" : theme.colors.textSecondary}
                    />
                    <Text style={[styles.statText, { color: item.isLiked ? '#ef4444' : theme.colors.textSecondary }]}>{item.likes_count || 0}</Text>
                </TouchableOpacity>
                <View style={styles.statItem}>
                    <MaterialCommunityIcons name="chat-outline" size={20} color={theme.colors.textSecondary} />
                    <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>{item.comments_count || 0}</Text>
                </View>
            </View>
            <Button
                variant="outline"
                size="sm"
                style={styles.cardActionBtn}
                textStyle={styles.cardActionBtnText}
            >
                RESPONDER
            </Button>
        </View>
    </View>
);

export default function ServicesScreenNative({ navigation }) {
    const logic = useServicesScreen(navigation);
    const { theme, isDark, profile } = logic;

    if (logic.loading && !logic.refreshing) return <LoadingSpinner />;

    const HeaderComponent = () => (
        <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
            <View style={styles.topRow}>
                <TouchableOpacity style={styles.locationSelector}>
                    <View style={[styles.locationIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                        <MaterialCommunityIcons name="map-marker" size={18} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.locationText, { color: theme.colors.text }]}>{profile?.comunidades?.nombre || 'Mi Vecindario'}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.headerIconButton, { backgroundColor: theme.colors.inputBackground }]}>
                    <MaterialCommunityIcons name="bell-outline" size={22} color={theme.colors.text} />
                    <View style={styles.notifDot} />
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                {['Todo', 'Aviso', 'Evento', 'Alerta'].map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.filterChip,
                            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                            logic.activeTab === tab && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                        ]}
                        onPress={() => logic.setActiveTab(tab)}
                    >
                        <Text style={[
                            styles.filterText,
                            { color: theme.colors.textSecondary },
                            logic.activeTab === tab && styles.filterTextActive
                        ]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <View style={[styles.container, { backgroundColor: isDark ? theme.colors.background : '#f6f7f8' }]}>
                <FlatList
                    data={logic.posts}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <ServiceCard item={item} onToggleLike={logic.handleToggleLike} theme={theme} />}
                    ListHeaderComponent={HeaderComponent}
                    ListEmptyComponent={<EmptyState title="No hay publicaciones" message="Sé el primero en avisar algo a tus vecinos." />}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={logic.refreshing} onRefresh={logic.handleRefresh} />
                    }
                />

                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('CreatePost')}
                >
                    <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                    <Text style={styles.fabText}>Avisar</Text>
                </TouchableOpacity>
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
    header: {
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 8 : 16,
        paddingBottom: 16,
    },
    locationSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    locationIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    headerIconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    notifDot: {
        position: 'absolute',
        top: 12,
        right: 13,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    filterContainer: {
        paddingHorizontal: 16,
        gap: 10,
    },
    filterChip: {
        paddingHorizontal: 20,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#fff',
    },
    listContent: {
        paddingBottom: 100,
    },
    card: {
        marginTop: 12,
        marginHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    authorName: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    cardMeta: {
        fontSize: 11,
        fontWeight: '500',
    },
    moreButton: {
        padding: 4,
    },
    cardBody: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardContent: {
        fontSize: 14,
        lineHeight: 20,
    },
    cardImage: {
        width: '100%',
        height: 200,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 13,
        fontWeight: '700',
    },
    cardActionBtn: {
        height: 34,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    cardActionBtnText: {
        fontSize: 11,
        fontWeight: '800',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 22,
        borderRadius: 30,
        elevation: 10,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        zIndex: 100,
        gap: 8,
    },
    fabText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
