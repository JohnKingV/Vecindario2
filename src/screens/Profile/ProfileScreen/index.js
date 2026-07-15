import ProfileScreenNative from './ProfileScreen.native';
import ProfileScreenWeb from './ProfileScreen.web';
import { Platform } from 'react-native';

const ProfileScreen = Platform.select({
    web: ProfileScreenWeb,
    default: ProfileScreenNative,
});

export default ProfileScreen;
