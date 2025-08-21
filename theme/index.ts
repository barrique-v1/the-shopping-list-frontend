import { MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';
import { lightColors, darkColors } from './colors';
import { fonts } from './fonts';
import { spacing, roundness, shadows } from './tokens';

// Extended theme interface
export interface AppTheme extends MD3Theme {
    spacing: typeof spacing;
    customRoundness: typeof roundness;
    shadows: typeof shadows;
    custom: {
        statusBarHeight: number;
        headerHeight: number;
        tabBarHeight: number;
    };
}

// Light theme
export const lightTheme: AppTheme = {
    ...MD3LightTheme,
    colors: lightColors,
    fonts,
    spacing,
    customRoundness: roundness,
    shadows,
    custom: {
        statusBarHeight: 44,
        headerHeight: 56,
        tabBarHeight: 80,
    },
};

// Dark theme
export const darkTheme: AppTheme = {
    ...MD3DarkTheme,
    colors: darkColors,
    fonts,
    spacing,
    customRoundness: roundness,
    shadows,
    custom: {
        statusBarHeight: 44,
        headerHeight: 56,
        tabBarHeight: 80,
    },
};

// Type augmentation for react-native-paper
declare global {
    namespace ReactNativePaper {
        interface Theme extends AppTheme {}
    }
}

export { lightColors, darkColors, fonts, spacing, roundness, shadows };
