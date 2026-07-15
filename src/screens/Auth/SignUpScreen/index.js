import SignUpScreenNative from './SignUpScreen.native';
import SignUpScreenWeb from './SignUpScreen.web';
import { Platform } from 'react-native';

const SignUpScreen = Platform.select({
    web: SignUpScreenWeb,
    default: SignUpScreenNative,
});

export default SignUpScreen;
