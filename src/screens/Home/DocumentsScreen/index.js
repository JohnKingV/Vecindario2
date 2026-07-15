import DocumentsScreenNative from './DocumentsScreen.native';
import DocumentsScreenWeb from './DocumentsScreen.web';
import { Platform } from 'react-native';

const DocumentsScreen = Platform.select({
    web: DocumentsScreenWeb,
    default: DocumentsScreenNative,
});

export default DocumentsScreen;
