import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Platform,
    TextInput,
    StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const AnnouncementsScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const [activeTab, setActiveTab] = useState('Todos');

    const announcements = [
        {
            id: '1',
            category: 'Importante',
            date: '24 Oct, 2024',
            title: 'Asamblea General Ordinaria 2024',
            content: 'Se convoca a todos los copropietarios a la reunión anual para discutir el presupuesto del próximo año y la elección del nuevo comité de vigilancia...',
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800',
            color: '#135bec',
            bgColor: 'rgba(19, 91, 236, 0.1)',
        },
        {
            id: '2',
            category: 'Mantenimiento',
            date: '22 Oct, 2024',
            title: 'Limpieza Profunda de Piscina',
            content: 'El próximo lunes se realizará el mantenimiento preventivo y desinfección total de la piscina principal. El área permanecerá cerrada de 8:00 AM a 6:00 PM.',
            image: 'https://images.unsplash.com/photo-1576013551627-0cf20b96c2a7?auto=format&fit=crop&q=80&w=800',
            color: '#f59e0b',
            bgColor: '#fff7ed',
        },
        {
            id: '3',
            category: 'Social',
            date: '20 Oct, 2024',
            title: 'Evento de Halloween para Niños',
            content: '¡Preparen sus disfraces! Los invitamos a la celebración de Halloween en el área de juegos el sábado 31 de octubre. Habrá dulces, juegos y muchas sorpresas.',
            image: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?auto=format&fit=crop&q=80&w=800',
            color: '#16a34a',
            bgColor: '#f0fdf4',
        }
    ];

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.searchButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <MaterialCommunityIcons name="magnify" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Comunicados</Text>
                <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>Notificaciones oficiales de la administración</Text>
            </View>

            {/* Filter Tabs */}
            <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
                    {['Todos', 'Importante', 'Mantenimiento', 'Social'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                                activeTab === tab && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                            ]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[
                                styles.tabText,
                                { color: theme.colors.text },
                                activeTab === tab && styles.activeTabText
                            ]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {announcements.map((item) => (
                    <TouchableOpacity key={item.id} style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} activeOpacity={0.9}>
                        <Image source={{ uri: item.image }} style={styles.cardImage} />
                        <View style={styles.cardBody}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.categoryBadge, { backgroundColor: item.bgColor }]}>
                                    <Text style={[styles.categoryText, { color: item.color }]}>{item.category.toUpperCase()}</Text>
                                </View>
                                <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>{item.date}</Text>
                            </View>
                            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.title}</Text>
                            <Text style={[styles.cardContent, { color: theme.colors.textSecondary }]} numberOfLines={3}>{item.content}</Text>
                            <View style={styles.cardFooter}>
                                <TouchableOpacity style={styles.readMoreBtn}>
                                    <Text style={[styles.readMoreText, { color: theme.colors.primary }]}>Leer más</Text>
                                    <MaterialCommunityIcons name="chevron-right" size={18} color={theme.colors.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f6f6f8',
    },
    header: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#f6f6f8',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconButton: {
        marginLeft: -8,
    },
    searchButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111318',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#616f89',
        marginTop: 4,
    },
    tabsContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
    },
    tab: {
        height: 36,
        paddingHorizontal: 20,
        borderRadius: 18,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    activeTab: {
        backgroundColor: '#135bec',
        borderColor: '#135bec',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111318',
    },
    activeTabText: {
        color: '#fff',
    },
    scrollContent: {
        padding: 16,
        gap: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardImage: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#f1f5f9',
    },
    cardBody: {
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    dateText: {
        fontSize: 12,
        color: '#616f89',
        fontWeight: '500',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111318',
        lineHeight: 26,
    },
    cardContent: {
        fontSize: 15,
        color: '#616f89',
        marginTop: 8,
        lineHeight: 22,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    readMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    readMoreText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#135bec',
    },
});

export default AnnouncementsScreen;
