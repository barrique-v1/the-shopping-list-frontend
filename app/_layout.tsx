import { useState, useEffect } from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { lightTheme, darkTheme } from '@/theme';
import TabLayout from './(tabs)/_layout';
import { DatabaseProvider } from '@/components/DatabaseProvider';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

    const [loaded] = useFonts({
        'Antonio-Bold': require('@/assets/fonts/antonio/Antonio-Bold.ttf'),
        'Antonio-SemiBold': require('@/assets/fonts/antonio/Antonio-SemiBold.ttf'),
        'Antonio-Medium': require('@/assets/fonts/antonio/Antonio-Medium.ttf'),
        'Antonio-Regular': require('@/assets/fonts/antonio/Antonio-Regular.ttf'),
        'Antonio-Light': require('@/assets/fonts/antonio/Antonio-Light.ttf'),
        'Antonio-ExtraLight': require('@/assets/fonts/antonio/Antonio-ExtraLight.ttf'),
        'Antonio-Thin': require('@/assets/fonts/antonio/Antonio-Thin.ttf'),
        'Roboto-Regular': require('@/assets/fonts/roboto/Roboto-Regular.ttf'),
    });

    useEffect(() => {
        setIsDarkMode(colorScheme === 'dark');
    }, [colorScheme]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
        <DatabaseProvider>
            <SafeAreaProvider>
                <PaperProvider theme={theme}>
                    <StatusBar
                        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                        backgroundColor={theme.colors.surface}
                    />
                    <TabLayout />
                </PaperProvider>
            </SafeAreaProvider>
        </DatabaseProvider>
    );
}
