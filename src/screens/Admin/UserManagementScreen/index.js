import UserManagementScreenNative from './UserManagementScreen.native';
import UserManagementScreenWeb from './UserManagementScreen.web';
import { Platform } from 'react-native';

const UserManagementScreen = Platform.select({
    web: UserManagementScreenWeb,
    default: UserManagementScreenNative,
});

export default UserManagementScreen;
