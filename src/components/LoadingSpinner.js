import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { LoadingDots } from './LoadingDots';

const LoadingSpinner = ({ message = 'Cargando...' }) => {
    const { theme } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <LoadingDots size={12} color={theme.colors.primary} />
            {message && <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    message: {
        marginTop: 16,
        fontSize: 14,
        color: '#64748b',
    },
});

export default LoadingSpinner;