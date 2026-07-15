import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../../hooks/useAuth';
import { authService } from '../../../services/authService';
import { useTheme } from '../../../context/ThemeContext';

export const useEditProfileScreen = (navigation) => {
    const { profile, refreshProfile } = useAuth();
    const { theme, isDark } = useTheme();
    const [nombre, setNombre] = useState(profile?.nombre || '');
    const [telefono, setTelefono] = useState(profile?.telefono || '');
    const [torre, setTorre] = useState(profile?.torre || '');
    const [depto, setDepto] = useState(profile?.depto || '');
    const [sexo, setSexo] = useState(profile?.sexo || 'hombre');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [alertState, setAlertState] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info'
    });

    const showAlert = (title, message, type = 'info') => {
        setAlertState({ visible: true, title, message, type });
    };

    const hideAlert = () => setAlertState(prev => ({ ...prev, visible: false }));

    const handleSave = async () => {
        if (!nombre.trim()) {
            showAlert('Error', 'El nombre no puede estar vacío', 'danger');
            return;
        }

        setLoading(true);
        try {
            const { error } = await authService.updateProfile(profile.id, {
                nombre: nombre.trim(),
                telefono: telefono.trim(),
                torre: torre.trim(),
                depto: depto.trim(),
                sexo: sexo,
                email: profile.email, // Incluimos el email para evitar violar el constraint NOT NULL
            });

            if (error) {
                setLoading(false);
                console.error('[EditProfile] Update error:', error);
                showAlert('Error', 'No se pudo actualizar el perfil', 'danger');
            } else {
                // Await the refresh before showing success to ensure UI data is sync
                if (refreshProfile) {
                    await refreshProfile().catch(e => console.error('[EditProfile] Refresh error:', e));
                }
                setLoading(false);
                setShowSuccess(true);
            }
        } catch (err) {
            setLoading(false);
            console.error('[EditProfile] Unexpected error:', err);
            showAlert('Error', 'Ocurrió un error inesperado al guardar', 'danger');
        }
    };

    const handleSuccessClose = () => {
        setShowSuccess(false);
        // Permanecemos en la pantalla según solicitud del usuario
    };

    return {
        nombre, setNombre,
        telefono, setTelefono,
        torre, setTorre,
        depto, setDepto,
        sexo, setSexo,
        loading,
        showSuccess, setShowSuccess,
        alertState,
        hideAlert,
        theme,
        isDark,
        handleSave,
        handleSuccessClose,
        navigation
    };
};
