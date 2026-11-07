import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../../context/AppContext';
import Screen from '../../components/Screen';
import AppButton from '../../components/AppButton';
import ProgressRing from '../../components/ProgressRing';

import { loadProfile } from '../../services/profileStorage';
import { calculateNutrition } from '../../services/nutritionCalculator';

export default function DiaryScreen() {
  const { theme } = useApp();
  const { width } = useWindowDimensions();
  const router = useRouter();

  const [nutrition, setNutrition] = useState(null);
  const [error, setError] = useState('');

  // Пока дневник пустой. Позже подключим сохранённые приёмы пищи.
  const eaten = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  };

  // Обновляем норму при каждом возвращении на экран
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadData() {
        const profile = await loadProfile();

        if (!isActive) return;

        if (!profile) {
          setNutrition(null);
          setError('Сначала заполни свой профиль.');
          return;
        }

        try {
          const result = calculateNutrition(profile);

          if (isActive) {
            setNutrition(result);
            setError('');
          }
        } catch {
          if (isActive) {
            setNutrition(null);
            setError('Проверь данные своего профиля.');
          }
        }
      }

      loadData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  // Размеры рассчитываем с учётом места внутри карточки
  const ringAreaWidth = Math.max(220, width - 76);

  const smallSize = Math.min(
    Math.max(ringAreaWidth * 0.22, 62),
    78
  );

  const mainSize = Math.min(
    ringAreaWidth - smallSize * 2 - 16,
    160
  );

  const ringColors = {
    calories: theme.calories || '#5B8F71',
    protein: theme.protein || '#E5A04B',
    fat: theme.fat || '#9A82C4',
    carbs: theme.carbs || '#E17F72',
  };

  // Рассчитываем остаток и прогресс для каждого кольца
  function getRingData(consumed, target) {
    const remaining = Math.round(target - consumed);

    return {
      remaining,
      percent: target > 0
        ? Math.min(100, (consumed / target) * 100)
        : 0,
      exceeded: remaining < 0,
    };
  }

  const calorieRing = nutrition
    ? getRingData(eaten.calories, nutrition.targetCalories)
    : null;

  const proteinRing = nutrition
    ? getRingData(eaten.protein, nutrition.protein)
    : null;

  const fatRing = nutrition
    ? getRingData(eaten.fat, nutrition.fat)
    : null;

  const carbsRing = nutrition
    ? getRingData(eaten.carbs, nutrition.carbs)
    : null;

  function formatRemaining(value) {
    return value < 0
      ? `−${Math.abs(value)}`
      : String(value);
  }

  return (
    <Screen>
      <View style={styles.container}>
        {/* Заголовок дневника */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.eyebrow, { color: theme.secondaryText }]}>
              FOODFIT
            </Text>

            <Text style={[styles.title, { color: theme.text }]}>
              Мой дневник
            </Text>

            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
              Твой день в балансе
            </Text>
          </View>

          <View style={styles.headerActions}>
            {/* Кнопка настроек */}
            <Pressable
              style={[
                styles.headerIconButton,
                { backgroundColor: theme.primaryLight },
              ]}
              onPress={() => router.push('/settings')}
            >
              <Ionicons
                name="settings-outline"
                size={26}
                color={theme.primary}
              />
            </Pressable>

            {/* Кнопка профиля */}
            <Pressable
              style={[
                styles.headerIconButton,
                { backgroundColor: theme.primaryLight },
              ]}
              onPress={() => router.push('/profile')}
            >
              <Ionicons
                name="person-circle-outline"
                size={30}
                color={theme.primary}
              />
            </Pressable>
          </View>
        </View>

        {error ? (
          <View
            style={[
              styles.messageCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.messageTitle, { color: theme.text }]}>
              Давай настроим твой дневник
            </Text>

            <Text style={[styles.message, { color: theme.secondaryText }]}>
              {error}
            </Text>

            <AppButton
              title="Открыть профиль"
              onPress={() => router.push('/profile')}
            />
          </View>
        ) : null}

        {nutrition && (
          <>
            {/* Блок колец калорий и БЖУ */}
            <View
              style={[
                styles.ringsCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Баланс за день
              </Text>

              <View
                style={[
                  styles.ringsArea,
                  {
                    height: mainSize + smallSize + 18,
                  },
                ]}
              >
                {/* Большое кольцо калорий */}
                <View
                  style={[
                    styles.mainRing,
                    {
                      width: mainSize,
                      height: mainSize,
                    },
                  ]}
                >
                  <ProgressRing
                    size={mainSize}
                    thickness={mainSize * 0.075}
                    percent={calorieRing.percent}
                    color={calorieRing.exceeded
                      ? theme.danger
                      : ringColors.calories}
                    trackColor={theme.ringTrack || '#E8EDE9'}
                    value={formatRemaining(calorieRing.remaining)}
                    label="осталось"
                    sublabel="ккал"
                    valueColor={calorieRing.exceeded
                      ? theme.danger
                      : theme.text}
                  />
                </View>

                {/* Белки слева */}
                <View
                  style={[
                    styles.smallRing,
                    {
                      left: 0,
                      top: 120,
                    },
                  ]}
                >
                  <ProgressRing
                    size={smallSize}
                    thickness={smallSize * 0.09}
                    percent={proteinRing.percent}
                    color={proteinRing.exceeded
                      ? theme.danger
                      : ringColors.protein}
                    trackColor={theme.ringTrack || '#E8EDE9'}
                    value={formatRemaining(proteinRing.remaining)}
                    label="Белки"
                    sublabel={`из ${nutrition.protein} г`}
                    valueColor={proteinRing.exceeded
                      ? theme.danger
                      : theme.text}
                  />
                </View>

                {/* Углеводы справа */}
                <View
                  style={[
                    styles.smallRing,
                    {
                      right: 0,
                      top: 120,
                    },
                  ]}
                >
                  <ProgressRing
                    size={smallSize}
                    thickness={smallSize * 0.09}
                    percent={carbsRing.percent}
                    color={carbsRing.exceeded ? theme.danger : ringColors.carbs}
                    trackColor={theme.ringTrack || '#E8EDE9'}
                    value={formatRemaining(carbsRing.remaining)}
                    label="Углеводы"
                    sublabel={`из ${nutrition.carbs} г`}
                    valueColor={carbsRing.exceeded ? theme.danger : theme.text}
                  />
                </View>

                {/* Жиры снизу */}
                <View
                  style={[
                    styles.smallRing,
                    {
                      left: '50%',
                      top: mainSize + 18,
                      transform: [{ translateX: -smallSize / 2 }],
                    },
                  ]}
                >
                  <ProgressRing
                    size={smallSize}
                    thickness={smallSize * 0.09}
                    percent={fatRing.percent}
                    color={fatRing.exceeded ? theme.danger : ringColors.fat}
                    trackColor={theme.ringTrack || '#E8EDE9'}
                    value={formatRemaining(fatRing.remaining)}
                    label="Жиры"
                    sublabel={`из ${nutrition.fat} г`}
                    valueColor={fatRing.exceeded ? theme.danger : theme.text}
                  />
                </View>
              </View>

              {/* Съедено и дневная норма */}
              <View
                style={[
                  styles.calorieSummary,
                  { borderTopColor: theme.border },
                ]}
              >
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>
                    Съедено
                  </Text>

                  <Text style={[styles.summaryValue, { color: theme.text }]}>
                    {eaten.calories} ккал
                  </Text>
                </View>

                <View
                  style={[
                    styles.summaryDivider,
                    { backgroundColor: theme.border },
                  ]}
                />

                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>
                    Норма
                  </Text>

                  <Text style={[styles.summaryValue, { color: theme.text }]}>
                    {nutrition.targetCalories} ккал
                  </Text>
                </View>
              </View>
            </View>

            
            {/* Приёмы пищи */}
            <View
              style={[
                styles.mealsCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.mealsHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Приёмы пищи
                </Text>

                <Pressable
                  onPress={() => router.push({
                    pathname: '/add-meal',
                    params: {
                      date: new Date().getFullYear()
                        + '-'
                        + String(new Date().getMonth() + 1).padStart(2, '0')
                        + '-'
                        + String(new Date().getDate()).padStart(2, '0'),
                    },
                  })}
                  style={[
                    styles.addMealButton,
                    { backgroundColor: theme.primaryLight },
                  ]}
                >
                  <Ionicons name="add" size={22} color={theme.primary} />
                  <Text style={[styles.addMealButtonText, { color: theme.primary }]}>
                    Добавить
                  </Text>
                </Pressable>
              </View>

              <Text style={[styles.message, { color: theme.secondaryText }]}>
                Добавляй блюда, чтобы следить за калориями и БЖУ.
              </Text>
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringsCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  ringsArea: {
    width: '100%',
    position: 'relative',
    alignItems: 'center',
  },
  mainRing: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallRing: {
    position: 'absolute',
    zIndex: 2,
  },
  calorieSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 10,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 13,
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryDivider: {
    width: 1,
    height: 32,
  },
  mealsCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  addMealButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  messageCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  messageTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },
});