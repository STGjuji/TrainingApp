import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import ModalForm from '../components/ModalForm';
import FormInput from '../components/FormInput';
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
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

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

  async function addMeal() {
    if (!name.trim()) return;
    setLoading(true);
    const { error } = await supabase.from('meals').insert({
      name,
      calories: calories ? parseInt(calories) : null,
      notes: notes || null,
      eaten_at: new Date().toISOString(),
    });
    setLoading(false);
    if (error) {
      console.error(error);
      return;
    }
    setName('');
    setCalories('');
    setNotes('');
    setModalVisible(false);
    loadMeals();
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
        <PrimaryButton label="Add Meal" onPress={() => setModalVisible(true)} />
      </View>
      <ModalForm
        visible={modalVisible}
        title="Log Meal"
        onClose={() => setModalVisible(false)}
        onSubmit={addMeal}
      >
        <FormInput label="Meal Name" placeholder="e.g., Chicken with rice" value={name} onChangeText={setName} />
        <FormInput label="Calories (optional)" placeholder="e.g., 500" value={calories} onChangeText={setCalories} keyboardType="numeric" />
        <FormInput label="Notes" placeholder="Add details" value={notes} onChangeText={setNotes} multiline numberOfLines={4} />
      </ModalForm>
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
