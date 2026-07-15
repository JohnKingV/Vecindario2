import React from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Input, Toast, Select } from '../../../components';
import { useCreateItemScreen } from './useCreateItemScreen';

export default function CreateItemScreenNative({ navigation, route }) {
    const logic = useCreateItemScreen(route, navigation);
    const { theme } = logic;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />

                <View style={[styles.appBar, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                        <MaterialCommunityIcons name="close" size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    <Text style={[styles.appBarTitle, { color: theme.colors.text }]}>{logic.editItem ? 'Editar Artículo' : 'Publicar para Venta'}</Text>
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
                                {logic.imagenes.map((img, index) => (
                                    <View key={index} style={styles.imageSlot}>
                                        <Image source={{ uri: img }} style={styles.imageThumb} />
                                        <TouchableOpacity
                                            style={styles.removeBadge}
                                            onPress={() => logic.removeImage(index)}
                                        >
                                            <MaterialCommunityIcons name="close" size={16} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.changeBtn}
                                            onPress={() => logic.pickImage(index)}
                                        >
                                            <Text style={styles.changeText}>CAMBIAR</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}

                                {logic.imagenes.length < 3 && (
                                    <TouchableOpacity
                                        style={[styles.addSlot, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}
                                        onPress={() => logic.pickImage()}
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
                                    value={logic.titulo}
                                    onChangeText={logic.setTitulo}
                                    containerStyle={styles.fieldInputContainer}
                                    style={[styles.fieldInput, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
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
                                            value={logic.precio}
                                            onChangeText={logic.handlePrecioChange}
                                            keyboardType="numeric"
                                            containerStyle={styles.fieldInputContainer}
                                            style={[styles.fieldInput, { paddingLeft: 35, backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
                                            placeholderTextColor={theme.colors.placeholder}
                                            inputStyle={{ color: theme.colors.text }}
                                        />
                                    </View>
                                </View>

                                <View style={[styles.field, { flex: 1 }]}>
                                    <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>ESTADO</Text>
                                    <View style={[styles.toggleContainer, { backgroundColor: theme.colors.inputBackground }]}>
                                        <TouchableOpacity
                                            style={[styles.toggleBtn, logic.estado === 'NUEVO' && styles.toggleActive, logic.estado === 'NUEVO' && { backgroundColor: theme.colors.card }]}
                                            onPress={() => logic.setEstado('NUEVO')}
                                        >
                                            <Text style={[styles.toggleText, { color: theme.colors.textSecondary }, logic.estado === 'NUEVO' && { color: theme.colors.primary }]}>NUEVO</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.toggleBtn, logic.estado === 'USADO' && styles.toggleActive, logic.estado === 'USADO' && { backgroundColor: theme.colors.card }]}
                                            onPress={() => logic.setEstado('USADO')}
                                        >
                                            <Text style={[styles.toggleText, { color: theme.colors.textSecondary }, logic.estado === 'USADO' && { color: theme.colors.primary }]}>USADO</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.field}>
                                <Select
                                    label="CATEGORÍA"
                                    value={logic.categoria}
                                    onValueChange={logic.setCategoria}
                                    options={logic.categories}
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
                                    value={logic.ubicacion}
                                    onChangeText={logic.setUbicacion}
                                    containerStyle={styles.fieldInputContainer}
                                    style={[styles.fieldInput, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
                                    placeholderTextColor={theme.colors.placeholder}
                                    inputStyle={{ color: theme.colors.text }}
                                    rightIcon={
                                        <TouchableOpacity
                                            onPress={logic.handleSearchLocation}
                                            disabled={logic.isVerifyingLocation}
                                        >
                                            {logic.isVerifyingLocation ? (
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
                                    flat
                                    placeholder="Marca, color, motivo de venta..."
                                    value={logic.descripcion}
                                    onChangeText={logic.setDescripcion}
                                    containerStyle={styles.fieldInputContainer}
                                    style={{
                                        backgroundColor: theme.colors.inputBackground,
                                        color: theme.colors.text,
                                        width: '100%',
                                        minHeight: 65,
                                        paddingTop: 16,
                                        paddingHorizontal: 20,
                                        borderRadius: 20,
                                        borderWidth: 2,
                                        borderColor: theme.colors.border,
                                        textAlignVertical: 'top',
                                        fontSize: 16,
                                        fontWeight: '600',
                                    }}
                                    placeholderTextColor={theme.colors.placeholder}
                                    inputStyle={{ color: theme.colors.text }}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Footer */}
                <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
                    <Button
                        fullWidth
                        onPress={logic.handlePublish}
                        loading={logic.loading}
                        style={[styles.publishBtn, { backgroundColor: theme.colors.primary }]}
                    >
                        <View style={styles.btnContent}>
                            <Text style={styles.publishBtnText}>{logic.editItem ? 'Guardar Cambios' : 'Publicar para Venta'}</Text>
                            <MaterialCommunityIcons name="arrow-right" size={22} color="#fff" />
                        </View>
                    </Button>
                </View>

                <Toast
                    visible={logic.toast.visible}
                    message={logic.toast.message}
                    onDismiss={() => logic.setToast({ ...logic.toast, visible: false })}
                    type={logic.toast.type}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    closeBtn: {
        padding: 8,
    },
    appBarTitle: {
        fontSize: 18,
        fontWeight: '900',
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
        letterSpacing: 1.5,
        marginBottom: 16,
    },
    imageGrid: {
        flexDirection: 'column',
        gap: 16,
    },
    imageSlot: {
        width: '100%',
        height: 200,
        borderRadius: 20,
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
        width: '100%',
        height: 65,
        borderRadius: 20,
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    addSlotText: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
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
        letterSpacing: 1.5,
        paddingLeft: 4,
    },
    fieldHint: {
        fontSize: 11,
        fontWeight: '600',
        paddingLeft: 4,
        marginTop: -4,
    },
    fieldInputContainer: {
        marginBottom: 0,
    },
    fieldInput: {
        borderRadius: 20,
        paddingHorizontal: 20,
        fontSize: 16,
        fontWeight: '600',
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
        top: 18,
        zIndex: 10,
        fontSize: 16,
        fontWeight: '900',
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    toggleContainer: {
        flexDirection: 'row',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleText: {
        fontSize: 12,
        fontWeight: '900',
    },
    textArea: {
        minHeight: 60,
        paddingTop: 16,
        textAlignVertical: 'top',
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        borderTopWidth: 1,
    },
    publishBtn: {
        height: 58,
        borderRadius: 20,
        shadowColor: '#1E3A8A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    publishBtnText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#fff',
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        gap: 12,
    },
});
