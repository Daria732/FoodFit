import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from '../context/AppContext';

function Navigation() {
  const { theme, themeMode } = useApp();

  return (
    <>
      <StatusBar
        style={themeMode === 'dark' ? 'light' : 'dark'}
      />

      <Stack
        initialRouteName="(tabs)"
        screenOptions={{
          headerShown: false,

          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      >
        {/* Основная навигация с четырьмя вкладками */}
        <Stack.Screen name="(tabs)" />

        {/* Дополнительные экраны приложения */}
        <Stack.Screen name="profile" />
        <Stack.Screen name="products" />
        <Stack.Screen name="fridge" />
        <Stack.Screen name="menu" />
        <Stack.Screen name="diary" />
        <Stack.Screen name="activity" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <Navigation />
    </AppProvider>
  );
}