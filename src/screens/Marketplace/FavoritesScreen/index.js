import FavoritesScreenNative from './FavoritesScreen.native';
import FavoritesScreenWeb from './FavoritesScreen.web';
import { Platform } from 'react-native';

const FavoritesScreen = Platform.select({
    web: FavoritesScreenWeb,
    default: FavoritesScreenNative,
});

export default FavoritesScreen;
