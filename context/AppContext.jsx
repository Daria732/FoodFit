
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme } from '../constants/theme';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [themeMode, setThemeMode] = useState(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
  );
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const savedTheme = await AsyncStorage.getItem('foodfit_theme');

        if (savedTheme === 'light' || savedTheme === 'dark') {
          setThemeMode(savedTheme);
        }
      } catch (error) {
        console.log('Не удалось загрузить тему', error);
      } finally {
        setThemeLoaded(true);
      }
    }

    loadTheme();
  }, []);

  useEffect(() => {
    if (!themeLoaded) return;

    AsyncStorage.setItem('foodfit_theme', themeMode).catch(() => {
      console.log('Не удалось сохранить тему');
    });
  }, [themeMode, themeLoaded]);

  const theme = useMemo(
    () => (themeMode === 'dark' ? darkTheme : lightTheme),
    [themeMode]
  );

  const toggleTheme = () => {
    setThemeMode((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AppContext.Provider value={{ theme, themeMode, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp нужно использовать внутри AppProvider');
  }

  return context;
}
