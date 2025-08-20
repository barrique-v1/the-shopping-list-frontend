import 'react-native-paper';
import { AppTheme } from '@/theme';

declare module 'react-native-paper' {
  interface ThemeColors {
    // Add any custom colors here if needed
  }
}

declare global {
  namespace ReactNativePaper {
    interface Theme extends AppTheme {}
  }
}