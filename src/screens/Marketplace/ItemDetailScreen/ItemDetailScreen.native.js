import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    StatusBar,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Badge, Button, ConfirmModal, OptionsModal, ResilientImage, Input, Modal, LoadingSpinner } from '../../../components';
import { useItemDetailScreen } from './useItemDetailScreen';

export default function ItemDetailScreenNative({ route, navigation }) {
    const logic = useItemDetailScreen(route, navigation);
    const { theme, insets, width, isDark } = logic;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />

            {/* Top Navigation Overlay */}
            <View style={styles.headerOverlay}>
                <TouchableOpacity
                    style={[styles.headerIconButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255, 255, 255, 0.9)' }]}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? '#fff' : '#181112'} />
                </TouchableOpacity>
                <View style={styles.headerRightGroup}>
                    <TouchableOpacity style={[styles.headerIconButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255, 255, 255, 0.9)' }]} onPress={logic.handleShare}>
                        <MaterialCommunityIcons name="share-variant" size={22} color={isDark ? '#fff' : '#181112'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.headerIconButton, logic.liked && styles.heartActive, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255, 255, 255, 0.9)' }]}
                        onPress={logic.handleToggleLike}
                    >
                        <MaterialCommunityIcons
                            name={logic.liked ? "heart" : "heart-outline"}
                            size={24}
                            color={logic.liked ? "#FFA500" : (isDark ? '#fff' : "#181112")}
                        />
                    </TouchableOpacity>
                    {(logic.isOwner || logic.canDelete) && (
                        <TouchableOpacity
                            style={[styles.headerIconButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255, 255, 255, 0.9)' }]}
                            onPress={() => logic.setShowOptionsModal(true)}
                        >
                            <MaterialCommunityIcons name="dots-vertical" size={24} color={isDark ? '#fff' : '#181112'} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header Image Section */}
                <View style={[styles.imageWrapper, { backgroundColor: theme.colors.inputBackground }]}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: logic.scrollX } } }],
                            { useNativeDriver: false }
                        )}
                        scrollEventThrottle={16}
                    >
                        {logic.displayImages.map((img, index) => (
                            <ResilientImage
                                key={index}
                                source={{ uri: img }}
                                style={{ width, height: '100%' }}
                                resizeMode="cover"
                            />
                        ))}
                    </ScrollView>

                    {logic.displayImages.length > 1 && (
                        <View style={styles.paginationContainer}>
                            {logic.displayImages.map((_, index) => {
                                const opacity = logic.scrollX.interpolate({
                                    inputRange: [
                                        (index - 1) * width,
                                        index * width,
                                        (index + 1) * width,
                                    ],
                                    outputRange: [0.5, 1, 0.5],
                                    extrapolate: 'clamp',
                                });

                                const scale = logic.scrollX.interpolate({
                                    inputRange: [
                                        (index - 1) * width,
                                        index * width,
                                        (index + 1) * width,
                                    ],
                                    outputRange: [0.8, 1.2, 0.8],
                                    extrapolate: 'clamp',
                                });

                                return (
                                    <Animated.View
                                        key={index}
                                        style={[
                                            styles.dot,
                                            { opacity, transform: [{ scale }] }
                                        ]}
                                    />
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Product Content */}
                <View style={styles.contentSection}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>{logic.item.titulo}</Text>
                    </View>

                    <View style={styles.priceContainer}>
                        <Text style={[styles.price, { color: theme.colors.primary }]}>{logic.formatPrice(logic.item.precio)}</Text>
                        <Badge
                            variant={logic.item.vendido ? 'error' : 'success'}
                            style={styles.statusBadge}
                        >
                            {logic.item.vendido ? 'Inactivo' : 'Disponible'}
                        </Badge>
                    </View>

                    <View style={styles.locationMetaRow}>
                        <MaterialCommunityIcons name="map-marker-outline" size={18} color={theme.colors.textSecondary} />
                        <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{logic.item.ubicacion || 'Villa Club, Ciudad'}</Text>
                        <Text style={[styles.metaSeparator, { color: theme.colors.border }]}>•</Text>
                        <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{logic.getTimeAgo()}</Text>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                {/* Description Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Descripción</Text>
                    <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]}>
                        {logic.item.contenido || logic.item.descripcion || 'Este artículo está en excelente estado, ideal para su uso dentro del vecindario.'}
                    </Text>

                    <View style={styles.attributesGrid}>
                        <View style={[styles.attributeCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <MaterialCommunityIcons name="speedometer" size={24} color={theme.colors.primary} style={styles.attrIcon} />
                            <Text style={[styles.attrLabel, { color: theme.colors.textSecondary }]}>Estado</Text>
                            <Text style={[styles.attrValue, { color: theme.colors.text }]}>{logic.item.condicion || 'Como nuevo'}</Text>
                        </View>
                        <View style={[styles.attributeCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <MaterialCommunityIcons name="tag-outline" size={24} color={theme.colors.primary} style={styles.attrIcon} />
                            <Text style={[styles.attrLabel, { color: theme.colors.textSecondary }]}>Categoría</Text>
                            <Text style={[styles.attrValue, { color: theme.colors.text }]}>{logic.item.categoria || 'Otros'}</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                {(logic.item.ubicacion || (logic.item.latitude && logic.item.longitude)) ? (
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ubicación</Text>
                            <TouchableOpacity onPress={logic.handleOpenMap}>
                                <Text style={[styles.viewMapText, { color: theme.colors.primary }]}>Ver en mapa completo</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.mapContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.inputBackground }]}>
                            <TouchableOpacity activeOpacity={0.9} onPress={logic.handleOpenMap} style={styles.mapTouchArea}>
                                <View style={[styles.mapOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255, 255, 255, 0.5)' }]}>
                                    <View style={[styles.mapMarkerPulse, { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '33' }]}>
                                        <View style={[styles.mapMarkerInner, { backgroundColor: theme.colors.primary }]} />
                                    </View>
                                    <Text style={[styles.mapHintText, { color: theme.colors.primary }]}>Toca para ver en el mapa</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ubicación</Text>
                        <View style={[styles.noLocationItem, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}>
                            <MaterialCommunityIcons name="map-marker-off-outline" size={24} color={theme.colors.textSecondary} />
                            <Text style={[styles.noLocationText, { color: theme.colors.textSecondary }]}>Sin ubicación compartida</Text>
                        </View>
                    </View>
                )}
                {/* Comments Section */}
                <View style={[styles.section, { paddingBottom: 40 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Preguntas y Comentarios ({logic.comments.length})</Text>

                    {logic.loadingComments ? (
                        <View style={{ padding: 20 }}>
                            <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>Cargando comentarios...</Text>
                        </View>
                    ) : logic.comments.length === 0 ? (
                        <View style={styles.emptyComments}>
                            <MaterialCommunityIcons name="chat-outline" size={40} color={theme.colors.border} />
                            <Text style={[styles.emptyCommentsText, { color: theme.colors.textSecondary }]}>Sé el primero en preguntar algo.</Text>
                        </View>
                    ) : (
                        logic.comments.map((comment) => (
                            <View key={comment.id} style={styles.commentItem}>
                                <Avatar uri={comment.profiles?.foto_url} name={comment.profiles?.nombre} size="sm" />
                                <View style={styles.commentContent}>
                                    <View style={styles.commentHeader}>
                                        <Text style={[styles.commentAuthor, { color: theme.colors.text }]}>{comment.profiles?.nombre}</Text>
                                        <Text style={[styles.commentTime, { color: theme.colors.textSecondary }]}>
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <Text style={[styles.commentText, { color: theme.colors.textSecondary }]}>{comment.contenido}</Text>
                                </View>
                            </View>
                        ))
                    )}

                    {logic.user && (
                        <View style={[styles.addCommentRow, { borderTopColor: theme.colors.border }]}>
                            <Avatar uri={logic.userProfile?.foto_url} name={logic.userProfile?.nombre} size="sm" />
                            <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBackground }]}>
                                <Input
                                    flat
                                    placeholder={logic.isOwner ? "Escribe un comentario o respuesta..." : "Escribe una pregunta..."}
                                    value={logic.newComment}
                                    onChangeText={logic.setNewComment}
                                    style={{ flex: 1, paddingHorizontal: 0, height: 40, color: theme.colors.text }}
                                    containerStyle={{ marginBottom: 0, borderWidth: 0, flex: 1 }}
                                />
                                <TouchableOpacity
                                    onPress={logic.handleAddComment}
                                    disabled={!logic.newComment.trim() || logic.isSubmittingComment}
                                >
                                    <MaterialCommunityIcons
                                        name="send"
                                        size={24}
                                        color={logic.newComment.trim() ? theme.colors.primary : theme.colors.border}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Seller Section & Sticky Action */}
            <View style={[styles.stickyFooter, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
                <TouchableOpacity
                    style={styles.sellerMiniCard}
                    onPress={() => navigation.navigate('UserProfile', {
                        userId: logic.item.user_id,
                        userProfile: logic.item.profiles
                    })}
                >
                    <Avatar
                        uri={logic.item.profiles?.foto_url}
                        name={logic.item.profiles?.nombre || (logic.item.profiles?.sexo === 'mujer' ? 'Vecina' : 'Vecino')}
                        size="md"
                        border
                    />
                    <View style={styles.sellerTextContainer}>
                        <View style={styles.sellerNameRow}>
                            <Text style={[styles.sellerName, { color: theme.colors.text }]} numberOfLines={1}>{logic.item.profiles?.nombre || (logic.item.profiles?.sexo === 'mujer' ? 'Vecina' : 'Vecino')}</Text>
                        </View>
                        <View style={styles.ratingRow}>
                            <MaterialCommunityIcons
                                name={logic.item.profiles?.raiting_ventas >= 4.0 ? "star" : "star-outline"}
                                size={14}
                                color={logic.item.profiles?.raiting_ventas >= 4.0 ? "#fb923c" : theme.colors.textSecondary}
                            />
                            <Text style={[styles.ratingText, { color: theme.colors.textSecondary }]}>
                                {logic.item.profiles?.raiting_ventas >= 4.0 ? 'Vecino destacado' : 'Sin calificar'}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {logic.isOwner ? (
                    <Button
                        onPress={logic.handleMarkAsSold}
                        variant="error"
                        style={styles.contactBtn}
                        contentStyle={{ paddingVertical: 0, height: '100%' }}
                        textStyle={{ fontSize: 12, fontWeight: '600' }}
                        leftIcon={<MaterialCommunityIcons name={logic.item.categoria === 'Servicios' ? "close-circle-outline" : "check-circle-outline"} size={20} color="#fff" />}
                    >
                        {logic.item.categoria === 'Servicios' ? 'Retirar Servicio' : 'Marcar como Vendido'}
                    </Button>
                ) : (
                    <Button
                        onPress={logic.handleChatInternal}
                        style={styles.contactBtn}
                        contentStyle={{ paddingVertical: 0, height: '100%' }}
                        textStyle={{ fontSize: 12, fontWeight: '600' }}
                        leftIcon={<MaterialCommunityIcons name="message-outline" size={18} color="#fff" />}
                    >
                        Enviar Mensaje
                    </Button>
                )}
            </View>

            <ConfirmModal
                visible={logic.showDeleteModal}
                onClose={() => !logic.isDeleting && logic.setShowDeleteModal(false)}
                onConfirm={logic.confirmDelete}
                title="Eliminar Artículo"
                message="¿Estás seguro de que quieres eliminar este artículo? Esta acción no se puede deshacer."
                confirmText={logic.isDeleting ? "Eliminando..." : "Eliminar"}
                type="danger"
            />

            <OptionsModal
                visible={logic.showOptionsModal}
                onClose={() => logic.setShowOptionsModal(false)}
                title="Opciones del Artículo"
                options={[
                    ...(logic.isOwner ? [{
                        label: 'Editar artículo',
                        icon: 'pencil-outline',
                        onPress: logic.handleEditItem
                    }] : []),
                    ...(logic.canDelete ? [{
                        label: 'Eliminar artículo',
                        icon: 'trash-can-outline',
                        onPress: () => logic.setShowDeleteModal(true),
                        destructive: true
                    }] : []),
                    {
                        label: logic.item.categoria === 'Servicios' ? 'Retirar servicio' : 'Marcar como vendido',
                        icon: 'check-circle-outline',
                        onPress: logic.handleMarkAsSold
                    }
                ]}
            />

            {/* Withdraw Modal (Services) */}
            <ConfirmModal
                visible={logic.showWithdrawModal}
                onClose={() => !logic.isProcessingAction && logic.setShowWithdrawModal(false)}
                onConfirm={() => logic.handleConfirmSoldAction(null)}
                title="Retirar Servicio"
                message="¿Estás seguro de que quieres retirar este servicio del marketplace?"
                confirmText={logic.isProcessingAction ? "Retirando..." : "Sí, retirar"}
                type="danger"
            />

            {/* Sold Confirmation Modal (Products) */}
            <ConfirmModal
                visible={logic.showSoldConfirmation}
                onClose={() => !logic.isProcessingAction && logic.setShowSoldConfirmation(false)}
                onConfirm={logic.handleOpenBuyerSelection}
                title="Marcar como Vendido"
                message="¡Felicidades por tu venta! ¿Quieres registrar a quién se lo vendiste?"
                confirmText="Sí, seleccionar comprador"
                cancelText="No, marcar como vendido"
                onCancel={() => logic.handleConfirmSoldAction(null)}
            />

            {/* Buyer Selection Modal */}
            <Modal
                isOpen={logic.showBuyerModal}
                onClose={() => logic.setShowBuyerModal(false)}
                title="¿A quién se lo vendiste?"
            >
                <View style={styles.buyerModalContent}>
                    {logic.isProcessingAction ? (
                        <View style={{ padding: 40, alignItems: 'center', gap: 16 }}>
                            <LoadingSpinner size="lg" />
                            <Text style={{ color: theme.colors.textSecondary }}>Procesando venta...</Text>
                        </View>
                    ) : (
                        <>
                            <Input
                                placeholder="Buscar vecino..."
                                value={logic.searchUser}
                                onChangeText={logic.setSearchUser}
                                leftIcon={<MaterialCommunityIcons name="magnify" size={20} color={theme.colors.placeholder} />}
                            />

                            {logic.loadingUsers ? (
                                <View style={{ padding: 40, alignItems: 'center' }}>
                                    <LoadingSpinner size="lg" />
                                </View>
                            ) : (
                                <ScrollView style={{ maxHeight: 300 }}>
                                    {logic.filteredUsers.length === 0 ? (
                                        <Text style={[styles.emptySearchText, { color: theme.colors.textSecondary }]}>
                                            No se encontraron vecinos.
                                        </Text>
                                    ) : (
                                        logic.filteredUsers.map(u => (
                                            <TouchableOpacity
                                                key={u.id}
                                                style={[styles.userItem, { borderBottomColor: theme.colors.border }]}
                                                onPress={() => logic.handleConfirmSoldAction(u.id)}
                                            >
                                                <Avatar uri={u.foto_url} name={u.nombre} size="sm" />
                                                <View style={styles.userInfo}>
                                                    <Text style={[styles.userNameText, { color: theme.colors.text }]}>{u.nombre}</Text>
                                                    <Text style={[styles.userDeptoText, { color: theme.colors.textSecondary }]}>
                                                        {u.depto ? ('Depto ' + u.depto + (u.torre ? (' • Torre ' + u.torre) : '')) : 'Residente'}
                                                    </Text>
                                                </View>
                                                <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.border} />
                                            </TouchableOpacity>
                                        ))
                                    )}
                                </ScrollView>
                            )}

                            <Button
                                variant="ghost"
                                onPress={() => logic.handleConfirmSoldAction(null)}
                                style={{ marginTop: 12 }}
                            >
                                Saltar y marcar como vendido
                            </Button>
                        </>
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    headerIconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    headerRightGroup: {
        flexDirection: 'row',
        gap: 8,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    imageWrapper: {
        width: '100%',
        aspectRatio: 4 / 3,
        position: 'relative',
    },
    paginationContainer: {
        position: 'absolute',
        bottom: 16,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    contentSection: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        gap: 8,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 32,
        flex: 1,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingTop: 4,
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 8,
    },
    locationMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
    },
    metaText: {
        fontSize: 14,
        fontWeight: '500',
    },
    metaSeparator: {
        fontSize: 14,
    },
    divider: {
        height: 1,
        marginHorizontal: 20,
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 24,
    },
    attributesGrid: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 24,
    },
    attributeCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    attrIcon: {
        marginBottom: 8,
    },
    attrLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    attrValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    mapContainer: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
    },
    mapTouchArea: {
        flex: 1,
    },
    mapOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapHintText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 8,
    },
    contactBtn: {
        height: 40,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    mapMarkerPulse: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    mapMarkerInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    stickyFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        gap: 16,
    },
    sellerMiniCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    sellerTextContainer: {
        gap: 2,
    },
    sellerNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    sellerName: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
    },
    heartActive: {
        backgroundColor: '#fef2f2',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    viewMapText: {
        fontWeight: 'bold',
        fontSize: 13,
    },
    noLocationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        gap: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    noLocationText: {
        fontSize: 15,
        fontWeight: '600',
    },
    emptyComments: {
        alignItems: 'center',
        padding: 30,
        gap: 12,
    },
    emptyCommentsText: {
        fontSize: 14,
        fontWeight: '500',
    },
    commentItem: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    commentContent: {
        flex: 1,
        gap: 2,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    commentAuthor: {
        fontSize: 14,
        fontWeight: '700',
    },
    commentTime: {
        fontSize: 12,
    },
    commentText: {
        fontSize: 14,
        lineHeight: 20,
    },
    addCommentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingTop: 20,
        marginTop: 10,
        borderTopWidth: 1,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderRadius: 20,
        height: 48,
    },
    emptySearchText: {
        textAlign: 'center',
        padding: 20,
        fontSize: 14,
    },
    buyerModalContent: {
        gap: 12,
        paddingBottom: 20,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 12,
    },
    userInfo: {
        flex: 1,
        gap: 2,
    },
    userNameText: {
        fontSize: 15,
        fontWeight: '700',
    },
    userDeptoText: {
        fontSize: 13,
    },
});
