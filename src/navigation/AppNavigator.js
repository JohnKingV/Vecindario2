import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import VerificationPendingScreen from '../screens/Auth/VerificationPendingScreen';
import CompleteProfileScreen from '../screens/Auth/CompleteProfileScreen';

// Home Screens
import FeedScreen from '../screens/Home/FeedScreen';
import PostDetailScreen from '../screens/Home/PostDetailScreen';
import ResidencialScreen from '../screens/Home/ResidencialScreen';
import BookingScreen from '../screens/Home/BookingScreen';
import PaymentsScreen from '../screens/Home/PaymentsScreen';
import AnnouncementsScreen from '../screens/Home/AnnouncementsScreen';
import DocumentsScreen from '../screens/Home/DocumentsScreen';
import NotificationsScreen from '../screens/Home/NotificationsScreen';
import ServicesScreen from '../screens/Home/ServicesScreen';

// Marketplace Screens
import CreateItemScreen from '../screens/Marketplace/CreateItemScreen';
import MarketplaceScreen from '../screens/Marketplace/MarketplaceScreen';
import ItemDetailScreen from '../screens/Marketplace/ItemDetailScreen';
import FavoritesScreen from '../screens/Marketplace/FavoritesScreen';
import MyItemsScreen from '../screens/Marketplace/MyItemsScreen';

// Profile Screens
import ProfileScreen from '../screens/Profile/ProfileScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import UserProfileScreen from '../screens/Profile/UserProfileScreen';

// Message Screens
import MessagesScreen from '../screens/Messages/MessagesScreen';
import ChatScreen from '../screens/Messages/ChatScreen';
import NewMessageScreen from '../screens/Messages/NewMessageScreen';

// Admin Screens
import AdminPanelScreen from '../screens/Admin/AdminPanelScreen';
import UserManagementScreen from '../screens/Admin/UserManagementScreen';
import CondoManagementScreen from '../screens/Admin/CondoManagementScreen';

import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Icon Component
const TabIcon = ({ icon, focused }) => (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
        <Text style={[styles.tabIconText, focused && styles.tabIconTextFocused]}>
            {icon}
        </Text>
    </View>
);

// Main Tabs Navigator
function MainTabs() {
    const { theme, isDark } = useTheme();
    const { unreadMessages } = useAuth();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: [
                    styles.tabBar,
                    {
                        backgroundColor: theme.colors.card,
                        borderTopColor: theme.colors.border,
                    }
                ],
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarLabelStyle: styles.tabLabel,
                tabBarHideOnKeyboard: true,
            }}
        >
            <Tab.Screen
                name="Home"
                component={FeedScreen}
                options={{
                    tabBarLabel: 'INICIO',
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialCommunityIcons
                            name={focused ? "home" : "home-outline"}
                            size={26}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Club"
                component={MarketplaceScreen}
                options={{
                    tabBarLabel: 'CLUB',
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialCommunityIcons
                            name={focused ? "storefront" : "storefront-outline"}
                            size={26}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Residencial"
                component={ResidencialScreen}
                options={{
                    tabBarLabel: 'ACCESO',
                    tabBarIcon: ({ color }) => (
                        <View style={styles.centerButton}>
                            <MaterialCommunityIcons
                                name="apps"
                                size={26}
                                color="#fff"
                            />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Messages"
                component={MessagesScreen}
                options={{
                    tabBarLabel: 'CHAT',
                    tabBarBadge: unreadMessages > 0 ? unreadMessages : null,
                    tabBarBadgeStyle: {
                        backgroundColor: theme.colors.primary,
                        fontSize: 10,
                    },
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialCommunityIcons
                            name={focused ? "forum" : "forum-outline"}
                            size={26}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'PERFIL',
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialCommunityIcons
                            name={focused ? "account" : "account-outline"}
                            size={26}
                            color={color}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

// Auth Stack
function AuthStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="VerificationPending" component={VerificationPendingScreen} />
        </Stack.Navigator>
    );
}

// Complete Profile Stack (para usuarios de Google/OAuth sin comunidad)
function CompleteProfileStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
        </Stack.Navigator>
    );
}

// App Stack (con modales)
function AppStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Main"
                component={MainTabs}
                options={{ headerShown: false }}
            />

            {/* Modal Screens */}
            <Stack.Group
                screenOptions={{
                    presentation: 'modal',
                    headerShown: false,
                }}
            >
                <Stack.Screen
                    name="CreateItem"
                    component={CreateItemScreen}
                />
            </Stack.Group>

            {/* Regular Screens */}
            <Stack.Group
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen
                    name="PostDetail"
                    component={PostDetailScreen}
                />
                <Stack.Screen
                    name="EditProfile"
                    component={EditProfileScreen}
                />
                <Stack.Screen
                    name="ItemDetail"
                    component={ItemDetailScreen}
                />
                <Stack.Screen
                    name="Settings"
                    component={View} // Placeholder for settings
                />
                <Stack.Screen
                    name="Chat"
                    component={ChatScreen}
                />
                <Stack.Screen
                    name="Booking"
                    component={BookingScreen}
                />
                <Stack.Screen
                    name="Payments"
                    component={PaymentsScreen}
                />
                <Stack.Screen
                    name="Announcements"
                    component={AnnouncementsScreen}
                />
                <Stack.Screen
                    name="Documents"
                    component={DocumentsScreen}
                />
                <Stack.Screen
                    name="Favorites"
                    component={FavoritesScreen}
                />
                <Stack.Screen
                    name="Notifications"
                    component={NotificationsScreen}
                />
                <Stack.Screen
                    name="MyItems"
                    component={MyItemsScreen}
                />
                <Stack.Screen
                    name="AdminPanel"
                    component={AdminPanelScreen}
                />
                <Stack.Screen
                    name="UserManagement"
                    component={UserManagementScreen}
                />
                <Stack.Screen
                    name="CondoManagement"
                    component={CondoManagementScreen}
                />
                <Stack.Screen
                    name="NewMessage"
                    component={NewMessageScreen}
                />
                <Stack.Screen
                    name="UserProfile"
                    component={UserProfileScreen}
                />
            </Stack.Group>
        </Stack.Navigator>
    );
}

// Root Navigator
export default function AppNavigator() {
    const { isAuthenticated, profile, loading } = useAuth();
    const { theme, isDark } = useTheme();

    const navigationTheme = {
        ...(isDark ? DarkTheme : DefaultTheme),
        colors: {
            ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
            background: theme.colors.background,
            card: theme.colors.card,
            text: theme.colors.text,
            border: theme.colors.border,
            notification: theme.colors.notification,
            primary: theme.colors.primary,
        },
    };

    console.log('[AppNavigator] State:', { isAuthenticated, hasProfile: !!profile, loading });

    // Si estamos autenticados pero el perfil aún no ha llegado, seguimos mostrando carga
    // Esto evita el "flicker" de ver la pantalla de Completar Registro por medio segundo
    if (loading || (isAuthenticated && !profile)) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                    {isAuthenticated ? 'SINCRONIZANDO PERFIL...' : 'CARGANDO...'}
                </Text>
            </View>
        );
    }

    // Comprobamos si el perfil está completo (tiene nombre y comunidad)
    // Usamos doble negación para asegurar booleano y manejamos casos de carga parcial
    const isProfileComplete = !!(profile && profile.nombre && profile.comunidad_id);

    let content;
    if (!isAuthenticated) {
        content = <AuthStack />;
    } else if (!isProfileComplete) {
        // Solo enviamos a completar perfil si es un usuario nuevo (normalmente Google) sin comunidad
        content = <CompleteProfileStack />;
    } else {
        content = <AppStack />;
    }

    return (
        <NavigationContainer theme={navigationTheme}>
            {content}
            {isAuthenticated && Platform.OS === 'ios' && (
                <View style={[styles.iosHomeIndicator, { backgroundColor: isDark ? '#475569' : '#d1d5db' }]} />
            )}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '700',
        marginTop: 12,
    },
    tabBar: {
        height: Platform.OS === 'ios' ? 88 : 70,
        paddingBottom: Platform.OS === 'ios' ? 28 : 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        backgroundColor: 'rgba(255,255,255,0.95)',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 0,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: 4,
    },
    iosHomeIndicator: {
        position: 'absolute',
        bottom: 8,
        alignSelf: 'center',
        width: 134,
        height: 5,
        backgroundColor: '#d1d5db',
        borderRadius: 100,
    },
    centerButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#135bec',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -30,
        shadowColor: '#135bec',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
