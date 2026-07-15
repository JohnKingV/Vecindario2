import LoginScreenNative from './LoginScreen.native';
import LoginScreenWeb from './LoginScreen.web';
import { Platform } from 'react-native';

const LoginScreen = Platform.select({
    web: LoginScreenWeb,
    default: LoginScreenNative,
});

export default LoginScreen;
