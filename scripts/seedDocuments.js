const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mfzikonhpcipifvmjfuu.supabase.co';
const supabaseKey = 'sb_publishable_huihV65FhYqxmhWdywvSAw_NGRRK0rn'; // Public Anon Key from .env

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Starting seed...');

    // 1. Get ALL communities
    const { data: communities, error: commError } = await supabase
        .from('comunidades')
        .select('id');

    if (commError || !communities || communities.length === 0) {
        console.error('Error fetching communities or no community found:', commError);
        return;
    }

    console.log(`Found ${communities.length} communities.`);

    for (const comm of communities) {
        const communityId = comm.id;
        console.log('Seeding community ID:', communityId);

        // 2. Insert documents for this community
        const documents = [
            {
                comunidad_id: communityId,
                titulo: 'Manual de Convivencia 2024',
                url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                categoria: 'reglamento'
            },
            {
                comunidad_id: communityId,
                titulo: 'Acta Asamblea Marzo',
                url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                categoria: 'acta'
            },
            {
                comunidad_id: communityId,
                titulo: 'Plano General Hidráulico',
                url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1000',
                categoria: 'plano'
            },
            {
                comunidad_id: communityId,
                titulo: 'Balance Financiero Q1',
                url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                categoria: 'finanzas'
            }
        ];

        const { error } = await supabase
            .from('documentos_comunales')
            .insert(documents);

        if (error) {
            console.error(`Error inserting for ${communityId}:`, error);
        } else {
            console.log(`Inserted 4 documents for ${communityId}`);
        }
    }
}

seed();
