
export const mockProfile = {
  name: '',
  age: 21,
  gender: 'female',
  height: 173,
  weight: 60,
  activityLevel: 'moderate',
  goal: 'maintain',
};

export const mockProducts = [
  {
    id: '1',
    name: 'Молоко',
    quantity: 1000,
    unit: 'мл',
    calories: 60,
    protein: 3,
    fat: 3.2,
    carbs: 4.7,
    addedAt: '2026-10-14',
  },
  {
    id: '2',
    name: 'Яйца',
    quantity: 6,
    unit: 'шт.',
    calories: 157,
    protein: 12.7,
    fat: 11.5,
    carbs: 0.7,
    addedAt: '2026-10-14',
  },
  {
    id: '3',
    name: 'Помидоры',
    quantity: 400,
    unit: 'г',
    calories: 18,
    protein: 0.9,
    fat: 0.2,
    carbs: 3.9,
    addedAt: '2026-10-14',
  },
];

export const mockRecognizedProducts = [
  {
    id: 'scan-1',
    name: 'Молоко',
    confidence: 0.96,
    quantity: 1000,
    unit: 'мл',
  },
  {
    id: 'scan-2',
    name: 'Яйца',
    confidence: 0.93,
    quantity: 6,
    unit: 'шт.',
  },
  {
    id: 'scan-3',
    name: 'Сыр',
    confidence: 0.89,
    quantity: 200,
    unit: 'г',
  },
  {
    id: 'scan-4',
    name: 'Помидоры',
    confidence: 0.91,
    quantity: 400,
    unit: 'г',
  },
];
