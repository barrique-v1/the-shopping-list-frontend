import {MD3LightTheme, MD3DarkTheme} from 'react-native-paper';
import {lightColors, darkColors} from './colors';
import {fonts} from './fonts';

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const roundness = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    circle: 9999,
}

export const lightTheme = {
    ...MD3LightTheme,
    colors: lightColors,
    fonts,
    roundness,
    spacing,
};

export const darkTheme = {
    ...MD3DarkTheme,
    colors: darkColors,
    fonts,
    roundness,
    spacing,
};

export type AppTheme = typeof lightTheme;

export {lightColors, darkColors, fonts};
