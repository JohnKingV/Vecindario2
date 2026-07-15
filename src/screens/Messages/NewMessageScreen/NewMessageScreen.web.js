import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Input, EmptyState, ResponsiveContainer } from '../../../components';
import { useNewMessageScreen } from './useNewMessageScreen';
import { useTheme } from '../../../context/ThemeContext';

export default function NewMessageScreenWeb({ navigation }) {
    const { theme, isDark } = useTheme();
    const logic = useNewMessageScreen(navigation);

    const renderNeighbor = ({ item }) => (
        <TouchableOpacity
            style={[styles.neighborItem, { borderBottomColor: theme.colors.border }]}
            activeOpacity={0.7}
            onPress={() => logic.handleSelectNeighbor(item)}
        >
            <Avatar
                uri={item.foto_url}
                name={item.nombre}
                size={56}
                style={[styles.neighborAvatar, { borderColor: theme.colors.border }]}
            />
            <View style={styles.neighborInfo}>
                <Text style={[styles.neighborName, { color: theme.colors.text }]}>{item.nombre}</Text>
                <Text style={[styles.neighborDepto, { color: theme.colors.textSecondary }]}>
                    {item.depto ? `Depto ${item.depto}` : 'Vecino'} • {logic.profile?.comunidades?.nombre || 'Mi Condominio'}
                </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>
                {/* Header Top Row (Not Sticky) */}
                <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.topRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Nuevo Mensaje</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </View>

                {/* Search Bar Container (Sticky) */}
                <View style={[styles.stickySearch, { backgroundColor: theme.colors.card }]}>
                    <View style={[styles.searchBar, { backgroundColor: theme.colors.inputBackground }]}>
                        <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textSecondary} />
                        <Input
                            placeholder="Buscar vecino..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={logic.search}
                            onChangeText={logic.setSearch}
                            containerStyle={styles.searchInputContainer}
                            style={[styles.searchInput, { color: theme.colors.text }]}
                            flat
                            noMargin
                            rightIcon={logic.search.length > 0 ? (
                                <TouchableOpacity onPress={() => logic.setSearch('')}>
                                    <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            ) : null}
                        />
                    </View>
                </View>

                {logic.loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={logic.groupedNeighbors}
                        keyExtractor={(item) => item.letter}
                        renderItem={({ item }) => (
                            <View style={styles.section}>
                                <Text style={[styles.sectionLetter, {
                                    color: theme.colors.textSecondary,
                                    backgroundColor: theme.colors.background
                                }]}>{item.letter}</Text>
                                {item.data.map(neighbor => (
                                    <React.Fragment key={neighbor.id}>
                                        {renderNeighbor({ item: neighbor })}
                                        <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
                                    </React.Fragment>
                                ))}
                            </View>
                        )}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <EmptyState
                                icon="👥"
                                title="No se encontraron vecinos"
                                message="Intenta con otro nombre o número de departamento."
                            />
                        }
                    />
                )}
            </ResponsiveContainer>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: '100%',
    },
    header: {
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    stickySearch: {
        position: Platform.OS === 'web' ? 'sticky' : 'relative',
        top: 0,
        zIndex: 10,
        paddingHorizontal: 20,
        paddingBottom: 16,
        paddingTop: 8,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingTop: 16,
    },
    backButton: {
        padding: 4,
        marginLeft: -8,
        cursor: 'pointer',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 48,
        marginTop: 8,
    },
    searchInputContainer: {
        flex: 1,
        marginBottom: 0,
    },
    searchInput: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        fontSize: 15,
        paddingHorizontal: 8,
        outlineStyle: 'none',
    },
    listContent: {
        paddingBottom: 40,
    },
    section: {
        marginBottom: 16,
    },
    sectionLetter: {
        fontSize: 12,
        fontWeight: '800',
        paddingHorizontal: 24,
        paddingVertical: 8,
        letterSpacing: 1,
    },
    neighborItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        gap: 16,
        cursor: 'pointer',
    },
    neighborAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
    },
    neighborInfo: {
        flex: 1,
    },
    neighborName: {
        fontSize: 16,
        fontWeight: '600',
    },
    neighborDepto: {
        fontSize: 14,
        marginTop: 2,
    },
    separator: {
        height: 1,
        marginLeft: 96,
        marginRight: 24,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
    }
});
