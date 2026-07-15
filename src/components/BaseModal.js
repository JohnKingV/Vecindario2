import React from 'react';
import {
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    Dimensions,
} from 'react-native';
import { Portal } from 'react-native-paper';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * BaseModal - Portal-based root solution for centered dialogs.
 * Bypasses native RNModal bugs (displacement/alignment) by using a high-level Portal.
 */
const BaseModal = ({
    visible,
    onClose,
    children,
    overlayColor = 'rgba(15, 23, 42, 0.75)'
}) => {
    if (!visible) return null;

    return (
        <Portal>
            <View style={styles.portalContainer} pointerEvents="auto">
                {/* 1. Manual Backdrop: Absolute fill to block interaction and provide dimming */}
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={[styles.backdrop, { backgroundColor: overlayColor }]} />
                </TouchableWithoutFeedback>

                {/* 2. Content Centering Wrapper */}
                <View style={styles.contentWrapper} pointerEvents="box-none">
                    {children}
                </View>
            </View>
        </Portal>
    );
};

const styles = StyleSheet.create({
    portalContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    contentWrapper: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default BaseModal;
