import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/hooks/useAuth';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

import { notificationService } from './src/services/notificationService';

// Ignorar warnings específicos
LogBox.ignoreLogs([
    'Setting a timer',
    'AsyncStorage has been extracted',
    'props.pointerEvents is deprecated',
]);

const AppContent = () => {
    const { theme } = useTheme();
    return (
        <>
            <StatusBar
                style={theme.dark ? "light" : "dark"}
                translucent={false}
                backgroundColor={theme.colors.statusBarBg}
            />
            <AppNavigator />
        </>
    );
};

export default function App() {
    useEffect(() => {
        // Inicializar servicios globales
        notificationService.init();
    }, []);

    return (
        <SafeAreaProvider>
            <PaperProvider>
                <ThemeProvider>
                    <AuthProvider>
                        <AppContent />
                    </AuthProvider>
                </ThemeProvider>
            </PaperProvider>
        </SafeAreaProvider>
    );
}
