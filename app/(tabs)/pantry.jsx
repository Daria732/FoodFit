import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../../context/AppContext';
import Screen from '../../components/Screen';
import { loadPantry, savePantry } from '../../services/pantryStorage';

export default function FridgeScreen() {
  const { theme } = useApp();

  const [products, setProducts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [productName, setProductName] = useState('');
  const [productQuantity, setProductQuantity] = useState('');

  // Загружаем продукты при открытии экрана
  useEffect(() => {
    async function loadProducts() {
      const savedProducts = await loadPantry();

      setProducts(savedProducts);
      setIsLoaded(true);
    }

    loadProducts();
  }, []);

  // Сохраняем изменения после первоначальной загрузки
  useEffect(() => {
    if (!isLoaded) return;

    savePantry(products).catch(() => {
      Alert.alert(
        'Ошибка',
        'Не удалось сохранить список продуктов.'
      );
    });
  }, [products, isLoaded]);

  // Добавление продукта в список
  function addProduct() {
    if (!isLoaded) return;
    const name = productName.trim();
    const quantity = productQuantity.trim();

    if (!name) {
      Alert.alert('Добавление продукта', 'Введи название продукта.');
      return;
    }

    setProducts((previous) => [
      ...previous,
      {
        id: `${Date.now()}-${Math.random()}`,
        name,
        quantity: quantity || 'Количество не указано',
        icon: 'nutrition-outline',
      },
    ]);

    setProductName('');
    setProductQuantity('');
  }

  // Удаление продукта из списка
  function deleteProduct(id) {
    setProducts((previous) =>
      previous.filter((product) => product.id !== id)
    );
  }

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: theme.secondaryText }]}>
            FOODFIT
          </Text>

          <Text style={[styles.title, { color: theme.text }]}>
            Мои запасы
          </Text>

          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
            Продукты, которые уже есть дома
          </Text>
        </View>

        {/* Карточка сканирования холодильника */}
        <Pressable
          style={[
            styles.scanCard,
            { backgroundColor: theme.primaryLight },
          ]}
          onPress={() =>
            Alert.alert(
              'Сканирование холодильника',
              'Подключение камеры и нейросети добавим на следующем этапе.'
            )
          }
        >
          <View
            style={[
              styles.scanIcon,
              { backgroundColor: theme.surface },
            ]}
          >
            <Ionicons
              name="camera-outline"
              size={30}
              color={theme.primary}
            />
          </View>

          <View style={styles.scanText}>
            <Text style={[styles.scanTitle, { color: theme.text }]}>
              Сканировать холодильник
            </Text>

            <Text style={[styles.scanDescription, { color: theme.secondaryText }]}>
              Найдём продукты по фотографии
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={theme.primary}
          />
        </Pressable>

        {/* Форма добавления продукта */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Добавить продукт
          </Text>

          <TextInput
            value={productName}
            onChangeText={setProductName}
            placeholder="Например, куриная грудка"
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

          <TextInput
            value={productQuantity}
            onChangeText={setProductQuantity}
            placeholder="Количество, например 500 г"
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

          <Pressable
            style={[
              styles.addButton,
              { backgroundColor: theme.primary },
            ]}
            onPress={addProduct}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />

            <Text style={styles.addButtonText}>
              Добавить в запасы
            </Text>
          </Pressable>
        </View>

        {/* Список продуктов */}
        <View style={styles.listHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Продукты дома
          </Text>

          <Text style={[styles.count, { color: theme.secondaryText }]}>
            {products.length}
          </Text>
        </View>

        {products.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <Ionicons
              name="basket-outline"
              size={36}
              color={theme.secondaryText}
            />

            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Пока здесь пусто
            </Text>

            <Text style={[styles.emptyDescription, { color: theme.secondaryText }]}>
              Добавь продукты вручную или воспользуйся сканированием.
            </Text>
          </View>
        ) : (
          products.map((product) => (
            <View
              key={product.id}
              style={[
                styles.productCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <View
                style={[
                  styles.productIcon,
                  { backgroundColor: theme.primaryLight },
                ]}
              >
                <Ionicons
                  name={product.icon}
                  size={24}
                  color={theme.primary}
                />
              </View>

              <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: theme.text }]}>
                  {product.name}
                </Text>

                <Text style={[styles.productQuantity, { color: theme.secondaryText }]}>
                  {product.quantity}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Удалить ${product.name}`}
                hitSlop={8}
                onPress={() => deleteProduct(product.id)}
                style={styles.deleteButton}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={theme.secondaryText}
                />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 28,
  },
  header: {
    marginBottom: 22,
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
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 22,
    marginBottom: 18,
    gap: 12,
  },
  scanIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanText: {
    flex: 1,
  },
  scanTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 5,
  },
  scanDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 14,
    marginTop: 12,
  },
  addButton: {
    minHeight: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  count: {
    fontSize: 13,
    fontWeight: '600',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  productIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 5,
  },
  productQuantity: {
    fontSize: 13,
  },
  deleteButton: {
    padding: 8,
  },
  emptyCard: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 7,
  },
});