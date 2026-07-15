import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { authService } from '../../../services/authService';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useCompleteProfileScreen = () => {
    const { theme, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { user, profile, refreshProfile, signOut } = useAuth();

    const [nombre, setNombre] = useState('');
    const [torre, setTorre] = useState('');
    const [depto, setDepto] = useState('');
    const [communityCode, setCommunityCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [comunidades, setComunidades] = useState([]);
    const [selectedComunidad, setSelectedComunidad] = useState(null);
    const [showComunidadSelector, setShowComunidadSelector] = useState(false);
    const [sexo, setSexo] = useState('hombre');

    useEffect(() => {
        loadComunidades();
        if (profile?.nombre) {
            setNombre(profile.nombre);
        } else if (user?.user_metadata?.nombre || user?.user_metadata?.full_name || user?.user_metadata?.name) {
            setNombre(user.user_metadata.nombre || user.user_metadata.full_name || user.user_metadata.name);
        }
    }, [user, profile]);

    const loadComunidades = async () => {
        const { data } = await authService.getComunidades();
        if (data) {
            const unique = data.filter((v, i, a) => a.findIndex(t => t.nombre === v.nombre) === i);
            setComunidades(unique);
        }
    };

    const handleCompleteProfile = async () => {
        if (!nombre || !depto || !communityCode) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        setLoading(true);
        try {
            const { data: community, error: codeError } = await authService.verificarCodigoComunidad(communityCode);

            if (codeError || !community) {
                setLoading(false);
                Alert.alert('Error', 'El código de condominio no es válido. Por favor verifica con tu administración.');
                return;
            }

            if (community.id !== selectedComunidad.id) {
                setLoading(false);
                Alert.alert('Error', 'El código ingresado no corresponde al condominio seleccionado.');
                return;
            }

            const { error } = await authService.updateProfile(user.id, {
                nombre,
                torre,
                depto,
                sexo,
                comunidad_id: community.id,
                email: user.email,
            });

            if (error) {
                Alert.alert('Error', error.message);
            } else {
                await refreshProfile();
            }
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
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
        communityCode, setCommunityCode,
        loading,
        comunidades,
        selectedComunidad,
        showComunidadSelector,
        sexo, setSexo,
        theme, isDark, insets,
        handleCompleteProfile,
        signOut,
        toggleComunidadSelector,
        handleSelectComunidad,
    };
};
