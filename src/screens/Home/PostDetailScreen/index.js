import PostDetailScreenNative from './PostDetailScreen.native';
import PostDetailScreenWeb from './PostDetailScreen.web';
import { Platform } from 'react-native';

const PostDetailScreen = Platform.select({
    web: PostDetailScreenWeb,
    default: PostDetailScreenNative,
});

export default PostDetailScreen;
