import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(undefined); // undefined = no cargado, null = no existe
    const [loading, setLoading] = useState(true);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const isInitializing = useRef(true);

    const handleSignOut = useCallback(async () => {
        try {
            // 1. Intentar poner offline (Fire and forget, no await crítico)
            if (user?.id) {
                supabase
                    .from('profiles')
                    .update({ status: 'offline', last_seen: new Date().toISOString() })
                    .eq('id', user.id)
                    .then(() => console.log('[AuthProvider] Offline status updated'))
                    .catch(err => console.warn('[AuthProvider] Offline status update failed:', err));
            }

            // 2. Cerrar sesión en Supabase (con timeout de seguridad)
            const signOutPromise = authService.signOut();
            const timeoutPromise = new Promise(resolve => setTimeout(resolve, 3000));
            await Promise.race([signOutPromise, timeoutPromise]);

        } catch (error) {
            console.error('[AuthProvider] SignOut error (forcing local cleanup):', error);
        } finally {
            // 3. Limpieza local INCONDICIONAL
            setUser(null);
            setProfile(null);
            setLoading(false);
            console.log('[AuthProvider] User signed out and local state cleared');
        }
    }, [user?.id]);

    const loadProfile = useCallback(async (userId) => {
        if (!userId) {
            setProfile(null);
            return null;
        }

        // Solo seteamos undefined si no hay perfil previo para evitar desmontar el AppStack en AppNavigator
        if (profile === undefined) setProfile(undefined);
        try {
            console.log('[AuthProvider] Loading profile for:', userId);
            const { data, error } = await supabase
                .from('profiles')
                .select('*, comunidades(nombre)')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                // Manejar error de cancelación de Supabase/Red de forma silenciosa
                const isAbortError = error.message?.includes('AbortError') || error.message?.includes('signal is aborted');
                if (isAbortError) {
                    console.log('[AuthProvider] Profile fetch aborted (expected during rapid navigation)');
                    // No cambiamos estado si abortado
                    return null;
                }

                const isAuthError = error.message?.includes('bad_jwt') || error.message?.includes('expired');
                if (isAuthError) {
                    console.log('[AuthProvider] Profile fetch failed due to invalid session, signing out...');
                    handleSignOut();
                } else {
                    console.error('[AuthProvider] profile fetch error:', error);
                    setProfile(null); // Error fetching detected
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
                    setProfile(null);
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
                                    role: 'vecino',
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

                // Si llegamos aquí, no se encontró perfil ni se pudo crear
                console.log('[AuthProvider] Final result: No profile available');
                setProfile(null);
                return null;
            }
        } catch (error) {
            console.error('[AuthProvider] loadProfile catch error:', error);
            setProfile(null);
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

            // 1. Obtener IDs de conversaciones donde el usuario es miembro
            const { data: userConvs, error: convError } = await supabase
                .from('conversation_members')
                .select('conversation_id')
                .eq('user_id', userId);

            if (convError) throw convError;

            // Si no tiene conversaciones, el conteo es 0
            if (!userConvs || userConvs.length === 0) {
                setUnreadMessages(0);
                return;
            }

            const conversationIds = userConvs.map(c => c.conversation_id);

            // 2. Contar mensajes no leídos SOLO de esas conversaciones
            const { count: msgCount, error: msgError } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .in('conversation_id', conversationIds)
                .neq('sender_id', userId)
                .eq('is_read', false);

            if (msgError) throw msgError;

            setUnreadMessages(msgCount || 0);

            // 3. Cargar Badges de Condominio (Encomiendas, Votaciones, Mantencion, Pagos)
            await loadCondoBadges(userId);

            // 4. Cargar Estatus de Pago Dinámico
            await loadPaymentStatus(userId);

        } catch (error) {
            console.error('[AuthProvider] loadUnreadCounts error:', error);
        }
    }, [loadCondoBadges]);

    // --- Condo Badges Logic ---
    const [condoBadges, setCondoBadges] = useState({ packages: 0, votings: 0, maintenance: 0, payments: 0, paymentStatus: 'loading', total: 0 });

    const loadCondoBadges = useCallback(async (userId) => {
        if (!userId) return;
        try {
            // Necesitamos el perfil para saber la comunidad
            const { data: userProfile, error: profileError } = await supabase
                .from('profiles')
                .select('comunidad_id')
                .eq('id', userId)
                .single();

            if (profileError || !userProfile?.comunidad_id) return;

            const comunidadId = userProfile.comunidad_id;

            // A. Encomiendas Pendientes (Service ya importado implícitamente o necesitamos importarlo)
            // Importación dinámica para evitar ciclos si fuera necesario, pero mejor usar los services importados arriba si están
            // Asumimos que authService no tiene esto. Importaremos residentialService y communityService arriba.

            // Para simplificar, hacemos las llamadas directas a los services nuevos
            // Nota: Debemos asegurar que residentialService y communityService estén importados.
            // Como no puedo ver los imports arriba en este replace, asumiré que debo agregarlos o usar require.
            // Usaré require inline para asegurar funcionalidad sin romper imports existentes

            const { residentialService } = require('../services/residentialService');
            const { communityService } = require('../services/communityService');

            const [pkgRes, votRes] = await Promise.all([
                residentialService.getPendingPackagesCount(userId),
                residentialService.getActiveVotingsUserCount(comunidadId, userId)
            ]);

            // B. Mantenimiento (Nuevos desde lastSeen)
            const lastSeenMaintenance = await AsyncStorage.getItem(`LAST_SEEN_MAINTENANCE_${userId}`);
            const maintRes = await communityService.getNewMaintenanceCount(comunidadId, lastSeenMaintenance);

            const newBadges = {
                packages: pkgRes.count || 0,
                votings: votRes.count || 0,
                maintenance: maintRes.count || 0,
            };

            setCondoBadges(prev => {
                const updated = {
                    ...prev,
                    ...newBadges
                };
                updated.total = updated.packages + updated.votings + updated.maintenance + (prev.payments || 0);
                return updated;
            });
        } catch (err) {
            console.error('[AuthProvider] loadCondoBadges error:', err);
        }
    }, []);

    const loadPaymentStatus = useCallback(async (userId) => {
        if (!userId) return;
        try {
            const { odooService } = require('../services/odooService');

            // 1. Obtener perfil para el email
            const { data: userProfile } = await supabase
                .from('profiles')
                .select('email')
                .eq('id', userId)
                .single();

            if (!userProfile?.email) return;

            // 2. Obtener facturas de Odoo
            let invoices = [];
            try {
                const res = await odooService.getInvoices(userProfile.email);
                if (Array.isArray(res)) invoices = res;
            } catch (err) {
                console.warn('[AuthProvider] Failed to fetch Odoo invoices (Service may be down)');
            }

            // 3. Calcular estatus y pendientes
            const pendingInvoices = invoices.filter(inv => inv.payment_state === 'not_paid');
            const overdueInvoices = pendingInvoices.filter(inv => {
                if (!inv.invoice_date_due) return false;
                return new Date(inv.invoice_date_due) < new Date();
            });

            // 4. Determinar estatus final
            let status = 'up_to_date';
            if (overdueInvoices.length > 0) status = 'overdue';
            else if (pendingInvoices.length > 0) status = 'pending';

            setCondoBadges(prev => {
                const updated = {
                    ...prev,
                    payments: pendingInvoices.length,
                    paymentStatus: status,
                };
                updated.total = updated.packages + updated.votings + updated.maintenance + updated.payments;
                return updated;
            });

            // 5. Verificar si hay facturas nuevas para notificación push local
            if (invoices.length > 0) {
                const latestInvoiceId = invoices[0].id;
                const lastSeenInvoice = await AsyncStorage.getItem(`LAST_INVOICE_ID_${userId}`);

                if (lastSeenInvoice && parseInt(lastSeenInvoice) < latestInvoiceId) {
                    // Disparar Notificación Push Local
                    notificationService.sendLocalNotification(
                        'Nueva Factura Generada',
                        `Se ha generado una nueva factura por un monto de ${invoices[0].amount_total}.`
                    );
                }

                await AsyncStorage.setItem(`LAST_INVOICE_ID_${userId}`, latestInvoiceId.toString());
            }

        } catch (err) {
            console.error('[AuthProvider] loadPaymentStatus error:', err);
        }
    }, []);

    const refreshCondoBadges = useCallback(() => {
        if (user?.id) {
            loadCondoBadges(user.id);
            loadPaymentStatus(user.id);
        }
    }, [user?.id, loadCondoBadges, loadPaymentStatus]);

    const initializeAuth = useCallback(async () => {
        try {
            console.log('[AuthProvider] Initializing session...');
            // Obtenemos la sesión con un try/catch local muy agresivo
            const { data: sessionData, error } = await supabase.auth.getSession();

            if (error) {
                const errorMsg = error.message || '';
                const isAuthError = errorMsg.includes('expired') ||
                    errorMsg.includes('bad_jwt') ||
                    errorMsg.includes('Refresh Token Not Found') ||
                    errorMsg.includes('invalid_grant');

                if (isAuthError) {
                    console.log('[AuthProvider] Auth token invalid/missing, clearing session...');
                    // Intentamos limpiar localmente si Supabase falla
                    await supabase.auth.signOut().catch(() => { });
                    setUser(null);
                    setProfile(null);
                } else {
                    console.error('[AuthProvider] Non-auth session error:', errorMsg);
                }
                setLoading(false);
                return;
            }

            const session = sessionData?.session;
            if (session?.user) {
                setUser(session.user);
                await loadProfile(session.user.id);
                await loadUnreadCounts(session.user.id);
                // Asegurar estado ONLINE al inicializar con sesión activa
                updateStatus('online');
            } else {
                setUser(null);
                setProfile(null);
            }
        } catch (error) {
            console.error('[AuthProvider] Critical initialization fail:', error);
            // Ante error crítico, aseguramos estado limpio
            setUser(null);
            setProfile(null);
        } finally {
            setLoading(false);
            isInitializing.current = false;
        }
    }, [loadProfile, loadUnreadCounts]);

    const refreshUnreadCounts = useCallback(() => {
        if (user?.id) loadUnreadCounts(user.id);
    }, [user?.id, loadUnreadCounts]);

    // 1. Efecto de Inicialización y Listeners Globales (Solo al montar)
    useEffect(() => {
        initializeAuth();

        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('[AuthProvider] Auth event:', event);

                if (event === 'SIGNED_IN') {
                    if (session?.user) {
                        setLoading(true);
                        setUser(session.user);
                        setProfile(undefined);
                        await loadProfile(session.user.id);
                        await loadUnreadCounts(session.user.id);
                        setLoading(false);
                    }
                } else if (event === 'TOKEN_REFRESHED') {
                    if (session?.user) {
                        setUser(session.user);
                        loadProfile(session.user.id);
                        loadUnreadCounts(session.user.id);
                    }
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setProfile(null);
                    setLoading(false);
                }

                if (event !== 'SIGNED_IN' && !isInitializing.current) {
                    setLoading(false);
                }
            }
        );

        const handleAppStateChange = async (nextAppState) => {
            if (nextAppState === 'active') {
                console.log('[AuthProvider] App returned to foreground, verifying session...');
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('[AuthProvider] Error refreshing session on active:', error);
                    if (error.message?.includes('invalid_grant') || error.message?.includes('Refresh Token Not Found')) {
                        handleSignOut();
                    }
                    return;
                }

                if (session?.user) {
                    console.log('[AuthProvider] Foreground refresh triggered for:', session.user.id);
                    await refreshProfile();
                    updateStatus('online');
                }
            }
        };

        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            authSubscription.unsubscribe();
            appStateSubscription.remove();
        };
    }, [initializeAuth, loadProfile, refreshProfile]);

    // 2. Efecto de Suscripciones en Tiempo Real (Depende de user?.id)
    useEffect(() => {
        if (!user?.id) return;

        console.log('[AuthProvider] Setting up real-time subscriptions for:', user.id);

        // A. Perfil (Rol, Status, etc.)
        const profileSub = supabase
            .channel(`public:profiles:id=eq.${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${user.id}`
                },
                (payload) => {
                    console.log('[AuthProvider] Profile updated in real-time:', payload.new);
                    setProfile(prev => ({ ...prev, ...payload.new }));
                }
            )
            .subscribe();

        // B. Notificaciones
        const notificationsSub = supabase
            .channel(`public:notifications:user_id=eq.${user.id}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
                () => loadUnreadCounts(user.id)
            )
            .subscribe();

        // C. Mensajes (Conteo global)
        // Nota: Es mejor filtrar por recipient_id si tu tabla de mensajes lo tiene, 
        // pero si usas conversation_members está bien refrescar globalmente.
        // Aquí mantenemos la lógica original de escuchar cambios en messages.
        const messagesSub = supabase
            .channel(`public:messages:global-listener`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'messages' },
                () => loadUnreadCounts(user.id)
            )
            .subscribe();

        return () => {
            console.log('[AuthProvider] Cleaning up subscriptions');
            supabase.removeChannel(profileSub);
            supabase.removeChannel(notificationsSub);
            supabase.removeChannel(messagesSub);
        };
    }, [user?.id, loadUnreadCounts]);

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
        condoBadges,
        refreshCondoBadges,
        isAuthenticated: !!user,
        isSuperAdmin: profile?.role === 'admin' && profile?.email === 'jaraneda1596@gmail.com',
    }), [user, profile, loading, unreadNotifications, unreadMessages, handleSignOut, updateStatus, refreshProfile, refreshUnreadCounts]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default useAuth;
