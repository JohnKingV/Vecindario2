import AdminPanelScreenNative from './AdminPanelScreen.native';
import AdminPanelScreenWeb from './AdminPanelScreen.web';
import { Platform } from 'react-native';

const AdminPanelScreen = Platform.select({
    web: AdminPanelScreenWeb,
    default: AdminPanelScreenNative,
});

export default AdminPanelScreen;
