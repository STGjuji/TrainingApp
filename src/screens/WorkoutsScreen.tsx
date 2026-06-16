import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { theme } from '../theme';
import { formatDate } from '../utils/format';

interface Workout {
  id: string;
  title: string;
  notes: string | null;
  scheduled_at: string | null;
  completed: boolean;
}

export default function WorkoutsScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    loadWorkouts();
  }, []);

  async function loadWorkouts() {
    const { data, error } = await supabase.from('workouts').select('*').order('scheduled_at', { ascending: true });
    if (error) {
      console.error(error);
      return;
    }
    setWorkouts(data ?? []);
  }

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.container}>
        <AppHeader title="Workouts" subtitle="Track training sessions and plan your next move." />
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.row}>
                <Text style={styles.workoutTitle}>{item.title}</Text>
                <Text style={[styles.status, item.completed ? styles.completed : styles.pending]}>
                  {item.completed ? 'Completed' : 'Planned'}
                </Text>
              </View>
              <Text style={styles.workoutMeta}>{item.notes ?? 'No details added yet.'}</Text>
              <Text style={styles.workoutDate}>{formatDate(item.scheduled_at)}</Text>
            </Card>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No workouts logged yet. Add your first workout in Settings.</Text>}
        />
        <PrimaryButton label="Refresh workouts" onPress={loadWorkouts} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, paddingHorizontal: theme.spacing.medium, paddingTop: theme.spacing.medium },
  list: { paddingBottom: theme.spacing.large },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.small },
  workoutTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
  workoutMeta: { color: theme.colors.textMuted, marginBottom: theme.spacing.small },
  workoutDate: { color: theme.colors.secondary, marginTop: theme.spacing.small, fontWeight: '600' },
  status: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  completed: { color: theme.colors.success },
  pending: { color: theme.colors.accent },
  empty: { textAlign: 'center', marginTop: theme.spacing.large, color: theme.colors.textMuted },
});
