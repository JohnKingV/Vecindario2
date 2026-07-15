import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Switch,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// BlurView removido de aquí
import { useNoticeLogScreen } from './useNoticeLogScreen';
import { useTheme } from '../../../context/ThemeContext';
import { Avatar } from '../../../components';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CATEGORIES = {
    general: { label: 'General', icon: 'note-text', color: '#64748b' },
    turno: { label: 'Turno', icon: 'account-clock', color: '#3b82f6' },
    seguridad: { label: 'Seguridad', icon: 'shield-check', color: '#22c55e' },
    mantenimiento: { label: 'Mantenimiento', icon: 'wrench', color: '#f59e0b' },
    siniestro: { label: 'Siniestro', icon: 'alert-decagram', color: '#ef4444' }
};

const NoticeLogScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const {
        novedades,
        loading,
        refreshing,
        onRefresh,
        isModalVisible,
        setIsModalVisible,
        newNovedad,
        setNewNovedad,
        handleSubmit,
        userRole
    } = useNoticeLogScreen();

    const canAdd = ['conserje', 'admin', 'mayordomo', 'comite'].includes(userRole);

    const renderItem = ({ item }) => {
        const cat = CATEGORIES[item.categoria] || CATEGORIES.general;
        const date = new Date(item.created_at);

        return (
            <View style={[styles.logCard, { backgroundColor: theme.colors.card, borderColor: item.importante ? '#ef4444' : theme.colors.border }]}>
                {item.importante && (
                    <View style={styles.importantBadge}>
                        <MaterialCommunityIcons name="alert" size={12} color="#fff" />
                        <Text style={styles.importantText}>URGENTE</Text>
                    </View>
                )}

                <View style={styles.logHeader}>
                    <View style={[styles.catIcon, { backgroundColor: cat.color + '20' }]}>
                        <MaterialCommunityIcons name={cat.icon} size={20} color={cat.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.logAuthor, { color: theme.colors.text }]}>
                            {item.profiles?.nombre || 'Personal'}
                            <Text style={[styles.logRole, { color: theme.colors.textSecondary }]}> • {item.profiles?.role}</Text>
                        </Text>
                        <Text style={[styles.logTime, { color: theme.colors.textSecondary }]}>
                            {format(date, "d 'de' MMMM, HH:mm", { locale: es })}
                        </Text>
                    </View>
                </View>

                <Text style={[styles.logContent, { color: theme.colors.text }]}>{item.contenido}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={theme.colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.title, { color: theme.colors.text }]}>Libro de Novedades</Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Bitácora digital del condominio</Text>
                </View>
                {canAdd && (
                    <TouchableOpacity onPress={() => setIsModalVisible(true)} style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}>
                        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>

            {loading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={novedades}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                    }
                />
            )}

            {/* Modal para Nueva Novedad */}
            <Modal visible={isModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Registrar Novedad</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ maxHeight: 500 }}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>CATEGORÍA</Text>
                            <View style={styles.catGrid}>
                                {Object.entries(CATEGORIES).map(([key, cat]) => (
                                    <TouchableOpacity
                                        key={key}
                                        style={[
                                            styles.catOption,
                                            {
                                                borderColor: newNovedad.categoria === key ? cat.color : theme.colors.border,
                                                backgroundColor: newNovedad.categoria === key ? cat.color + '15' : 'transparent'
                                            }
                                        ]}
                                        onPress={() => setNewNovedad({ ...newNovedad, categoria: key })}
                                    >
                                        <MaterialCommunityIcons name={cat.icon} size={20} color={newNovedad.categoria === key ? cat.color : theme.colors.textSecondary} />
                                        <Text style={{ fontSize: 12, color: newNovedad.categoria === key ? cat.color : theme.colors.text, fontWeight: 'bold' }}>{cat.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>CONTENIDO</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text, borderColor: theme.colors.border }]}
                                placeholder="Describe lo ocurrido..."
                                placeholderTextColor={theme.colors.placeholder}
                                multiline
                                numberOfLines={6}
                                value={newNovedad.contenido}
                                onChangeText={(text) => setNewNovedad({ ...newNovedad, contenido: text })}
                            />

                            <View style={styles.importantRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.label, { color: theme.colors.text, marginBottom: 0 }]}>Marcar como Importante</Text>
                                    <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Destacado en rojo para el equipo</Text>
                                </View>
                                <Switch
                                    value={newNovedad.importante}
                                    onValueChange={(val) => setNewNovedad({ ...newNovedad, importante: val })}
                                    trackColor={{ false: '#767577', true: '#ef4444' }}
                                />
                            </View>

                            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.colors.primary }]} onPress={handleSubmit}>
                                <Text style={styles.submitBtnText}>Publicar Bitácora</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 12 },
    backBtn: { width: 44, height: 44, justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: '900' },
    subtitle: { fontSize: 13 },
    addBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginLeft: 'auto' },
    list: { padding: 20 },
    logCard: { padding: 20, borderRadius: 24, marginBottom: 16, borderWidth: 1, position: 'relative', overflow: 'hidden' },
    importantBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4, borderBottomLeftRadius: 16 },
    importantText: { color: '#fff', fontSize: 10, fontWeight: '900' },
    logHeader: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 },
    catIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    logAuthor: { fontSize: 14, fontWeight: 'bold' },
    logRole: { fontSize: 12, fontWeight: '400' },
    logTime: { fontSize: 11, marginTop: 2 },
    logContent: { fontSize: 15, lineHeight: 22 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { padding: 24, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: 60 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    label: { fontSize: 12, fontWeight: '900', marginBottom: 12, marginTop: 12, letterSpacing: 1 },
    catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    catOption: { flex: 1, minWidth: '30%', padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center', gap: 6 },
    input: { padding: 16, borderRadius: 16, borderWidth: 1, minHeight: 120, textAlignVertical: 'top', fontSize: 16 },
    importantRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, backgroundColor: 'rgba(0,0,0,0.05)', padding: 16, borderRadius: 16 },
    submitBtn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default NoticeLogScreen;
