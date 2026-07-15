import { useState, useEffect, useRef } from 'react';
import { Animated, Linking, Alert, Share, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { marketplaceService } from '../../../services/marketplaceService';
import { messagesService } from '../../../services/messagesService';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';

const { width } = Dimensions.get('window');

export const useItemDetailScreen = (route, navigation) => {
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();
    const { item } = route.params;
    const { user, profile: userProfile } = useAuth();

    const isAdmin = userProfile?.role === 'admin';
    const isOwner = user?.id === item.user_id;
    const canDelete = isOwner || isAdmin;
    const canEdit = isOwner;

    // State
    const [liked, setLiked] = useState(item.has_liked || false);
    const [likesCount, setLikesCount] = useState(item.likes_count || 0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
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

    useEffect(() => {
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
        u.id !== user?.id &&
        u.nombre && u.nombre.toLowerCase().includes(searchUser.toLowerCase())
    );

    const handleDeleteItem = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        const { error } = await marketplaceService.deleteItem(item.id, user?.id, isAdmin);
        setIsDeleting(false);
        setShowDeleteModal(false);

        if (!error) {
            navigation.goBack();
        } else {
            Alert.alert('Error', 'No se pudo eliminar el artículo: ' + (error.message || 'Error desconocido'));
        }
    };

    const handleEditItem = () => {
        navigation.navigate('CreateItem', { item });
    };

    const handleToggleLike = async () => {
        if (!user) return;

        setLiked(!liked);
        setLikesCount(prev => liked ? prev - 1 : prev + 1);

        const { error } = await marketplaceService.toggleLike(item.id, user.id);
        if (error) {
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

    const handleChatInternal = async () => {
        if (!user || isOwner) return;

        try {
            const { data: conv, error } = await messagesService.getOrCreateConversation(user.id, item.user_id);
            if (error) throw error;

            navigation.navigate('Chat', {
                conversation: {
                    id: conv.id,
                    name: item.profiles?.nombre || (item.profiles?.sexo === 'mujer' ? 'Vecina' : 'Vecino'),
                    avatar: item.profiles?.foto_url,
                    sexo: item.profiles?.sexo,
                    otherId: item.user_id
                },
                initialProduct: item
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

    return {
        // State
        item,
        user,
        userProfile,
        liked,
        comments,
        loadingComments,
        newComment, setNewComment,
        isSubmittingComment,
        showDeleteModal, setShowDeleteModal,
        isDeleting,
        showOptionsModal, setShowOptionsModal,
        showWithdrawModal, setShowWithdrawModal,
        showSoldConfirmation, setShowSoldConfirmation,
        showBuyerModal, setShowBuyerModal,
        searchUser, setSearchUser,
        loadingUsers,
        filteredUsers,
        isProcessingAction,
        scrollX,
        displayImages,

        // Utils
        theme,
        isDark,
        insets,
        width,
        formatPrice,
        getTimeAgo,
        isOwner,
        canDelete,

        // Handlers
        handleAddComment,
        handleMarkAsSold,
        handleConfirmSoldAction,
        handleOpenBuyerSelection,
        handleDeleteItem,
        confirmDelete,
        handleEditItem,
        handleToggleLike,
        handleOpenMap,
        handleChatInternal,
        handleShare,
    };
};
