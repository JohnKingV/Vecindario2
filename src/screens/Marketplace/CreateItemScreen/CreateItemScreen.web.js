import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Input, Toast, Select, ResponsiveContainer } from '../../../components';
import { useCreateItemScreen } from './useCreateItemScreen';

export default function CreateItemScreenWeb({ navigation, route }) {
    const logic = useCreateItemScreen(route, navigation);
    const { theme } = logic;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ResponsiveContainer>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                        {logic.editItem ? 'Editar Artículo' : 'Publicar para Venta'}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.contentRow}>
                    {/* Left Column: Images */}
                    <View style={styles.leftColumn}>
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
                    </View>

                    {/* Right Column: Form */}
                    <View style={styles.rightColumn}>
                        <View style={styles.form}>
                            <View style={styles.field}>
                                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>¿QUÉ VENDES?</Text>
                                <Input
                                    placeholder="Nombre del artículo"
                                    value={logic.titulo}
                                    onChangeText={logic.setTitulo}
                                    containerStyle={styles.fieldInputContainer}
                                    style={[styles.fieldInput, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text, borderColor: theme.colors.border, borderWidth: 1 }]}
                                    placeholderTextColor={theme.colors.placeholder}
                                    inputStyle={{ color: theme.colors.text }}
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.field, { flex: 1 }]}>
                                    <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>PRECIO (CLP)</Text>
                                    <View style={styles.priceInputWrapper}>
                                        <Text style={[styles.priceSymbol, { color: theme.colors.textSecondary }]}>$</Text>
                                        <Input
                                            placeholder="0"
                                            value={logic.precio}
                                            onChangeText={logic.handlePrecioChange}
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
                                    style={[styles.fieldInput, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text, borderColor: theme.colors.border, borderWidth: 1 }]}
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
                                    placeholder="Marca, color, motivo de venta..."
                                    value={logic.descripcion}
                                    onChangeText={logic.setDescripcion}
                                    containerStyle={styles.fieldInputContainer}
                                    style={[styles.fieldInput, styles.textArea, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text, borderColor: theme.colors.border, borderWidth: 1 }]}
                                    placeholderTextColor={theme.colors.placeholder}
                                    inputStyle={{ color: theme.colors.text }}
                                />
                            </View>

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
                    </View>
                </View>

                <Toast
                    visible={logic.toast.visible}
                    message={logic.toast.message}
                    onDismiss={() => logic.setToast({ ...logic.toast, visible: false })}
                    type={logic.toast.type}
                />
            </ResponsiveContainer>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: '100%',
        overflow: 'scroll',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    contentRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 40,
    },
    leftColumn: {
        flex: 1,
        minWidth: 300,
    },
    rightColumn: {
        flex: 1,
        minWidth: 320,
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
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
    },
    imageSlot: {
        width: 120,
        height: 120,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    imageThumb: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
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
        cursor: 'pointer',
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
        cursor: 'pointer',
    },
    changeText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#fff',
    },
    addSlot: {
        width: 120,
        height: 120,
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        cursor: 'pointer',
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
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
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
        cursor: 'pointer',
    },
    toggleActive: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    },
    toggleText: {
        fontSize: 12,
        fontWeight: '900',
    },
    textArea: {
        minHeight: 120,
        paddingTop: 16,
        textAlignVertical: 'top',
    },
    publishBtn: {
        height: 65,
        borderRadius: 20,
        marginTop: 24,
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
