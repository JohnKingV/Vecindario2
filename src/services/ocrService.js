import { supabase } from '../config/supabase';
import * as FileSystem from 'expo-file-system';

export const ocrService = {
    /**
     * Procesa la imagen del medidor para extraer la lectura numérica.
     * En una fase real, esto llamaría a una Edge Function que use Google Vision o OpenAI.
     */
    async processMeterImage(uri) {
        try {
            console.log('[ocrService] Iniciando procesamiento de imagen:', uri);

            // 1. Simular delay de procesamiento de IA
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 2. Lógica de simulación de lectura
            // Generamos un número aleatorio entre 100 y 9999 para la demo
            const simulatedReading = Math.floor(Math.random() * (5000 - 100) + 100);
            const confidence = 0.95;

            return {
                data: {
                    reading: simulatedReading,
                    confidence: confidence,
                    detected_text: `Lectura detected: ${simulatedReading}`
                },
                error: null
            };
        } catch (error) {
            console.error('[ocrService] Error processing image:', error);
            return { data: null, error };
        }
    },

    async registerReading(userId, comunidadId, type, reading, fotoUrl) {
        try {
            const { data, error } = await supabase
                .from('medidores')
                .insert([{
                    user_id: userId,
                    comunidad_id: comunidadId,
                    tipo: type,
                    lectura: reading,
                    foto_url: fotoUrl,
                    fecha_lectura: new Date().toISOString().split('T')[0]
                }])
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }
};
