import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { theme } from '../theme';

interface WeightEntry {
  id: string;
  kilos: number;
  recorded_at: string;
  notes: string | null;
}

export default function WeightScreen() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    const { data, error } = await supabase.from('weight_entries').select('*').order('recorded_at', { ascending: false });
    if (error) {
      console.error(error);
      return;
    }
    setEntries(data ?? []);
  }

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.container}>
        <AppHeader title="Weight Tracker" subtitle="Log weight and watch progress over time." />
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card>
              <Text style={styles.weightValue}>{item.kilos.toFixed(1)} kg</Text>
              <Text style={styles.recordedAt}>{new Date(item.recorded_at).toLocaleDateString()}</Text>
              <Text style={styles.notes}>{item.notes ?? 'No notes added.'}</Text>
            </Card>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No weight entries yet. Add your first entry to start tracking.</Text>}
        />
        <PrimaryButton label="Refresh weight" onPress={loadEntries} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, paddingHorizontal: theme.spacing.medium, paddingTop: theme.spacing.medium },
  list: { paddingBottom: theme.spacing.large },
  weightValue: { fontSize: 26, fontWeight: '800', color: theme.colors.text },
  recordedAt: { marginTop: theme.spacing.small, color: theme.colors.textMuted },
  notes: { marginTop: theme.spacing.small, color: theme.colors.textMuted },
  empty: { textAlign: 'center', marginTop: theme.spacing.large, color: theme.colors.textMuted },
});
