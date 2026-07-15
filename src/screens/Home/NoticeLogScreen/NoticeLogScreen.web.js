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
import { useNoticeLogScreen } from './useNoticeLogScreen';
import { useTheme } from '../../../context/ThemeContext';
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
    const { width } = useWindowDimensions();
    const { novedades, loading, userRole } = useNoticeLogScreen();

    const columnCount = width > 1200 ? 3 : width > 800 ? 2 : 1;

    const renderItem = ({ item }) => {
        const cat = CATEGORIES[item.categoria] || CATEGORIES.general;
        const date = new Date(item.created_at);

        return (
            <View style={[styles.webCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={styles.webCatRow}>
                    <View style={[styles.webCatIcon, { backgroundColor: cat.color + '15' }]}>
                        <MaterialCommunityIcons name={cat.icon} size={24} color={cat.color} />
                    </View>
                    <Text style={[styles.webCatLabel, { color: cat.color }]}>{cat.label.toUpperCase()}</Text>
                    <Text style={[styles.webTime, { color: theme.colors.textSecondary }]}>
                        {format(date, "HH:mm, d LLL", { locale: es })}
                    </Text>
                </View>

                <Text style={[styles.webContent, { color: theme.colors.text }]}>{item.contenido}</Text>

                <View style={styles.webFooter}>
                    <Text style={[styles.webAuthor, { color: theme.colors.textSecondary }]}>
                        Por: <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{item.profiles?.nombre}</Text>
                        ({item.profiles?.role})
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, { color: theme.colors.text }]}>Libro de Novedades</Text>
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Bitácora digital del equipo de seguridad y administración</Text>
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator style={{ marginTop: 100 }} size="large" color={theme.colors.primary} />
                ) : (
                    <FlatList
                        data={novedades}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        numColumns={columnCount}
                        key={columnCount}
                        contentContainerStyle={styles.list}
                        columnWrapperStyle={columnCount > 1 ? styles.row : null}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { maxWidth: 1200, width: '100%', alignSelf: 'center', padding: 60 },
    header: { marginBottom: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 48, fontWeight: '900', letterSpacing: -2 },
    subtitle: { fontSize: 20, marginTop: 12 },
    list: { paddingBottom: 100 },
    row: { gap: 24 },
    webCard: { flex: 1, padding: 32, borderRadius: 24, borderWidth: 1, marginBottom: 24, minHeight: 200 },
    webCatRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    webCatIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    webCatLabel: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
    webTime: { fontSize: 12, marginLeft: 'auto' },
    webContent: { fontSize: 18, lineHeight: 28 },
    webFooter: { marginTop: 24, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 16 },
    webAuthor: { fontSize: 13 }
});

export default NoticeLogScreen;
