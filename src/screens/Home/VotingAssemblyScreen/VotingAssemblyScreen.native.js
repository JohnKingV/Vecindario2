import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Modal,
    TextInput,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Avatar from '../../../components/Avatar';
import { useVotingAssemblyScreen } from './useVotingAssemblyScreen';
import { useTheme } from '../../../context/ThemeContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import DateTimePicker from '@react-native-community/datetimepicker';

const VotingAssemblyScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const [isModalVisible, setIsModalVisible] = React.useState(false);
    const [newPoll, setNewPoll] = React.useState({ titulo: '', descripcion: '', fecha_fin: '' });
    const [showPicker, setShowPicker] = React.useState(false);
    const [pickerMode, setPickerMode] = React.useState('date');

    const [editingPollId, setEditingPollId] = React.useState(null);

    const {
        votaciones,
        loading,
        refreshing,
        onRefresh,
        userVotes,
        handleVote,
        handleCreatePoll,
        handleUpdatePoll,
        fetchVoters,
        userRole,
    } = useVotingAssemblyScreen();

    const [votersModalVisible, setVotersModalVisible] = React.useState(false);
    const [selectedPollVoters, setSelectedPollVoters] = React.useState([]);
    const [selectedPollTitle, setSelectedPollTitle] = React.useState('');

    const handleShowVoters = async (poll) => {
        setSelectedPollTitle(poll.titulo);
        const voters = await fetchVoters(poll.id);
        setSelectedPollVoters(voters || []);
        setVotersModalVisible(true);
    };

    const canCreate = ['admin', 'comite', 'mayordomo'].includes(userRole);

    const handleSavePoll = async () => {
        if (!newPoll.titulo || !newPoll.descripcion || !newPoll.fecha_fin) {
            alert('Por favor completa todos los campos');
            return;
        }

        let success;
        if (editingPollId) {
            success = await handleUpdatePoll(editingPollId, {
                titulo: newPoll.titulo,
                descripcion: newPoll.descripcion,
                fecha_fin: newPoll.fecha_fin
            });
        } else {
            success = await handleCreatePoll({
                titulo: newPoll.titulo,
                descripcion: newPoll.descripcion,
                fecha_fin: newPoll.fecha_fin
            });
        }

        if (success) {
            setIsModalVisible(false);
            setNewPoll({ titulo: '', descripcion: '', fecha_fin: '' });
            setEditingPollId(null);
        } else {
            alert('Error al guardar la votación');
        }
    };

    const openEditModal = (poll) => {
        setNewPoll({
            titulo: poll.titulo,
            descripcion: poll.descripcion,
            fecha_fin: poll.fecha_fin
        });
        setEditingPollId(poll.id);
        setIsModalVisible(true);
    };

    const [optionsModalVisible, setOptionsModalVisible] = React.useState(false);
    const [activePoll, setActivePoll] = React.useState(null);

    const handleOptionsPress = (poll) => {
        setActivePoll(poll);
        setOptionsModalVisible(true);
    };

    const handleEditFromModal = () => {
        setOptionsModalVisible(false);
        if (activePoll) openEditModal(activePoll);
    };

    const handleDeleteFromModal = () => {
        // Placeholder if needed later
        setOptionsModalVisible(false);
    };

    const onDateChange = (event, selectedDate) => {
        setShowPicker(false);
        if (selectedDate) {
            const current = newPoll.fecha_fin ? new Date(newPoll.fecha_fin) : new Date();

            if (pickerMode === 'date') {
                const newDate = new Date(selectedDate);
                newDate.setHours(current.getHours());
                newDate.setMinutes(current.getMinutes());
                setNewPoll({ ...newPoll, fecha_fin: newDate.toISOString() });
            } else {
                const newDate = new Date(current);
                newDate.setHours(selectedDate.getHours());
                newDate.setMinutes(selectedDate.getMinutes());
                setNewPoll({ ...newPoll, fecha_fin: newDate.toISOString() });
            }
        }
    };

    const showDatepicker = () => {
        setPickerMode('date');
        setShowPicker(true);
    };

    const showTimepicker = () => {
        setPickerMode('time');
        setShowPicker(true);
    };

    const renderPoll = ({ item }) => {
        const hasVoted = !!userVotes[item.id];
        const date = new Date(item.fecha_fin);
        const options = ['A Favor', 'En Contra', 'Abstención'];

        return (
            <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={[styles.pollTitle, { color: theme.colors.text }]}>{item.titulo}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={[styles.badge, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Text style={[styles.badgeText, { color: theme.colors.primary }]}>ACTIVA</Text>
                        </View>
                        {canCreate && (
                            <TouchableOpacity onPress={() => handleOptionsPress(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <MaterialCommunityIcons name="dots-vertical" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <Text style={[styles.pollDesc, { color: theme.colors.textSecondary }]}>{item.descripcion}</Text>

                <View style={styles.metaRow}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                        Cierra: {format(date, "d 'de' MMMM, HH:mm", { locale: es })}
                    </Text>
                </View>

                <View style={styles.optionsContainer}>
                    {options.map((opt) => {
                        const isSelected = userVotes[item.id] === opt;
                        return (
                            <TouchableOpacity
                                key={opt}
                                style={[
                                    styles.optionBtn,
                                    { borderColor: isSelected ? theme.colors.primary : theme.colors.border },
                                    isSelected && { backgroundColor: theme.colors.primary + '10' }
                                ]}
                                disabled={hasVoted}
                                onPress={() => handleVote(item.id, opt)}
                            >
                                <Text style={[
                                    styles.optionText,
                                    { color: isSelected ? theme.colors.primary : theme.colors.text }
                                ]}>
                                    {opt}
                                </Text>
                                {isSelected && (
                                    <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.primary} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {hasVoted && (
                    <View style={styles.votedStatus}>
                        <MaterialCommunityIcons name="information-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.votedLabel, { color: theme.colors.textSecondary }]}>
                            Ya has registrado tu voto. Resultados al finalizar la sesión.
                        </Text>
                    </View>
                )}

                {canCreate && (
                    <TouchableOpacity
                        style={{ marginTop: 16, alignSelf: 'flex-end', padding: 8 }}
                        onPress={() => handleShowVoters(item)}
                    >
                        <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Ver Votantes</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>Asamblea Digital</Text>
                {canCreate ? (
                    <TouchableOpacity
                        style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
                        onPress={() => {
                            setEditingPollId(null);
                            setNewPoll({ titulo: '', descripcion: '', fecha_fin: '' });
                            setIsModalVisible(true);
                        }}
                    >
                        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 44 }} />
                )}
            </View>

            <FlatList
                data={votaciones}
                renderItem={renderPoll}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <MaterialCommunityIcons name="account-group-outline" size={80} color={theme.colors.border} />
                        <Text style={{ color: theme.colors.textSecondary, marginTop: 16 }}>No hay votaciones activas</Text>
                    </View>
                }
            />

            <Modal visible={isModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                            {editingPollId ? 'Editar Asamblea' : 'Nueva Asamblea'}
                        </Text>

                        <Text style={[styles.label, { color: theme.colors.text }]}>Título</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
                            value={newPoll.titulo}
                            onChangeText={t => setNewPoll({ ...newPoll, titulo: t })}
                            placeholder="Ej: Aprobación Presupuesto 2024"
                            placeholderTextColor={theme.colors.textSecondary}
                        />

                        <Text style={[styles.label, { color: theme.colors.text }]}>Fecha y Hora de Cierre</Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                            <TouchableOpacity
                                onPress={showDatepicker}
                                style={[styles.dateBtn, { backgroundColor: theme.colors.inputBackground, flex: 1 }]}
                            >
                                <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.primary} />
                                <Text style={{ color: theme.colors.text, marginLeft: 8 }}>
                                    {newPoll.fecha_fin ? format(new Date(newPoll.fecha_fin), 'dd/MM/yyyy') : 'Seleccionar Fecha'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={showTimepicker}
                                style={[styles.dateBtn, { backgroundColor: theme.colors.inputBackground, flex: 1 }]}
                            >
                                <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.primary} />
                                <Text style={{ color: theme.colors.text, marginLeft: 8 }}>
                                    {newPoll.fecha_fin ? format(new Date(newPoll.fecha_fin), 'HH:mm') : 'Seleccionar Hora'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {showPicker && (
                            <DateTimePicker
                                value={newPoll.fecha_fin ? new Date(newPoll.fecha_fin) : new Date()}
                                mode={pickerMode}
                                is24Hour={true}
                                display="default"
                                onChange={onDateChange}
                                minimumDate={new Date()}
                            />
                        )}

                        <Text style={[styles.label, { color: theme.colors.text }]}>Descripción</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text, height: 100, textAlignVertical: 'top' }]}
                            value={newPoll.descripcion}
                            onChangeText={t => setNewPoll({ ...newPoll, descripcion: t })}
                            multiline
                            placeholder="Detalles sobre los puntos a votar..."
                            placeholderTextColor={theme.colors.textSecondary}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.btn, styles.cancelBtn, { borderColor: theme.colors.border }]}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={{ color: theme.colors.text }}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btn, { backgroundColor: theme.colors.primary }]}
                                onPress={handleSavePoll}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                                    {editingPollId ? 'Guardar Cambios' : 'Crear'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={votersModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card, maxHeight: '80%' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text, marginBottom: 0, flex: 1 }]}>
                                {selectedPollTitle}
                            </Text>
                            <TouchableOpacity onPress={() => setVotersModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                            {['A Favor', 'En Contra', 'Abstención'].map(option => {
                                const voters = selectedPollVoters.filter(v => v.opcion === option);
                                if (voters.length === 0) return null;
                                return (
                                    <View key={option} style={{ marginBottom: 20 }}>
                                        <Text style={{ color: theme.colors.primary, fontWeight: 'bold', marginBottom: 10, fontSize: 16 }}>
                                            {option} ({voters.length})
                                        </Text>
                                        {voters.map((v, index) => (
                                            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingLeft: 10 }}>
                                                <Avatar
                                                    uri={v.profiles?.foto_url}
                                                    name={v.profiles?.nombre}
                                                    size="sm"
                                                />
                                                <Text style={{ color: theme.colors.text, marginLeft: 12 }}>
                                                    {v.profiles?.nombre}
                                                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                                                        {v.profiles?.depto && ` (Depto ${v.profiles.depto}${v.profiles.torre ? `, Torre ${v.profiles.torre}` : ''})`}
                                                    </Text>
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                );
                            })}
                            {selectedPollVoters.length === 0 && (
                                <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginTop: 20 }}>
                                    Aún no hay votos registrados.
                                </Text>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>


            <Modal visible={optionsModalVisible} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setOptionsModalVisible(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card, width: '80%' }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text, textAlign: 'center' }]}>Opciones</Text>

                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: theme.colors.primary, marginBottom: 12, height: 48, width: '100%', flex: 0 }]}
                            onPress={handleEditFromModal}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Editar Asamblea</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.border, height: 48, width: '100%', flex: 0 }]}
                            onPress={() => setOptionsModalVisible(false)}
                        >
                            <Text style={{ color: theme.colors.text }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, justifyContent: 'space-between' },
    title: { fontSize: 24, fontWeight: '900' },
    list: { padding: 20 },
    card: { padding: 24, borderRadius: 28, marginBottom: 20, borderWidth: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    pollTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: 10 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 10, fontWeight: '900' },
    pollDesc: { fontSize: 14, marginBottom: 16, lineHeight: 20 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
    metaText: { fontSize: 12 },
    optionsContainer: { gap: 12 },
    optionBtn: {
        height: 56,
        borderRadius: 16,
        borderWidth: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20
    },
    optionText: { fontSize: 15, fontWeight: 'bold' },
    votedStatus: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, opacity: 0.7 },
    votedLabel: { fontSize: 11 },
    votedLabel: { fontSize: 11 },
    empty: { alignItems: 'center', marginTop: 100 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { padding: 24, borderRadius: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    label: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginTop: 8 },
    input: { padding: 12, borderRadius: 12, borderWidth: 0, marginBottom: 8 },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
    btn: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    cancelBtn: { borderWidth: 1 },
    addBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    dateBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, justifyContent: 'center' }
});

export default VotingAssemblyScreen;
