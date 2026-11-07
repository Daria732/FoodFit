import { View, Text, TextInput, StyleSheet } from 'react-native';

// Универсальное поле для ввода данных профиля
export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  theme,
}) {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>
        {label}
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.secondaryText}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 7,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },
});