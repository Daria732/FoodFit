import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

// Выпадающий список для выбора одного значения
export default function FormSelect({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Выберите',
  theme,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>
        {label}
      </Text>

      <Pressable
        style={[
          styles.select,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text
          style={{
            color: selectedOption
              ? theme.text
              : theme.secondaryText,
            fontSize: 16,
          }}
        >
          {selectedOption
            ? selectedOption.label
            : placeholder}
        </Text>

        <Text style={{ color: theme.secondaryText }}>
          {isOpen ? '▲' : '▼'}
        </Text>
      </Pressable>

      {isOpen && (
        <View
          style={[
            styles.options,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {options.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.option,
                {
                  borderBottomColor: theme.border,
                  backgroundColor:
                    option.value === value
                      ? theme.primaryLight
                      : theme.surface,
                },
              ]}
              onPress={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
            >
              <Text style={{ color: theme.text, fontSize: 16 }}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
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
  select: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  options: {
    marginTop: 5,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
