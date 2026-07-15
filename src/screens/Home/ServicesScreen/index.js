import ServicesScreenNative from './ServicesScreen.native';
import ServicesScreenWeb from './ServicesScreen.web';
import { Platform } from 'react-native';

const ServicesScreen = Platform.select({
    web: ServicesScreenWeb,
    default: ServicesScreenNative,
});

export default ServicesScreen;
