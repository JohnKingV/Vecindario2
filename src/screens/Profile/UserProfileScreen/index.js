import UserProfileScreenNative from './UserProfileScreen.native';
import UserProfileScreenWeb from './UserProfileScreen.web';
import { Platform } from 'react-native';

const UserProfileScreen = Platform.select({
    web: UserProfileScreenWeb,
    default: UserProfileScreenNative,
});

export default UserProfileScreen;
