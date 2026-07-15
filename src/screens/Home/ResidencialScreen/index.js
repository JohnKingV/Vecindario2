import ResidencialScreenNative from './ResidencialScreen.native';
import ResidencialScreenWeb from './ResidencialScreen.web';
import { Platform } from 'react-native';

const ResidencialScreen = Platform.select({
    web: ResidencialScreenWeb,
    default: ResidencialScreenNative,
});

export default ResidencialScreen;
