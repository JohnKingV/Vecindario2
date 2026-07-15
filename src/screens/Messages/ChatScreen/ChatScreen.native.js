import React from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    ScrollView,
    Modal,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Input, ResponsiveContainer, LoadingDots } from '../../../components';
import { useChatScreen } from './useChatScreen';

export default function ChatScreenNative({ route, navigation }) {
    const logic = useChatScreen(route, navigation);
    const { theme, isDark, conversation } = logic;
    const messageInputRef = React.useRef(null);

    const renderMessage = ({ item, index }) => {
        const isMe = item.sender === 'me';
        const showAvatar = item.sender === 'other' && (index === 0 || logic.chatHistory[index - 1]?.sender !== 'other');

        return (
            <View style={[styles.messageContainer, isMe ? styles.myMessageContainer : styles.otherMessageContainer]}>
                {!isMe && (
                    <View style={styles.avatarPlaceholder}>
                        {showAvatar && (
                            <Avatar
                                uri={item.avatar}
                                name={conversation.name}
                                size="sm"
                                featured={conversation.raiting_ventas >= 4.0}
                            />
                        )}
                    </View>
                )}
                <View style={styles.bubbleWrapper}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onLongPress={() => logic.handleLongPress(item)}
                        style={[
                            styles.bubble,
                            isMe ? styles.myBubble : [styles.otherBubble, { backgroundColor: theme.colors.inputBackground }],
                            logic.editingMessageId === item.id && styles.editingBubble
                        ]}
                    >
                        {item.item && (
                            <View style={[styles.productReference, { backgroundColor: isMe ? 'rgba(0,0,0,0.1)' : theme.colors.background, borderColor: theme.colors.border }]}>
                                <Image source={{ uri: item.item.imagen_url }} style={styles.productThumb} />
                                <View style={styles.productInfo}>
                                    <Text style={[styles.productTitle, { color: isMe ? '#fff' : theme.colors.text }]} numberOfLines={1}>{item.item.titulo}</Text>
                                    <Text style={[styles.productPrice, { color: isMe ? '#e0f2fe' : theme.colors.primary }]}>
                                        {logic.formatPrice(item.item.precio)}
                                    </Text>
                                </View>
                            </View>
                        )}
                        {item.image && (
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => {
                                    logic.setViewerImage(item.image);
                                    logic.setViewerVisible(true);
                                }}
                                style={styles.imageMessageWrapper}
                            >
                                <Image
                                    source={{ uri: item.image }}
                                    style={styles.messageImage}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        )}
                        {item.text && item.text.trim() !== '' && (
                            <Text style={[styles.messageText, isMe ? styles.myMessageText : [styles.otherMessageText, { color: theme.colors.text }]]}>
                                {item.text}
                            </Text>
                        )}
                    </TouchableOpacity>
                    {(!item.text || item.text.trim() === '') && item.time && (
                        <View style={styles.imageTimeBadge}>
                            <Text style={styles.imageTimeText}>
                                {item.time}{item.status ? ` • ${item.status}` : ''}
                            </Text>
                        </View>
                    )}
                    <View style={[styles.timeRow, isMe ? styles.myTimeRow : styles.otherTimeRow]}>
                        {item.isEdited && <Text style={styles.editedText}>editado</Text>}
                        {item.text && item.text.trim() !== '' && item.time && (
                            <Text style={[styles.timeText, isMe && styles.myTimeText]}>
                                {item.time}{item.status ? ` • ${item.status}` : ''}
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const renderTypingIndicator = () => {
        if (!logic.isOtherTyping) return null;

        return (
            <View style={[styles.messageContainer, styles.otherMessageContainer, { marginBottom: 12, marginTop: 8 }]}>
                <View style={styles.avatarPlaceholder}>
                    <Avatar
                        uri={conversation.avatar}
                        name={conversation.name}
                        size="sm"
                    />
                </View>
                <View style={styles.bubbleWrapper}>
                    <View style={[styles.bubble, styles.otherBubble, { backgroundColor: theme.colors.inputBackground, paddingVertical: 10, paddingHorizontal: 16, borderBottomLeftRadius: 4 }]}>
                        <View style={styles.typingContainer}>
                            <Text style={[styles.typingText, { color: theme.colors.textSecondary }]}>
                                escribiendo
                                <Text style={styles.typingDotsText}>...</Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
            >
                <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.colors.inputBackground }]}>
                            <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.userInfo}
                            onPress={() => navigation.navigate('UserProfile', { userId: conversation.otherId, userProfile: conversation })}
                        >
                            <Avatar
                                uri={conversation.avatar}
                                name={conversation.name}
                                size="md"
                                status={logic.isOtherTyping ? 'typing' : (logic.otherUserStatus === 'online' ? 'online' : 'offline')}
                                featured={conversation.raiting_ventas >= 4.0}
                            />
                            <View>
                                <Text style={[styles.userName, { color: theme.colors.text }]}>
                                    {conversation.sexo === 'mujer' ? 'Vecina: ' : 'Vecino: '}{conversation.name}
                                </Text>
                                {conversation.raiting_ventas >= 4.0 && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <MaterialCommunityIcons name="star-circle" size={12} color="#F59E0B" />
                                        <Text style={{ fontSize: 10, color: '#F59E0B', fontWeight: 'bold' }}>Vecino Destacado</Text>
                                    </View>
                                )}
                                <Text style={styles.userStatus}>
                                    {logic.isOtherTyping ? 'Escribiendo...' :
                                        (logic.otherUserStatus === 'online' ? 'En línea' : 'Desconectado')}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {logic.loading ? (
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <LoadingDots size={12} color={theme.colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        ref={logic.flatListRef}
                        data={logic.chatHistory}
                        inverted={true}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMessage}
                        ListHeaderComponent={renderTypingIndicator}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        initialNumToRender={20}
                        ListFooterComponent={() => (
                            <View style={styles.dateSeparator}>
                                <Text style={[styles.dateText, { color: theme.colors.textSecondary, backgroundColor: theme.colors.inputBackground }]}>HOY</Text>
                            </View>
                        )}
                        ListEmptyComponent={() => (
                            <View style={{ flex: 1, alignItems: 'center', marginTop: 40, transform: [{ scaleY: -1 }, { scaleX: -1 }] }}>
                                <Text style={{ color: '#94a3b8' }}>Dile hola a tu vecino 👋</Text>
                            </View>
                        )}
                    />
                )}

                <View style={[styles.inputArea, { backgroundColor: theme.colors.background }]}>
                    {logic.editingMessageId && (
                        <View style={[styles.editingBanner, { backgroundColor: theme.colors.inputBackground }]}>
                            <Text style={[styles.editingBannerText, { color: theme.colors.textSecondary }]}>Editando mensaje...</Text>
                            <TouchableOpacity onPress={() => { logic.setEditingMessageId(null); logic.setMessage(''); }}>
                                <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {logic.showEmojiPicker && (
                        <View style={[styles.emojiTray, { backgroundColor: theme.colors.inputBackground }]}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {logic.commonEmojis.map((emoji, i) => (
                                    <TouchableOpacity key={i} onPress={() => logic.handleEmojiPress(emoji)} style={styles.emojiBtn}>
                                        <Text style={styles.emojiText}>{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {logic.selectedImage && (
                        <View style={styles.imagePreviewContainer}>
                            <TouchableOpacity
                                style={styles.imagePreviewWrapper}
                                onLongPress={() => {
                                    Alert.alert('Quitar imagen', '¿Quieres quitar esta imagen antes de enviar?',
                                        [{ text: 'Cancelar', style: 'cancel' }, { text: 'Quitar', onPress: () => logic.setSelectedImage(null), style: 'destructive' }]
                                    );
                                }}
                                activeOpacity={0.8}
                            >
                                <Image source={{ uri: logic.selectedImage }} style={styles.imagePreview} />
                                {logic.isUploading && (
                                    <View style={styles.uploadingOverlay}>
                                        <LoadingDots size={8} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.inputContainerOuter}>
                        <Pressable
                            onPress={() => messageInputRef.current?.focus()}
                            style={[
                                styles.inputContainerInner,
                                {
                                    backgroundColor: isDark ? '#262d31' : '#fff',
                                    borderWidth: isDark ? 0 : 1,
                                    borderColor: theme.colors.border
                                }
                            ]}
                        >
                            <TouchableOpacity
                                style={styles.innerIconButton}
                                onPress={() => logic.setShowEmojiPicker(!logic.showEmojiPicker)}
                            >
                                <MaterialCommunityIcons
                                    name={logic.showEmojiPicker ? "keyboard-outline" : "emoticon-outline"}
                                    size={24}
                                    color={isDark ? "#8696a0" : theme.colors.textSecondary}
                                />
                            </TouchableOpacity>

                            <TextInput
                                ref={messageInputRef}
                                placeholder={logic.editingMessageId ? "Editar mensaje..." : "Mensaje"}
                                placeholderTextColor={isDark ? "#8696a0" : "#94a3b8"}
                                multiline
                                value={logic.message}
                                style={[
                                    styles.textInput,
                                    { color: isDark ? '#fff' : theme.colors.text }
                                ]}
                                onChangeText={logic.handleTyping}
                            />

                            <TouchableOpacity
                                style={styles.innerIconButton}
                                onPress={logic.handlePickImage}
                            >
                                <MaterialCommunityIcons name="paperclip" size={24} color={isDark ? "#8696a0" : theme.colors.textSecondary} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.innerIconButton}
                                onPress={logic.handleTakePhoto}
                            >
                                <MaterialCommunityIcons name="camera" size={24} color={isDark ? "#8696a0" : theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </Pressable>

                        <TouchableOpacity
                            style={[
                                styles.outerSendButton,
                                (!logic.message.trim() && !logic.selectedImage) ? { backgroundColor: '#8696a0' } : { backgroundColor: theme.colors.primary }
                            ]}
                            onPress={logic.handleSend}
                            disabled={(!logic.message.trim() && !logic.selectedImage) || logic.isUploading}
                        >
                            {logic.isUploading ? (
                                <LoadingDots size={8} color="#fff" />
                            ) : (
                                <MaterialCommunityIcons
                                    name={logic.editingMessageId ? "check" : "send"}
                                    size={24}
                                    color="#fff"
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Message Options Modal */}
                <Modal
                    visible={logic.showOptionsModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => {
                        logic.setShowOptionsModal(false);
                        logic.setIsConfirmingUnsend(false);
                    }}
                >
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => {
                            logic.setShowOptionsModal(false);
                            logic.setIsConfirmingUnsend(false);
                        }}
                    >
                        <Pressable
                            style={[styles.modalContent, { backgroundColor: theme.colors.card, zIndex: 100, elevation: 10 }]}
                            onPress={(e) => {
                                // Prevent bubbling
                            }}
                        >
                            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                                    {logic.isConfirmingUnsend ? '¿Anular mensaje?' : 'Opciones de mensaje'}
                                </Text>
                            </View>

                            {logic.selectedMessage && (() => {
                                const isAdmin = logic.profile?.role === 'admin';
                                const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
                                const canEdit = logic.selectedMessage.rawTime ? new Date(logic.selectedMessage.rawTime) > oneHourAgo : true;

                                if (logic.isConfirmingUnsend) {
                                    return (
                                        <View style={styles.confirmContainer}>
                                            <Text style={styles.confirmDesc}>
                                                Esta acción borrará el mensaje para todos los participantes.
                                            </Text>
                                            {logic.isDeleting ? (
                                                <View style={{ padding: 20 }}>
                                                    <LoadingDots size={8} color="#ef4444" />
                                                </View>
                                            ) : (
                                                <>
                                                    <Pressable
                                                        style={({ pressed }) => [
                                                            styles.modalOption,
                                                            styles.modalOptionDestructive,
                                                            pressed && { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2' }
                                                        ]}
                                                        onPress={logic.handleUnsend}
                                                    >
                                                        <MaterialCommunityIcons name="delete-forever" size={24} color="#ef4444" />
                                                        <Text style={[styles.modalOptionText, styles.destructiveText]}>Anular para todos</Text>
                                                    </Pressable>
                                                    <Pressable
                                                        style={({ pressed }) => [
                                                            styles.modalOption,
                                                            pressed && { backgroundColor: '#f1f5f9' }
                                                        ]}
                                                        onPress={() => logic.setIsConfirmingUnsend(false)}
                                                    >
                                                        <MaterialCommunityIcons name="arrow-left" size={24} color="#64748b" />
                                                        <Text style={styles.modalOptionText}>Volver</Text>
                                                    </Pressable>
                                                </>
                                            )}
                                        </View>
                                    );
                                }

                                return (
                                    <>
                                        {(canEdit || isAdmin) ? (
                                            <Pressable
                                                style={({ pressed }) => [
                                                    styles.modalOption,
                                                    pressed && { backgroundColor: theme.colors.inputBackground }
                                                ]}
                                                onPress={logic.handleEditOption}
                                            >
                                                <MaterialCommunityIcons name="pencil" size={24} color={theme.colors.primary} />
                                                <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>Editar mensaje</Text>
                                            </Pressable>
                                        ) : (
                                            <View style={[styles.modalOption, { opacity: 0.5 }]}>
                                                <MaterialCommunityIcons name="clock-outline" size={24} color="#94a3b8" />
                                                <Text style={[styles.modalOptionText, { color: '#94a3b8' }]}>Edición no disponible (+1h)</Text>
                                            </View>
                                        )}

                                        <Pressable
                                            style={({ pressed }) => [
                                                styles.modalOption,
                                                styles.modalOptionDestructive,
                                                pressed && { backgroundColor: '#fef2f2' }
                                            ]}
                                            onPress={() => logic.setIsConfirmingUnsend(true)}
                                        >
                                            <MaterialCommunityIcons name="delete-outline" size={24} color="#ef4444" />
                                            <Text style={[styles.modalOptionText, styles.destructiveText]}>Anular mensaje</Text>
                                        </Pressable>
                                    </>
                                );
                            })()}

                            <Pressable
                                style={({ pressed }) => [
                                    styles.modalCancelBtn,
                                    pressed && { backgroundColor: '#f8fafc' },
                                ]}
                                onPress={() => {
                                    logic.setShowOptionsModal(false);
                                    logic.setIsConfirmingUnsend(false);
                                }}
                            >
                                <Text style={styles.modalCancelText}>Cancelar</Text>
                            </Pressable>
                        </Pressable>
                    </Pressable>
                </Modal>

                {/* Image Viewer Modal */}
                <Modal
                    visible={logic.viewerVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => logic.setViewerVisible(false)}
                >
                    <View style={styles.viewerContainer}>
                        <TouchableOpacity
                            style={styles.viewerCloseBtn}
                            onPress={() => logic.setViewerVisible(false)}
                        >
                            <MaterialCommunityIcons name="close" size={30} color="#fff" />
                        </TouchableOpacity>

                        <Image
                            source={{ uri: logic.viewerImage }}
                            style={styles.viewerImage}
                            resizeMode="contain"
                        />

                        <TouchableOpacity
                            style={styles.viewerDownloadBtn}
                            onPress={() => logic.handleDownloadImage(logic.viewerImage)}
                        >
                            <MaterialCommunityIcons name="download" size={24} color="#fff" />
                            <Text style={styles.downloadText}>Guardar en dispositivo</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingTop: Platform.OS === 'android' ? 8 : 0,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#181112',
    },
    userStatus: {
        fontSize: 12,
        color: '#197fe6',
        fontWeight: '500',
    },
    timeText: {
        fontSize: 10,
        color: '#94a3b8',
        fontWeight: '500',
    },
    productReference: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        gap: 12,
        minWidth: 200,
    },
    productThumb: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    productTitle: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    productPrice: {
        fontSize: 13,
        fontWeight: '900',
        marginTop: 2,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    dateSeparator: {
        alignItems: 'center',
        marginVertical: 24,
    },
    dateText: {
        fontSize: 11,
        fontWeight: 'bold',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        letterSpacing: 1,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        maxWidth: '85%',
    },
    myMessageContainer: {
        alignSelf: 'flex-end',
        justifyContent: 'flex-end',
    },
    otherMessageContainer: {
        alignSelf: 'flex-start',
    },
    avatarPlaceholder: {
        width: 32,
        marginRight: 8,
        justifyContent: 'flex-end',
    },
    bubbleWrapper: {
        gap: 4,
    },
    bubble: {
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        overflow: 'hidden',
    },
    myBubble: {
        backgroundColor: '#197fe6',
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        backgroundColor: '#f1f5f9',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#fff',
    },
    otherMessageText: {
        color: '#181112',
    },
    myTimeText: {
        textAlign: 'right',
    },
    inputArea: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: Platform.OS === 'ios' ? 10 : 10,
        backgroundColor: 'transparent',
    },
    inputContainerOuter: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 6,
        paddingHorizontal: 6,
        paddingBottom: 8,
    },
    inputContainerInner: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderRadius: 25,
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    innerIconButton: {
        width: 44,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 10,
        paddingHorizontal: 4,
        minHeight: 40,
        maxHeight: 120,
        textAlignVertical: 'center',
    },
    outerSendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#197fe6',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    editingBubble: {
        opacity: 0.7,
        borderWidth: 1,
        borderColor: '#197fe6',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    myTimeRow: {
        justifyContent: 'flex-end',
    },
    otherTimeRow: {
        justifyContent: 'flex-start',
    },
    editedText: {
        fontSize: 9,
        color: '#94a3b8',
        fontStyle: 'italic',
    },
    editingBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    editingBannerText: {
        fontSize: 12,
        color: '#197fe6',
        fontWeight: 'bold',
    },
    emojiTray: {
        paddingBottom: 12,
        paddingHorizontal: 8,
    },
    emojiBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emojiText: {
        fontSize: 24,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 24,
        width: '100%',
        maxWidth: 340,
        padding: 8,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
    },
    modalHeader: {
        padding: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    modalOptionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    modalOptionDestructive: {
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    destructiveText: {
        color: '#ef4444',
    },
    modalCancelBtn: {
        padding: 16,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        marginTop: 4,
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#64748b',
    },
    confirmContainer: {
        paddingVertical: 8,
    },
    confirmDesc: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        lineHeight: 20,
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typingText: {
        fontSize: 14,
        fontWeight: '500',
    },
    typingDotsText: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },
    imageMessageWrapper: {
        marginHorizontal: -12,
        marginTop: -8,
        marginBottom: 4,
    },
    messageImage: {
        width: 260,
        height: 200,
    },
    imagePreviewContainer: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    imagePreviewWrapper: {
        width: 100,
        height: 100,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageTimeBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    imageTimeText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '500',
    },
    viewerContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewerImage: {
        width: '100%',
        height: '80%',
    },
    viewerCloseBtn: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 10,
    },
    viewerDownloadBtn: {
        position: 'absolute',
        bottom: 40,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    downloadText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
