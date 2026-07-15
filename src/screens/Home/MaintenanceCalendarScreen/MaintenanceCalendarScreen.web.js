import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMaintenanceCalendarScreen } from './useMaintenanceCalendarScreen';
import { useTheme } from '../../../context/ThemeContext';
import { ResponsiveContainer } from '../../../components';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const MaintenanceCalendarScreen = () => {
    const { theme } = useTheme();
    const {
        tasks,
        loading,
        handleUpdateStatus,
        userRole,
    } = useMaintenanceCalendarScreen();

    const isAdmin = ['admin', 'mayordomo'].includes(userRole);

    const renderTask = ({ item }) => {
        const date = new Date(item.fecha_programada);
        const isCompleted = item.estado === 'completada';

        const statusConfig = {
            programada: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
            en_curso: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
            completada: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' }
        };

        const config = statusConfig[item.estado] || statusConfig.programada;

        return (
            <View style={[styles.webTaskCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={styles.webDateColumn}>
                    <Text style={[styles.webDateMonth, { color: theme.colors.textSecondary }]}>
                        {format(date, 'MMM', { locale: es }).toUpperCase()}
                    </Text>
                    <Text style={[styles.webDateDay, { color: theme.colors.text }]}>{format(date, 'dd')}</Text>
                </View>

                <View style={styles.webContentColumn}>
                    <View style={styles.webHeaderRow}>
                        <Text style={[styles.webTaskTitle, { color: theme.colors.text }]}>{item.titulo}</Text>
                        <View style={[styles.webStatusBadge, { backgroundColor: config.bg }]}>
                            <Text style={[styles.webStatusText, { color: config.color }]}>{item.estado.toUpperCase()}</Text>
                        </View>
                    </View>
                    <Text style={[styles.webTaskDesc, { color: theme.colors.textSecondary }]}>{item.descripcion}</Text>

                    <View style={styles.webFooterRow}>
                        <View style={styles.webMetaItem}>
                            <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.textSecondary} />
                            <Text style={{ color: theme.colors.textSecondary, marginLeft: 8 }}>
                                {format(date, "EEEE d 'de' MMMM", { locale: es })}
                            </Text>
                        </View>
                        {isAdmin && !isCompleted && (
                            <TouchableOpacity
                                style={[styles.webActionBtn, { backgroundColor: theme.colors.primary }]}
                                onPress={() => handleUpdateStatus(item.id, item.estado === 'programada' ? 'en_curso' : 'completada')}
                            >
                                <Text style={styles.webActionBtnText}>
                                    {item.estado === 'programada' ? 'Iniciar Trabajos' : 'Marcar Completado'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>
                <View style={styles.webWrapper}>
                    <View style={styles.webHeader}>
                        <View>
                            <Text style={[styles.webTitle, { color: theme.colors.text }]}>Cronograma de Mantenimiento</Text>
                            <Text style={[styles.webSubtitle, { color: theme.colors.textSecondary }]}>
                                Seguimiento de revisiones técnicas y mejoras infraestructurales del condominio.
                            </Text>
                        </View>
                        {isAdmin && (
                            <TouchableOpacity style={[styles.webAddBtn, { backgroundColor: theme.colors.primary }]}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Programar Mantención</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {loading ? (
                        <ActivityIndicator style={{ marginTop: 100 }} size="large" color={theme.colors.primary} />
                    ) : (
                        <FlatList
                            data={tasks}
                            renderItem={renderTask}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.webList}
                            ListEmptyComponent={
                                <View style={styles.webEmpty}>
                                    <MaterialCommunityIcons name="calendar-blank" size={120} color={theme.colors.border} />
                                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.textSecondary, marginTop: 24 }}>
                                        No hay actividades este mes
                                    </Text>
                                </View>
                            }
                        />
                    )}
                </View>
            </ResponsiveContainer>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    webWrapper: { paddingVertical: 80 },
    webHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 60 },
    webTitle: { fontSize: 48, fontWeight: '900', letterSpacing: -2 },
    webSubtitle: { fontSize: 20, marginTop: 12, maxWidth: 600 },
    webAddBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
    webList: { paddingBottom: 100 },
    webTaskCard: { flexDirection: 'row', padding: 40, borderRadius: 32, borderWidth: 1, marginBottom: 24, alignItems: 'center' },
    webDateColumn: { alignItems: 'center', width: 100, borderRightWidth: 1, borderRightColor: 'rgba(0,0,0,0.05)', paddingRight: 32 },
    webDateMonth: { fontSize: 13, fontWeight: '900', letterSpacing: 2 },
    webDateDay: { fontSize: 42, fontWeight: '900', marginTop: 4 },
    webContentColumn: { flex: 1, paddingLeft: 40 },
    webHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    webTaskTitle: { fontSize: 24, fontWeight: 'bold' },
    webStatusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    webStatusText: { fontSize: 10, fontWeight: '900' },
    webTaskDesc: { fontSize: 16, lineHeight: 24, marginBottom: 32 },
    webFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    webMetaItem: { flexDirection: 'row', alignItems: 'center' },
    webActionBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    webActionBtnText: { color: '#fff', fontWeight: 'bold' },
    webEmpty: { alignItems: 'center', marginTop: 100 }
});

export default MaintenanceCalendarScreen;
