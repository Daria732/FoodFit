
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../context/AppContext';
import Screen from '../components/Screen';
import AppButton from '../components/AppButton';

import { loadMeals, saveMeals } from '../services/mealStorage';
import { searchProducts } from '../services/productSearch';
import { formatDateRussian, getTodayKey } from '../services/dateUtils';

const MEAL_TYPES = ['Завтрак', 'Обед', 'Ужин', 'Перекус'];

export default function AddMealScreen() {
  const { theme } = useApp();
  const router = useRouter();
  const params = useLocalSearchParams();

  const selectedDate =
    typeof params.date === 'string' ? params.date : getTodayKey();

  const [mealType, setMealType] = useState('Завтрак');
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [weight, setWeight] = useState('100');
  const [unit, setUnit] = useState('g');
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Ищем продукты в базе
  async function handleSearch() {
    if (query.trim().length < 2) {
      setSearchError('Введи название длиной хотя бы два символа.');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setProducts([]);
    setSelectedProduct(null);

    try {
      const results = await searchProducts(query);
      setProducts(results);

      if (results.length === 0) {
        setSearchError(
          'Продукты с русским названием и полными данными КБЖУ не найдены. Попробуй другое название.'
        );
      }
    } catch (error) {
      setSearchError(
        error.message || 'Ошибка поиска. Проверь подключение к интернету.'
      );
    } finally {
      setIsSearching(false);
    }
  }

  // Проверяем введённое количество
  const numericWeight = Number(weight.replace(',', '.'));

  const validWeight =
    weight.trim() !== '' &&
    Number.isFinite(numericWeight) &&
    numericWeight > 0 &&
    numericWeight <= 5000;

  // Получаем КБЖУ для выбранной единицы измерения
  const nutritionPer100 = selectedProduct
    ? unit === 'g'
      ? selectedProduct.per100g
      : selectedProduct.per100ml
    : null;

  const hasNutritionForUnit =
    nutritionPer100 !== null &&
    nutritionPer100 !== undefined &&
    ['calories', 'protein', 'fat', 'carbs'].every((key) => {
      const value = nutritionPer100[key];
      return (
        value !== null &&
        value !== undefined &&
        Number.isFinite(value) &&
        value >= 0
      );
    });

  // Рассчитываем пищевую ценность указанной порции
  const ratio =
    validWeight && hasNutritionForUnit ? numericWeight / 100 : 0;

  const calories = hasNutritionForUnit
    ? Math.round(nutritionPer100.calories * ratio)
    : 0;

  const protein = hasNutritionForUnit
    ? Number((nutritionPer100.protein * ratio).toFixed(1))
    : 0;

  const fat = hasNutritionForUnit
    ? Number((nutritionPer100.fat * ratio).toFixed(1))
    : 0;

  const carbs = hasNutritionForUnit
    ? Number((nutritionPer100.carbs * ratio).toFixed(1))
    : 0;

  // Сохраняем продукт в дневник
  async function handleSave() {
    if (!selectedProduct) {
      Alert.alert(
        'Выбери продукт',
        'Сначала найди и выбери продукт из списка.'
      );
      return;
    }

    if (!validWeight) {
      Alert.alert(
        'Проверь количество',
        'Укажи количество больше 0 и не более 5000.'
      );
      return;
    }

    if (!hasNutritionForUnit) {
      Alert.alert(
        'Нет данных',
        `В базе нет полного КБЖУ на 100 ${unit === 'g' ? 'г' : 'мл'}. Выбери другую единицу измерения.`
      );
      return;
    }

    setIsSaving(true);

    try {
      const meals = await loadMeals();

      const newMeal = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date: selectedDate,
        mealType,
        productId: selectedProduct.id,
        name: selectedProduct.name,
        brand: selectedProduct.brand,
        weight: numericWeight,
        unit,
        calories,
        protein,
        fat,
        carbs,
      };

      await saveMeals([...meals, newMeal]);

      Alert.alert('Готово', 'Продукт добавлен в дневник.', [
        {
          text: 'Продолжить',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Ошибка сохранения продукта:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить продукт.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.container}
      >
        {/* Заголовок */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.backButton,
              { backgroundColor: theme.primaryLight },
            ]}
          >
            <Ionicons name="arrow-back" size={23} color={theme.primary} />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.text }]}>
              Добавить продукт
            </Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
              {formatDateRussian(selectedDate)}
            </Text>
          </View>
        </View>

        {/* Выбор приёма пищи */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.label, { color: theme.text }]}>
            Приём пищи
          </Text>

          <View style={styles.mealTypes}>
            {MEAL_TYPES.map((type) => {
              const active = mealType === type;

              return (
                <Pressable
                  key={type}
                  onPress={() => setMealType(type)}
                  style={[
                    styles.mealType,
                    {
                      backgroundColor: active
                        ? theme.primaryLight
                        : theme.background,
                      borderColor: active ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? theme.primary : theme.text,
                      fontWeight: '600',
                    }}
                  >
                    {type}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Поиск продукта */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.label, { color: theme.text }]}>
            Найти продукт
          </Text>

          <View style={styles.searchRow}>
            <TextInput
              value={query}
              onChangeText={(value) => {
                setQuery(value);
                setSearchError('');
              }}
              placeholder="Например, молоко или йогурт"
              placeholderTextColor={theme.secondaryText}
              style={[
                styles.searchInput,
                {
                  color: theme.text,
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />

            <Pressable
              onPress={handleSearch}
              disabled={isSearching}
              style={[
                styles.searchButton,
                {
                  backgroundColor: theme.primary,
                  opacity: isSearching ? 0.6 : 1,
                },
              ]}
            >
              <Ionicons name="search" size={21} color="#FFFFFF" />
            </Pressable>
          </View>

          <Text style={[styles.hint, { color: theme.secondaryText }]}>
            Поиск по открытой базе. Отображаются продукты с русскими
            названиями и полными данными КБЖУ.
          </Text>

          {isSearching && (
            <ActivityIndicator
              style={styles.loader}
              size="small"
              color={theme.primary}
            />
          )}

          {searchError ? (
            <Text
              style={[
                styles.errorText,
                { color: theme.danger || '#C34D4D' },
              ]}
            >
              {searchError}
            </Text>
          ) : null}

          {products.map((product) => {
            const active = selectedProduct?.id === product.id;

            // Показываем показатели на 100 г, если они доступны,
            // иначе — показатели на 100 мл.
            const displayNutrition =
              product.per100g || product.per100ml;

            const displayUnit = product.per100g ? 'г' : 'мл';

            return (
              <Pressable
                key={product.id}
                onPress={() => {
                  setSelectedProduct(product);
                  setWeight('100');
                  setUnit(product.per100g ? 'g' : 'ml');
                }}
                style={[
                  styles.productResult,
                  {
                    backgroundColor: active
                      ? theme.primaryLight
                      : theme.background,
                    borderColor: active ? theme.primary : theme.border,
                  },
                ]}
              >
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: theme.text }]}>
                    {product.name}
                  </Text>

                  {product.brand ? (
                    <Text
                      style={[styles.brand, { color: theme.secondaryText }]}
                    >
                      {product.brand}
                    </Text>
                  ) : null}

                  <Text
                    style={[
                      styles.productMacros,
                      { color: theme.secondaryText },
                    ]}
                  >
                    Б {displayNutrition.protein} г · Ж {displayNutrition.fat} г
                    {' · '}У {displayNutrition.carbs} г
                  </Text>

                  <Text
                    style={[styles.productCalories, { color: theme.text }]}
                  >
                    {Math.round(displayNutrition.calories)} ккал на 100{' '}
                    {displayUnit}
                  </Text>
                </View>

                <Ionicons
                  name={active ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={theme.primary}
                />
              </Pressable>
            );
          })}
        </View>

        {/* Количество и единица измерения */}
        {selectedProduct && (
          <>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.label, { color: theme.text }]}>
                Количество продукта
              </Text>

              <View style={styles.unitRow}>
                {[
                  { label: 'Граммы (г)', value: 'g' },
                  { label: 'Миллилитры (мл)', value: 'ml' },
                ].map((item) => {
                  const active = unit === item.value;
                  const available =
                    item.value === 'g'
                      ? Boolean(selectedProduct.per100g)
                      : Boolean(selectedProduct.per100ml);

                  return (
                    <Pressable
                      key={item.value}
                      disabled={!available}
                      onPress={() => setUnit(item.value)}
                      style={[
                        styles.unitButton,
                        {
                          backgroundColor: active
                            ? theme.primaryLight
                            : theme.background,
                          borderColor: active
                            ? theme.primary
                            : theme.border,
                          opacity: available ? 1 : 0.4,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: active ? theme.primary : theme.text,
                          fontWeight: '600',
                          fontSize: 13,
                        }}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <TextInput
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder="Например, 200"
                placeholderTextColor={theme.secondaryText}
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                  },
                ]}
              />

              <Text style={[styles.hint, { color: theme.secondaryText }]}>
                Введи количество от 1 до 5000 {unit === 'g' ? 'г' : 'мл'}.
              </Text>

              {!hasNutritionForUnit && (
                <Text
                  style={[
                    styles.errorText,
                    { color: theme.danger || '#C34D4D' },
                  ]}
                >
                  Нет полного КБЖУ для выбранной единицы измерения.
                </Text>
              )}
            </View>

            {/* Пищевая ценность порции */}
            <View
              style={[
                styles.nutritionCard,
                {
                  backgroundColor: theme.primaryLight,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.nutritionTitle, { color: theme.text }]}>
                Пищевая ценность порции
              </Text>

              <Text style={[styles.calorieValue, { color: theme.primary }]}>
                {validWeight && hasNutritionForUnit
                  ? `${calories} ккал`
                  : '—'}
              </Text>

              <View style={styles.macros}>
                <MacroItem
                  label="Белки"
                  value={
                    validWeight && hasNutritionForUnit ? `${protein} г` : '—'
                  }
                  color={theme.protein || '#E5A04B'}
                  textColor={theme.text}
                  secondaryText={theme.secondaryText}
                />

                <MacroItem
                  label="Жиры"
                  value={
                    validWeight && hasNutritionForUnit ? `${fat} г` : '—'
                  }
                  color={theme.fat || '#9A82C4'}
                  textColor={theme.text}
                  secondaryText={theme.secondaryText}
                />

                <MacroItem
                  label="Углеводы"
                  value={
                    validWeight && hasNutritionForUnit ? `${carbs} г` : '—'
                  }
                  color={theme.carbs || '#E17F72'}
                  textColor={theme.text}
                  secondaryText={theme.secondaryText}
                />
              </View>
            </View>

            <AppButton
              title={isSaving ? 'Сохраняем...' : 'Добавить в дневник'}
              onPress={handleSave}
              disabled={
                isSaving || !validWeight || !hasNutritionForUnit
              }
            />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function MacroItem({
  label,
  value,
  color,
  textColor,
  secondaryText,
}) {
  return (
    <View style={styles.macroItem}>
      <View style={[styles.macroDot, { backgroundColor: color }]} />
      <Text style={[styles.macroLabel, { color: secondaryText }]}>
        {label}
      </Text>
      <Text style={[styles.macroValue, { color: textColor }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 22,
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 5,
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  mealTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealType: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  loader: {
    marginTop: 18,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
  productResult: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
  },
  brand: {
    fontSize: 12,
    marginTop: 4,
  },
  productMacros: {
    fontSize: 12,
    marginTop: 6,
  },
  productCalories: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 50,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  unitRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  unitButton: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  nutritionCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  calorieValue: {
    fontSize: 30,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 18,
  },
  macros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  macroItem: {
    flex: 1,
    gap: 5,
  },
  macroDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  macroLabel: {
    fontSize: 12,
  },
  macroValue: {
    fontSize: 15,
    fontWeight: '700',
  },
});
