import ChatScreenNative from './ChatScreen.native';
import ChatScreenWeb from './ChatScreen.web';
import { Platform } from 'react-native';

const ChatScreen = Platform.select({
    web: ChatScreenWeb,
    default: ChatScreenNative,
});

export default ChatScreen;
