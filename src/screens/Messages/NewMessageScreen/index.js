import NewMessageScreenNative from './NewMessageScreen.native';
import NewMessageScreenWeb from './NewMessageScreen.web';
import { Platform } from 'react-native';

const NewMessageScreen = Platform.select({
    web: NewMessageScreenWeb,
    default: NewMessageScreenNative,
});

export default NewMessageScreen;
