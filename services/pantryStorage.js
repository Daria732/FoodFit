import AsyncStorage from '@react-native-async-storage/async-storage';

// Ключ, под которым список продуктов будет храниться на устройстве
const PANTRY_STORAGE_KEY = 'foodfit_pantry';

// Получение сохранённых продуктов
export async function loadPantry() {
  try {
    const savedProducts = await AsyncStorage.getItem(PANTRY_STORAGE_KEY);

    return savedProducts ? JSON.parse(savedProducts) : [];
  } catch (error) {
    console.error('Ошибка загрузки запасов:', error);
    return [];
  }
}

// Сохранение списка продуктов
export async function savePantry(products) {
  try {
    await AsyncStorage.setItem(
      PANTRY_STORAGE_KEY,
      JSON.stringify(products)
    );
  } catch (error) {
    console.error('Ошибка сохранения запасов:', error);
    throw error;
  }
}