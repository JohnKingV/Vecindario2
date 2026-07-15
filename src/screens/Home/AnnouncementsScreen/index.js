import AnnouncementsScreenNative from './AnnouncementsScreen.native';
import AnnouncementsScreenWeb from './AnnouncementsScreen.web';
import { Platform } from 'react-native';

const AnnouncementsScreen = Platform.select({
    web: AnnouncementsScreenWeb,
    default: AnnouncementsScreenNative,
});

export default AnnouncementsScreen;
