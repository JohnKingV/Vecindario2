import MyItemsScreenNative from './MyItemsScreen.native';
import MyItemsScreenWeb from './MyItemsScreen.web';
import { Platform } from 'react-native';

const MyItemsScreen = Platform.select({
    web: MyItemsScreenWeb,
    default: MyItemsScreenNative,
});

export default MyItemsScreen;
