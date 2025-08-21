import { MD3Theme } from 'react-native-paper';
import { Platform } from 'react-native';

type MD3Fonts = MD3Theme['fonts'];

// Fallback to system fonts if custom fonts aren't loaded
const getFontFamily = (customFont: string, fallback: string) => {
    return Platform.select({
        ios: customFont,
        android: customFont,
        default: fallback,
    });
};

export const fonts: MD3Fonts = {
    default: {
        fontFamily: getFontFamily('Roboto-Regular', 'System'),
        fontWeight: '400',
        letterSpacing: 0,
    },
    displayLarge: {
        fontFamily: getFontFamily('Antonio-Bold', 'System'),
        fontSize: 57,
        fontWeight: '700',
        lineHeight: 64,
        letterSpacing: 0,
    },
    displayMedium: {
        fontFamily: getFontFamily('Antonio-Bold', 'System'),
        fontSize: 45,
        fontWeight: '700',
        lineHeight: 52,
        letterSpacing: 0,
    },
    displaySmall: {
        fontFamily: getFontFamily('Antonio-Bold', 'System'),
        fontSize: 36,
        fontWeight: '700',
        lineHeight: 44,
        letterSpacing: 0,
    },
    headlineLarge: {
        fontFamily: getFontFamily('Antonio-SemiBold', 'System'),
        fontSize: 32,
        fontWeight: '600',
        lineHeight: 40,
        letterSpacing: 0,
    },
    headlineMedium: {
        fontFamily: getFontFamily('Antonio-SemiBold', 'System'),
        fontSize: 28,
        fontWeight: '600',
        lineHeight: 36,
        letterSpacing: 0,
    },
    headlineSmall: {
        fontFamily: getFontFamily('Antonio-SemiBold', 'System'),
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 32,
        letterSpacing: 0,
    },
    titleLarge: {
        fontFamily: getFontFamily('Antonio-Medium', 'System'),
        fontSize: 22,
        fontWeight: '500',
        lineHeight: 28,
        letterSpacing: 0,
    },
    titleMedium: {
        fontFamily: getFontFamily('Antonio-Medium', 'System'),
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 24,
        letterSpacing: 0.15,
    },
    titleSmall: {
        fontFamily: getFontFamily('Antonio-Medium', 'System'),
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    bodyLarge: {
        fontFamily: getFontFamily('Roboto-Regular', 'System'),
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
        letterSpacing: 0.15,
    },
    bodyMedium: {
        fontFamily: getFontFamily('Roboto-Regular', 'System'),
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        letterSpacing: 0.25,
    },
    bodySmall: {
        fontFamily: getFontFamily('Roboto-Regular', 'System'),
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0.4,
    },
    labelLarge: {
        fontFamily: getFontFamily('Roboto-Medium', 'System'),
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    labelMedium: {
        fontFamily: getFontFamily('Roboto-Medium', 'System'),
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 16,
        letterSpacing: 0.5,
    },
    labelSmall: {
        fontFamily: getFontFamily('Roboto-Medium', 'System'),
        fontSize: 11,
        fontWeight: '500',
        lineHeight: 16,
        letterSpacing: 0.5,
    },
};