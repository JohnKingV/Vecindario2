-- AGREGAR REFERENCIA DE PRODUCTO A LOS MENSAJES
-- Permite saber de qué producto se está hablando en un chat

ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS item_id UUID REFERENCES public.items(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.messages.item_id IS 'Referencia al producto del marketplace sobre el cual se inició la conversación';

-- Índice para mejorar el rendimiento de búsqueda por productos
CREATE INDEX IF NOT EXISTS messages_item_id_idx ON public.messages(item_id);
