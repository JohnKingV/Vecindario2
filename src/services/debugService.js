import { supabase } from '../config/supabase';

const MOCK_AVATARS = [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
];

const MOCK_POST_IMAGES = [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1516733965668-db8871ccdca0?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'
];

export const debugService = {
    /**
     * Puebla la comunidad actual con datos de prueba realistas.
     */
    async seedCommunityData(comunidadId, currentUserId) {
        console.log('[DebugService] Starting seed for community:', comunidadId);

        try {
            // 1. Crear Vecinos de Prueba (Perfiles)
            // Nota: En Supabase real, los perfiles dependen de Auth.users. 
            // Para propósitos de este "seed" de UI, intentaremos insertar perfiles 
            // con IDs aleatorios si la RLS lo permite, o simplemente usaremos los existentes.
            // Si la RLS falla, al menos intentaremos insertar Posts e Items vinculados al usuario actual.

            const neighbors = [
                { id: 'neighbor-1', nombre: 'Carlos Ruiz', depto: '101A', email: 'carlos@example.com', foto_url: MOCK_AVATARS[0], comunidad_id: comunidadId },
                { id: 'neighbor-2', nombre: 'Lucía Fernández', depto: '302B', email: 'lucia@example.com', foto_url: MOCK_AVATARS[1], comunidad_id: comunidadId },
                { id: 'neighbor-3', nombre: 'Roberto Gómez', depto: 'Vigilancia', email: 'roberto@example.com', foto_url: MOCK_AVATARS[4], comunidad_id: comunidadId }
            ];

            // Intentar insertar perfiles (puede fallar si hay RLS estricta, pero procedemos)
            await supabase.from('profiles').upsert(neighbors);

            // 2. Insertar Posts en el Feed
            const posts = [
                { user_id: currentUserId, comunidad_id: comunidadId, tipo: 'aviso', titulo: '¡Bienvenidos!', contenido: 'Estamos muy felices de lanzar nuestra nueva app comunitaria.' },
                { user_id: 'neighbor-2', comunidad_id: comunidadId, tipo: 'evento', titulo: 'Asamblea Anual', contenido: 'Recuerden que mañana a las 19:00 tenemos la reunión de copropietarios en el salón social.' },
                { user_id: 'neighbor-3', comunidad_id: comunidadId, tipo: 'alerta', titulo: 'Mantenimiento de Ascensores', contenido: 'El ascensor de la torre A estará fuera de servicio de 10:00 a 14:00 por mantenimiento.' }
            ];
            await supabase.from('posts').insert(posts);

            // 3. Insertar Items en Marketplace
            const items = [
                { user_id: 'neighbor-1', comunidad_id: comunidadId, titulo: 'Bicicleta de Montaña', precio: 150000, categoria: 'Deporte', estado: 'usado', contenido: 'Excelente estado, talla M.', imagen_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800' },
                { user_id: 'neighbor-2', comunidad_id: comunidadId, titulo: 'Cafetera Nespresso', precio: 45000, categoria: 'Hogar', estado: 'nuevo', contenido: 'Sin uso, en caja original.', imagen_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800' }
            ];
            await supabase.from('items').insert(items);

            // 4. Insertar Amenidades
            const amenities = [
                { comunidad_id: comunidadId, nombre: 'Piscina Olímpica', ubicacion: 'Nivel 1', imagen_url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=800' },
                { comunidad_id: comunidadId, nombre: 'Gimnasio Premium', ubicacion: 'Nivel 2', imagen_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800' },
                { comunidad_id: comunidadId, nombre: 'Quincho / BBQ', ubicacion: 'Terraza', imagen_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800' }
            ];
            await supabase.from('amenities').upsert(amenities, { onConflict: 'nombre,comunidad_id' });

            // 5. Insertar Historial de Pagos para el usuario actual
            const payments = [
                { user_id: currentUserId, mes_periodo: 'Enero 2024', monto: 85000, estado: 'pendiente' },
                { user_id: currentUserId, mes_periodo: 'Diciembre 2023', monto: 85000, estado: 'pagado' },
                { user_id: currentUserId, mes_periodo: 'Noviembre 2023', monto: 82000, estado: 'pagado' }
            ];
            await supabase.from('pagos_expensas').insert(payments);

            console.log('[DebugService] Seed completed successfully');
            return { success: true };
        } catch (error) {
            console.error('[DebugService] Seed failed:', error);
            return { success: false, error };
        }
    }
};
