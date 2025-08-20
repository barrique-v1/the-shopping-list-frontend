import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { lightColors, darkColors } from './colors';
import { fonts } from './fonts';

export const lightTheme = {
  ...MD3LightTheme,
  colors: lightColors,
  fonts,
  roundness: 12,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: darkColors,
  fonts,
  roundness: 12,
};

export type AppTheme = typeof lightTheme;

export { lightColors, darkColors, fonts };