import AlertScreenNative from './AlertScreen.native';
import AlertScreenWeb from './AlertScreen.web';
import { Platform } from 'react-native';

const AlertScreen = Platform.select({
    web: AlertScreenWeb,
    default: AlertScreenNative,
});

export default AlertScreen;
