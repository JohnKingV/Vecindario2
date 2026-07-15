import { useState, useEffect } from 'react';

import { useAuth } from '../../../hooks/useAuth';
import { authService } from '../../../services/authService';
import { useTheme } from '../../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useSignUpScreen = (navigation) => {
    const insets = useSafeAreaInsets();
    const { signInWithGoogle: googleSignIn } = useAuth();
    const { theme, isDark } = useTheme();

    const [nombre, setNombre] = useState('');
    const [torre, setTorre] = useState('');
    const [depto, setDepto] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [communityCode, setCommunityCode] = useState('');
    const [comunidades, setComunidades] = useState([]);
    const [selectedComunidad, setSelectedComunidad] = useState(null);
    const [showComunidadSelector, setShowComunidadSelector] = useState(false);

    const [alertState, setAlertState] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { }
    });

    const [successState, setSuccessState] = useState({
        visible: false,
        message: '',
        onClose: () => { }
    });

    const hideAlert = () => {
        setAlertState(prev => ({ ...prev, visible: false }));
    };

    const showAlert = (title, message, type = 'info') => {
        setAlertState({
            visible: true,
            title,
            message,
            type,
            onConfirm: hideAlert
        });
    };

    const showSuccess = (message, onClose) => {
        setSuccessState({
            visible: true,
            message,
            onClose: onClose || (() => setSuccessState(prev => ({ ...prev, visible: false })))
        });
    };

    useEffect(() => {
        loadComunidades();
    }, []);

    const loadComunidades = async () => {
        const { data } = await authService.getComunidades();
        if (data) setComunidades(data);
    };

    const handleSignUp = async () => {
        if (!nombre || !email || !password || !depto || !communityCode) {
            showAlert('Error', 'Por favor completa todos los campos', 'danger');
            return;
        }

        setLoading(true);
        try {
            const { data: community, error: codeError } = await authService.verificarCodigoComunidad(communityCode);

            if (codeError || !community) {
                setLoading(false);
                showAlert('Error', 'El código de condominio no es válido. Por favor verifica con tu administración.', 'danger');
                return;
            }

            if (community.id !== selectedComunidad.id) {
                setLoading(false);
                showAlert('Error', 'El código ingresado no corresponde al condominio seleccionado.', 'danger');
                return;
            }

            const res = await authService.signUp(email, password, {
                nombre,
                depto,
                torre,
                comunidad_id: community.id
            });

            if (res.error) {
                showAlert('Error', res.error.message, 'danger');
            } else if (res.verificationPending) {
                navigation.navigate('VerificationPending', { email });
            } else {
                showSuccess('Cuenta creada correctamente.', () => {
                    setSuccessState(prev => ({ ...prev, visible: false }));
                    if (navigation.canGoBack()) {
                        navigation.goBack();
                    }
                });
            }
        } catch (err) {
            showAlert('Error', err.message, 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
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

    const toggleComunidadSelector = () => setShowComunidadSelector(!showComunidadSelector);

    const handleSelectComunidad = (comunidad) => {
        setSelectedComunidad(comunidad);
        setShowComunidadSelector(false);
    };

    return {
        nombre, setNombre,
        torre, setTorre,
        depto, setDepto,
        email, setEmail,
        password, setPassword,
        loading,
        googleLoading,
        communityCode, setCommunityCode,
        comunidades,
        selectedComunidad,
        showComunidadSelector,
        theme, isDark, insets,
        handleSignUp,
        handleGoogleSignUp,
        toggleComunidadSelector,
        handleSelectComunidad,
        navigation,
        alertState,
        hideAlert,
        successState
    };
};
