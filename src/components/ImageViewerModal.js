import React, { useEffect } from 'react';
import {
    View,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Modal,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Use 'screen' to get the absolute physical dimensions, including navigation bars on Android
const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

const ImageViewerModal = ({ visible, onClose, imageUri }) => {
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (visible) {
            // Hide StatusBar when opening
            StatusBar.setHidden(true, 'fade');
        } else {
            StatusBar.setHidden(false, 'fade');
        }
        return () => StatusBar.setHidden(false, 'fade');
    }, [visible]);

    if (!imageUri) return null;

    return (
        <Modal
            visible={visible}
            transparent={false} // Use opaque modal to ensure it replaces the entire screen window
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <View style={styles.fullscreenContainer}>
                {/* 1. Explicitly hide StatusBar for the native window too */}
                <StatusBar hidden={true} />

                {/* 2. Backdrop Area - Solid Black covering EVERYTHING */}
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />

                {/* 3. Center Content */}
                <View style={styles.centerWrapper} pointerEvents="none">
                    <View style={styles.circularContainer}>
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    </View>
                </View>

                {/* 4. Top Controls - Positioned safely down to avoid any sensor/punch hole */}
                <View style={[styles.controls, { top: (Platform.OS === 'ios' ? insets.top : 40) + 20 }]}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                        <MaterialCommunityIcons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    fullscreenContainer: {
        width: screenWidth,
        height: screenHeight,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
    },
    centerWrapper: {
        width: screenWidth,
        height: screenWidth,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    circularContainer: {
        width: screenWidth * 0.88,
        height: screenWidth * 0.88,
        borderRadius: (screenWidth * 0.88) / 2,
        borderWidth: 4,
        borderColor: '#fff',
        overflow: 'hidden',
        backgroundColor: '#111',
        elevation: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    controls: {
        position: 'absolute',
        right: 20,
        zIndex: 10,
    },
    closeButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    }
});

export default ImageViewerModal;
