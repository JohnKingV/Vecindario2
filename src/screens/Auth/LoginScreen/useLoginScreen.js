import { useState } from 'react';

import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useLoginScreen = (navigation) => {
    const insets = useSafeAreaInsets();
    const { signIn, signInWithGoogle: googleSignIn } = useAuth();
    const { theme, isDark } = useTheme();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [alertState, setAlertState] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { }
    });

    const hideAlert = () => {
        setAlertState(prev => ({ ...prev, visible: false }));
    };

    const showAlert = (title, message, type = 'info', onConfirm = null) => {
        setAlertState({
            visible: true,
            title,
            message,
            type,
            onConfirm: onConfirm || hideAlert
        });
    };

    const handleLogin = async () => {
        if (!email || !password) {
            showAlert('Error', 'Por favor completa todos los campos', 'danger');
            return;
        }

        setLoading(true);
        try {
            const { error } = await signIn(email, password);
            if (error) {
                if (error.message?.includes('Email not confirmed')) {
                    showAlert(
                        'Confirmación Pendiente',
                        'Tu correo electrónico aún no ha sido confirmado. Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación.',
                        'warning'
                    );
                } else {
                    showAlert('Error', error.message, 'danger');
                }
            }
        } catch (err) {
            showAlert('Error', err.message, 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            const { error } = await googleSignIn();
            if (error) {
                showAlert('Error', error.message, 'danger');
            }
        } catch (err) {
            showAlert('Error', err.message, 'danger');
        } finally {
            setGoogleLoading(false);
        }
    };

    return {
        email, setEmail,
        password, setPassword,
        loading,
        googleLoading,
        showPassword, setShowPassword,
        theme, isDark,
        insets,
        handleLogin,
        handleGoogleSignIn,
        navigation,
        alertState,
        hideAlert
    };
};
