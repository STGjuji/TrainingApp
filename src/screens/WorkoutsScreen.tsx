import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Switch, Button, Platform, ScrollView } from 'react-native';
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
  completed_at?: string | null;
}

export default function WorkoutsScreen() {
  const [calendarCollapsed, setCalendarCollapsed] = useState(false);
  const [useSystemPicker, setUseSystemPicker] = useState(false);
  const [showNativePicker, setShowNativePicker] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduledAt, setScheduledAt] = useState<string>(new Date().toISOString());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  function getWeekNumber(d: Date) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return weekNo;
  }

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

  async function toggleCompleted(id: string, current: boolean) {
    try {
      const payload: any = { completed: !current };
      if (!current) payload.completed_at = new Date().toISOString();
      else payload.completed_at = null;

      const { data, error } = await supabase.from('workouts').update(payload).eq('id', id).select();
      if (error) {
        console.error('Supabase update error:', error);
        setErrorMessage(error.message || 'Unable to update workout.');
        return;
      }

      // Update local state for immediate feedback (set completed_at when confirming)
      setWorkouts((prev) => prev.map((w) => (w.id === id ? { ...w, completed: !current, completed_at: !current ? payload.completed_at : null } : w)));
      setSuccessMessage(!current ? 'Workout confirmed' : 'Workout unconfirmed');
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err) {
      console.error(err);
      setErrorMessage('Unexpected error updating workout.');
    }
  }

  async function confirmSelected() {
    if (!selectedIds.length) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('workouts').update({ completed: true, completed_at: new Date().toISOString() }).in('id', selectedIds).select();
      setLoading(false);
      if (error) {
        setErrorMessage(error.message || 'Unable to confirm selected workouts.');
        return;
      }
      const now = new Date().toISOString();
      setWorkouts((prev) => prev.map((w) => (selectedIds.includes(w.id) ? { ...w, completed: true, completed_at: now } : w)));
      setSuccessMessage('Selected workouts confirmed');
      setSelectedIds([]);
      setSelectionMode(false);
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err) {
      setLoading(false);
      setErrorMessage('Unexpected error confirming workouts.');
    }
  }

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView style={styles.container} contentContainerStyle={styles.containerContent} keyboardShouldPersistTaps="handled">
        <AppHeader title="Workouts" subtitle="Track training sessions and plan your next move." />
        <View style={styles.calendarHeaderRow}>
          <View style={styles.calendarRowLeft}>
            <Text style={styles.calendarLabel}>Calendar</Text>
            <Text style={styles.weekInfo}>Week {getWeekNumber(selectedDate)}</Text>
          </View>
          <View style={styles.calendarToggles}>
            <Text style={styles.toggleLabel}>Collapse</Text>
            <Switch value={calendarCollapsed} onValueChange={setCalendarCollapsed} />
            <Text style={[styles.toggleLabel, { marginLeft: 12 }]}>System Picker</Text>
            <Switch value={useSystemPicker} onValueChange={setUseSystemPicker} />
          </View>
        </View>
        {!calendarCollapsed && (
          <WorkoutCalendar selectedDate={selectedDate} onDateChange={setSelectedDate} events={workoutEvents} />
        )}
        {errorMessage ? (
          <View style={{ marginTop: theme.spacing.small }}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}
        {successMessage ? (
          <View style={{ marginTop: theme.spacing.small }}>
            <Text style={{ color: theme.colors.primary, fontWeight: '800' }}>{successMessage}</Text>
          </View>
        ) : null}
        <View style={styles.workoutsHeaderRow}>
          <Text style={styles.dateSectionTitle}>Workouts on {selectedDate.toLocaleDateString()} — Week {getWeekNumber(selectedDate)}</Text>
          <View style={styles.selectionControls}>
            <TouchableOpacity onPress={() => { setSelectionMode((s) => !s); setSelectedIds([]); }} style={styles.selectionToggle}>
              <Text style={styles.selectionToggleText}>{selectionMode ? 'Cancel' : 'Select'}</Text>
            </TouchableOpacity>
            {selectionMode ? (
              <TouchableOpacity onPress={confirmSelected} style={[styles.bulkConfirmButton, selectedIds.length === 0 && styles.bulkConfirmDisabled]} disabled={selectedIds.length === 0}>
                <Text style={styles.bulkConfirmText}>Confirm Selected ({selectedIds.length})</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        <FlatList
          data={selectedWorkouts}
          keyExtractor={(item) => item.id}
          style={styles.list}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  {selectionMode ? (
                    <TouchableOpacity onPress={() => {
                      setSelectedIds((prev) => prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]);
                    }} style={[styles.selectionCheckbox, selectedIds.includes(item.id) && styles.selectionCheckboxOn]}>
                      <Text style={styles.selectionCheckboxText}>{selectedIds.includes(item.id) ? '✓' : ''}</Text>
                    </TouchableOpacity>
                  ) : null}
                  <Text style={styles.workoutTitle}>{item.title}</Text>
                </View>
                <View style={styles.headerRight}>
                  <TouchableOpacity
                    onPress={() => toggleCompleted(item.id, item.completed)}
                    style={[styles.confirmButton, item.completed && styles.confirmed]}
                  >
                    <Text style={[styles.confirmText, item.completed && styles.confirmedText]}>
                      {item.completed ? 'Confirmed' : 'Confirm'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={[styles.status, item.completed ? styles.completed : styles.pending]}>
                    {item.completed ? 'Completed' : 'Planned'}
                  </Text>
                </View>
              </View>
              <Text style={styles.workoutMeta}>{item.notes ?? 'No details added yet.'}</Text>
              <Text style={styles.workoutDate}>{formatDate(item.scheduled_at)}{item.completed ? ` • Confirmed ${item.completed_at ? new Date(item.completed_at).toLocaleString() : ''}` : ''}</Text>
            </Card>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No workouts scheduled for this date. Add a planned workout below.
            </Text>
          }
        />
        <PrimaryButton label="Add Workout" onPress={() => setModalVisible(true)} />
      </ScrollView>
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
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.selectedDateText}>{new Date(scheduledAt).toLocaleDateString()}</Text>
            <Text style={styles.weekInfoSmall}>Week {getWeekNumber(new Date(scheduledAt))}</Text>
          </View>
          <TouchableOpacity onPress={() => setScheduledAt(new Date(new Date(scheduledAt).getTime() + 24 * 60 * 60 * 1000).toISOString())} style={styles.dateNavButton}>
            <Text style={styles.dateNavText}>›</Text>
          </TouchableOpacity>
        </View>
        {useSystemPicker ? (
          <View style={{ marginTop: 8 }}>
            <Button title="Pick Date" onPress={async () => {
              // Try to render a native picker if available; otherwise fallback to prompt (web)
              if (Platform.OS === 'web') {
                const input = prompt('Enter date (YYYY-MM-DD)', scheduledAt.slice(0,10));
                if (input) setScheduledAt(new Date(input).toISOString());
                return;
              }
              try {
                // Use eval('require') to avoid bundlers resolving this optional native module at build time
                // eslint-disable-next-line no-eval,@typescript-eslint/no-var-requires
                const r = eval('require');
                const DateTimePicker = r('@react-native-community/datetimepicker').default;
                setShowNativePicker(true);
              } catch (e) {
                // fallback
                alert('Native date picker not installed. Install @react-native-community/datetimepicker to use system picker.');
              }
            }} />
            {showNativePicker ? (
              // Render inline DateTimePicker when available
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              (() => {
                try {
                  // Use eval('require') to avoid bundler static analysis for optional native module
                  // eslint-disable-next-line no-eval,@typescript-eslint/no-var-requires
                  const r = eval('require');
                  const Picker = r('@react-native-community/datetimepicker').default;
                  return (
                    <Picker
                      value={new Date(scheduledAt)}
                      mode="date"
                      display="default"
                      onChange={(event: any, date?: Date) => {
                        setShowNativePicker(false);
                        if (date) setScheduledAt(date.toISOString());
                      }}
                    />
                  );
                } catch (err) {
                  return null;
                }
              })()
            ) : null}
          </View>
        ) : null}
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
  containerContent: { paddingBottom: theme.spacing.large },
  workoutsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectionControls: { flexDirection: 'row', alignItems: 'center' },
  selectionToggle: { padding: 6, backgroundColor: theme.colors.border, borderRadius: theme.radius / 2, marginLeft: theme.spacing.small },
  selectionToggleText: { color: theme.colors.text, fontWeight: '700' },
  bulkConfirmButton: { padding: 8, backgroundColor: theme.colors.accent, borderRadius: theme.radius / 2, marginLeft: theme.spacing.small },
  bulkConfirmText: { color: '#fff', fontWeight: '800' },
  bulkConfirmDisabled: { backgroundColor: theme.colors.border, opacity: 0.7 },
  selectionCheckbox: { width: 28, height: 28, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.small, backgroundColor: 'transparent' },
  selectionCheckboxOn: { backgroundColor: theme.colors.primary },
  selectionCheckboxText: { color: '#fff', fontWeight: '800' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.small },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  confirmButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: theme.radius / 2, backgroundColor: theme.colors.border, marginRight: theme.spacing.small },
  confirmText: { color: theme.colors.textMuted, fontWeight: '700' },
  confirmed: { backgroundColor: theme.colors.success },
  confirmedText: { color: '#062b17' },
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
  calendarHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.small },
  calendarRowLeft: { flexDirection: 'row', alignItems: 'center' },
  calendarLabel: { color: theme.colors.text, fontWeight: '800', fontSize: 16, marginRight: theme.spacing.medium },
  weekInfo: { color: theme.colors.textMuted, fontSize: 13, fontWeight: '700' },
  weekInfoSmall: { color: theme.colors.textMuted, fontSize: 12 },
  calendarToggles: { flexDirection: 'row', alignItems: 'center' },
  toggleLabel: { color: theme.colors.textMuted, fontSize: 12, marginRight: 6 },
  errorText: { color: theme.colors.error, marginTop: theme.spacing.medium, fontWeight: '700' },
  helperText: { color: theme.colors.textMuted, marginTop: theme.spacing.small, fontSize: 13 },
});
