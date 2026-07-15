import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer, getFocusedRouteNameFromRoute, createNavigationContainerRef } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View, Platform, TouchableOpacity, useWindowDimensions, Keyboard, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LoadingDots } from '../components/LoadingDots';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import VerificationPendingScreen from '../screens/Auth/VerificationPendingScreen';
import CompleteProfileScreen from '../screens/Auth/CompleteProfileScreen';

// Home Screens
import FeedScreen from '../screens/Home/FeedScreen';
import PostDetailScreen from '../screens/Home/PostDetailScreen';
import CreatePostScreen from '../screens/Home/CreatePostScreen';
import ResidencialScreen from '../screens/Home/ResidencialScreen';
import BookingScreen from '../screens/Home/BookingScreen';
import PaymentsScreen from '../screens/Home/PaymentsScreen';
import AnnouncementsScreen from '../screens/Home/AnnouncementsScreen';
import DocumentsScreen from '../screens/Home/DocumentsScreen';
import NotificationsScreen from '../screens/Home/NotificationsScreen';
import ServicesScreen from '../screens/Home/ServicesScreen';
import ParkingMonitorScreen from '../screens/Home/ParkingMonitorScreen';
import LogisticsHubScreen from '../screens/Home/LogisticsHubScreen';
import NoticeLogScreen from '../screens/Home/NoticeLogScreen';
import FinanceHubScreen from '../screens/Home/FinanceHubScreen';
import RoleManagementScreen from '../screens/Admin/RoleManagementScreen';
import MeterReadingScreen from '../screens/Home/MeterReadingScreen';
import VotingAssemblyScreen from '../screens/Home/VotingAssemblyScreen';
import MaintenanceCalendarScreen from '../screens/Home/MaintenanceCalendarScreen';
import ProvidersScreen from '../screens/Home/FinanceHubScreen/ProvidersScreen';
import PayrollScreen from '../screens/Home/FinanceHubScreen/PayrollScreen';
import BankReconciliationScreen from '../screens/Home/FinanceHubScreen/BankReconciliationScreen';

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
import PhotoViewerScreen from '../screens/Profile/PhotoViewerScreen';
import PhotoSelectScreen from '../screens/Profile/PhotoSelectScreen';

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
const Tab = createMaterialTopTabNavigator();

export const navigationRef = createNavigationContainerRef();

// --- Helper for Route Detection ---
const isRouteRoot = (route) => {
    const routeName = getFocusedRouteNameFromRoute(route);
    return !routeName || [
        'Feed',
        'Marketplace',
        'ResidencialMain',
        'MessagesList',
        'NotificationsList',
        'ProfileMain'
    ].includes(routeName);
};

// --- Per-Tab Stack Navigators ---
function HomeStack() {
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true
        }}>
            <Stack.Screen name="Feed" component={FeedScreen} />
            <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Documents" component={DocumentsScreen} />
            <Stack.Screen name="Booking" component={BookingScreen} />
            <Stack.Screen name="Payments" component={PaymentsScreen} />
            <Stack.Screen name="Services" component={ServicesScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
    );
}

function ClubStack() {
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true
        }}>
            <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
            <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
            <Stack.Screen name="MyItems" component={MyItemsScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
    );
}

function MessagesStack() {
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true
        }}>
            <Stack.Screen name="MessagesList" component={MessagesScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="NewMessage" component={NewMessageScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        </Stack.Navigator>
    );
}

function ProfileStack() {
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true
        }}>
            <Stack.Screen name="ProfileMain" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="MyItems" component={MyItemsScreen} />
        </Stack.Navigator>
    );
}

function ResidencialStack() {
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true
        }}>
            <Stack.Screen name="ResidencialMain" component={ResidencialScreen} />
            <Stack.Screen name="Booking" component={BookingScreen} />
            <Stack.Screen name="Payments" component={PaymentsScreen} />
            <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
            <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
            <Stack.Screen name="Documents" component={DocumentsScreen} />
            <Stack.Screen name="ParkingMonitor" component={ParkingMonitorScreen} />
            <Stack.Screen name="LogisticsHub" component={LogisticsHubScreen} />
            <Stack.Screen name="NoticeLog" component={NoticeLogScreen} />
            <Stack.Screen name="FinanceHub" component={FinanceHubScreen} />
            <Stack.Screen name="MeterReading" component={MeterReadingScreen} />
            <Stack.Screen name="VotingAssembly" component={VotingAssemblyScreen} />
            <Stack.Screen name="MaintenanceCalendar" component={MaintenanceCalendarScreen} />
            <Stack.Screen name="Providers" component={ProvidersScreen} />
            <Stack.Screen name="Payroll" component={PayrollScreen} />
            <Stack.Screen name="BankReconciliation" component={BankReconciliationScreen} />
        </Stack.Navigator>
    );
}

function NotificationsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="NotificationsList" component={NotificationsScreen} />
        </Stack.Navigator>
    );
}

function CustomTabBar({ state, descriptors, navigation }) {
    const { theme, isDark } = useTheme();
    const { unreadMessages, unreadNotifications, condoBadges } = useAuth();
    const { width } = useWindowDimensions();
    const [isKeyboardVisible, setKeyboardVisible] = React.useState(false);

    React.useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const focusedRoute = state.routes[state.index];
    const isRoot = isRouteRoot(focusedRoute);
    const currentRootRoute = navigation.getParent()?.getState()?.routes[navigation.getParent()?.getState()?.index]?.name;
    const isAppAtMain = !currentRootRoute || currentRootRoute === 'Main';
    const shouldHide = isKeyboardVisible || !isRoot || !isAppAtMain;

    return (
        <View style={StyleSheet.flatten([
            styles.tabBar,
            {
                backgroundColor: shouldHide ? '#000000' : theme.colors.card,
                borderTopColor: shouldHide ? '#000000' : theme.colors.border,
                borderTopWidth: shouldHide ? 0 : 1,
                flexDirection: 'row',
                justifyContent: 'center',
                paddingBottom: Platform.OS === 'ios' ? (shouldHide ? 0 : 20) : (shouldHide ? 0 : 8),
                paddingTop: shouldHide ? 0 : 8,
                height: shouldHide ? 0 : (Platform.OS === 'ios' ? 85 : 60),
                opacity: shouldHide ? 0 : 1,
                overflow: 'hidden',
                elevation: shouldHide ? 0 : 8,
                display: shouldHide ? 'none' : 'flex',
                position: shouldHide ? 'absolute' : 'relative',
                bottom: shouldHide ? -500 : 0,
                zIndex: shouldHide ? -1 : 100,
            }
        ])}>
            <View style={[
                { flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center' },
                Platform.OS === 'web' && width > 768 && { maxWidth: 800, width: '100%', justifyContent: 'space-around' }
            ]}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel !== undefined ? options.tabBarLabel : (options.title !== undefined ? options.title : route.name);
                    const isFocused = state.index === index;
                    const onPress = () => {
                        const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                        if (!isFocused && !event.defaultPrevented) { navigation.navigate({ name: route.name, merge: true }); }
                    };
                    const color = isFocused ? theme.colors.primary : theme.colors.textSecondary;

                    return (
                        <TouchableOpacity key={route.key} onPress={onPress} style={styles.tabItem}>
                            <View style={{ position: 'relative' }}>
                                {options.tabBarIcon && options.tabBarIcon({ color, focused: isFocused })}
                                {route.name === 'Messages' && unreadMessages > 0 && (
                                    <View style={[styles.badge, { right: -6, top: -4 }]}>
                                        <Text style={styles.badgeText}>{unreadMessages > 9 ? '9+' : unreadMessages}</Text>
                                    </View>
                                )}
                                {route.name === 'Notifications' && unreadNotifications > 0 && (
                                    <View style={[styles.badge, { right: -6, top: -4 }]}>
                                        <Text style={styles.badgeText}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
                                    </View>
                                )}
                                {route.name === 'Residencial' && condoBadges?.total > 0 && (
                                    <View style={[styles.badge, { right: -6, top: -4 }]}>
                                        <Text style={styles.badgeText}>{condoBadges.total > 9 ? '9+' : condoBadges.total}</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={[styles.tabLabel, { color, fontSize: 10, fontWeight: isFocused ? 'bold' : '600' }]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

function MainTabs() {
    return (
        <Tab.Navigator tabBar={props => <CustomTabBar {...props} />} tabBarPosition="bottom" screenOptions={({ route }) => ({ swipeEnabled: isRouteRoot(route), lazy: true, animationEnabled: true })}>
            <Tab.Screen name="Home" component={HomeStack} options={{ tabBarLabel: 'INICIO', tabBarIcon: ({ color, focused }) => (<MaterialCommunityIcons name={focused ? "home" : "home-outline"} size={26} color={color} />) }} />
            <Tab.Screen name="Club" component={ClubStack} options={{ tabBarLabel: 'CLUB', tabBarIcon: ({ color, focused }) => (<MaterialCommunityIcons name={focused ? "storefront" : "storefront-outline"} size={26} color={color} />) }} />
            <Tab.Screen name="Residencial" component={ResidencialStack} options={{ tabBarLabel: 'CONDOMINIO', tabBarIcon: ({ color, focused }) => (<MaterialCommunityIcons name={focused ? "office-building" : "office-building-outline"} size={26} color={color} />) }} />
            <Tab.Screen name="Messages" component={MessagesStack} options={{ tabBarLabel: 'CHAT', tabBarIcon: ({ color, focused }) => (<MaterialCommunityIcons name={focused ? "forum" : "forum-outline"} size={26} color={color} />) }} />
            <Tab.Screen name="Notifications" component={NotificationsStack} options={{ tabBarLabel: 'NOTIF', tabBarIcon: ({ color, focused }) => (<MaterialCommunityIcons name={focused ? "bell" : "bell-outline"} size={26} color={color} />) }} />
            <Tab.Screen name="Profile" component={ProfileStack} options={{ tabBarLabel: 'PERFIL', tabBarIcon: ({ color, focused }) => (<MaterialCommunityIcons name={focused ? "account" : "account-outline"} size={26} color={color} />) }} />
        </Tab.Navigator>
    );
}

function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade', gestureEnabled: true }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="VerificationPending" component={VerificationPendingScreen} />
        </Stack.Navigator>
    );
}

function CompleteProfileStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_bottom', gestureEnabled: true }}>
            <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
        </Stack.Navigator>
    );
}

function AppStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right', gestureEnabled: true }}>
            <Stack.Screen name="Main" component={MainTabs} options={{ gestureEnabled: false }} />
            <Stack.Group screenOptions={{ presentation: 'modal', headerShown: false }}>
                <Stack.Screen name="CreateItem" component={CreateItemScreen} />
                <Stack.Screen name="CreatePost" component={CreatePostScreen} />
            </Stack.Group>
            <Stack.Group screenOptions={{ headerShown: false }}>
                <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
                <Stack.Screen name="UserManagement" component={UserManagementScreen} />
                <Stack.Screen name="CondoManagement" component={CondoManagementScreen} />
                <Stack.Screen name="RoleManagement" component={RoleManagementScreen} />
                <Stack.Screen name="ChatTab" component={ChatScreen} options={{ headerShown: false }} />
            </Stack.Group>
            <Stack.Screen name="PhotoViewer" component={PhotoViewerScreen} options={{ animation: 'fade', orientation: 'all' }} />
            <Stack.Screen name="PhotoSelect" component={PhotoSelectScreen} options={{ animation: 'slide_from_bottom' }} />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    const { isAuthenticated, profile, loading } = useAuth();
    const { theme, isDark } = useTheme();
    const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';
    const HAS_ENTERED_KEY = 'HAS_ENTERED_APP_V1';
    const [isReady, setIsReady] = React.useState(false);
    const [initialState, setInitialState] = React.useState();
    const [hasEnteredApp, setHasEnteredApp] = React.useState(false);
    const [currentRoute, setCurrentRoute] = React.useState(null);

    const navigationTheme = {
        ...(isDark ? DarkTheme : DefaultTheme),
        colors: {
            ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
            background: theme.colors.background, card: theme.colors.card, text: theme.colors.text, border: theme.colors.border, notification: theme.colors.notification, primary: theme.colors.primary,
        },
    };

    const isProfileComplete = !!(profile && profile.nombre && profile.comunidad_id);

    React.useEffect(() => {
        const restoreState = async () => {
            try {
                const initialUrl = await Linking.getInitialURL();
                if (Platform.OS !== 'web' && initialUrl == null) {
                    const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
                    const state = savedStateString ? JSON.parse(savedStateString) : undefined;
                    const savedHasEntered = await AsyncStorage.getItem(HAS_ENTERED_KEY);
                    if (state !== undefined) {
                        setInitialState(state);
                        if (savedHasEntered === 'true' || !!savedStateString) { setHasEnteredApp(true); }
                    }
                }
            } catch (e) {
                console.error('[AppNavigator] Persistence error:', e);
            } finally {
                setIsReady(true);
            }
        };
        if (!isReady) { restoreState(); }
    }, [isReady]);

    React.useEffect(() => {
        if (isAuthenticated && isProfileComplete && !loading) {
            setHasEnteredApp(true);
            AsyncStorage.setItem(HAS_ENTERED_KEY, 'true');
        }
    }, [isAuthenticated, isProfileComplete, loading]);

    React.useEffect(() => {
        const updateRoute = () => {
            const route = navigationRef.getCurrentRoute();
            setCurrentRoute(route?.name);
        };
        if (navigationRef.isReady()) { updateRoute(); }
        const unsubscribe = navigationRef.addListener('state', updateRoute);
        return unsubscribe;
    }, []);

    const hideHomeIndicator = ['PhotoViewer', 'PhotoSelect', 'Login', 'SignUp'].includes(currentRoute);

    React.useEffect(() => {
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            if (data?.type === 'package') {
                if (navigationRef.isReady()) {
                    navigationRef.navigate('Main', { screen: 'Residencial', params: { screen: 'LogisticsHub' } });
                }
            }
        });
        return () => subscription.remove();
    }, []);

    let content;
    const isActuallyInitialLoading = !isReady || (loading && !hasEnteredApp);
    const hideLoadingOverlay = ['PhotoViewer', 'PhotoSelect'].includes(currentRoute);

    if (isActuallyInitialLoading) {
        content = (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <LoadingDots size={12} color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                    {isAuthenticated ? 'SINCRONIZANDO...' : 'CARGANDO...'}
                </Text>
            </View>
        );
    } else if (!isAuthenticated) {
        content = <AuthStack />;
    } else if (hasEnteredApp) {
        content = (
            <View style={{ flex: 1 }}>
                <AppStack />
            </View>
        );
    } else if (!isProfileComplete) {
        content = <CompleteProfileStack />;
    } else {
        content = <AppStack />;
    }

    return (
        <NavigationContainer
            theme={navigationTheme}
            ref={navigationRef}
            initialState={initialState}
            onStateChange={(state) => AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state))}
        >
            {content}
            {isAuthenticated && Platform.OS === 'ios' && !hideHomeIndicator && (
                <View style={[styles.iosHomeIndicator, { backgroundColor: isDark ? '#475569' : '#d1d5db' }]} />
            )}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    overlayLoading: { justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
    overlayBlur: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
    loadingBox: { padding: 20, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    loadingText: { fontSize: 16, color: '#64748b', fontWeight: '700', marginTop: 12 },
    tabBar: { backgroundColor: '#fff', elevation: 0 },
    tabLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: 4 },
    tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    iosHomeIndicator: { position: 'absolute', bottom: 8, alignSelf: 'center', width: 134, height: 5, backgroundColor: '#d1d5db', borderRadius: 100, zIndex: 1001 },
    badge: { position: 'absolute', right: -4, top: -1, backgroundColor: '#f87171', borderRadius: 7, minWidth: 14, height: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1.2, borderColor: '#fff' },
    badgeText: { color: '#fff', fontSize: 8, fontWeight: 'bold', paddingHorizontal: 1 },
});
