import { ScrollView, View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import AppHeader from '../components/AppHeader';
import { theme } from '../theme';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const cards = [
    { label: 'Workouts', screen: 'Workouts' },
    { label: 'Meals', screen: 'Meals' },
    { label: 'Weight', screen: 'Weight' },
    { label: 'Progress', screen: 'Progress' },
    { label: 'Settings', screen: 'Settings' },
  ];

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Training App" subtitle="Build better workouts, meals, and progress plans." />
        <Text style={styles.description}>Tap a card to open any tracker or settings screen.</Text>
        <View style={styles.cardGrid}>
          {cards.map((item) => (
            <TouchableOpacity key={item.screen} style={styles.tile} onPress={() => navigation.navigate(item.screen)}>
              <Text style={styles.tileTitle}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.medium },
  description: { color: theme.colors.textMuted, fontSize: 16, marginBottom: theme.spacing.medium },
  cardGrid: { gap: theme.spacing.medium },
  tile: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    padding: theme.spacing.large,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  tileTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
});
