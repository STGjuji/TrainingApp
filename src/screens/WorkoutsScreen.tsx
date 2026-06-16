import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import ModalForm from '../components/ModalForm';
import FormInput from '../components/FormInput';
import WorkoutCalendar from '../components/WorkoutCalendar';
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
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduledAt, setScheduledAt] = useState<string>(new Date().toISOString());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadWorkouts();
  }, []);

  async function loadWorkouts() {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('scheduled_at', { ascending: true });
    if (error) {
      console.error(error);
      return;
    }
    setWorkouts(data ?? []);
  }

  const workoutEvents = useMemo(() => {
    return workouts.reduce<Record<string, { plannedCount: number; completedCount: number }>>((acc, workout) => {
      const date = workout.scheduled_at ? workout.scheduled_at.slice(0, 10) : new Date().toISOString().slice(0, 10);
      const key = date;
      const existing = acc[key] || { plannedCount: 0, completedCount: 0 };
      if (workout.completed) {
        existing.completedCount += 1;
      } else {
        existing.plannedCount += 1;
      }
      acc[key] = existing;
      return acc;
    }, {});
  }, [workouts]);

  const selectedWorkouts = useMemo(() => {
    const key = selectedDate.toISOString().slice(0, 10);
    return workouts.filter((workout) => workout.scheduled_at?.slice(0, 10) === key);
  }, [selectedDate, workouts]);

  async function addWorkout() {
    if (!title.trim()) {
      setErrorMessage('Please enter a workout title.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase.from('workouts').insert({
      title,
      notes: notes || null,
      scheduled_at: scheduledAt,
      completed: false,
    }).select();

    setLoading(false);

    if (error) {
      console.error('Supabase insert error:', error);
      setErrorMessage(error.message || 'Unable to save workout.');
      return;
    }

    setTitle('');
    setNotes('');
    setErrorMessage(null);
    setModalVisible(false);
    loadWorkouts();
  }

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.container}>
        <AppHeader title="Workouts" subtitle="Track training sessions and plan your next move." />
        <WorkoutCalendar selectedDate={selectedDate} onDateChange={setSelectedDate} events={workoutEvents} />
        <Text style={styles.dateSectionTitle}>Workouts on {selectedDate.toLocaleDateString()}</Text>
        <FlatList
          data={selectedWorkouts}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.cardHeader}>
                <Text style={styles.workoutTitle}>{item.title}</Text>
                <Text style={[styles.status, item.completed ? styles.completed : styles.pending]}>
                  {item.completed ? 'Completed' : 'Planned'}
                </Text>
              </View>
              <Text style={styles.workoutMeta}>{item.notes ?? 'No details added yet.'}</Text>
              <Text style={styles.workoutDate}>{formatDate(item.scheduled_at)}</Text>
            </Card>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No workouts scheduled for this date. Add a planned workout below.
            </Text>
          }
        />
        <PrimaryButton label="Add Workout" onPress={() => setModalVisible(true)} />
      </View>
      <ModalForm
        visible={modalVisible}
        title="Add Workout"
        onClose={() => {
          setModalVisible(false);
          setErrorMessage(null);
        }}
        onSubmit={addWorkout}
      >
        <FormInput label="Workout Title" placeholder="e.g., 30 min run" value={title} onChangeText={setTitle} />
        <FormInput label="Notes" placeholder="Add details here" value={notes} onChangeText={setNotes} multiline numberOfLines={4} />
        <View style={styles.datePickerRow}>
          <TouchableOpacity onPress={() => setScheduledAt(new Date(new Date(scheduledAt).getTime() - 24 * 60 * 60 * 1000).toISOString())} style={styles.dateNavButton}>
            <Text style={styles.dateNavText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.selectedDateText}>{new Date(scheduledAt).toLocaleDateString()}</Text>
          <TouchableOpacity onPress={() => setScheduledAt(new Date(new Date(scheduledAt).getTime() + 24 * 60 * 60 * 1000).toISOString())} style={styles.dateNavButton}>
            <Text style={styles.dateNavText}>›</Text>
          </TouchableOpacity>
        </View>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        <Text style={styles.helperText}>{loading ? 'Saving workout…' : 'Tap Save to add this workout.'}</Text>
      </ModalForm>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, paddingHorizontal: theme.spacing.medium, paddingTop: theme.spacing.medium },
  list: { flex: 1, width: '100%' },
  listContent: { paddingBottom: theme.spacing.large },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.small },
  workoutTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text, flex: 1, marginRight: theme.spacing.small, flexWrap: 'wrap' },
  workoutMeta: { color: theme.colors.textMuted, marginBottom: theme.spacing.small, lineHeight: 20 },
  workoutDate: { color: theme.colors.secondary, marginTop: theme.spacing.small, fontWeight: '600', fontSize: 13 },
  status: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, paddingVertical: 4, paddingHorizontal: 8, borderRadius: theme.radius / 2 },
  completed: { backgroundColor: '#163f2b', color: theme.colors.success },
  pending: { backgroundColor: '#7c2d12', color: theme.colors.accent },
  empty: { textAlign: 'center', marginTop: theme.spacing.large, color: theme.colors.textMuted, paddingHorizontal: theme.spacing.medium },
  dateSectionTitle: { color: theme.colors.text, fontSize: 17, fontWeight: '800', marginBottom: theme.spacing.small, marginTop: theme.spacing.small },
  datePickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.spacing.medium, marginBottom: theme.spacing.medium, backgroundColor: theme.colors.surface, borderRadius: theme.radius, padding: theme.spacing.small },
  dateNavButton: { padding: theme.spacing.small, backgroundColor: theme.colors.border, borderRadius: theme.radius },
  dateNavText: { color: theme.colors.text, fontSize: 18, fontWeight: '700' },
  selectedDateText: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  errorText: { color: theme.colors.error, marginTop: theme.spacing.medium, fontWeight: '700' },
  helperText: { color: theme.colors.textMuted, marginTop: theme.spacing.small, fontSize: 13 },
});
