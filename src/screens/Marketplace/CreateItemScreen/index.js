import CreateItemScreenNative from './CreateItemScreen.native';
import CreateItemScreenWeb from './CreateItemScreen.web';
import { Platform } from 'react-native';

const CreateItemScreen = Platform.select({
    web: CreateItemScreenWeb,
    default: CreateItemScreenNative,
});

export default CreateItemScreen;
