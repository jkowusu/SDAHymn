import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import {
  CrimsonText_400Regular,
  CrimsonText_600SemiBold,
} from '@expo-google-fonts/crimson-text';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
// import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import React from 'react';
import { DatabaseProvider } from '@/hooks/useDatabase';
import { FavoritesProvider } from '@/hooks/useFavorites';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';

// SplashScreen.preventAutoHideAsync(); // temporarily disabled

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <Image source={require('@/assets/images/SDA_logo.png')} style={styles.logo} />
      <ActivityIndicator size="large" color="#555" />
    </View>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'CrimsonText-Regular': CrimsonText_400Regular,
    'CrimsonText-SemiBold': CrimsonText_600SemiBold,
  });

  // Force loading screen ON for testing
  const forceCustomLoading = false;
  const showLoading = !fontsLoaded || forceCustomLoading;

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (showLoading && !fontError) {
    return <LoadingScreen />;
  }

  return (
    <>
      <DatabaseProvider>
        <FavoritesProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="hymn/[id]" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="dark" />
        </FavoritesProvider>
      </DatabaseProvider>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
    resizeMode: 'contain',
  },
});
