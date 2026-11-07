
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ключ для хранения дневника питания
const MEALS_STORAGE_KEY = 'foodfit_meals';

// Получаем сохранённые блюда
export async function loadMeals() {
  try {
    const savedMeals = await AsyncStorage.getItem(MEALS_STORAGE_KEY);

    if (!savedMeals) {
      return [];
    }

    return JSON.parse(savedMeals);
  } catch (error) {
    console.error('Ошибка загрузки дневника:', error);
    return [];
  }
}

// Сохраняем список блюд
export async function saveMeals(meals) {
  try {
    await AsyncStorage.setItem(
      MEALS_STORAGE_KEY,
      JSON.stringify(meals)
    );
  } catch (error) {
    console.error('Ошибка сохранения дневника:', error);
    throw error;
  }
}
