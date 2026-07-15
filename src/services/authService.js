import { Platform } from 'react-native';
import { supabase } from '../config/supabase';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

// Importación segura de Google Sign-In para evitar crashes en Expo Go
let GoogleSignin;
try {
    const GoogleSigninModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = GoogleSigninModule.GoogleSignin;
} catch (e) {
    console.warn('[authService] Google Sign-In native module not found. Using mock.');
    GoogleSignin = {
        configure: () => { },
        hasPlayServices: () => Promise.reject(new Error('Google Sign-In no está disponible en este entorno (requiere Development Build).')),
        signIn: () => Promise.reject(new Error('Google Sign-In no está disponible en este entorno.')),
        signOut: () => Promise.resolve(),
    };
}

// Configuración global de Google Sign-In para plataformas nativas
if (Platform.OS !== 'web') {
    GoogleSignin.configure({
        webClientId: '326645024756-te4slj6ppdh17dk3coskditcjnr4fp38.apps.googleusercontent.com',
        offlineAccess: true,
        scopes: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ],
    });
}

export const authService = {
    // Sign in with Google (Versión optimizada para Web y Android/iOS)
    async signInWithGoogle() {
        try {
            // --- Para la plataforma Web ---
            if (Platform.OS === 'web') {
                const redirectTo = Linking.createURL('auth-callback');
                const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo,
                        skipBrowserRedirect: false,
                        queryParams: {
                            hl: 'es', // Fuerza el idioma español
                        }
                    },
                });
                if (error) throw error;
                return { data, error: null };
            }

            // --- Para plataformas Nativas (Android / iOS) ---

            // 1. Verificar servicios de Play
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Cerrar sesión previa para forzar el selector de cuentas
            try {
                await GoogleSignin.signOut();
            } catch (e) {
                // Silencioso
            }

            // 2. Iniciar sesión nativa
            const response = await GoogleSignin.signIn();

            // Manejo de la respuesta (v12+ retorna { type: 'success', data: { ... } } o { type: 'cancelled' })
            if (response.type === 'cancelled') {
                return { data: null, error: { message: 'Inicio de sesión cancelado.' } };
            }

            const idToken = response.idToken || (response.data && response.data.idToken);

            if (!idToken) {
                console.error('[authService] Google Sign-In response missing token. Full response:', JSON.stringify(response));
                throw new Error('No se recibió el token de identidad de Google. Verifica la configuración de Firebase.');
            }

            // 3. Autenticación con Supabase usando el idToken obtenido
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: idToken,
            });

            if (error) {
                console.error('[authService] Supabase signInWithIdToken error:', error);
                throw error;
            }

            return { data, error: null };

        } catch (error) {
            console.error('[authService] signInWithGoogle falló:', error);

            // Manejo de códigos de error específicos de Google
            if (error.code === 'SIGN_IN_CANCELLED' || error.message?.includes('cancelled')) {
                return { data: null, error: { message: 'Inicio de sesión cancelado.' } };
            }

            if (error.code === 'DEVELOPER_ERROR') {
                return {
                    data: null,
                    error: { message: 'Error de configuración (Developer Error). Verifica el SHA-1 y el Client ID en Google Console.' }
                };
            }

            return { data: null, error };
        }
    },

    // Sign up con email y password (tu código original)
    async signUp(email, password, userData) {
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        nombre: userData.nombre,
                        depto: userData.depto,
                        torre: userData.torre,
                        comunidad_id: userData.comunidad_id,
                        is_manual_signup: true // Flag para saber que viene de registro manual
                    }
                }
            });

            if (authError) throw authError;

            // Si Supabase requiere confirmación de email, data.session será null
            if (!authData.session) {
                return {
                    data: authData,
                    error: null,
                    verificationPending: true
                };
            }

            // Si NO requiere confirmación (o si está logueado ya), creamos el perfil
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: authData.user.id,
                        email: email,
                        nombre: userData.nombre,
                        telefono: userData.telefono,
                        depto: userData.depto,
                        torre: userData.torre,
                        comunidad_id: userData.comunidad_id,
                        role: 'vecino',
                        verificado: false
                    }
                ]);

            if (profileError) throw profileError;

            return { data: authData, error: null, verificationPending: false };
        } catch (error) {
            return { data: null, error };
        }
    },

    // Login (tu código original)
    async signIn(email, password) {
        try {
            console.log('[authService] signIn called for:', email);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            console.log('[authService] supabase response status:', { hasError: !!error, hasSession: !!(data && data.session) });

            if (error) throw error;

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    // Logout (tu código original)
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error };
        }
    },

    // Obtener sesión actual (tu código original)
    async getSession() {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    // Obtener perfil del usuario actual (tu código original)
    async getCurrentUserProfile() {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return { data: null, error: 'No user logged in' };

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (error) throw error;

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Obtiene el perfil público de otro usuario con estadísticas.
     */
    async getUserPublicProfile(userId) {
        try {
            // 1. Obtener datos básicos del perfil
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileError) throw profileError;

            // 2. Contar SOLO posts de tipo 'aviso' (Novedades)
            const { count: novedadesCount } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('tipo', 'aviso');

            // 3. Contar item que REALMENTE se han vendido
            const { count: ventasRealizadas } = await supabase
                .from('items')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('vendido', true);

            // 4. Calcular Reputación Dinámica
            // 0.1 por cada venta de verdad + 0.1 por cada 5 avisos de novedades
            const baseRepVentas = (ventasRealizadas || 0) * 0.1;
            const baseRepAvisos = Math.floor((novedadesCount || 0) / 5) * 0.1;
            const dynamicRep = Math.min(5.0, baseRepVentas + baseRepAvisos);

            // Usar el valor de la DB si es mayor (para cambios manuales del admin)
            const totalRep = Math.max(dynamicRep, profile.raiting_ventas || 0);

            return {
                data: {
                    ...profile,
                    stats: {
                        novedades: novedadesCount || 0,
                        ventas: ventasRealizadas || 0,
                        rating: totalRep
                    }
                },
                error: null
            };
        } catch (error) {
            console.error('[authService] getUserPublicProfile error:', error);
            return { data: null, error };
        }
    },

    // Verificar código de comunidad (tu código original)
    async verificarCodigoComunidad(codigo) {
        try {
            const { data, error } = await supabase
                .from('comunidades')
                .select('*')
                .eq('codigo_verificacion', codigo.toUpperCase())
                .maybeSingle();

            if (error) throw error;

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    // Actualizar perfil (tu código original)
    async updateProfile(userId, updates) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (error) throw error;

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    // Subir avatar (Optimizado para evitar caché y asegurar actualización)
    async uploadAvatar(userId, uri) {
        try {
            let publicUrl = null;

            if (uri) {
                // Nombre de archivo único para evitar problemas con caché de Storage y CDN
                const timestamp = Date.now();
                const fileName = `${userId}/avatar_${timestamp}.jpg`;

                const base64 = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64
                });
                const arrayBuffer = decode(base64);

                console.log('[authService] Subiendo avatar:', { size: arrayBuffer.byteLength, fileName });

                // 1. Subir a Storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, arrayBuffer, {
                        contentType: 'image/jpeg',
                        cacheControl: '3600',
                        upsert: true
                    });

                if (uploadError) {
                    console.error('[authService] Error al subir a Storage:', uploadError);
                    throw uploadError;
                }

                // 2. Obtener URL pública (asíncrono no necesario pero usamos desestructuración consistente)
                const { data: urlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);
                publicUrl = urlData.publicUrl;

                console.log('[authService] URL generada:', publicUrl);
            } else {
                console.log('[authService] Eliminando avatar (uri es null)');
            }

            // 3. Actualizar la tabla de perfiles (Si uri es null, publicUrl será null)
            const { data: profileUpdated, error: profileError } = await supabase
                .from('profiles')
                .update({
                    foto_url: publicUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (profileError) {
                console.error('[authService] Error al actualizar perfil en DB:', profileError);
                throw profileError;
            }

            console.log('[authService] Perfil actualizado exitosamente en DB');
            return { data: profileUpdated, error: null };
        } catch (error) {
            console.error('[authService] uploadAvatar catch error:', error);
            return { data: null, error };
        }
    },

    // --- El resto de tus funciones no se modifican ---

    async getComunidades() {
        return await supabase.from('comunidades').select('id, nombre');
    },

    async createCommunity(communityData) {
        try {
            const { data, error } = await supabase
                .from('comunidades')
                .insert([communityData])
                .select()
                .single();
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async getCommunityNeighbors(comunidadId, currentUserId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, nombre, foto_url, depto, raiting_ventas')
                .eq('comunidad_id', comunidadId)
                .neq('id', currentUserId)
                .order('nombre', { ascending: true });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async syncCommunityContent(comunidadId) {
        try {
            const { error: postsError } = await supabase
                .from('posts')
                .update({ comunidad_id: comunidadId })
                .is('comunidad_id', null);
            const { error: itemsError } = await supabase
                .from('items')
                .update({ comunidad_id: comunidadId })
                .is('comunidad_id', null);
            if (postsError || itemsError) throw postsError || itemsError;
            return { error: null };
        } catch (error) {
            console.error('[authService] syncCommunityContent error:', error);
            return { error };
        }
    },

    async getAllCommunitiesWithStats() {
        try {
            const { data: comunidades, error: comError } = await supabase
                .from('comunidades')
                .select('*')
                .order('nombre', { ascending: true });
            if (comError) throw comError;
            const communitiesWithStats = await Promise.all(comunidades.map(async (com) => {
                const { count } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('comunidad_id', com.id);
                return { ...com, userCount: count || 0 };
            }));
            return { data: communitiesWithStats, error: null };
        } catch (error) {
            console.error('[authService] getAllCommunitiesWithStats error:', error);
            return { data: null, error };
        }
    },

    async getUnassignedUsers() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .is('comunidad_id', null)
                .order('nombre', { ascending: true });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[authService] getUnassignedUsers error:', error);
            return { data: null, error };
        }
    },

    async getAllProfiles() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('nombre', { ascending: true });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[authService] getAllProfiles error:', error);
            return { data: null, error };
        }
    },

    async getCommunityUsers(comunidadId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('comunidad_id', comunidadId)
                .order('nombre', { ascending: true });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[authService] getCommunityUsers error:', error);
            return { data: null, error };
        }
    },

    async changeUserCommunity(userId, newCommunityId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ comunidad_id: newCommunityId })
                .eq('id', userId)
                .select()
                .single();
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[authService] changeUserCommunity error:', error);
            return { data: null, error };
        }
    },

    async updateCommunityCode(communityId, newCode) {
        try {
            const { data, error } = await supabase
                .from('comunidades')
                .update({ codigo_verificacion: newCode.toUpperCase() })
                .eq('id', communityId)
                .select()
                .single();
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[authService] updateCommunityCode error:', error);
            return { data: null, error };
        }
    },

    async updateUserRole(userId, newRole) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId)
                .select()
                .single();
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('[authService] updateUserRole error:', error);
            return { data: null, error };
        }
    },

    async deleteUser(userId) {
        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('[authService] deleteUser error:', error);
            return { error };
        }
    }
};
