import { useTheme } from '../../../context/ThemeContext';

export const useVerificationScreen = () => {
    const { theme } = useTheme();
    return { theme };
};
