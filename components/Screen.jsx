
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

export default function Screen({ children, scroll = true }) {
  const { theme } = useApp();
  const { width } = useWindowDimensions();
  const maxWidth = width >= 768 ? 680 : 560;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, { maxWidth }]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.flex, { maxWidth }]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: '5%',
    paddingTop: 20,
    paddingBottom: 32,
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
});
