import PaymentsScreenNative from './PaymentsScreen.native';
import PaymentsScreenWeb from './PaymentsScreen.web';
import { Platform } from 'react-native';

const PaymentsScreen = Platform.select({
    web: PaymentsScreenWeb,
    default: PaymentsScreenNative,
});

export default PaymentsScreen;
