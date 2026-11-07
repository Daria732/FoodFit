import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';

// Нижняя навигация приложения FoodFit
export default function TabsLayout() {
  const { theme } = useApp();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,

        // Цвета активной и неактивных вкладок
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.secondaryText,

        // Оформление нижней панели
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: 68,
          paddingTop: 7,
          paddingBottom: 7,
          elevation: 0,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },

        // Иконки для каждой вкладки
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'book-outline';

          if (route.name === 'index') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'recipes') {
            iconName = focused
              ? 'restaurant'
              : 'restaurant-outline';
          } else if (route.name === 'break') {
            iconName = focused ? 'body' : 'body-outline';
          } else if (route.name === 'pantry') {
            iconName = focused ? 'basket' : 'basket-outline';
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Дневник' }}
      />

      <Tabs.Screen
        name="recipes"
        options={{ title: 'Рецепты' }}
      />

      <Tabs.Screen
        name="break"
        options={{ title: 'Разминка' }}
      />

      <Tabs.Screen
        name="pantry"
        options={{ title: 'Запасы' }}
      />
    </Tabs>
  );
}