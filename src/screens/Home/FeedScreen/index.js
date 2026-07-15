import FeedScreenNative from './FeedScreen.native';
import FeedScreenWeb from './FeedScreen.web';
import { Platform } from 'react-native';

const FeedScreen = Platform.select({
    web: FeedScreenWeb,
    default: FeedScreenNative,
});

export default FeedScreen;
