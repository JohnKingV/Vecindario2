import MessagesScreenNative from './MessagesScreen.native';
import MessagesScreenWeb from './MessagesScreen.web';
import { Platform } from 'react-native';

const MessagesScreen = Platform.select({
    web: MessagesScreenWeb,
    default: MessagesScreenNative,
});

export default MessagesScreen;
