import CreatePostScreenNative from './CreatePostScreen.native';
import CreatePostScreenWeb from './CreatePostScreen.web';
import { Platform } from 'react-native';

const CreatePostScreen = Platform.select({
    web: CreatePostScreenWeb,
    default: CreatePostScreenNative,
});

export default CreatePostScreen;
