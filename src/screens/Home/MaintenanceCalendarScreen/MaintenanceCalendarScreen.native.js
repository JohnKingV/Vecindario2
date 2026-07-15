import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMaintenanceCalendarScreen } from './useMaintenanceCalendarScreen';
import { useTheme } from '../../../context/ThemeContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const MaintenanceCalendarScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const [isModalVisible, setIsModalVisible] = React.useState(false);
    const [newTask, setNewTask] = React.useState({ titulo: '', descripcion: '', fecha: '' });
    const {
        tasks,
        loading,
        handleUpdateStatus,
        handleCreateTask,
        onRefresh,
        refreshing,
        userRole
    } = useMaintenanceCalendarScreen();

    const isAdmin = ['admin', 'mayordomo'].includes(userRole);

    const handleSaveTask = async () => {
        if (!newTask.titulo || !newTask.fecha) {
            alert('Por favor completa título y fecha');
            return;
        }

        const success = await handleCreateTask({
            titulo: newTask.titulo,
            descripcion: newTask.descripcion,
            fecha_programada: newTask.fecha
        });

        if (success) {
            setIsModalVisible(false);
            setNewTask({ titulo: '', descripcion: '', fecha: '' });
        } else {
            alert('Error al crear la tarea');
        }
    };

    const renderTask = ({ item }) => {
        const date = new Date(item.fecha_programada);
        const isCompleted = item.estado === 'completada';

        const statusConfig = {
            programada: { color: '#3b82f6', icon: 'calendar-clock' },
            en_curso: { color: '#f59e0b', icon: 'progress-wrench' },
            completada: { color: '#22c55e', icon: 'check-decagram' }
        };

        const config = statusConfig[item.estado] || statusConfig.programada;

        return (
            <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={[styles.dateBox, { backgroundColor: config.color + '15' }]}>
                    <Text style={[styles.dateDay, { color: config.color }]}>{format(date, 'dd')}</Text>
                    <Text style={[styles.dateMonth, { color: config.color }]}>{format(date, 'MMM', { locale: es }).toUpperCase()}</Text>
                </View>

                <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, { color: theme.colors.text }]}>{item.titulo}</Text>
                    <Text style={[styles.taskDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                        {item.descripcion}
                    </Text>
                    <View style={styles.statusRow}>
                        <MaterialCommunityIcons name={config.icon} size={14} color={config.color} />
                        <Text style={[styles.statusText, { color: config.color }]}>
                            {item.estado.toUpperCase()}
                        </Text>
                    </View>
                </View>

                {isAdmin && !isCompleted && (
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.colors.inputBackground }]}
                        onPress={() => handleUpdateStatus(item.id, item.estado === 'programada' ? 'en_curso' : 'completada')}
                    >
                        <MaterialCommunityIcons
                            name={item.estado === 'programada' ? "play-circle-outline" : "check-circle-outline"}
                            size={24}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>Mantenimiento</Text>
                {isAdmin && (
                    <TouchableOpacity
                        style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
                        onPress={() => setIsModalVisible(true)}
                    >
                        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={tasks}
                renderItem={renderTask}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <MaterialCommunityIcons name="hammer-wrench" size={80} color={theme.colors.border} />
                        <Text style={{ color: theme.colors.textSecondary, marginTop: 16 }}>No hay tareas programadas</Text>
                    </View>
                }
            />

            <Modal visible={isModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Nueva Tarea</Text>

                        <Text style={[styles.label, { color: theme.colors.text }]}>Título</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
                            value={newTask.titulo}
                            onChangeText={t => setNewTask({ ...newTask, titulo: t })}
                            placeholder="Ej: Revisión Ascensores"
                            placeholderTextColor={theme.colors.textSecondary}
                        />

                        <Text style={[styles.label, { color: theme.colors.text }]}>Fecha (YYYY-MM-DD)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
                            value={newTask.fecha}
                            onChangeText={t => setNewTask({ ...newTask, fecha: t })}
                            placeholder="Ej: 2024-03-20"
                            placeholderTextColor={theme.colors.textSecondary}
                        />

                        <Text style={[styles.label, { color: theme.colors.text }]}>Descripción</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text, height: 80 }]}
                            value={newTask.descripcion}
                            onChangeText={t => setNewTask({ ...newTask, descripcion: t })}
                            multiline
                            placeholder="Detalles de la tarea..."
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
                                onPress={handleSaveTask}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, justifyContent: 'space-between' },
    title: { fontSize: 24, fontWeight: '900' },
    addBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 20 },
    card: { flexDirection: 'row', padding: 16, borderRadius: 24, marginBottom: 16, borderWidth: 1, alignItems: 'center' },
    dateBox: { width: 60, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    dateDay: { fontSize: 20, fontWeight: '900' },
    dateMonth: { fontSize: 10, fontWeight: 'bold' },
    taskInfo: { flex: 1, marginLeft: 16, marginRight: 8 },
    taskTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    taskDesc: { fontSize: 12, marginBottom: 8 },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    actionBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    empty: { alignItems: 'center', marginTop: 100 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { padding: 24, borderRadius: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    label: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginTop: 8 },
    input: { padding: 12, borderRadius: 12, borderWidth: 0, marginBottom: 8 },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
    btn: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    cancelBtn: { borderWidth: 1 }
});

export default MaintenanceCalendarScreen;
