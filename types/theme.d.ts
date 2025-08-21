import 'react-native-paper';
import { AppTheme } from '@/theme';


declare global {
  namespace ReactNativePaper {
    interface Theme extends AppTheme {}
  }
}