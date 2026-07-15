import ItemDetailScreenNative from './ItemDetailScreen.native';
import ItemDetailScreenWeb from './ItemDetailScreen.web';
import { Platform } from 'react-native';

const ItemDetailScreen = Platform.select({
    web: ItemDetailScreenWeb,
    default: ItemDetailScreenNative,
});

export default ItemDetailScreen;
