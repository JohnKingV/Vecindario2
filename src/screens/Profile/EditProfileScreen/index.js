import EditProfileScreenNative from './EditProfileScreen.native';
import EditProfileScreenWeb from './EditProfileScreen.web';
import { Platform } from 'react-native';

const EditProfileScreen = Platform.select({
    web: EditProfileScreenWeb,
    default: EditProfileScreenNative,
});

export default EditProfileScreen;
