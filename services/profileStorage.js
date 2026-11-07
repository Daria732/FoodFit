import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = 'foodfit_profile';

// Сохраняем профиль пользователя на телефоне
export async function saveProfile(profile) {
  try {
    await AsyncStorage.setItem(
      PROFILE_KEY,
      JSON.stringify(profile)
    );

    return true;
  } catch (error) {
    console.error('Ошибка сохранения профиля:', error);
    return false;
  }
}

// Загружаем сохранённый профиль
export async function loadProfile() {
  try {
    const savedProfile = await AsyncStorage.getItem(PROFILE_KEY);

    if (!savedProfile) {
      return null;
    }

    return JSON.parse(savedProfile);
  } catch (error) {
    console.error('Ошибка загрузки профиля:', error);
    return null;
  }
}