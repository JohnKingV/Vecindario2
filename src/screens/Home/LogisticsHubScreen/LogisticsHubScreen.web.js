import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    useWindowDimensions,
    Modal
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLogisticsHubScreen } from './useLogisticsHubScreen';
import { useTheme } from '../../../context/ThemeContext';
import { Avatar, ResponsiveContainer } from '../../../components';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const LogisticsHubScreen = () => {
    const { theme, isDark } = useTheme();
    const { width } = useWindowDimensions();
    const {
        encomiendas,
        loading,
        userRole,
        userId
    } = useLogisticsHubScreen();

    const columnCount = width > 1200 ? 3 : width > 800 ? 2 : 1;

    const renderItem = ({ item }) => {
        const isMine = item.residente_id === userId;
        const date = new Date(item.created_at);

        return (
            <View style={[styles.webCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={styles.webTypeRow}>
                    <MaterialCommunityIcons name="package-variant-closed" size={24} color={theme.colors.primary} />
                    <Text style={[styles.webStatus, { color: item.estado === 'pendiente' ? '#f59e0b' : '#22c55e' }]}>
                        {item.estado.toUpperCase()}
                    </Text>
                    <Text style={[styles.webTime, { color: theme.colors.textSecondary }]}>
                        {format(date, "d LLL, HH:mm", { locale: es })}
                    </Text>
                </View>

                <Text style={[styles.webDesc, { color: theme.colors.text }]}>{item.descripcion}</Text>
                <Text style={[styles.webMeta, { color: theme.colors.textSecondary }]}>
                    Courier: {item.empresa_transporte || 'Particular'}
                </Text>

                <View style={styles.webFooter}>
                    <View style={styles.webUserRow}>
                        <Avatar uri={item.profiles?.foto_url} size="xs" />
                        <Text style={[styles.webUserText, { color: theme.colors.text }]}>
                            {item.profiles?.nombre} ({item.profiles?.depto})
                        </Text>
                    </View>
                    {isMine && item.estado === 'pendiente' && (
                        <View style={[styles.webPinBox, { backgroundColor: theme.colors.primary + '15' }]}>
                            <Text style={[styles.webPinLabel, { color: theme.colors.primary }]}>PIN</Text>
                            <Text style={[styles.webPinValue, { color: theme.colors.primary }]}>{item.codigo_retiro}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.title, { color: theme.colors.text }]}>Centro de Logística</Text>
                            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                                {userRole === 'vecino' ? 'Mis paquetes y correspondencia pendientes de retiro.' : 'Gestión de entrada y salida de paquetes del condominio.'}
                            </Text>
                        </View>
                    </View>

                    {loading ? (
                        <ActivityIndicator style={{ marginTop: 100 }} size="large" color={theme.colors.primary} />
                    ) : (
                        <FlatList
                            data={userRole === 'vecino' ? encomiendas.filter(e => e.residente_id === userId) : encomiendas}
                            keyExtractor={item => item.id}
                            renderItem={renderItem}
                            numColumns={columnCount}
                            key={columnCount}
                            contentContainerStyle={styles.list}
                            columnWrapperStyle={columnCount > 1 ? styles.row : null}
                            ListEmptyComponent={
                                <View style={styles.empty}>
                                    <MaterialCommunityIcons name="package-variant" size={80} color={theme.colors.border} />
                                    <Text style={{ color: theme.colors.textSecondary, marginTop: 16 }}>No hay actividad logística hoy</Text>
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
    content: { paddingVertical: 60, paddingHorizontal: 20 },
    header: { marginBottom: 48 },
    title: { fontSize: 42, fontWeight: '900' },
    subtitle: { fontSize: 18, marginTop: 12 },
    list: { paddingBottom: 100 },
    row: { gap: 24 },
    webCard: { flex: 1, padding: 32, borderRadius: 24, borderWidth: 1, marginBottom: 24, minWidth: 350 },
    webTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
    webStatus: { fontSize: 12, fontWeight: '900' },
    webTime: { fontSize: 12, marginLeft: 'auto' },
    webDesc: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    webMeta: { fontSize: 14, marginBottom: 24 },
    webFooter: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    webUserRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    webUserText: { fontSize: 13, fontWeight: '600' },
    webPinBox: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, alignItems: 'center' },
    webPinLabel: { fontSize: 9, fontWeight: '900' },
    webPinValue: { fontSize: 18, fontWeight: '900', letterSpacing: 2 },
    empty: { marginTop: 100, alignItems: 'center' }
});

export default LogisticsHubScreen;
