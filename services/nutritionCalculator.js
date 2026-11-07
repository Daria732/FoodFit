// Коэффициенты физической активности
const activityFactors = {
  low: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  very_high: 1.9,
};

// Рассчитываем суточную норму калорий и КБЖУ
export function calculateNutrition(profile) {
  const age = Number(profile.age);
  const height = Number(profile.height);
  const weight = Number(profile.weight);

  // Проверяем, заполнены ли необходимые данные
  if (
    !age ||
    !height ||
    !weight ||
    !profile.gender ||
    !activityFactors[profile.activityLevel] ||
    !profile.goal
  ) {
    throw new Error('Для расчёта необходимо заполнить профиль.');
  }

  // Формула Миффлина — Сан Жеора
  let bmr = 10 * weight + 6.25 * height - 5 * age;

  if (profile.gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // Суточная потребность с учётом активности
  const maintenanceCalories = Math.round(
    bmr * activityFactors[profile.activityLevel]
  );

  // Корректируем калорийность под выбранную цель
  let targetCalories = maintenanceCalories;

  if (profile.goal === 'lose') {
    targetCalories = Math.round(maintenanceCalories * 0.85);
  }

  if (profile.goal === 'gain') {
    targetCalories = Math.round(maintenanceCalories * 1.1);
  }

  // Ориентировочные нормы белков и жиров
  const protein = Math.round(weight * 1.6);
  const fat = Math.round(weight * 0.8);

  // Оставшиеся калории приходятся на углеводы
  const carbs = Math.max(
    0,
    Math.round(
      (targetCalories - protein * 4 - fat * 9) / 4
    )
  );

  return {
    bmr: Math.round(bmr),
    maintenanceCalories,
    targetCalories,
    protein,
    fat,
    carbs,
  };
}