import { ScrollView, View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import AppHeader from '../components/AppHeader';
import { theme } from '../theme';

interface HomeScreenProps {
  navigation: any;
}

const CardEmoji: Record<string, string> = {
  Workouts: '💪',
  Meals: '🍽️',
  Weight: '⚖️',
  Progress: '📊',
  Settings: '⚙️',
};

const CardColors: Record<string, string> = {
  Workouts: theme.colors.card1,
  Meals: theme.colors.card2,
  Weight: theme.colors.card3,
  Progress: theme.colors.card4,
  Settings: theme.colors.card5,
};

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
        <AppHeader title="Training App" subtitle="Track your fitness journey" />
        <View style={styles.cardGrid}>
          {cards.map((item, index) => (
            <TouchableOpacity
              key={item.screen}
              style={[
                styles.tile,
                { backgroundColor: CardColors[item.label] },
                index % 2 === 0 ? { marginRight: theme.spacing.small } : {},
              ]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.85}
            >
              <Text style={styles.emoji}>{CardEmoji[item.label]}</Text>
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
  content: { padding: theme.spacing.medium, paddingBottom: theme.spacing.large },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.medium,
  },
  tile: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 24,
    padding: theme.spacing.large,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  emoji: {
    fontSize: 48,
    marginBottom: theme.spacing.medium,
  },
  tileTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
});
