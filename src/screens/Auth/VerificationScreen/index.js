import VerificationScreenNative from './VerificationScreen.native';
import VerificationScreenWeb from './VerificationScreen.web';
import { Platform } from 'react-native';

const VerificationScreen = Platform.select({
    web: VerificationScreenWeb,
    default: VerificationScreenNative,
});

export default VerificationScreen;
