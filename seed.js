const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
    console.log('--- Creando Usuario de Prueba ---');

    // 1. Asegurar que la comunidad existe
    let { data: comunidad } = await supabase
        .from('comunidades')
        .select('*')
        .eq('codigo_verificacion', 'VECINO2026')
        .single();

    if (!comunidad) {
        console.log('Creando comunidad VECINO2026...');
        const { data: newCom, error: comError } = await supabase
            .from('comunidades')
            .insert({
                nombre: 'Condominio Las Flores',
                direccion: 'Av. Providencia 1234',
                ciudad: 'Santiago',
                codigo_verificacion: 'VECINO2026'
            })
            .select()
            .single();

        if (comError) {
            console.error('Error creando comunidad:', comError);
            return;
        }
        comunidad = newCom;
    }

    const email = 'jaraneda1596@gmail.com';
    const password = 'pastel123';

    console.log(`Registrando a: ${email}...`);

    // 2. Registrar en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        if (authError.message.includes('already registered')) {
            console.log('AVISO: El usuario ya existe en Auth.');
            // Intentar recuperar el ID del usuario existente si ya está registrado
            const { data: users } = await supabase.from('profiles').select('id').eq('email', email).single();
            if (users) {
                console.log('Perfil encontrado para el usuario existente.');
            }
        } else {
            console.error('Error registrando usuario:', authError.message);
            return;
        }
    } else {
        console.log('¡Usuario registrado con éxito en Auth!');

        // 3. Crear Perfil
        if (authData.user) {
            const { error: profError } = await supabase.from('profiles').insert({
                id: authData.user.id,
                email: email,
                nombre: 'Juan Araneda',
                comunidad_id: comunidad.id,
                verificado: true
            });

            if (profError) {
                console.error('Error creando perfil:', profError.message);
            } else {
                console.log('Perfil creado correctamente.');
            }
        }
    }

    console.log('\n-----------------------------------');
    console.log('LISTO PARA ENTRAR:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('-----------------------------------');
}

createTestUser();
