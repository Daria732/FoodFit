import { USE_MOCK, BASE_URL } from './config';
import {
  mockProfile,
  mockProducts,
  mockRecognizedProducts,
} from './mockData';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error('Не удалось получить данные с сервера');
  }

  return response.json();
}

export const api = {
  async getProfile() {
    if (USE_MOCK) return { ...mockProfile };

    return request('/profile');
  },

  async updateProfile(data) {
    if (USE_MOCK) return { ...mockProfile, ...data };

    return request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getProducts() {
    if (USE_MOCK) return mockProducts.map((item) => ({ ...item }));

    return request('/products');
  },

  async scanFridge() {
    if (USE_MOCK) {
      return mockRecognizedProducts.map((item) => ({ ...item }));
    }

    throw new Error('Для сканирования нужно передать фотографию');
  },

  async generateMenu(params = {}) {
    if (USE_MOCK) {
      return {
        date: new Date().toISOString().slice(0, 10),
        mode: params.mode || 'strict',
        meals: [],
        shoppingList: [],
      };
    }

    return request('/menu/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async getActivityRecommendations() {
    if (USE_MOCK) {
      return [
        {
          id: '1',
          title: 'Небольшая прогулка',
          description: 'Прогуляйся в удобном темпе 15–20 минут.',
        },
        {
          id: '2',
          title: 'Перерыв от сидения',
          description: 'Встань, разомни плечи и немного походи.',
        },
      ];
    }

    return request('/activity/recommendations');
  },
};
