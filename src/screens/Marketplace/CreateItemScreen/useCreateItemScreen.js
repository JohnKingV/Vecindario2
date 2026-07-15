import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { useItems } from '../../../hooks/useItems';

export const useCreateItemScreen = (route, navigation) => {
    const editItem = route.params?.item;
    const insets = useSafeAreaInsets();
    const { profile } = useAuth();
    const { theme, isDark } = useTheme();
    const { createItem, updateItem } = useItems(profile?.comunidad_id);

    const [titulo, setTitulo] = useState(editItem?.titulo || '');
    const [descripcion, setDescripcion] = useState(editItem?.descripcion || '');
    const [precio, setPrecio] = useState(editItem?.precio?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") || '');
    const [estado, setEstado] = useState(editItem?.estado?.toUpperCase() || 'NUEVO');
    const [categoria, setCategoria] = useState(editItem?.categoria || 'Hogar');
    const [ubicacion, setUbicacion] = useState(editItem?.ubicacion || '');
    const [coordenadas, setCoordenadas] = useState(editItem?.latitude ? { latitude: editItem.latitude, longitude: editItem.longitude } : null);
    const [imagenes, setImagenes] = useState(editItem?.imagenes_url || (editItem?.imagen_url ? [editItem.imagen_url] : []));
    const [loading, setLoading] = useState(false);
    const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

    useEffect(() => {
        requestPermissions();
    }, []);

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permiso necesario',
                'Necesitamos acceso a tu galería para subir fotos del artículo'
            );
        }
    };

    const pickImage = async (index = -1) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                const newUri = result.assets[0].uri;
                if (index >= 0) {
                    const newImgs = [...imagenes];
                    newImgs[index] = newUri;
                    setImagenes(newImgs);
                } else if (imagenes.length < 3) {
                    setImagenes([...imagenes, newUri]);
                }
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'No pudimos seleccionar la imagen');
        }
    };

    const removeImage = (index) => {
        const newImgs = [...imagenes];
        newImgs.splice(index, 1);
        setImagenes(newImgs);
    };

    const handlePrecioChange = (value) => {
        const numbersOnly = value.replace(/[^0-9]/g, '');
        const limitedValue = numbersOnly.slice(0, 9);
        const formattedValue = limitedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        setPrecio(formattedValue);
    };

    const handleSearchLocation = async () => {
        if (!ubicacion.trim()) return;

        setIsVerifyingLocation(true);
        try {
            if (Platform.OS === 'web') {
                // Priority 1: Google Maps
                if (window.google && window.google.maps && window.google.maps.Geocoder) {
                    const geocoder = new window.google.maps.Geocoder();
                    const results = await new Promise((resolve, reject) => {
                        geocoder.geocode({ address: ubicacion }, (res, status) => {
                            if (status === 'OK') resolve(res);
                            else reject(status);
                        });
                    });

                    if (results && results.length > 0) {
                        const res = results[0];
                        const formatted = res.formatted_address;
                        const lat = res.geometry.location.lat();
                        const lng = res.geometry.location.lng();

                        setUbicacion(formatted);
                        setCoordenadas({ latitude: lat, longitude: lng });
                        Alert.alert('Ubicación Encontrada', `Se guardará como: ${formatted}`);
                        setIsVerifyingLocation(false);
                        return;
                    }
                }

                // Priority 2: Photon (OpenStreetMap)
                const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(ubicacion)}&limit=1`);
                const data = await response.json();

                if (data.features && data.features.length > 0) {
                    const feature = data.features[0];
                    const props = feature.properties;
                    const [lng, lat] = feature.geometry.coordinates;

                    const street = props.street ? `${props.street}${props.housenumber ? ' ' + props.housenumber : ''}` : '';
                    const name = props.name !== props.street ? props.name : '';
                    const city = props.city || props.town || props.state || '';
                    const country = props.country || '';

                    const formatted = [street, name, city, country]
                        .filter(item => item && item.length > 0)
                        .join(', ');

                    setUbicacion(formatted);
                    setCoordenadas({ latitude: lat, longitude: lng });
                    Alert.alert('Ubicación Encontrada', `Se guardará como: ${formatted}`);
                } else {
                    Alert.alert('No encontrada', 'No pudimos localizar esa dirección exacta. Intenta con Calle y Número.');
                }
            } else {
                // Native
                const results = await Location.geocodeAsync(ubicacion);

                if (results && results.length > 0) {
                    const res = results[0];
                    setCoordenadas({ latitude: res.latitude, longitude: res.longitude });

                    const reverseResults = await Location.reverseGeocodeAsync({
                        latitude: res.latitude,
                        longitude: res.longitude
                    });

                    if (reverseResults && reverseResults.length > 0) {
                        const first = reverseResults[0];
                        const formatted = `${first.street || ''} ${first.name || ''}, ${first.city || first.region || ''}`.trim();
                        setUbicacion(formatted);
                        Alert.alert('Ubicación Encontrada', `Se guardará como: ${formatted}`);
                    }
                } else {
                    Alert.alert('No encontrada', 'No pudimos localizar esa dirección automática, pero se guardará el texto que escribiste.');
                }
            }
        } catch (error) {
            console.warn('Geocoding notice:', error);
            Alert.alert('Aviso', 'No pudimos validar la dirección automáticamente, pero se guardará el texto que escribiste.');
        } finally {
            setIsVerifyingLocation(false);
        }
    };

    const handlePublish = async () => {
        if (!profile?.comunidad_id) {
            Alert.alert('Error', 'No se encontró información de tu comunidad');
            return;
        }

        if (!titulo.trim() || !precio || imagenes.length === 0) {
            Alert.alert('Incompleto', 'Por favor añade un título, precio y al menos una imagen');
            return;
        }

        setLoading(true);
        const itemData = {
            user_id: profile.id,
            comunidad_id: profile.comunidad_id,
            titulo: titulo.trim(),
            descripcion: descripcion.trim() || null,
            precio: parseInt(precio.replace(/\./g, '')) || 0,
            estado: estado.toLowerCase(),
            categoria: categoria,
            ubicacion: ubicacion.trim() || null,
            latitude: coordenadas?.latitude || null,
            longitude: coordenadas?.longitude || null,
            vendido: editItem?.vendido || false,
            imagen_url: editItem?.imagen_url || null
        };

        let res;
        if (editItem) {
            res = await updateItem(editItem.id, itemData, imagenes);
        } else {
            res = await createItem(itemData, imagenes);
        }

        const { error } = res;
        setLoading(false);

        if (!error) {
            navigation.goBack();
        } else {
            console.error('[CreateItem] Error detallo:', error);
            let errorMessage = 'No pudimos publicar tu artículo.';

            if (error.code === '42703' || error.message?.includes('Faltan columnas')) {
                errorMessage = 'Error de esquema. Por favor ejecuta el script repair_schema.sql en Supabase.';
            } else if (error.code === '23505') {
                errorMessage = 'Ya existe un artículo similar.';
            }

            setToast({
                visible: true,
                message: errorMessage,
                type: 'error'
            });
        }
    };

    const categories = ['Hogar', 'Electrónica', 'Mascotas', 'Deporte', 'Servicios', 'Otros'];

    return {
        // State
        titulo, setTitulo,
        descripcion, setDescripcion,
        precio, handlePrecioChange,
        estado, setEstado,
        categoria, setCategoria,
        ubicacion, setUbicacion,
        imagenes,
        loading,
        isVerifyingLocation,
        toast, setToast,
        editItem,

        // Utils
        theme, insets, isDark,
        categories,

        // Handlers
        pickImage,
        removeImage,
        handleSearchLocation,
        handlePublish,
    };
};
