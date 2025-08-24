// app/_layout.tsx

import { useState, useEffect } from 'react';
import {
  useColorScheme,
  StatusBar,
  View,
  ActivityIndicator,
} from 'react-native';
import { PaperProvider, Text } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { lightTheme, darkTheme } from '@/theme';
import TabLayout from './(tabs)/_layout';
import { useAppInitialization } from '@/hooks/useAppInitialization';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const { isInitialized: isDbInitialized, error: dbError } =
    useAppInitialization();

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
    if (loaded && isDbInitialized) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isDbInitialized]);

  const theme = isDarkMode ? darkTheme : lightTheme;

  // Show loading while fonts or database are initializing
  if (!loaded || !isDbInitialized) {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: theme.colors.background,
            }}
          >
            {dbError ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text
                  variant="headlineSmall"
                  style={{
                    color: theme.colors.error,
                    marginBottom: 10,
                  }}
                >
                  Initialisierungsfehler
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{
                    color: theme.colors.onSurface,
                    textAlign: 'center',
                  }}
                >
                  {dbError}
                </Text>
              </View>
            ) : (
              <>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text
                  variant="bodyLarge"
                  style={{
                    marginTop: 16,
                    color: theme.colors.onSurface,
                  }}
                >
                  Wird geladen...
                </Text>
              </>
            )}
          </View>
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.surface}
        />
        <TabLayout />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
