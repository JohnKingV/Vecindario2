import React, { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    RefreshControl,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
    StatusBar,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, LoadingSpinner, LoadingDots, Input, EmptyState, ConfirmModal, OptionsModal, PostCard, ModernFAB } from '../../../components';
import { useFeedScreen } from './useFeedScreen';

export default function FeedScreenNative({ navigation }) {
    const logic = useFeedScreen(navigation);
    const { theme, isDark } = logic;

    const renderHeader = (
        <Animated.View
            style={[
                styles.headerContainer,
                {
                    backgroundColor: theme.colors.background,
                    borderBottomColor: theme.colors.border,
                    paddingTop: Platform.OS === 'ios' ? 0 : 8,
                    transform: [{ translateY: logic.headerTranslateY }]
                }
            ]}
        >
            <View>
                <Animated.View style={{ opacity: logic.headerOpacity }}>
                    <View style={styles.topRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                                <Avatar
                                    uri={logic.userProfile?.foto_url || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=150'}
                                    size={44}
                                    status={logic.userProfile?.status}
                                    featured={logic.userProfile?.is_featured || logic.userProfile?.raiting_ventas >= 4.0}
                                />
                            </TouchableOpacity>
                            <View>
                                {/* Badge de Perfil Destacado */}
                                {(logic.userProfile?.is_featured || logic.userProfile?.raiting_ventas > 4.0) && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <View style={{
                                            backgroundColor: '#FEF3C7',
                                            paddingHorizontal: 8,
                                            paddingVertical: 4,
                                            borderRadius: 12,
                                            borderWidth: 1,
                                            borderColor: '#FDE68A'
                                        }}>
                                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#D97706' }}>
                                                Vecino Destacado
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                            <MaterialCommunityIcons name="star" size={14} color="#F59E0B" />
                                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.colors.text }}>
                                                {logic.userProfile?.raiting_ventas || 4.5}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>
                        <View style={styles.topActions}>
                            {/* Empty space for the absolute positioned FAB */}
                        </View>
                    </View>
                    <Text style={[styles.mainTitle, { color: theme.colors.text }]}>Novedades</Text>
                </Animated.View>

                {/* PREMIUM STICKY FAB */}
                <Animated.View
                    pointerEvents="box-none"
                    style={[
                        styles.stickyFabContainer,
                        {
                            transform: [
                                { translateY: logic.fabTranslateY },
                                { translateX: logic.fabTranslateX },
                                { scale: logic.fabScale }
                            ]
                        }
                    ]}
                >
                    <ModernFAB
                        onPress={() => navigation.navigate('CreatePost')}
                        label="PUBLICAR"
                        size={58}
                    />
                </Animated.View>

                <View style={[
                    styles.searchSection,
                    { backgroundColor: theme.colors.background, paddingRight: 80 }
                ]}>
                    <Input
                        placeholder="Buscar en Vecindario"
                        value={logic.searchQuery}
                        onChangeText={logic.setSearchQuery}
                        noMargin
                        leftIcon={<MaterialCommunityIcons name="magnify" size={22} color={theme.colors.textSecondary} />}
                        rightIcon={logic.searchQuery.length > 0 ? (
                            <TouchableOpacity onPress={() => logic.setSearchQuery('')}>
                                <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        ) : null}
                    />
                </View>

                <View style={styles.filterBar}>
                    {['Todo', 'Seguridad', 'Eventos', 'Avisos', 'Comunicados'].map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            onPress={() => logic.toggleFilter(filter)}
                            style={[
                                styles.filterChip,
                                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                                logic.activeFilter === filter && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                            ]}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: theme.colors.textSecondary },
                                logic.activeFilter === filter && styles.activeFilterText
                            ]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Animated.View>
    );

    const renderPost = useCallback(({ item }) => {
        const isOwner = item.user_id === logic.user?.id;
        return (
            <PostCard
                item={item}
                user={logic.user}
                userProfile={logic.userProfile}
                theme={theme}
                isDark={isDark}
                typeConfig={logic.typeConfig}
                onPress={() => logic.handlePostPress(item)}
                onLike={() => logic.handleLike(item.id)}
                onLongPressLike={() => logic.handleShowLikes(item.id)}
                onCommentLike={(commentId) => logic.handleCommentLike(commentId, item.id)}
                onCommentLongPressLike={(commentId) => logic.handleShowCommentLikes(commentId)}
                onMoreOptions={() => logic.handleOptionsPress(item)}
                onUserProfilePress={() => {
                    const profileData = isOwner ? logic.userProfile : item.profiles;
                    const resolvedProfile = Array.isArray(profileData) ? profileData[0] : profileData;
                    logic.handleUserProfilePress(resolvedProfile);
                }}
                formatDate={logic.formatDate}
            />
        );
    }, [logic.user, logic.userProfile, theme, isDark, logic.typeConfig, logic.handlePostPress, logic.handleLike, logic.handleShowLikes, logic.handleCommentLike, logic.handleShowCommentLikes, logic.handleOptionsPress, logic.handleUserProfilePress, logic.formatDate]);

    if (logic.loading && !logic.posts.length) return <LoadingSpinner />;

    return (
        <>
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
                <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                    <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />

                    <Animated.FlatList
                        style={{ opacity: logic.contentOpacity }}
                        data={logic.filteredPosts}
                        keyExtractor={(item) => item.id}
                        renderItem={renderPost}
                        ListHeaderComponent={null}
                        contentContainerStyle={[
                            styles.listPadding,
                            { paddingTop: logic.HEADER_MAX_HEIGHT, paddingBottom: 0 }
                        ]}
                        showsVerticalScrollIndicator={false}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { y: logic.scrollY } } }],
                            { useNativeDriver: true }
                        )}
                        scrollEventThrottle={16}
                        refreshControl={
                            <RefreshControl
                                refreshing={logic.refreshing}
                                onRefresh={logic.onRefresh}
                                progressViewOffset={logic.HEADER_MAX_HEIGHT}
                            />
                        }
                        ListEmptyComponent={
                            !logic.loading ? (
                                <EmptyState
                                    icon="📭"
                                    title="No hay publicaciones aún"
                                    message="Sé el primero en compartir algo con la comunidad."
                                />
                            ) : null
                        }
                    />

                    {logic.isFiltering && (
                        <View style={styles.loadingOverlay}>
                            <LoadingDots size={12} color={theme.colors.primary} />
                        </View>
                    )}

                    {renderHeader}
                </View>
            </SafeAreaView>

            <OptionsModal
                visible={logic.showOptionsModal}
                onClose={() => logic.setShowOptionsModal(false)}
                title="Opciones de Publicación"
                options={[
                    ...(logic.selectedPost?.user_id === logic.user?.id ? [{
                        label: 'Editar publicación',
                        icon: 'pencil-outline',
                        onPress: () => logic.handleEditPress(logic.selectedPost)
                    }] : []),
                    {
                        label: 'Eliminar publicación',
                        icon: 'trash-can-outline',
                        onPress: logic.handleDeletePress,
                        destructive: true
                    },
                    {
                        label: 'Compartir',
                        icon: 'share-variant-outline',
                        onPress: () => {/* handle share */ }
                    }
                ]}
            />

            <ConfirmModal
                visible={logic.showDeleteConfirm}
                onClose={() => !logic.isDeleting && logic.setShowDeleteConfirm(false)}
                onConfirm={logic.confirmDeletePost}
                title="Eliminar Publicación"
                message="¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer."
                confirmText={logic.isDeleting ? "Eliminando..." : "Eliminar"}
                type="danger"
            />

            <ConfirmModal
                visible={logic.alertState.visible}
                onClose={logic.hideAlert}
                onConfirm={logic.alertState.onConfirm}
                title={logic.alertState.title}
                message={logic.alertState.message}
                confirmText="Entendido"
                type={logic.alertState.type}
                showCancel={false}
            />

            <OptionsModal
                visible={logic.showLikesModal}
                onClose={() => logic.setShowLikesModal(false)}
                title="Vecinos que les gusta"
            >
                <View style={{ maxHeight: 400, paddingBottom: 24 }}>
                    {logic.loadingLikes ? (
                        <LoadingSpinner />
                    ) : logic.likesList.length > 0 ? (
                        <Animated.FlatList
                            data={logic.likesList}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.likeUserItem}
                                    onPress={() => {
                                        logic.setShowLikesModal(false);
                                        navigation.navigate('UserProfile', { userId: item.id, userProfile: item });
                                    }}
                                >
                                    <Avatar uri={item.foto_url} name={item.nombre} size="sm" />
                                    <View>
                                        <Text style={[styles.likeUserName, { color: theme.colors.text }]}>{item.nombre}</Text>
                                        <Text style={[styles.likeUserDepto, { color: theme.colors.textSecondary }]}>DEPTO {item.depto}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    ) : (
                        <Text style={{ textAlign: 'center', padding: 20, color: theme.colors.textSecondary }}>Aún no hay likes</Text>
                    )}
                </View>
            </OptionsModal>
        </>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    fabPosition: {
        bottom: Platform.OS === 'ios' ? 110 : 90,
        right: 20,
    },
    listPadding: {
        paddingBottom: 40,
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(248, 250, 252, 1)',
        paddingHorizontal: 12,
        paddingBottom: 0,
        zIndex: 100,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    topActions: {
        flexDirection: 'row',
        gap: 12,
    },
    roundBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        position: 'relative',
    },
    accentBtn: {
        backgroundColor: '#197fe6',
        borderWidth: 0,
        shadowColor: '#197fe6',
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    searchSection: {
        marginBottom: 0,
        backgroundColor: '#f8fafc',
        marginHorizontal: -20,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 4,
        paddingBottom: 0,
        zIndex: 1,
    },
    stickyFabContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? -5 : -3,
        right: 2,
        zIndex: 200,
    },
    filterBar: {
        flexDirection: 'row',
        paddingHorizontal: 0,
        paddingTop: 8,
        paddingBottom: 10,
        gap: 4,
        justifyContent: 'space-between',
    },
    filterChip: {
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 10,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    activeChip: {
        backgroundColor: '#197fe6',
        borderColor: '#197fe6',
        shadowColor: '#197fe6',
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#64748b',
    },
    activeFilterText: {
        color: '#fff',
    },
    modalScrollContent: {
        flexGrow: 1,
    },
    modalBody: {
        padding: 20,
        paddingBottom: 40,
    },
    inputWrapper: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    premiumInputContainer: {
        marginBottom: 0,
        borderWidth: 0,
    },
    premiumInput: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    premiumTextArea: {
        minHeight: 120,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    typeSelectorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeOption: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    typeOptionText: {
        fontSize: 12,
        fontWeight: '600',
    },
    premiumImageSelector: {
        width: '100%',
        height: 200,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        overflow: 'hidden',
    },
    selectedImage: {
        width: '100%',
        height: '100%',
    },
    premiumImagePlaceholder: {
        alignItems: 'center',
    },
    cameraIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    premiumImageLabel: {
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 4,
    },
    premiumImageSub: {
        fontSize: 12,
    },
    premiumPublishBtn: {
        borderRadius: 16,
        height: 56,
        marginTop: 10,
    },
    premiumPublishBtnText: {
        fontSize: 16,
        fontWeight: '700',
    },
    likeUserItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    likeUserName: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    likeUserDepto: {
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 2,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 280, // Approximate header height + some padding
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
    },
});
