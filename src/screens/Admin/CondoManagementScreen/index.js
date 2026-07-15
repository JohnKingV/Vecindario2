import CondoManagementScreenNative from './CondoManagementScreen.native';
import CondoManagementScreenWeb from './CondoManagementScreen.web';
import { Platform } from 'react-native';

const CondoManagementScreen = Platform.select({
    web: CondoManagementScreenWeb,
    default: CondoManagementScreenNative,
});

export default CondoManagementScreen;
