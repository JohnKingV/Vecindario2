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
    FlatList,
    Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, LoadingSpinner, Input, EmptyState, ConfirmModal, OptionsModal, ResilientImage, PostCard, Button, Modal, ResponsiveContainer, PremiumHeader } from '../../../components';
import { useFeedScreen } from './useFeedScreen';

// Simplified Web-Optimized View for Desktop
export default function FeedScreenWeb({ route, navigation }) {
    const logic = useFeedScreen(navigation, route);
    const { theme, isDark } = logic;

    // Web doesn't need Animated header logic as heavily, but we'll stick to simple standard

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
                onMoreOptions={() => logic.handleOptionsPress(item)}
                onUserProfilePress={() => logic.handleUserProfilePress(isOwner ? logic.userProfile : item.profiles)}
                formatDate={logic.formatDate}
                style={styles.postCardWeb}
            />
        );
    }, [logic.user, logic.userProfile, theme, isDark, logic.typeConfig, logic.handlePostPress, logic.handleLike, logic.handleOptionsPress, logic.handleUserProfilePress, logic.formatDate]);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <PremiumHeader navigation={navigation} activeTab="INICIO" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                <ResponsiveContainer maxWidth={1600} style={styles.mainWrapper}>
                    <View style={styles.mainLayout}>
                        {/* Sidebar */}
                        <View style={styles.sidebar}>
                            <Text style={[styles.sidebarTitle, { color: theme.colors.text }]}>Filtrar Actividad</Text>

                            <View style={styles.sidebarSection}>
                                <Text style={styles.sidebarLabel}>CATEGORÍAS</Text>
                                {['Todo', 'Seguridad', 'Eventos', 'Avisos'].map(filter => (
                                    <TouchableOpacity
                                        key={filter}
                                        style={styles.checkboxRow}
                                        onPress={() => logic.toggleFilter(filter)}
                                    >
                                        <View style={[
                                            styles.checkbox,
                                            { borderColor: theme.colors.border },
                                            logic.activeFilter === filter && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                        ]}>
                                            {logic.activeFilter === filter && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
                                        </View>
                                        <Text style={[styles.checkboxLabel, { color: logic.activeFilter === filter ? theme.colors.primary : theme.colors.textSecondary }]}>{filter}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={[styles.promoCard, { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }]}>
                                <Text style={[styles.promoTitle, { color: theme.colors.primary }]}>¿Algo que informar?</Text>
                                <Text style={[styles.promoDesc, { color: theme.colors.textSecondary }]}>Comparte noticias, alertas o eventos con tus vecinos al instante.</Text>
                                <Button
                                    style={styles.promoBtn}
                                    onPress={() => logic.setIsModalOpen(true)}
                                >
                                    CREAR PUBLICACIÓN
                                </Button>
                            </View>
                        </View>

                        {/* Main Content */}
                        <View style={styles.content}>
                            <View style={[styles.searchBarRow, { marginBottom: 24 }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('Announcements')}
                                        style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                    >
                                        <Text style={{ fontSize: 14, fontWeight: '900', color: theme.colors.textSecondary }}>NOVEDADES</Text>
                                    </TouchableOpacity>
                                    <View style={{ width: 1, height: 20, backgroundColor: theme.colors.border }} />
                                    <View style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                                        <Text style={{ fontSize: 14, fontWeight: '900', color: theme.colors.primary }}>FEED SOCIAL</Text>
                                    </View>
                                </View>
                                <Button
                                    onPress={() => logic.setIsModalOpen(true)}
                                    style={styles.mainActionBtn}
                                    icon={<MaterialCommunityIcons name="plus-circle" size={22} color="#fff" />}
                                >
                                    PUBLICAR
                                </Button>
                            </View>

                            <View style={styles.searchBarRow}>
                                <View style={styles.searchWrapper}>
                                    <Input
                                        placeholder="Buscar en el feed..."
                                        value={logic.searchQuery}
                                        onChangeText={logic.setSearchQuery}
                                        noMargin
                                        leftIcon={<MaterialCommunityIcons name="magnify" size={24} color={theme.colors.textSecondary} />}
                                    />
                                </View>
                            </View>

                            <View style={{ paddingBottom: 40 }}>
                                {logic.loading && !logic.posts.length ? (
                                    <LoadingSpinner />
                                ) : (
                                    <View>
                                        {logic.filteredPosts.map((post) => (
                                            <View key={post.id}>
                                                {renderPost({ item: post })}
                                            </View>
                                        ))}
                                        {logic.filteredPosts.length === 0 && (
                                            <EmptyState
                                                icon="📭"
                                                title="No hay publicaciones aún"
                                                message="Sé el primero en compartir algo con la comunidad."
                                            />
                                        )}
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </ResponsiveContainer>
            </ScrollView>

            {/* Modals reuse same components as they are already platform adaptable or handled externally */}
            <Modal isOpen={logic.isModalOpen} onClose={() => { logic.setIsModalOpen(false); logic.resetForm(); }} title={logic.editingPost ? "Editar Publicación" : "Crear Publicación"}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.modalScrollContent}
                >
                    <View style={styles.modalBody}>
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>TÍTULO</Text>
                            <Input
                                placeholder="Asunto del aviso..."
                                value={logic.newPostTitle}
                                onChangeText={logic.setNewPostTitle}
                                containerStyle={styles.premiumInputContainer}
                                style={[styles.premiumInput, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
                                placeholderTextColor={theme.colors.placeholder}
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>MENSAJE</Text>
                            <Input
                                multiline
                                placeholder="Describe lo que sucede..."
                                value={logic.newPostContent}
                                onChangeText={logic.setNewPostContent}
                                containerStyle={styles.premiumInputContainer}
                                style={[styles.premiumInput, styles.premiumTextArea, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
                                placeholderTextColor={theme.colors.placeholder}
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>TIPO DE PUBLICACIÓN</Text>
                            <View style={styles.typeSelectorRow}>
                                {Object.entries(logic.typeConfig).map(([key, config]) => (
                                    <TouchableOpacity
                                        key={key}
                                        activeOpacity={0.7}
                                        style={[
                                            styles.typeOption,
                                            { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border },
                                            logic.newPostType === key && {
                                                backgroundColor: config.bgColor,
                                                borderColor: config.color,
                                                borderWidth: 1.5
                                            }
                                        ]}
                                        onPress={() => logic.setNewPostType(key)}
                                    >
                                        <Text style={[
                                            styles.typeOptionText,
                                            { color: theme.colors.textSecondary },
                                            logic.newPostType === key && { color: config.color, fontWeight: '800' }
                                        ]}>
                                            {config.label.toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.premiumImageSelector, { backgroundColor: theme.colors.inputBackground }]}
                            onPress={logic.handlePickImage}
                            activeOpacity={0.8}
                        >
                            {logic.newPostImage ? (
                                <ResilientImage source={{ uri: logic.newPostImage }} style={styles.selectedImage} />
                            ) : (
                                <View style={styles.premiumImagePlaceholder}>
                                    <View style={[styles.cameraIconContainer, { backgroundColor: theme.colors.card }]}>
                                        <MaterialCommunityIcons name="camera" size={24} color={theme.colors.textSecondary} />
                                    </View>
                                    <Text style={[styles.premiumImageLabel, { color: theme.colors.textSecondary }]}>AÑADIR IMAGEN</Text>
                                    <Text style={[styles.premiumImageSub, { color: theme.colors.placeholder }]}>Suelte o toque para subir</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <Button
                            fullWidth
                            onPress={logic.handleCreatePost}
                            loading={logic.isPublishing}
                            style={styles.premiumPublishBtn}
                            textStyle={styles.premiumPublishBtnText}
                        >
                            {logic.editingPost ? 'Guardar Cambios' : 'Publicar'} <MaterialCommunityIcons name="send" size={18} color="#fff" />
                        </Button>
                    </View>
                </ScrollView>
            </Modal>

            <OptionsModal
                visible={logic.showOptionsModal}
                onClose={() => logic.setShowOptionsModal(false)}
                title="Opciones"
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
                    }
                ]}
            />
            <ConfirmModal
                visible={logic.showDeleteConfirm}
                onClose={() => !logic.isDeleting && logic.setShowDeleteConfirm(false)}
                onConfirm={logic.confirmDeletePost}
                title="Eliminar Publicación"
                message="¿Estás seguro de que quieres eliminar esta publicación?"
                confirmText={logic.isDeleting ? "Eliminando..." : "Eliminar"}
                type="danger"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: '100%',
    },
    headerContainer: {
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    mainWrapper: {
        paddingHorizontal: 24,
    },
    mainLayout: {
        flexDirection: 'row',
        paddingVertical: 40,
        gap: 48,
    },
    sidebar: {
        width: 280,
        gap: 40,
        ...Platform.select({
            web: {
                position: 'sticky',
                top: 120,
                alignSelf: 'flex-start',
            }
        })
    },
    sidebarTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: -10,
    },
    sidebarSection: {
        gap: 16,
    },
    sidebarLabel: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 4,
        opacity: 0.6,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 2,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderWidth: 1,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    promoCard: {
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        gap: 16,
    },
    promoTitle: {
        fontSize: 18,
        fontWeight: '800',
        fontStyle: 'italic',
    },
    promoDesc: {
        fontSize: 14,
        lineHeight: 22,
    },
    promoBtn: {
        height: 48,
        borderRadius: 14,
    },
    content: {
        flex: 1,
        gap: 40,
    },
    searchBarRow: {
        flexDirection: 'row',
        gap: 20,
    },
    searchWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    mainActionBtn: {
        height: 64,
        paddingHorizontal: 40,
        borderRadius: 20,
        ...Platform.select({
            web: {
                boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)',
            }
        })
    },
    webHeaderInner: {
        width: '100%',
        maxWidth: 800,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    toolbarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },
    mainTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    featuredBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 2,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    createBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    createBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
    filterBar: {
        flexDirection: 'row',
        gap: 8,
    },
    filterChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        cursor: 'pointer',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
    },
    listPadding: {
        paddingTop: 24,
        paddingBottom: 40,
    },
    postCardWeb: {
        marginTop: 0,
        marginBottom: 16,
        marginHorizontal: 0,
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
});
