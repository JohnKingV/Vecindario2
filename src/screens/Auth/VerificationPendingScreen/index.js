import VerificationPendingScreenNative from './VerificationPendingScreen.native';
import VerificationPendingScreenWeb from './VerificationPendingScreen.web';
import { Platform } from 'react-native';

const VerificationPendingScreen = Platform.select({
    web: VerificationPendingScreenWeb,
    default: VerificationPendingScreenNative,
});

export default VerificationPendingScreen;
