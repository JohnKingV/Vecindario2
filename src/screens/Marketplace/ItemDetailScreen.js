import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Linking,
    Dimensions,
    Share,
    Platform,
    StatusBar,
    Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Badge, Button, ConfirmModal, OptionsModal, ResilientImage, Input, Modal, LoadingSpinner } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { marketplaceService } from '../../services/marketplaceService';
import { messagesService } from '../../services/messagesService';
import { Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function ItemDetailScreen({ route, navigation }) {
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();
    const { item } = route.params;
    const { user, profile: userProfile } = useAuth();
    const isAdmin = userProfile?.role === 'admin';
    const isOwner = user?.id === item.user_id;
    const canDelete = isOwner || isAdmin;
    const canEdit = isOwner;
    const [liked, setLiked] = React.useState(item.has_liked || false);
    const [likesCount, setLikesCount] = React.useState(item.likes_count || 0);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showSoldConfirmation, setShowSoldConfirmation] = useState(false);
    const [showBuyerModal, setShowBuyerModal] = useState(false);
    const [communityUsers, setCommunityUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchUser, setSearchUser] = useState('');
    const [isProcessingAction, setIsProcessingAction] = useState(false);
    const scrollX = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        loadComments();
    }, []);

    const loadComments = async () => {
        setLoadingComments(true);
        const { data, error } = await marketplaceService.getItemComments(item.id);
        if (!error) setComments(data);
        setLoadingComments(false);
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || isSubmittingComment || !user) return;

        setIsSubmittingComment(true);
        const { data, error } = await marketplaceService.addItemComment(item.id, user.id, newComment.trim());

        if (!error && data) {
            setComments(prev => [...prev, data]);
            setNewComment('');
        }
        setIsSubmittingComment(false);
    };

    const displayImages = item.imagenes_url && item.imagenes_url.length > 0
        ? item.imagenes_url
        : [item.imagen_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'];

    const formatPrice = (price) => {
        if (!price && price !== 0) return '$0';
        return '$' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handleMarkAsSold = () => {
        if (item.categoria === 'Servicios') {
            setShowWithdrawModal(true);
        } else {
            setShowSoldConfirmation(true);
        }
    };

    const handleConfirmSoldAction = async (compradorId = null) => {
        try {
            setIsProcessingAction(true);
            const { error } = await marketplaceService.markAsSold(item.id, user?.id, compradorId);

            if (error) {
                const errorMessage = error.message || 'Error desconocido';
                Alert.alert('Error', 'No se pudo procesar la acción. ' + errorMessage);
            } else {
                setShowWithdrawModal(false);
                setShowSoldConfirmation(false);
                setShowBuyerModal(false);
                navigation.goBack();
                Alert.alert('¡Éxito!', 'Publicación marcada como vendida.');
            }
        } catch (e) {
            const msg = e.message || 'Ocurrió un error desconocido.';
            Alert.alert('Error Inesperado', msg);
        } finally {
            setIsProcessingAction(false);
        }
    };

    const handleOpenBuyerSelection = async () => {
        setShowSoldConfirmation(false);
        setShowBuyerModal(true);
        // Reset processing state just in case
        setIsProcessingAction(false);

        const loadCommunityUsers = async () => {
            const communityId = userProfile?.comunidad_id || item.comunidad_id;
            if (!communityId) return;

            setLoadingUsers(true);
            const { data, error } = await marketplaceService.getCommunityUsers(communityId);
            setLoadingUsers(false);

            if (!error) {
                setCommunityUsers(data || []);
            }
        };
        loadCommunityUsers();
    };

    const filteredUsers = communityUsers.filter(u =>
        u.id !== user?.id && // No venderse a uno mismo
        u.nombre && u.nombre.toLowerCase().includes(searchUser.toLowerCase())
    );

    const handleDeleteItem = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        console.log('[ItemDetail] Confirmed delete for:', item.id);
        const { error } = await marketplaceService.deleteItem(item.id, user?.id, isAdmin);
        setIsDeleting(false);
        setShowDeleteModal(false);

        if (!error) {
            console.log('[ItemDetail] Delete success');
            navigation.goBack();
        } else {
            console.error('[ItemDetail] Delete failed:', error);
            Alert.alert('Error', 'No se pudo eliminar el artículo: ' + (error.message || 'Error desconocido'));
        }
    };

    const handleEditItem = () => {
        navigation.navigate('CreateItem', { item });
    };

    const handleToggleLike = async () => {
        if (!user) return;

        // Optimistic update
        setLiked(!liked);
        setLikesCount(prev => liked ? prev - 1 : prev + 1);

        const { error } = await marketplaceService.toggleLike(item.id, user.id);
        if (error) {
            // Revert on error
            setLiked(liked);
            setLikesCount(likesCount);
        }
    };

    const handleOpenMap = () => {
        const address = encodeURIComponent(`${item.ubicacion || 'Villa Club'}`);
        const url = Platform.select({
            ios: `maps:0,0?q=${address}`,
            android: `geo:0,0?q=${address}`,
            default: `https://www.google.com/maps/search/?api=1&query=${address}`
        });
        Linking.openURL(url);
    };

    const handleCall = () => {
        if (item.profiles?.telefono) {
            Linking.openURL(`tel:${item.profiles.telefono}`);
        }
    };

    const handleChatInternal = async () => {
        if (!user || isOwner) return;

        try {
            const { data: conv, error } = await messagesService.getOrCreateConversation(user.id, item.user_id);
            if (error) throw error;

            // Navegar a Chat con el formato que espera la pantalla
            navigation.navigate('Chat', {
                conversation: {
                    id: conv.id,
                    name: item.profiles?.nombre || (item.profiles?.sexo === 'mujer' ? 'Vecina' : 'Vecino'),
                    avatar: item.profiles?.foto_url,
                    sexo: item.profiles?.sexo,
                    otherId: item.user_id
                },
                initialProduct: item // Pasar el producto para enviar la miniatura
            });
        } catch (error) {
            console.error('Error starting chat:', error);
            Alert.alert('Error', 'No se pudo iniciar el chat. Intenta por WhatsApp.');
            handleWhatsApp();
        }
    };

    const handleWhatsApp = () => {
        if (item.profiles?.telefono) {
            const message = `Hola ${item.profiles.nombre}, estoy interesado en tu artículo "${item.titulo}" que publicaste en Vecindario App.`;
            const url = `whatsapp://send?phone=${item.profiles.telefono}&text=${encodeURIComponent(message)}`;

            Linking.canOpenURL(url).then(supported => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    Linking.openURL(`https://wa.me/${item.profiles.telefono}?text=${encodeURIComponent(message)}`);
                }
            });
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Mira este artículo en el Club de Vecinos: ${item.titulo} por ${formatPrice(item.precio)}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const getTimeAgo = () => {
        if (!item.created_at) return 'Recientemente';
        const now = new Date();
        const created = new Date(item.created_at);
        const diffInHours = Math.floor((now - created) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Hace menos de una hora';
        if (diffInHours === 1) return 'Hace 1 hora';
        if (diffInHours < 24) return `Hace ${diffInHours} horas`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return 'Hace 1 día';
        return `Hace ${diffInDays} días`;
    };

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
                    <TouchableOpacity style={[styles.headerIconButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255, 255, 255, 0.9)' }]} onPress={handleShare}>
                        <MaterialCommunityIcons name="share-variant" size={22} color={isDark ? '#fff' : '#181112'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.headerIconButton, liked && styles.heartActive, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255, 255, 255, 0.9)' }]}
                        onPress={handleToggleLike}
                    >
                        <MaterialCommunityIcons
                            name={liked ? "heart" : "heart-outline"}
                            size={24}
                            color={liked ? "#ef4444" : (isDark ? '#fff' : "#181112")}
                        />
                    </TouchableOpacity>
                    {(isOwner || canDelete) && (
                        <TouchableOpacity
                            style={[styles.headerIconButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255, 255, 255, 0.9)' }]}
                            onPress={() => setShowOptionsModal(true)}
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
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: false }
                        )}
                        scrollEventThrottle={16}
                    >
                        {displayImages.map((img, index) => (
                            <ResilientImage
                                key={index}
                                source={{ uri: img }}
                                style={{ width, height: '100%' }}
                                resizeMode="cover"
                            />
                        ))}
                    </ScrollView>

                    {displayImages.length > 1 && (
                        <View style={styles.paginationContainer}>
                            {displayImages.map((_, index) => {
                                const opacity = scrollX.interpolate({
                                    inputRange: [
                                        (index - 1) * width,
                                        index * width,
                                        (index + 1) * width,
                                    ],
                                    outputRange: [0.5, 1, 0.5],
                                    extrapolate: 'clamp',
                                });

                                const scale = scrollX.interpolate({
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
                        <Text style={[styles.title, { color: theme.colors.text }]}>{item.titulo}</Text>
                    </View>

                    <View style={styles.priceContainer}>
                        <Text style={[styles.price, { color: theme.colors.primary }]}>{formatPrice(item.precio)}</Text>
                        <Badge
                            variant={item.vendido ? 'error' : 'success'}
                            style={styles.statusBadge}
                        >
                            {item.vendido ? 'Inactivo' : 'Disponible'}
                        </Badge>
                    </View>

                    <View style={styles.locationMetaRow}>
                        <MaterialCommunityIcons name="map-marker-outline" size={18} color={theme.colors.textSecondary} />
                        <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{item.ubicacion || 'Villa Club, Ciudad'}</Text>
                        <Text style={[styles.metaSeparator, { color: theme.colors.border }]}>•</Text>
                        <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{getTimeAgo()}</Text>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                {/* Description Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Descripción</Text>
                    <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]}>
                        {item.contenido || item.descripcion || 'Este artículo está en excelente estado, ideal para su uso dentro del vecindario.'}
                    </Text>

                    <View style={styles.attributesGrid}>
                        <View style={[styles.attributeCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <MaterialCommunityIcons name="speedometer" size={24} color={theme.colors.primary} style={styles.attrIcon} />
                            <Text style={[styles.attrLabel, { color: theme.colors.textSecondary }]}>Estado</Text>
                            <Text style={[styles.attrValue, { color: theme.colors.text }]}>{item.condicion || 'Como nuevo'}</Text>
                        </View>
                        <View style={[styles.attributeCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <MaterialCommunityIcons name="tag-outline" size={24} color={theme.colors.primary} style={styles.attrIcon} />
                            <Text style={[styles.attrLabel, { color: theme.colors.textSecondary }]}>Categoría</Text>
                            <Text style={[styles.attrValue, { color: theme.colors.text }]}>{item.categoria || 'Otros'}</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                {(item.ubicacion || (item.latitude && item.longitude)) ? (
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ubicación</Text>
                            <TouchableOpacity onPress={handleOpenMap}>
                                <Text style={[styles.viewMapText, { color: theme.colors.primary }]}>Ver en mapa completo</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.mapContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.inputBackground }]}>
                            {Platform.OS === 'web' ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    style={{ border: 0, borderRadius: 16 }}
                                    srcDoc={
                                        '<style>body{margin:0;overflow:hidden;} iframe{width:100%;height:100%;border:0;}</style>' +
                                        '<iframe src="https://maps.google.com/maps?q=' +
                                        ((item.latitude && item.longitude) ? (item.latitude + ',' + item.longitude) : encodeURIComponent(item.ubicacion || 'Villa Club, Ciudad')) +
                                        '&t=&z=15&ie=UTF8&iwloc=&output=embed"></iframe>'
                                    }
                                />
                            ) : (
                                <TouchableOpacity activeOpacity={0.9} onPress={handleOpenMap} style={styles.mapTouchArea}>
                                    <View style={[styles.mapOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255, 255, 255, 0.5)' }]}>
                                        <View style={[styles.mapMarkerPulse, { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '33' }]}>
                                            <View style={[styles.mapMarkerInner, { backgroundColor: theme.colors.primary }]} />
                                        </View>
                                        <Text style={[styles.mapHintText, { color: theme.colors.primary }]}>Toca para ver en el mapa</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
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
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Preguntas y Comentarios ({comments.length})</Text>

                    {loadingComments ? (
                        <View style={{ padding: 20 }}>
                            <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>Cargando comentarios...</Text>
                        </View>
                    ) : comments.length === 0 ? (
                        <View style={styles.emptyComments}>
                            <MaterialCommunityIcons name="chat-outline" size={40} color={theme.colors.border} />
                            <Text style={[styles.emptyCommentsText, { color: theme.colors.textSecondary }]}>Sé el primero en preguntar algo.</Text>
                        </View>
                    ) : (
                        comments.map((comment) => (
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

                    {!isOwner && user && (
                        <View style={[styles.addCommentRow, { borderTopColor: theme.colors.border }]}>
                            <Avatar uri={userProfile?.foto_url} name={userProfile?.nombre} size="sm" />
                            <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBackground }]}>
                                <Input
                                    placeholder="Escribe una pregunta..."
                                    value={newComment}
                                    onChangeText={setNewComment}
                                    style={{ flex: 1, paddingHorizontal: 0, height: 40, color: theme.colors.text }}
                                    containerStyle={{ marginBottom: 0, borderWidth: 0, flex: 1 }}
                                />
                                <TouchableOpacity
                                    onPress={handleAddComment}
                                    disabled={!newComment.trim() || isSubmittingComment}
                                >
                                    <MaterialCommunityIcons
                                        name="send"
                                        size={24}
                                        color={newComment.trim() ? theme.colors.primary : theme.colors.border}
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
                        userId: item.user_id,
                        userProfile: item.profiles
                    })}
                >
                    <Avatar
                        uri={item.profiles?.foto_url}
                        name={item.profiles?.nombre || (item.profiles?.sexo === 'mujer' ? 'Vecina' : 'Vecino')}
                        size="md"
                        border
                    />
                    <View style={styles.sellerTextContainer}>
                        <View style={styles.sellerNameRow}>
                            <Text style={[styles.sellerName, { color: theme.colors.text }]}>{item.profiles?.nombre || (item.profiles?.sexo === 'mujer' ? 'Vecina' : 'Vecino')}</Text>
                        </View>
                        <View style={styles.ratingRow}>
                            <MaterialCommunityIcons
                                name={item.profiles?.raiting_ventas >= 4.0 ? "star" : "star-outline"}
                                size={14}
                                color={item.profiles?.raiting_ventas >= 4.0 ? "#fb923c" : theme.colors.textSecondary}
                            />
                            <Text style={[styles.ratingText, { color: theme.colors.textSecondary }]}>
                                {item.profiles?.raiting_ventas >= 4.0 ? 'Vecino destacado' : 'Sin calificar'}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {isOwner ? (
                    <Button
                        onPress={handleMarkAsSold}
                        variant="error"
                        style={styles.contactBtn}
                        leftIcon={<MaterialCommunityIcons name={item.categoria === 'Servicios' ? "close-circle-outline" : "check-circle-outline"} size={20} color="#fff" />}
                    >
                        {item.categoria === 'Servicios' ? 'Retirar Servicio' : 'Marcar Inactivo'}
                    </Button>
                ) : (
                    <Button
                        onPress={handleChatInternal}
                        style={styles.contactBtn}
                        leftIcon={<MaterialCommunityIcons name="message-outline" size={20} color="#fff" />}
                    >
                        Enviar Mensaje
                    </Button>
                )}
            </View>

            <ConfirmModal
                visible={showDeleteModal}
                onClose={() => !isDeleting && setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Eliminar Artículo"
                message="¿Estás seguro de que quieres eliminar este artículo? Esta acción no se puede deshacer."
                confirmText={isDeleting ? "Eliminando..." : "Eliminar"}
                type="danger"
            />

            <OptionsModal
                visible={showOptionsModal}
                onClose={() => setShowOptionsModal(false)}
                title="Opciones del Artículo"
                options={[
                    ...(isOwner ? [{
                        label: 'Editar artículo',
                        icon: 'pencil-outline',
                        onPress: handleEditItem
                    }] : []),
                    ...(canDelete ? [{
                        label: 'Eliminar artículo',
                        icon: 'trash-can-outline',
                        onPress: () => setShowDeleteModal(true),
                        destructive: true
                    }] : []),
                    {
                        label: item.categoria === 'Servicios' ? 'Retirar servicio' : 'Marcar como vendido',
                        icon: 'check-circle-outline',
                        onPress: handleMarkAsSold
                    }
                ]}
            />

            {/* Withdraw Modal (Services) */}
            <ConfirmModal
                visible={showWithdrawModal}
                onClose={() => !isProcessingAction && setShowWithdrawModal(false)}
                onConfirm={() => handleConfirmSoldAction(null)}
                title="Retirar Servicio"
                message="¿Estás seguro de que quieres retirar este servicio del marketplace?"
                confirmText={isProcessingAction ? "Retirando..." : "Sí, retirar"}
                type="danger"
            />

            {/* Sold Confirmation Modal (Products) */}
            <ConfirmModal
                visible={showSoldConfirmation}
                onClose={() => !isProcessingAction && setShowSoldConfirmation(false)}
                onConfirm={handleOpenBuyerSelection}
                title="Marcar como Vendido"
                message="¡Felicidades por tu venta! ¿Quieres registrar a quién se lo vendiste?"
                confirmText="Sí, seleccionar comprador"
                cancelText="No, marcar como vendido"
                onCancel={() => handleConfirmSoldAction(null)}
            />

            {/* Buyer Selection Modal */}
            <Modal
                isOpen={showBuyerModal}
                onClose={() => setShowBuyerModal(false)}
                title="¿A quién se lo vendiste?"
            >
                <View style={styles.buyerModalContent}>
                    {isProcessingAction ? (
                        <View style={{ padding: 40, alignItems: 'center', gap: 16 }}>
                            <LoadingSpinner size="lg" />
                            <Text style={{ color: theme.colors.textSecondary }}>Procesando venta...</Text>
                        </View>
                    ) : (
                        <>
                            <Input
                                placeholder="Buscar vecino..."
                                value={searchUser}
                                onChangeText={setSearchUser}
                                leftIcon={<MaterialCommunityIcons name="magnify" size={20} color={theme.colors.placeholder} />}
                            />

                            {loadingUsers ? (
                                <View style={{ padding: 40, alignItems: 'center' }}>
                                    <LoadingSpinner size="lg" />
                                </View>
                            ) : (
                                <ScrollView style={{ maxHeight: 300 }}>
                                    {filteredUsers.length === 0 ? (
                                        <Text style={[styles.emptySearchText, { color: theme.colors.textSecondary }]}>
                                            No se encontraron vecinos.
                                        </Text>
                                    ) : (
                                        filteredUsers.map(u => (
                                            <TouchableOpacity
                                                key={u.id}
                                                style={[styles.userItem, { borderBottomColor: theme.colors.border }]}
                                                onPress={() => handleConfirmSoldAction(u.id)}
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
                                onPress={() => handleConfirmSoldAction(null)}
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
    mainImage: {
        width: '100%',
        height: '100%',
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
    activeDot: {
        backgroundColor: '#fff',
        width: 8,
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
    mapImage: {
        width: '100%',
        height: '100%',
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
        height: 48,
        paddingHorizontal: 24,
        borderRadius: 12,
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
