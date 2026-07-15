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
import { useVotingAssemblyScreen } from './useVotingAssemblyScreen';
import { useTheme } from '../../../context/ThemeContext';
import { ResponsiveContainer } from '../../../components';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const VotingAssemblyScreen = () => {
    const { theme } = useTheme();
    const {
        votaciones,
        loading,
        userVotes,
        handleVote,
    } = useVotingAssemblyScreen();

    const renderPoll = ({ item }) => {
        const hasVoted = !!userVotes[item.id];
        const date = new Date(item.fecha_fin);
        const options = ['A Favor', 'En Contra', 'Abstención'];

        return (
            <View style={[styles.webCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={styles.webHeaderRow}>
                    <Text style={[styles.webPollTitle, { color: theme.colors.text }]}>{item.titulo}</Text>
                    <View style={[styles.webBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                        <Text style={[styles.webBadgeText, { color: theme.colors.primary }]}>ASAMBLEA ACTIVA</Text>
                    </View>
                </View>

                <Text style={[styles.webPollDesc, { color: theme.colors.textSecondary }]}>{item.descripcion}</Text>

                <View style={styles.webMetaRow}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={{ color: theme.colors.textSecondary, marginLeft: 8 }}>
                        Finaliza el {format(date, "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                    </Text>
                </View>

                <View style={styles.webOptionsGrid}>
                    {options.map((opt) => {
                        const isSelected = userVotes[item.id] === opt;
                        return (
                            <TouchableOpacity
                                key={opt}
                                style={[
                                    styles.webOptionBtn,
                                    { borderColor: isSelected ? theme.colors.primary : theme.colors.border },
                                    isSelected && { backgroundColor: theme.colors.primary + '10' }
                                ]}
                                disabled={hasVoted}
                                onPress={() => handleVote(item.id, opt)}
                            >
                                <Text style={[
                                    styles.webOptionText,
                                    { color: isSelected ? theme.colors.primary : theme.colors.text }
                                ]}>
                                    {opt}
                                </Text>
                                {isSelected && (
                                    <MaterialCommunityIcons name="check-decagram" size={24} color={theme.colors.primary} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {hasVoted && (
                    <View style={styles.webVotedNotice}>
                        <MaterialCommunityIcons name="shield-check" size={24} color={theme.colors.primary} />
                        <Text style={[styles.webVotedText, { color: theme.colors.text }]}>
                            Tu voto ha sido registrado de forma segura. Accede al acta al finalizar la sesión.
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>
                <View style={styles.webContent}>
                    <View style={styles.webHeader}>
                        <Text style={[styles.webTitle, { color: theme.colors.text }]}>Centro de Decisiones</Text>
                        <Text style={[styles.webSubtitle, { color: theme.colors.textSecondary }]}>
                            Participa en las decisiones fundamentales del condominio mediante votación digital segura.
                        </Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator style={{ marginTop: 100 }} size="large" color={theme.colors.primary} />
                    ) : (
                        <FlatList
                            data={votaciones}
                            renderItem={renderPoll}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.webList}
                            ListEmptyComponent={
                                <View style={styles.webEmpty}>
                                    <MaterialCommunityIcons name="gavel" size={120} color={theme.colors.border} />
                                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.textSecondary, marginTop: 24 }}>
                                        No hay sesiones de votación activas
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
    webContent: { paddingVertical: 80 },
    webHeader: { marginBottom: 60 },
    webTitle: { fontSize: 48, fontWeight: '900', letterSpacing: -2 },
    webSubtitle: { fontSize: 20, marginTop: 12, maxWidth: 700 },
    webList: { paddingBottom: 100 },
    webCard: { padding: 48, borderRadius: 32, borderWidth: 1, marginBottom: 40 },
    webHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    webPollTitle: { fontSize: 28, fontWeight: '900' },
    webBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    webBadgeText: { fontSize: 12, fontWeight: '900' },
    webPollDesc: { fontSize: 18, lineHeight: 28, marginBottom: 32, maxWidth: 800 },
    webMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 48 },
    webOptionsGrid: { flexDirection: 'row', gap: 20 },
    webOptionBtn: {
        flex: 1,
        height: 80,
        borderRadius: 20,
        borderWidth: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 32
    },
    webOptionText: { fontSize: 18, fontWeight: '900' },
    webVotedNotice: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 48, padding: 32, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.02)' },
    webVotedText: { fontSize: 16, fontWeight: '600' },
    webEmpty: { alignItems: 'center', marginTop: 100 }
});

export default VotingAssemblyScreen;
