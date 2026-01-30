import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { supabase } from '../config/supabase';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const isInitializing = useRef(true);

    const handleSignOut = useCallback(async () => {
        try {
            if (user?.id) {
                // Intento silencioso de poner offline
                await supabase
                    .from('profiles')
                    .update({ status: 'offline', last_seen: new Date().toISOString() })
                    .eq('id', user.id);
            }
            await authService.signOut();
        } catch (error) {
            console.error('[AuthProvider] SignOut error:', error);
        } finally {
            setUser(null);
            setProfile(null);
            setLoading(false);
        }
    }, [user?.id]);

    const loadProfile = useCallback(async (userId) => {
        if (!userId) return null;

        try {
            console.log('[AuthProvider] Loading profile for:', userId);
            const { data, error } = await supabase
                .from('profiles')
                .select('*, comunidades(nombre)')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('[AuthProvider] profile fetch error:', error);
                if (error.message?.includes('bad_jwt') || error.message?.includes('expired')) {
                    handleSignOut();
                }
                return null;
            }

            if (data) {
                console.log('[AuthProvider] Profile loaded successfully');
                setProfile(data);

                // Registrar token de notificaciones si no existe o ha cambiado
                notificationService.getPushToken().then(token => {
                    if (token && token !== data.expo_push_token) {
                        supabase
                            .from('profiles')
                            .update({ expo_push_token: token })
                            .eq('id', userId)
                            .then(({ error }) => {
                                if (!error) console.log('[AuthProvider] Push token registered');
                            });
                    }
                });

                // Set online if was offline (background)
                if (data.status === 'offline') {
                    supabase
                        .from('profiles')
                        .update({ status: 'online', last_seen: new Date().toISOString() })
                        .eq('id', userId)
                        .then();
                }
                return data;
            } else {
                console.log('[AuthProvider] No profile found for user:', userId, '. Checking metadata...');

                // Buscamos metadata del usuario (venga de Google o registro manual)
                const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

                if (userError) {
                    console.error('[AuthProvider] Error getting auth user:', userError);
                    return null;
                }

                if (authUser && authUser.user_metadata) {
                    const metadata = authUser.user_metadata;
                    // Google suele usar 'full_name' o 'name', el registro manual usa 'nombre'
                    const nombre = metadata.nombre || metadata.full_name || metadata.name;

                    if (nombre) {
                        console.log('[AuthProvider] Metadata found, creating profile for:', nombre);

                        const { data: newProfile, error: createError } = await supabase
                            .from('profiles')
                            .upsert([
                                {
                                    id: userId,
                                    email: authUser.email,
                                    nombre: nombre,
                                    foto_url: metadata.avatar_url || metadata.picture || null,
                                    depto: metadata.depto || '',
                                    torre: metadata.torre || '',
                                    comunidad_id: metadata.comunidad_id || null,
                                    verificado: false,
                                    status: 'online',
                                    last_seen: new Date().toISOString()
                                }
                            ])
                            .select('*, comunidades(nombre)')
                            .maybeSingle();

                        if (!createError && newProfile) {
                            console.log('[AuthProvider] Profile created successfully from metadata');
                            setProfile(newProfile);
                            return newProfile;
                        } else {
                            console.error('[AuthProvider] Failed to create profile from metadata:', createError);
                        }
                    } else {
                        console.warn('[AuthProvider] User metadata found but no name/nombre present');
                    }
                }

                return null;
            }
        } catch (error) {
            console.error('[AuthProvider] loadProfile catch error:', error);
            return null;
        }
    }, [handleSignOut]);

    const refreshProfile = useCallback(async () => {
        if (user?.id) {
            loadUnreadCounts(user.id);
            return await loadProfile(user.id);
        }
        return null;
    }, [user?.id, loadProfile]);

    const loadUnreadCounts = useCallback(async (userId) => {
        try {
            const { count: notifCount } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('read', false);

            setUnreadNotifications(notifCount || 0);

            const { count: msgCount } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .neq('sender_id', userId)
                .eq('is_read', false);

            setUnreadMessages(msgCount || 0);
        } catch (error) {
            console.error('[AuthProvider] loadUnreadCounts error:', error);
        }
    }, []);

    const initializeAuth = useCallback(async () => {
        try {
            console.log('[AuthProvider] Initializing session...');
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('[AuthProvider] Session error:', error.message);
                if (error.message?.includes('expired') || error.message?.includes('bad_jwt')) {
                    await handleSignOut();
                }
                setLoading(false);
                return;
            }

            if (session?.user) {
                setUser(session.user);
                await loadProfile(session.user.id);
                await loadUnreadCounts(session.user.id);
            } else {
                setUser(null);
                setProfile(null);
                setUnreadNotifications(0);
                setUnreadMessages(0);
            }
        } catch (error) {
            console.error('[AuthProvider] Initialization failed:', error);
        } finally {
            setLoading(false);
            isInitializing.current = false;
        }
    }, [loadProfile, handleSignOut, loadUnreadCounts]);

    const refreshUnreadCounts = useCallback(() => {
        if (user?.id) loadUnreadCounts(user.id);
    }, [user?.id, loadUnreadCounts]);

    useEffect(() => {
        initializeAuth();

        let profileSubscription;

        const setupProfileSubscription = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;

            if (userId) {
                console.log('[AuthProvider] Setting up profile subscription for:', userId);
                profileSubscription = supabase
                    .channel(`public:profiles:id=eq.${userId}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'profiles',
                            filter: `id=eq.${userId}`
                        },
                        (payload) => {
                            console.log('[AuthProvider] Profile updated in real-time:', payload.new);
                            setProfile(prev => ({ ...prev, ...payload.new }));
                        }
                    )
                    .subscribe();
            }
        };

        setupProfileSubscription();

        // Suscripción a Notificaciones para actualizar contador
        let notificationsSub;
        if (user?.id) {
            notificationsSub = supabase
                .channel(`public:notifications:user_id=eq.${user.id}`)
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
                    () => loadUnreadCounts(user.id)
                )
                .subscribe();
        }

        // Suscripción a Mensajes para actualizar contador
        let messagesSub;
        if (user?.id) {
            messagesSub = supabase
                .channel(`public:messages:recipient`)
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'messages' },
                    (payload) => {
                        // Si el mensaje es para una conversación donde participo y no soy el sender
                        // Simplificamos: si cambia algo en messages, refrescamos conteo
                        loadUnreadCounts(user.id);
                    }
                )
                .subscribe();
        }

        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('[AuthProvider] Auth event:', event);

                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    if (session?.user) {
                        setLoading(true); // Forzar loading true al detectar inicio de sesión
                        setUser(session.user);
                        await loadProfile(session.user.id);
                        await loadUnreadCounts(session.user.id);
                    }
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setProfile(null);
                    setLoading(false);
                }

                // Solo ponemos loading en false después de procesar el evento (especialmente loadProfile)
                // y solo si no es la inicialización (la cual tiene su propio finally)
                if (!isInitializing.current) {
                    setLoading(false);
                }
            }
        );

        return () => {
            authSubscription.unsubscribe();
            if (profileSubscription) supabase.removeChannel(profileSubscription);
            if (notificationsSub) supabase.removeChannel(notificationsSub);
            if (messagesSub) supabase.removeChannel(messagesSub);
        };
    }, [initializeAuth, loadProfile]);

    const updateStatus = async (newStatus) => {
        if (!user?.id) return { error: 'No user session' };

        console.log('[AuthProvider] Updating status to:', newStatus);

        const previousProfile = profile;
        setProfile(prev => prev ? { ...prev, status: newStatus } : prev);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    status: newStatus,
                    last_seen: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) {
                setProfile(previousProfile);
                throw error;
            }

            return { error: null };
        } catch (error) {
            console.error('[AuthProvider] updateStatus error:', error);
            if (error.message?.includes('bad_jwt')) handleSignOut();
            return { error };
        }
    };

    const value = useMemo(() => ({
        user,
        profile,
        loading,
        unreadNotifications,
        unreadMessages,
        signIn: async (email, password) => {
            setLoading(true);
            const res = await authService.signIn(email, password);
            if (res.error) setLoading(false);
            return res;
        },
        signInWithGoogle: async () => {
            setLoading(true);
            const res = await authService.signInWithGoogle();
            if (res.error) setLoading(false);
            return res;
        },
        signOut: handleSignOut,
        updateStatus,
        refreshProfile,
        refreshUnreadCounts,
        isAuthenticated: !!user,
    }), [user, profile, loading, unreadNotifications, unreadMessages, handleSignOut, updateStatus, refreshProfile, refreshUnreadCounts]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default useAuth;
