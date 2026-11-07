import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../context/AppContext';
import Screen from '../components/Screen';
import FormField from '../components/FormField';
import FormSelect from '../components/FormSelect';
import AppButton from '../components/AppButton';

import {
  saveProfile,
  loadProfile,
} from '../services/profileStorage';

import { calculateNutrition } from '../services/nutritionCalculator';

export default function ProfileScreen() {
  const { theme } = useApp();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [goal, setGoal] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSavedProfile() {
      try {
        const profile = await loadProfile();

        if (profile) {
          setName(profile.name ?? '');
          setAge(profile.age != null ? String(profile.age) : '');
          setGender(profile.gender ?? '');
          setHeight(profile.height != null ? String(profile.height) : '');
          setWeight(profile.weight != null ? String(profile.weight) : '');
          setActivityLevel(profile.activityLevel ?? '');
          setGoal(profile.goal ?? '');
        }
      } catch {
        Alert.alert(
          'Ошибка',
          'Не удалось загрузить сохранённый профиль.'
        );
      }
    }

    loadSavedProfile();
  }, []);

  const handleSave = async () => {
    if (
      !name.trim() ||
      !age ||
      !gender ||
      !height ||
      !weight ||
      !activityLevel ||
      !goal
    ) {
      Alert.alert(
        'Не все данные заполнены',
        'Заполни все поля профиля перед сохранением.'
      );
      return;
    }

    const ageNumber = Number(age);
    const heightNumber = Number(height);
    const weightNumber = Number(weight.replace(',', '.'));

    if (
      !Number.isFinite(ageNumber) ||
      !Number.isFinite(heightNumber) ||
      !Number.isFinite(weightNumber) ||
      ageNumber < 1 ||
      ageNumber > 120 ||
      heightNumber < 50 ||
      heightNumber > 250 ||
      weightNumber < 10 ||
      weightNumber > 500
    ) {
      Alert.alert(
        'Проверь данные',
        'Укажи корректные значения возраста, роста и веса.'
      );
      return;
    }

    const profile = {
      name: name.trim(),
      age: ageNumber,
      gender,
      height: heightNumber,
      weight: weightNumber,
      activityLevel,
      goal,
    };

    setIsSaving(true);

    try {
      const isSaved = await saveProfile(profile);

      if (isSaved) {
        Alert.alert('Готово', 'Профиль успешно сохранён.');
      } else {
        Alert.alert(
          'Ошибка',
          'Не удалось сохранить профиль. Попробуй ещё раз.'
        );
      }
    } catch {
      Alert.alert(
        'Ошибка',
        'Не удалось сохранить профиль. Попробуй ещё раз.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const nutrition = (() => {
    try {
      if (
        name.trim() &&
        age &&
        gender &&
        height &&
        weight &&
        activityLevel &&
        goal
      ) {
        return calculateNutrition({
          name: name.trim(),
          age: Number(age),
          gender,
          height: Number(height),
          weight: Number(weight.replace(',', '.')),
          activityLevel,
          goal,
        });
      }
    } catch {
      return null;
    }

    return null;
  })();

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Заголовок */}
          <View style={styles.heading}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>
              FOODFIT
            </Text>

            <Text style={[styles.title, { color: theme.text }]}>
              Мой профиль
            </Text>

            <Text style={[styles.description, { color: theme.secondaryText }]}>
              Твои данные помогают подобрать персональную норму питания
              и рекомендации по активности.
            </Text>
          </View>

          {/* Карточка пользователя */}
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: theme.primaryLight,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.profileIcon,
                { backgroundColor: theme.surface },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={30}
                color={theme.primary}
              />
            </View>

            <View style={styles.profileCardText}>
              <Text style={[styles.profileName, { color: theme.text }]}>
                {name.trim() || 'Твоё имя'}
              </Text>

              <Text style={[styles.profileHint, { color: theme.secondaryText }]}>
                Персональные настройки питания
              </Text>
            </View>
          </View>

          {/* Основные данные */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.sectionHeading}>
              <Ionicons
                name="person-outline"
                size={21}
                color={theme.primary}
              />

              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Основные данные
              </Text>
            </View>

            <FormField
              label="Имя"
              value={name}
              onChangeText={setName}
              placeholder="Как к тебе обращаться?"
              theme={theme}
            />

            <FormField
              label="Возраст"
              value={age}
              onChangeText={setAge}
              placeholder="Например, 21"
              keyboardType="numeric"
              theme={theme}
            />

            <FormSelect
              label="Пол"
              value={gender}
              onSelect={setGender}
              placeholder="Выбери пол"
              theme={theme}
              options={[
                { label: 'Женский', value: 'female' },
                { label: 'Мужской', value: 'male' },
              ]}
            />
          </View>

          {/* Параметры тела */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.sectionHeading}>
              <Ionicons
                name="body-outline"
                size={21}
                color={theme.primary}
              />

              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Параметры тела
              </Text>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricField}>
                <FormField
                  label="Рост (см)"
                  value={height}
                  onChangeText={setHeight}
                  placeholder="173"
                  keyboardType="numeric"
                  theme={theme}
                />
              </View>

              <View style={styles.metricField}>
                <FormField
                  label="Вес (кг)"
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="60"
                  keyboardType="decimal-pad"
                  theme={theme}
                />
              </View>
            </View>
          </View>

          {/* Цель и активность */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.sectionHeading}>
              <Ionicons
                name="flag-outline"
                size={21}
                color={theme.primary}
              />

              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Цель и активность
              </Text>
            </View>

            <FormSelect
              label="Уровень физической активности"
              value={activityLevel}
              onSelect={setActivityLevel}
              placeholder="Выбери активность"
              theme={theme}
              options={[
                { label: 'Минимальная', value: 'low' },
                { label: 'Низкая', value: 'light' },
                { label: 'Умеренная', value: 'moderate' },
                { label: 'Высокая', value: 'high' },
                { label: 'Очень высокая', value: 'very_high' },
              ]}
            />

            <FormSelect
              label="Цель"
              value={goal}
              onSelect={setGoal}
              placeholder="Выбери цель"
              theme={theme}
              options={[
                { label: 'Снижение веса', value: 'lose' },
                { label: 'Поддержание веса', value: 'maintain' },
                { label: 'Набор массы', value: 'gain' },
              ]}
            />
          </View>

          {/* Предварительный расчёт */}
          {nutrition && (
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
                Твоя дневная норма
              </Text>

              <Text style={[styles.calorieValue, { color: theme.primary }]}>
                {Math.round(nutrition.targetCalories)} ккал
              </Text>

              <View style={styles.macrosRow}>
                <View style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: theme.text }]}>
                    {Math.round(nutrition.protein)} г
                  </Text>
                  <Text style={[styles.macroLabel, { color: theme.secondaryText }]}>
                    Белки
                  </Text>
                </View>

                <View style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: theme.text }]}>
                    {Math.round(nutrition.fat)} г
                  </Text>
                  <Text style={[styles.macroLabel, { color: theme.secondaryText }]}>
                    Жиры
                  </Text>
                </View>

                <View style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: theme.text }]}>
                    {Math.round(nutrition.carbs)} г
                  </Text>
                  <Text style={[styles.macroLabel, { color: theme.secondaryText }]}>
                    Углеводы
                  </Text>
                </View>
              </View>
            </View>
          )}

          <AppButton
            title={isSaving ? 'Сохранение...' : 'Сохранить изменения'}
            onPress={handleSave}
            disabled={isSaving}
          />

          <Text style={[styles.footerNote, { color: theme.secondaryText }]}>
            Ты сможешь изменить эти данные в любое время.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
  },
  heading: {
    marginBottom: 22,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
  },
  profileIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCardText: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 9,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricField: {
    flex: 1,
    minWidth: 0,
  },
  nutritionCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  calorieValue: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 5,
  },
  macroLabel: {
    fontSize: 12,
  },
  footerNote: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 14,
  },
});