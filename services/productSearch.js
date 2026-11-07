
const API_URL = 'https://world.openfoodfacts.net/cgi/search.pl';

// Преобразуем значение из базы в число.
// Если данных нет, возвращаем null.
function toNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

// Получаем калорийность на 100 г или 100 мл.
// Если ккал отсутствуют, пробуем перевести кДж в ккал.
function getCalories(nutrients, suffix) {
  const kcal = toNumber(nutrients[`energy-kcal_${suffix}`]);

  if (kcal !== null) {
    return kcal;
  }

  const kj = toNumber(nutrients[`energy-kj_${suffix}`]);

  return kj !== null ? kj / 4.184 : null;
}

// Собираем КБЖУ для конкретной единицы измерения.
function getNutrition(nutrients, suffix) {
  return {
    calories: getCalories(nutrients, suffix),
    protein: toNumber(nutrients[`proteins_${suffix}`]),
    fat: toNumber(nutrients[`fat_${suffix}`]),
    carbs: toNumber(nutrients[`carbohydrates_${suffix}`]),
  };
}

// Проверяем, что база содержит все нужные показатели.
function hasCompleteNutrition(nutrition) {
  return Object.values(nutrition).every(
    (value) => value !== null && value >= 0
  );
}

// Отбираем названия на кириллице.
// Явные украинские буквы считаем признаком другого языка.
function isRussianName(name) {
  if (!name || !/[а-яё]/i.test(name)) {
    return false;
  }

  if (/[іїєґІЇЄҐ]/.test(name)) {
    return false;
  }

  return true;
}

export async function searchProducts(query) {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    throw new Error('Введи не менее двух символов.');
  }

  const params = new URLSearchParams({
    search_terms: trimmedQuery,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '50',
    lc: 'ru',
    fields: [
      'code',
      'product_name',
      'product_name_ru',
      'generic_name',
      'generic_name_ru',
      'brands',
      'nutriments',
    ].join(','),
  });

  let response;

  try {
    response = await fetch(`${API_URL}?${params.toString()}`);
  } catch (error) {
    console.error('Ошибка подключения к базе продуктов:', error);

    throw new Error(
      'Не удалось подключиться к базе. Проверь интернет и повтори попытку.'
    );
  }

  if (!response.ok) {
    console.error('Open Food Facts вернул ошибку:', response.status);

    throw new Error(
      `Ошибка базы продуктов: ${response.status}. Попробуй позже.`
    );
  }

  const data = await response.json();

  return (data.products || [])
    .map((product) => {
      const nutrients = product.nutriments || {};

      // Сначала ищем явно русское название.
      // Если его нет, проверяем общее название товара.
      const russianName =
        product.product_name_ru?.trim() ||
        product.generic_name_ru?.trim() ||
        '';

      const generalName =
        product.product_name?.trim() ||
        product.generic_name?.trim() ||
        '';

      const name = isRussianName(russianName)
        ? russianName
        : isRussianName(generalName)
          ? generalName
          : '';

      const per100g = getNutrition(nutrients, '100g');
      const per100ml = getNutrition(nutrients, '100ml');

      return {
        id: product.code || `${name}-${product.brands || ''}`,
        name,
        brand: product.brands || '',
        per100g,
        per100ml,
      };
    })
    .filter(
      (product) =>
        product.name &&
        (
          hasCompleteNutrition(product.per100g) ||
          hasCompleteNutrition(product.per100ml)
        )
    );
}
