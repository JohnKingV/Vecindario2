import { useState, useMemo } from 'react';
import { useTheme } from '../../../context/ThemeContext';

export const useAnnouncementsScreen = () => {
    const { theme, isDark } = useTheme();
    const [activeTab, setActiveTab] = useState('Todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState(['Todas']);

    const announcements = useMemo(() => [
        {
            id: '1',
            category: 'Seguridad',
            date: 'Hace 2 horas',
            title: 'Actualización del Sistema de Vigilancia',
            content: 'Se informa a la comunidad que a partir del próximo lunes se iniciará el reemplazo de las cámaras del sector norte por modelos 4K con visión nocturna mejorada.',
            image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=800',
            author: 'Admin Central',
            authorAvatar: 'https://i.pravatar.cc/150?u=admin',
            color: '#3b82f6',
            bgColor: '#3b82f6',
        },
        {
            id: '2',
            category: 'Eventos',
            date: 'Hace 5 horas',
            title: 'Feria de Emprendimiento Local',
            content: 'Este sábado tendremos nuestra feria mensual en la plaza central. Ven a apoyar a los vecinos que ofrecen sus productos y servicios. ¡Habrá música en vivo!',
            image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800',
            author: 'Comité Social',
            authorAvatar: 'https://i.pravatar.cc/150?u=social',
            color: '#9333ea',
            bgColor: '#9333ea',
        },
        {
            id: '3',
            category: 'Mantenimiento',
            date: 'Ayer',
            title: 'Corte de Agua Programado',
            content: 'La empresa sanitaria realizará mantenciones en la matriz principal. El suministro se verá interrumpido el miércoles entre las 10:00 y las 14:00 horas.',
            image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
            author: 'G. Inmobiliaria',
            authorAvatar: 'https://i.pravatar.cc/150?u=maint',
            color: '#f97316',
            bgColor: '#f97316',
        },
        {
            id: '4',
            category: 'Mejoras',
            date: 'Hace 1 día',
            title: 'Nueva Zona de Reciclaje',
            content: 'Ya está habilitado el nuevo punto limpio en la entrada del condominio. Recuerda separar tus residuos: plástico, cartón y vidrio.',
            image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800',
            author: 'Ecología Vecinal',
            authorAvatar: 'https://i.pravatar.cc/150?u=eco',
            color: '#16a34a',
            bgColor: '#16a34a',
        },
        {
            id: '5',
            category: 'Urgente',
            date: 'Hace 3 horas',
            title: 'Extravío de Mascota: "Rex"',
            content: 'Cualquier información sobre un Golden Retriever visto en el área de juegos será muy agradecida. Tiene collar azul y placa con teléfono.',
            image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800',
            author: 'Marta Torres',
            authorAvatar: 'https://i.pravatar.cc/150?u=marta',
            color: '#ef4444',
            bgColor: '#ef4444',
        },
        {
            id: '6',
            category: 'Asamblea',
            date: 'Hace 2 días',
            title: 'Convocatoria Asamblea Ordinaria',
            content: 'Se cita a todos los propietarios a la reunión trimestral para discutir el presupuesto anual y elección de directiva. La asistencia es obligatoria.',
            image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=800',
            author: 'Secretaría',
            authorAvatar: 'https://i.pravatar.cc/150?u=sec',
            color: '#4f46e5',
            bgColor: '#4f46e5',
        }
    ], []);

    const filteredAnnouncements = useMemo(() => {
        return announcements.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.content.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesTab = activeTab === 'Todos' || item.category === activeTab;

            const matchesSidebar = selectedCategories.includes('Todas') || selectedCategories.includes(item.category);

            return matchesSearch && matchesTab && matchesSidebar;
        });
    }, [searchQuery, activeTab, selectedCategories, announcements]);

    const tabs = ['Todos', 'Seguridad', 'Eventos', 'Mejoras', 'Asamblea', 'Administración'];
    const sidebarCategories = ['Todas', 'Seguridad', 'Eventos', 'Mantenimiento'];

    const toggleSidebarCategory = (cat) => {
        if (cat === 'Todas') {
            setSelectedCategories(['Todas']);
            return;
        }

        const newCats = selectedCategories.filter(c => c !== 'Todas');
        if (newCats.includes(cat)) {
            const result = newCats.filter(c => c !== cat);
            setSelectedCategories(result.length === 0 ? ['Todas'] : result);
        } else {
            setSelectedCategories([...newCats, cat]);
        }
    };

    return {
        theme,
        isDark,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedCategories,
        toggleSidebarCategory,
        announcements: filteredAnnouncements,
        tabs,
        sidebarCategories
    };
};
