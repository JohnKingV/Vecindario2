import BookingScreenNative from './BookingScreen.native';
import BookingScreenWeb from './BookingScreen.web';
import { Platform } from 'react-native';

const BookingScreen = Platform.select({
    web: BookingScreenWeb,
    default: BookingScreenNative,
});

export default BookingScreen;
