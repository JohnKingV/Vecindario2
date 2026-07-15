import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    useWindowDimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useParkingMonitorScreen } from './useParkingMonitorScreen';
import { useTheme } from '../../../context/ThemeContext';

const ParkingMonitorScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const { width } = useWindowDimensions();
    const {
        parkingSlots,
        loading,
        handleToggleStatus,
        availableCount,
        totalCount,
        userRole
    } = useParkingMonitorScreen();

    const columnCount = width > 1200 ? 5 : width > 800 ? 4 : 2;

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View>
                <Text style={[styles.title, { color: theme.colors.text }]}>Monitor de Estacionamientos</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                    Estado de ocupación de visitas en tiempo real
                </Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={[styles.statBox, { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: theme.colors.border }]}>
                    <Text style={[styles.statNum, { color: '#22c55e' }]}>{availableCount}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Disponibles</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: theme.colors.border }]}>
                    <Text style={[styles.statNum, { color: theme.colors.text }]}>{totalCount}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Cupos</Text>
                </View>
            </View>
        </View>
    );

    const renderSlot = ({ item }) => {
        const isAvailable = item.estado === 'disponible';
        const canEdit = userRole === 'conserje' || userRole === 'admin' || userRole === 'mayordomo';

        return (
            <TouchableOpacity
                onPress={() => handleToggleStatus(item)}
                disabled={!canEdit}
                style={[
                    styles.slotCard,
                    {
                        backgroundColor: isDark ? '#1e293b' : '#fff',
                        borderColor: isAvailable ? '#22c55e' : '#ef4444',
                        borderWidth: 2,
                        opacity: canEdit ? 1 : 0.9
                    }
                ]}
            >
                <MaterialCommunityIcons
                    name={isAvailable ? "car-outline" : "car"}
                    size={40}
                    color={isAvailable ? '#22c55e' : '#ef4444'}
                />
                <Text style={[styles.slotName, { color: theme.colors.text }]}>{item.identificador}</Text>
                <View style={[styles.badge, { backgroundColor: isAvailable ? '#22c55e22' : '#ef444422' }]}>
                    <Text style={{ color: isAvailable ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>
                        {isAvailable ? 'LIBRE' : 'OCUPADO'}
                    </Text>
                </View>

                {canEdit && (
                    <Text style={styles.editHint}>Clic para cambiar</Text>
                )}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                {renderHeader()}
                <FlatList
                    data={parkingSlots}
                    numColumns={columnCount}
                    key={columnCount} // Force re-render on column change
                    renderItem={renderSlot}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    columnWrapperStyle={styles.row}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
        padding: 40,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    statBox: {
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        minWidth: 150,
        alignItems: 'center',
    },
    statNum: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    list: {
        paddingBottom: 40,
    },
    row: {
        justifyContent: 'flex-start',
        gap: 20,
        marginBottom: 20,
    },
    slotCard: {
        flex: 1,
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    slotName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 12,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
        marginTop: 8,
    },
    editHint: {
        fontSize: 10,
        color: '#64748b',
        marginTop: 12,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default ParkingMonitorScreen;
