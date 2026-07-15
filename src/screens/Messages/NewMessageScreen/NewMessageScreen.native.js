import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Input, EmptyState } from '../../../components';
import { useNewMessageScreen } from './useNewMessageScreen';
import { useTheme } from '../../../context/ThemeContext';

export default function NewMessageScreenNative({ navigation }) {
    const { theme, isDark } = useTheme();
    const logic = useNewMessageScreen(navigation);
    const scrollY = useRef(new Animated.Value(0)).current;

    const HEADER_TOP_HEIGHT = 60; // Altura de la fila del título

    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, HEADER_TOP_HEIGHT],
        outputRange: [0, -HEADER_TOP_HEIGHT],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_TOP_HEIGHT / 2, HEADER_TOP_HEIGHT],
        outputRange: [1, 0.5, 0],
        extrapolate: 'clamp',
    });

    const renderNeighbor = ({ item }) => (
        <TouchableOpacity
            style={styles.neighborItem}
            activeOpacity={0.7}
            onPress={() => logic.handleSelectNeighbor(item)}
        >
            <Avatar
                uri={item.foto_url}
                name={item.nombre}
                size={56}
                style={[styles.neighborAvatar, { borderColor: theme.colors.border }]}
                featured={item.raiting_ventas >= 4.0}
            />
            <View style={styles.neighborInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.neighborName, { color: theme.colors.text }]}>{item.nombre}</Text>
                    {item.raiting_ventas >= 4.0 && (
                        <MaterialCommunityIcons name="star-circle" size={16} color="#F59E0B" />
                    )}
                </View>
                <Text style={[styles.neighborDepto, { color: theme.colors.textSecondary }]}>
                    {item.depto ? `Depto ${item.depto}` : 'Vecino'} • {logic.profile?.comunidades?.nombre || 'Mi Condominio'}
                </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
    );

    const renderHeader = (
        <Animated.View style={[
            styles.headerContainer,
            {
                backgroundColor: theme.colors.card,
                transform: [{ translateY: headerTranslateY }]
            }
        ]}>
            <Animated.View style={[styles.topRow, { opacity: headerOpacity }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.colors.inputBackground }]}>
                    <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Nuevo Mensaje</Text>
                <View style={{ width: 40 }} />
            </Animated.View>
            <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
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
        </Animated.View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            <Animated.FlatList
                data={logic.groupedNeighbors}
                keyExtractor={(item) => item.letter}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
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
                contentContainerStyle={[styles.listContent, { paddingTop: 130 }]}
                ListEmptyComponent={
                    <EmptyState
                        icon="👥"
                        title="No se encontraron vecinos"
                        message="Intenta con otro nombre o número de departamento."
                    />
                }
            />

            {renderHeader}

            {logic.loading && (
                <View style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: 'rgba(0,0,0,0.1)' }]}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            )}

            {/* Alphabet Scroll Indicator */}
            <View style={styles.alphabetNav}>
                {'ABCDEFGHIJKLMNO PQRSTUVWXYZ'.split('').map((l, i) => (
                    <Text key={i} style={[styles.alphabetLetter, { color: theme.colors.primary }]}>{l}</Text>
                ))}
                <MaterialCommunityIcons name="magnify" size={12} color={theme.colors.primary} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingBottom: 8,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 48,
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
        paddingVertical: 12,
        gap: 16,
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
    alphabetNav: {
        position: 'absolute',
        right: 8,
        top: '30%',
        alignItems: 'center',
        gap: 2,
    },
    alphabetLetter: {
        fontSize: 10,
        fontWeight: '800',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
