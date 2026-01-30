import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const lightTheme = {
    dark: false,
    colors: {
        background: '#ffffff',
        text: '#0f172a',
        textSecondary: '#64748b',
        primary: '#197fe6',
        secondary: '#135bec',
        accent: '#e0f2fe',
        border: '#f1f5f9',
        card: '#ffffff',
        notification: '#ef4444',
        success: '#16a34a',
        error: '#ef4444',
        inputBackground: '#f8fafc',
        placeholder: '#94a3b8',
        statusBar: 'dark-content',
        statusBarBg: '#ffffff',
    }
};

export const darkTheme = {
    dark: true,
    colors: {
        background: '#0f172a',
        text: '#f8fafc',
        textSecondary: '#94a3b8',
        primary: '#3b82f6',
        secondary: '#60a5fa',
        accent: '#1e293b',
        border: '#1e293b',
        card: '#1e293b',
        notification: '#ef4444',
        success: '#22c55e',
        error: '#ef4444',
        inputBackground: '#334155',
        placeholder: '#64748b',
        statusBar: 'light-content',
        statusBarBg: '#0f172a',
    }
};

export const ThemeProvider = ({ children }) => {
    const systemScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemScheme === 'dark');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme');
            if (savedTheme !== null) {
                setIsDark(savedTheme === 'dark');
            }
        } catch (error) {
            console.error('Failed to load theme', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTheme = async () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        try {
            await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
        } catch (error) {
            console.error('Failed to save theme', error);
        }
    };

    const theme = isDark ? darkTheme : lightTheme;

    const value = React.useMemo(() => ({
        theme,
        isDark,
        toggleTheme
    }), [theme, isDark]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
