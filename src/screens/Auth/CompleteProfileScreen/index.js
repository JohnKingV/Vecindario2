import CompleteProfileScreenNative from './CompleteProfileScreen.native';
import CompleteProfileScreenWeb from './CompleteProfileScreen.web';
import { Platform } from 'react-native';

const CompleteProfileScreen = Platform.select({
    web: CompleteProfileScreenWeb,
    default: CompleteProfileScreenNative,
});

export default CompleteProfileScreen;
