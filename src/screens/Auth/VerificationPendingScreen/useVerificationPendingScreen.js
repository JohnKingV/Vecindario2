import { useTheme } from '../../../context/ThemeContext';

export const useVerificationPendingScreen = (route, navigation) => {
    const { theme, isDark } = useTheme();
    const email = route.params?.email || 'tu correo electrónico';

    const handleGoToLogin = () => {
        navigation.navigate('Login');
    };

    const handleResendEmail = () => {
        // Lógica para reenviar correo si se requiere en el futuro
        console.log('Resend email requested');
    };

    return {
        email,
        theme,
        isDark,
        handleGoToLogin,
        handleResendEmail,
        navigation
    };
};
