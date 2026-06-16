import { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface WorkoutCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  events: Record<string, { plannedCount: number; completedCount: number }>;
}

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function formatMonthYear(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function buildCalendarGrid(month: number, year: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const weeks: Array<Array<number | null>> = [];
  let day = 1;

  for (let week = 0; week < 6; week += 1) {
    const row: Array<number | null> = [];
    for (let weekday = 0; weekday < 7; weekday += 1) {
      if ((week === 0 && weekday < firstDay) || day > totalDays) {
        row.push(null);
      } else {
        row.push(day);
        day += 1;
      }
    }
    weeks.push(row);
  }

  return weeks;
}

export default function WorkoutCalendar({ selectedDate, onDateChange, events }: WorkoutCalendarProps) {
  const month = selectedDate.getMonth();
  const year = selectedDate.getFullYear();

  const weeks = useMemo(() => buildCalendarGrid(month, year), [month, year]);

  function handleMonthChange(direction: -1 | 1) {
    const next = new Date(year, month + direction, 1);
    onDateChange(next);
  }

  function getDateKey(day: number) {
    const date = new Date(year, month, day);
    return date.toISOString().slice(0, 10);
  }

  const selectedKey = selectedDate.toISOString().slice(0, 10);

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handleMonthChange(-1)} style={styles.navButton}>
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{formatMonthYear(selectedDate)}</Text>
        <TouchableOpacity onPress={() => handleMonthChange(1)} style={styles.navButton}>
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.weekRow}>
        {dayLabels.map((label) => (
          <Text key={label} style={styles.dayLabel}>{label}</Text>
        ))}
      </View>
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((day, dayIndex) => {
            if (day === null) {
              return <View key={dayIndex} style={[styles.dayCell, styles.emptyCell]} />;
            }

            const dateKey = getDateKey(day);
            const event = events[dateKey];
            const isSelected = dateKey === selectedKey;

            return (
              <TouchableOpacity
                key={dayIndex}
                style={[styles.dayCell, isSelected && styles.selectedDay]}
                onPress={() => onDateChange(new Date(year, month, day))}
              >
                <Text style={[styles.dayNumber, isSelected && styles.selectedDayNumber]}>{day}</Text>
                <View style={styles.dotRow}>
                  {event?.plannedCount ? <View style={[styles.dot, styles.plannedDot]} /> : null}
                  {event?.completedCount ? <View style={[styles.dot, styles.completedDot]} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  navButton: {
    padding: 6,
  },
  navText: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  monthLabel: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayLabel: {
    width: 36,
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontWeight: '700',
    marginBottom: theme.spacing.small / 2,
  },
  dayCell: {
    width: 36,
    height: 52,
    borderRadius: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: theme.spacing.small / 2,
    backgroundColor: theme.colors.surface,
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  dayNumber: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  selectedDay: {
    backgroundColor: theme.colors.primary,
  },
  selectedDayNumber: {
    color: '#fff',
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  plannedDot: {
    backgroundColor: theme.colors.accent,
  },
  completedDot: {
    backgroundColor: theme.colors.success,
  },
});
