import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../../hooks/useAuth';
import { useItems } from '../../hooks/useItems';
import { Button, Input, Toast, Select } from '../../components';
import { useTheme } from '../../context/ThemeContext';

export default function CreateItemScreen({ navigation, route }) {
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
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            const newUri = result.assets[0].uri;
            if (index >= 0) {
                // Reemplazar existente
                const newImgs = [...imagenes];
                newImgs[index] = newUri;
                setImagenes(newImgs);
            } else if (imagenes.length < 3) {
                // Añadir nueva
                setImagenes([...imagenes, newUri]);
            }
        }
    };

    const removeImage = (index) => {
        const newImgs = [...imagenes];
        newImgs.splice(index, 1);
        setImagenes(newImgs);
    };

    const handlePrecioChange = (value) => {
        // Eliminar todo lo que no sea número
        const numbersOnly = value.replace(/[^0-9]/g, '');

        // Limitar a 9 dígitos (999.999.999)
        const limitedValue = numbersOnly.slice(0, 9);

        // Aplicar formato de puntos
        const formattedValue = limitedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        setPrecio(formattedValue);
    };

    const handleSearchLocation = async () => {
        if (!ubicacion.trim()) return;

        setIsVerifyingLocation(true);
        try {
            if (Platform.OS === 'web') {
                // Prioridad 1: Si Google Maps ya está cargado
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

                // Prioridad 2: Fallback robusto para Web usando Photon (basado en OpenStreetMap)
                const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(ubicacion)}&limit=1`);
                const data = await response.json();

                if (data.features && data.features.length > 0) {
                    const feature = data.features[0];
                    const props = feature.properties;
                    const [lng, lat] = feature.geometry.coordinates;

                    // Construir una dirección legible y precisa
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
                // Comportamiento para nativo (iOS/Android) usando expo-location
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

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />

                <View style={[styles.appBar, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                        <MaterialCommunityIcons name="close" size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    <Text style={[styles.appBarTitle, { color: theme.colors.text }]}>{editItem ? 'Editar Artículo' : 'Publicar para Venta'}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Image Section */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>FOTOS DEL PRODUCTO (MÁX. 3)</Text>
                            <View style={styles.imageGrid}>
                                {imagenes.map((img, index) => (
                                    <View key={index} style={styles.imageSlot}>
                                        <Image source={{ uri: img }} style={styles.imageThumb} />
                                        <TouchableOpacity
                                            style={styles.removeBadge}
                                            onPress={() => removeImage(index)}
                                        >
                                            <MaterialCommunityIcons name="close" size={16} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.changeBtn}
                                            onPress={() => pickImage(index)}
                                        >
                                            <Text style={styles.changeText}>CAMBIAR</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}

                                {imagenes.length < 3 && (
                                    <TouchableOpacity
                                        style={[styles.addSlot, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}
                                        onPress={() => pickImage()}
                                        activeOpacity={0.7}
                                    >
                                        <MaterialCommunityIcons name="camera-plus" size={24} color={theme.colors.primary} />
                                        <Text style={[styles.addSlotText, { color: theme.colors.primary }]}>AÑADIR</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Form Section */}
                        <View style={styles.form}>
                            <View style={styles.field}>
                                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>¿QUÉ VENDES?</Text>
                                <Input
                                    placeholder="Nombre del artículo"
                                    value={titulo}
                                    onChangeText={setTitulo}
                                    containerStyle={styles.fieldInputContainer}
                                    style={[styles.fieldInput, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text, borderColor: theme.colors.border, borderWidth: 1 }]}
                                    placeholderTextColor={theme.colors.placeholder}
                                    inputStyle={{ color: theme.colors.text }}
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.field, { flex: 1.2 }]}>
                                    <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>PRECIO (CLP)</Text>
                                    <View style={styles.priceInputWrapper}>
                                        <Text style={[styles.priceSymbol, { color: theme.colors.textSecondary }]}>$</Text>
                                        <Input
                                            placeholder="0"
                                            value={precio}
                                            onChangeText={handlePrecioChange}
                                            keyboardType="numeric"
                                            containerStyle={styles.fieldInputContainer}
                                            style={[styles.fieldInput, { paddingLeft: 35, backgroundColor: theme.colors.inputBackground, color: theme.colors.text, borderColor: theme.colors.border, borderWidth: 1 }]}
                                            placeholderTextColor={theme.colors.placeholder}
                                            inputStyle={{ color: theme.colors.text }}
                                        />
                                    </View>
                                </View>

                                <View style={[styles.field, { flex: 1 }]}>
                                    <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>ESTADO</Text>
                                    <View style={[styles.toggleContainer, { backgroundColor: theme.colors.inputBackground }]}>
                                        <TouchableOpacity
                                            style={[styles.toggleBtn, estado === 'NUEVO' && styles.toggleActive, estado === 'NUEVO' && { backgroundColor: theme.colors.card }]}
                                            onPress={() => setEstado('NUEVO')}
                                        >
                                            <Text style={[styles.toggleText, { color: theme.colors.textSecondary }, estado === 'NUEVO' && { color: theme.colors.primary }]}>NUEVO</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.toggleBtn, estado === 'USADO' && styles.toggleActive, estado === 'USADO' && { backgroundColor: theme.colors.card }]}
                                            onPress={() => setEstado('USADO')}
                                        >
                                            <Text style={[styles.toggleText, { color: theme.colors.textSecondary }, estado === 'USADO' && { color: theme.colors.primary }]}>USADO</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.field}>
                                <Select
                                    label="CATEGORÍA"
                                    value={categoria}
                                    onValueChange={setCategoria}
                                    options={categories}
                                    placeholder="Elige una categoría"

                                    buttonStyle={{ backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }}
                                    buttonTextStyle={{ color: theme.colors.text }}
                                    dropdownStyle={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
                                    rowStyle={{ borderBottomColor: theme.colors.border }}
                                    rowTextStyle={{ color: theme.colors.text }}
                                    labelStyle={{ color: theme.colors.text, fontWeight: '900', fontSize: 11, letterSpacing: 1.5, marginLeft: 4, marginBottom: 12 }}
                                />
                            </View>

                            <View style={styles.field}>
                                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>UBICACIÓN (DIRECCIÓN)</Text>
                                <Input
                                    placeholder="Ej: Calle 10 #43, Poblado..."
                                    value={ubicacion}
                                    onChangeText={setUbicacion}
                                    containerStyle={styles.fieldInputContainer}
                                    style={[styles.fieldInput, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text, borderColor: theme.colors.border, borderWidth: 1 }]}
                                    placeholderTextColor={theme.colors.placeholder}
                                    inputStyle={{ color: theme.colors.text }}
                                    rightIcon={
                                        <TouchableOpacity
                                            onPress={handleSearchLocation}
                                            disabled={isVerifyingLocation}
                                        >
                                            {isVerifyingLocation ? (
                                                <ActivityIndicator size="small" color={theme.colors.primary} />
                                            ) : (
                                                <MaterialCommunityIcons
                                                    name="map-search-outline"
                                                    size={24}
                                                    color={theme.colors.primary}
                                                />
                                            )}
                                        </TouchableOpacity>
                                    }
                                />
                                <Text style={[styles.fieldHint, { color: theme.colors.textSecondary }]}>Buscaremos tu dirección en Google Maps para mostrarla</Text>
                            </View>

                            <View style={styles.field}>
                                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>DETALLES ADICIONALES</Text>
                                <Input
                                    multiline
                                    placeholder="Marca, color, motivo de venta..."
                                    value={descripcion}
                                    onChangeText={setDescripcion}
                                    containerStyle={styles.fieldInputContainer}
                                    style={[styles.fieldInput, styles.textArea, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text, borderColor: theme.colors.border, borderWidth: 1 }]}
                                    placeholderTextColor={theme.colors.placeholder}
                                    inputStyle={{ color: theme.colors.text }}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Footer 固定在底部 */}
                <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
                    <Button
                        fullWidth
                        onPress={handlePublish}
                        loading={loading}
                        style={[styles.publishBtn, { backgroundColor: theme.colors.primary }]}
                    >
                        <View style={styles.btnContent}>
                            <Text style={styles.publishBtnText}>{editItem ? 'Guardar Cambios' : 'Publicar para Venta'}</Text>
                            <MaterialCommunityIcons name="arrow-right" size={22} color="#fff" />
                        </View>
                    </Button>
                </View>

                <Toast
                    visible={toast.visible}
                    message={toast.message}
                    onDismiss={() => setToast({ ...toast, visible: false })}
                    type={toast.type}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingBottom: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    closeBtn: {
        padding: 8,
    },
    appBarTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
        flexGrow: 1,
    },
    section: {
        marginBottom: 32,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '900',
        color: '#64748b',
        letterSpacing: 1.5,
        marginBottom: 16,
    },
    imageGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    imageSlot: {
        width: 100,
        height: 100,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    imageThumb: {
        width: '100%',
        height: '100%',
    },
    removeBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    changeBtn: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 24,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    changeText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#fff',
    },
    addSlot: {
        width: 100,
        height: 100,
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    addSlotText: {
        fontSize: 10,
        fontWeight: '900',
    },
    form: {
        gap: 28,
    },
    field: {
        gap: 12,
    },
    fieldLabel: {
        fontSize: 11,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: 1.5,
        paddingLeft: 4,
    },
    fieldHint: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '600',
        paddingLeft: 4,
        marginTop: -4,
    },
    fieldInputContainer: {
        marginBottom: 0,
    },
    fieldInput: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 20,
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 10,
        elevation: 1,
    },
    priceInputWrapper: {
        position: 'relative',
    },
    priceSymbol: {
        position: 'absolute',
        left: 20,
        top: 20,
        zIndex: 10,
        fontSize: 16,
        color: '#94a3b8',
        fontWeight: '900',
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderRadius: 20,
        padding: 5,
        minHeight: 56,
    },
    toggleBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
    },
    toggleActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#94a3b8',
    },
    toggleTextActive: {
        color: '#1E3A8A',
    },
    catScroll: {
        flexDirection: 'row',
        marginHorizontal: -4,
    },
    catChip: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        marginHorizontal: 4,
    },
    catChipActive: {
        backgroundColor: '#1E3A8A',
        borderColor: '#1E3A8A',
    },
    catChipText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
    },
    catChipTextActive: {
        color: '#fff',
    },
    textArea: {
        minHeight: 120,
        paddingTop: 16,
        textAlignVertical: 'top',
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    publishBtn: {
        height: 65,
        borderRadius: 20,
        backgroundColor: '#1E3A8A',
        shadowColor: '#1E3A8A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    publishBtnText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#fff',
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
});
