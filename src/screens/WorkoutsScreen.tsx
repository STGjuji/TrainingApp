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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<string>(new Date().toISOString());
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);

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

  useEffect(() => {
    setCalendarMonth(new Date(scheduledAt));
  }, [scheduledAt]);

  const calendarDays = useMemo(() => {
    const month = calendarMonth.getMonth();
    const year = calendarMonth.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1);
    const weekday = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid: (Date | null)[] = [];

    for (let i = 0; i < weekday; i += 1) {
      grid.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      grid.push(new Date(year, month, day));
    }
    while (grid.length % 7 !== 0) {
      grid.push(null);
    }
    return grid;
  }, [calendarMonth]);

  function changeCalendarMonth(delta: number) {
    setCalendarMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + delta);
      return next;
    });
  }

  function selectCalendarDate(date: Date) {
    setScheduledAt(date.toISOString());
    setShowDatePicker(false);
  }

  async function saveWorkout() {
    if (!title.trim()) {
      setErrorMessage('Please enter a workout title.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    const payload = {
      title,
      notes: notes || null,
      scheduled_at: scheduledAt,
    };

    let response;
    if (editingWorkoutId) {
      response = await supabase.from('workouts').update(payload).eq('id', editingWorkoutId).select();
    } else {
      response = await supabase.from('workouts').insert({ ...payload, completed: false }).select();
    }

    const { data, error } = response;
    setLoading(false);

    if (error) {
      console.error('Supabase save error:', error);
      setErrorMessage(error.message || 'Unable to save workout.');
      return;
    }

    setTitle('');
    setNotes('');
    setScheduledAt(new Date().toISOString());
    setEditingWorkoutId(null);
    setErrorMessage(null);
    setModalVisible(false);
    loadWorkouts();
  }

  function openEditWorkout(workout: Workout) {
    setTitle(workout.title);
    setNotes(workout.notes ?? '');
    setScheduledAt(workout.scheduled_at ?? new Date().toISOString());
    setEditingWorkoutId(workout.id);
    setErrorMessage(null);
    setModalVisible(true);
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

  async function deleteWorkout(id: string) {
    setLoading(true);
    try {
      const { error } = await supabase.from('workouts').delete().eq('id', id);
      setLoading(false);
      if (error) {
        console.error('Supabase delete error:', error);
        setErrorMessage(error.message || 'Unable to delete workout.');
        return;
      }
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
      setSuccessMessage('Workout deleted');
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err) {
      setLoading(false);
      console.error(err);
      setErrorMessage('Unexpected error deleting workout.');
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
      <View style={styles.container}>
        <AppHeader title="Workouts" subtitle="Track training sessions and plan your next move." />
        <View style={styles.section}>
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
            <View style={styles.messageBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}
          {successMessage ? (
            <View style={styles.messageBox}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.workoutsHeader}>
          <Text style={styles.dateSectionTitle}>Workouts on {selectedDate.toLocaleDateString()}</Text>
          <View style={styles.selectionControls}>
            <TouchableOpacity onPress={() => { setSelectionMode((s) => !s); setSelectedIds([]); }} style={styles.selectionToggle}>
              <Text style={styles.selectionToggleText}>{selectionMode ? 'Cancel' : 'Select'}</Text>
            </TouchableOpacity>
            {selectionMode ? (
              <TouchableOpacity onPress={confirmSelected} style={[styles.bulkConfirmButton, selectedIds.length === 0 && styles.bulkConfirmDisabled]} disabled={selectedIds.length === 0}>
                <Text style={styles.bulkConfirmText}>Confirm ({selectedIds.length})</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <FlatList
          data={selectedWorkouts}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderTop}>
                  <View style={styles.headerLeft}>
                    {selectionMode ? (
                      <TouchableOpacity onPress={() => {
                        setSelectedIds((prev) => prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]);
                      }} style={[styles.selectionCheckbox, selectedIds.includes(item.id) && styles.selectionCheckboxOn]}>
                        <Text style={styles.selectionCheckboxText}>{selectedIds.includes(item.id) ? '✓' : ''}</Text>
                      </TouchableOpacity>
                    ) : null}
                    <Text style={styles.workoutTitle}>{item.title}</Text>
                  </View>
                  <Text style={[styles.status, item.completed ? styles.completed : styles.pending]}>
                    {item.completed ? 'Completed' : 'Planned'}
                  </Text>
                </View>
                <Text style={styles.workoutDate}>{formatDate(item.scheduled_at)}</Text>
              </View>
              <Text style={styles.workoutMeta}>{item.notes ?? 'No details added yet.'}</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => openEditWorkout(item)} style={[styles.actionButton, styles.editButton]}>
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteWorkout(item.id)} style={[styles.actionButton, styles.deleteButton]}>
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleCompleted(item.id, item.completed)} style={[styles.actionButton, styles.confirmButton, item.completed && styles.confirmed]}>
                  <Text style={[styles.actionButtonText, item.completed && styles.confirmedText]}>
                    {item.completed ? 'Confirmed' : 'Confirm'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No workouts scheduled for this date. Add a planned workout below.
            </Text>
          }
          ListFooterComponent={<PrimaryButton label="Add Workout" onPress={() => setModalVisible(true)} />}
        />
      </View>
      <ModalForm
        visible={modalVisible}
        title={editingWorkoutId ? 'Edit Workout' : 'Add Workout'}
        onClose={() => {
          setModalVisible(false);
          setErrorMessage(null);
          setEditingWorkoutId(null);
        }}
        onSubmit={saveWorkout}
      >
        <FormInput label="Workout Title" placeholder="e.g., 30 min run" value={title} onChangeText={setTitle} />
        <FormInput label="Notes" placeholder="Add details here" value={notes} onChangeText={setNotes} multiline numberOfLines={4} />
        <View style={styles.datePickerRow}>
          <View>
            <Text style={styles.datePickerLabel}>Scheduled date</Text>
            <Text style={styles.selectedDateText}>{new Date(scheduledAt).toLocaleDateString()}</Text>
            <Text style={styles.weekInfoSmall}>Week {getWeekNumber(new Date(scheduledAt))}</Text>
          </View>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker((prev) => !prev)}
          >
            <Text style={styles.datePickerButtonText}>{showDatePicker ? 'Hide calendar' : 'Pick date'}</Text>
          </TouchableOpacity>
        </View>
        {showDatePicker ? (
          <View style={styles.calendarPicker}>
            <View style={styles.calendarPickerHeader}>
              <TouchableOpacity onPress={() => changeCalendarMonth(-1)} style={styles.calendarNavButton}>
                <Text style={styles.calendarNavText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.calendarMonthLabel}>{calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
              <TouchableOpacity onPress={() => changeCalendarMonth(1)} style={styles.calendarNavButton}>
                <Text style={styles.calendarNavText}>›</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.calendarWeekRow}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
                <Text key={label} style={styles.calendarWeekDay}>{label}</Text>
              ))}
            </View>
            <View style={styles.calendarGrid}>
              {calendarDays.map((date, index) => {
                const isSelected = date?.toDateString() === new Date(scheduledAt).toDateString();
                return (
                  <TouchableOpacity
                    key={`${index}-${date?.toISOString() ?? 'empty'}`}
                    style={[styles.calendarDay, date && isSelected && styles.calendarDaySelected]}
                    disabled={!date}
                    onPress={() => date && selectCalendarDate(date)}
                  >
                    <Text style={[styles.calendarDayText, date && isSelected && styles.calendarDayTextSelected]}>
                      {date ? date.getDate() : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
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
  section: { marginBottom: theme.spacing.large },
  messageBox: { padding: theme.spacing.small, borderRadius: theme.radius, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, marginTop: theme.spacing.small },
  successText: { color: theme.colors.primary, fontWeight: '800' },
  workoutsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.medium },
  cardHeader: { marginBottom: theme.spacing.small },
  cardHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.small },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: theme.spacing.small },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: theme.spacing.small },
  actionButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: theme.radius / 2, minWidth: 92, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontWeight: '700' },
  editButton: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.primaryLight, marginRight: theme.spacing.small },
  editButtonText: { color: theme.colors.text, fontWeight: '700' },
  deleteButton: { backgroundColor: theme.colors.error, marginRight: theme.spacing.small },
  deleteButtonText: { color: '#fff', fontWeight: '700' },
  confirmButton: { backgroundColor: theme.colors.primary, marginRight: theme.spacing.small },
  confirmText: { color: '#fff', fontWeight: '700' },
  confirmed: { backgroundColor: theme.colors.success },
  confirmedText: { color: '#062b17' },
  workoutTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text, flex: 1, marginRight: theme.spacing.small, flexWrap: 'wrap' },
  workoutMeta: { color: theme.colors.text, marginBottom: theme.spacing.small, lineHeight: 20 },
  workoutDate: { color: theme.colors.secondary, marginTop: theme.spacing.small, fontWeight: '600', fontSize: 13 },
  status: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, paddingVertical: 4, paddingHorizontal: 8, borderRadius: theme.radius / 2 },
  completed: { backgroundColor: '#163f2b', color: theme.colors.success },
  pending: { backgroundColor: '#7c2d12', color: theme.colors.accent },
  empty: { textAlign: 'center', marginTop: theme.spacing.large, color: theme.colors.textMuted, paddingHorizontal: theme.spacing.medium },
  dateSectionTitle: { color: theme.colors.text, fontSize: 17, fontWeight: '800', marginBottom: theme.spacing.small, marginTop: theme.spacing.small },
  datePickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.spacing.medium, marginBottom: theme.spacing.medium, backgroundColor: theme.colors.surface, borderRadius: theme.radius, padding: theme.spacing.small },
  datePickerLabel: { color: theme.colors.textMuted, fontSize: 12, marginBottom: 4 },
  datePickerButton: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: theme.colors.primary, borderRadius: theme.radius / 2 },
  datePickerButtonText: { color: '#fff', fontWeight: '700' },
  selectedDateText: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  calendarHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.small },
  calendarRowLeft: { flexDirection: 'row', alignItems: 'center' },
  calendarLabel: { color: theme.colors.text, fontWeight: '800', fontSize: 16, marginRight: theme.spacing.medium },
  weekInfo: { color: theme.colors.textMuted, fontSize: 13, fontWeight: '700' },
  weekInfoSmall: { color: theme.colors.textMuted, fontSize: 12 },
  calendarPicker: { backgroundColor: theme.colors.surface, borderRadius: theme.radius, padding: theme.spacing.small, marginTop: theme.spacing.small },
  calendarPickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.small },
  calendarNavButton: { padding: 8, backgroundColor: theme.colors.border, borderRadius: theme.radius / 2 },
  calendarNavText: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  calendarMonthLabel: { color: theme.colors.text, fontWeight: '800' },
  calendarWeekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.small },
  calendarWeekDay: { width: 32, textAlign: 'center', color: theme.colors.textMuted, fontSize: 12, fontWeight: '700' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  calendarDay: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8, backgroundColor: theme.colors.border },
  calendarDaySelected: { backgroundColor: theme.colors.primary },
  calendarDayText: { color: theme.colors.text, fontWeight: '700' },
  calendarDayTextSelected: { color: '#fff' },
  calendarToggles: { flexDirection: 'row', alignItems: 'center' },
  toggleLabel: { color: theme.colors.textMuted, fontSize: 12, marginRight: 6 },
  errorText: { color: theme.colors.error, marginTop: theme.spacing.medium, fontWeight: '700' },
  helperText: { color: theme.colors.textMuted, marginTop: theme.spacing.small, fontSize: 13 },
});
