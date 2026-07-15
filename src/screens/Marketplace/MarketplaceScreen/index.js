import MarketplaceScreenNative from './MarketplaceScreen.native';
import MarketplaceScreenWeb from './MarketplaceScreen.web';
import { Platform } from 'react-native';

const MarketplaceScreen = Platform.select({
    web: MarketplaceScreenWeb,
    default: MarketplaceScreenNative,
});

export default MarketplaceScreen;
