import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase Config] CRITICAL ERROR: Environment variables are missing! Check your .env file and ensure they start with EXPO_PUBLIC_');
}

console.log('[Supabase Config] URL:', supabaseUrl ? 'Defined' : 'UNDEFINED');
console.log('[Supabase Config] Key:', supabaseAnonKey ? 'Defined' : 'UNDEFINED');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
