import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { theme } from '../theme';

interface Stat {
  workouts: number;
  meals: number;
  weightEntries: number;
}

export default function ProgressScreen() {
  const [stats, setStats] = useState<Stat>({ workouts: 0, meals: 0, weightEntries: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const [workouts, meals, weights] = await Promise.all([
      supabase.from('workouts').select('id', { count: 'exact' }),
      supabase.from('meals').select('id', { count: 'exact' }),
      supabase.from('weight_entries').select('id', { count: 'exact' }),
    ]);

    setStats({
      workouts: workouts.count ?? 0,
      meals: meals.count ?? 0,
      weightEntries: weights.count ?? 0,
    });
  }

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.container}>
        <AppHeader title="Progress" subtitle="See your training summary at a glance." />
        <View style={styles.metricRow}>
          <Card>
            <Text style={styles.metricValue}>{stats.workouts}</Text>
            <Text style={styles.metricLabel}>Workouts</Text>
          </Card>
          <Card>
            <Text style={styles.metricValue}>{stats.meals}</Text>
            <Text style={styles.metricLabel}>Meals</Text>
          </Card>
        </View>
        <Card>
          <Text style={styles.metricValue}>{stats.weightEntries}</Text>
          <Text style={styles.metricLabel}>Weight Entries</Text>
        </Card>
        <PrimaryButton label="Refresh progress" onPress={loadStats} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, paddingHorizontal: theme.spacing.medium, paddingTop: theme.spacing.medium },
  metricRow: { flexDirection: 'row', gap: theme.spacing.medium, marginBottom: theme.spacing.medium },
  metricValue: { fontSize: 34, fontWeight: '800', color: theme.colors.text },
  metricLabel: { marginTop: 10, color: theme.colors.textMuted, fontSize: 16 },
});
