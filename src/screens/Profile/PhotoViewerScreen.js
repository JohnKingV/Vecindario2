import React, { useEffect } from 'react';
import {
    View,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

const PhotoViewerScreen = ({ route, navigation }) => {
    const { imageUri } = route.params;
    const insets = useSafeAreaInsets();

    useEffect(() => {
        // Force hide status bar immediately when screen mounts
        StatusBar.setHidden(true, 'fade');
        return () => {
            // Restore status bar when screen unmounts
            StatusBar.setHidden(false, 'fade');
        };
    }, []);

    if (!imageUri) {
        navigation.goBack();
        return null;
    }

    return (
        <View style={styles.container}>
            <StatusBar hidden={true} backgroundColor="#000000" />

            {/* Immersive Backdrop for closing */}
            <TouchableOpacity
                style={styles.backdrop}
                activeOpacity={1}
                onPress={() => navigation.goBack()}
            />

            <View style={styles.centerWrapper} pointerEvents="none">
                <View style={styles.circularContainer}>
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>
            </View>

            {/* Ergonomic Close Button - Positioned safely down */}
            <TouchableOpacity
                style={[styles.closeButton, { top: (Platform.OS === 'ios' ? insets.top : 40) + 20 }]}
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
                <MaterialCommunityIcons name="close" size={28} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: screenWidth,
        height: screenHeight,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999, // Layer insurance
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
    },
    centerWrapper: {
        width: screenWidth,
        height: screenWidth,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    // ... rest of styles
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
    closeButton: {
        position: 'absolute',
        right: 20,
        zIndex: 100,
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
});

export default PhotoViewerScreen;
