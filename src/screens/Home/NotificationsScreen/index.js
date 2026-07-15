import NotificationsScreenNative from './NotificationsScreen.native';
import NotificationsScreenWeb from './NotificationsScreen.web';
import { Platform } from 'react-native';

const NotificationsScreen = Platform.select({
    web: NotificationsScreenWeb,
    default: NotificationsScreenNative,
});

export default NotificationsScreen;
