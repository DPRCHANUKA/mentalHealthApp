import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { loadMentorProfile } from '@/state/mentor-session';
import { loadStudentProfile } from '@/state/student-profile';
import { IrishGrover_400Regular } from '@expo-google-fonts/irish-grover';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadStudentProfile();
    loadMentorProfile();
  }, []);

  const [fontsLoaded] = useFonts({
    IrishGrover: IrishGrover_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="role-selection" />
        <Stack.Screen name="student" />
        <Stack.Screen name="mentor" />
      </Stack>
    </ThemeProvider>
  );
}