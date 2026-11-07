
import { StyleSheet, Text, View } from 'react-native';
import Screen from './Screen';
import { useApp } from '../context/AppContext';

export default function PlaceholderScreen({ title, description }) {
  const { theme } = useApp();

  return (
    <Screen>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.text }]}>
          {title}
        </Text>

        <Text style={[styles.description, { color: theme.secondaryText }]}>
          {description}
        </Text>

        <Text style={[styles.note, { color: theme.primary }]}>
          Этот раздел будет добавлен на следующем этапе.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
    gap: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 23,
  },
  note: {
    fontSize: 14,
    lineHeight: 20,
  },
});
