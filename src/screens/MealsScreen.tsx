import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { theme } from '../theme';
import { formatDate } from '../utils/format';

interface Meal {
  id: string;
  name: string;
  calories: number | null;
  notes: string | null;
  eaten_at: string | null;
}

export default function MealsScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);

  useEffect(() => {
    loadMeals();
  }, []);

  async function loadMeals() {
    const { data, error } = await supabase.from('meals').select('*').order('eaten_at', { ascending: false });
    if (error) {
      console.error(error);
      return;
    }
    setMeals(data ?? []);
  }

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.container}>
        <AppHeader title="Meals" subtitle="Log your food and calories with ease." />
        <FlatList
          data={meals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card>
              <Text style={styles.mealName}>{item.name}</Text>
              <View style={styles.row}>
                <Text style={styles.mealMeta}>Calories: {item.calories ?? 'N/A'}</Text>
                <Text style={styles.mealDate}>{formatDate(item.eaten_at)}</Text>
              </View>
              <Text style={styles.note}>{item.notes ?? 'No notes yet.'}</Text>
            </Card>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No meals logged yet. Add something tasty today.</Text>}
        />
        <PrimaryButton label="Refresh meals" onPress={loadMeals} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, paddingHorizontal: theme.spacing.medium, paddingTop: theme.spacing.medium },
  list: { paddingBottom: theme.spacing.large },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.small },
  mealName: { fontSize: 20, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.small },
  mealMeta: { color: theme.colors.textMuted },
  mealDate: { color: theme.colors.secondary, fontWeight: '600' },
  note: { color: theme.colors.textMuted, marginTop: theme.spacing.small },
  empty: { textAlign: 'center', marginTop: theme.spacing.large, color: theme.colors.textMuted },
});
