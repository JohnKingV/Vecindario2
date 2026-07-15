-- Insert test documents for the main community (assuming community_id from context or a known ID, here I'll try to find one or use a placeholder if I knew it, but since I don't have the ID handy, I will fetch it or use a subquery)

INSERT INTO public.documentos_comunales (comunidad_id, titulo, url, categoria)
SELECT 
    id as comunidad_id,
    'Manual de Convivencia 2024' as titulo,
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' as url,
    'reglamento' as categoria
FROM public.comunidades
LIMIT 1;

INSERT INTO public.documentos_comunales (comunidad_id, titulo, url, categoria)
SELECT 
    id as comunidad_id,
    'Acta Asamblea Marzo' as titulo,
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' as url,
    'acta' as categoria
FROM public.comunidades
LIMIT 1;

INSERT INTO public.documentos_comunales (comunidad_id, titulo, url, categoria)
SELECT 
    id as comunidad_id,
    'Plano General' as titulo,
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1000' as url,
    'plano' as categoria
FROM public.comunidades
LIMIT 1;
