import { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { theme } from '../theme';

interface WorkoutCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  events: Record<string, { plannedCount: number; completedCount: number }>;
  collapsed?: boolean;
  showWeekNumbers?: boolean;
}

const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function formatMonthYear(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function buildCalendarGrid(month: number, year: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const firstDayIndex = (firstDay + 6) % 7; // Monday-first week
  const totalDays = new Date(year, month + 1, 0).getDate();
  const weeks: Array<Array<number | null>> = [];
  let day = 1;

  for (let week = 0; week < 6; week += 1) {
    const row: Array<number | null> = [];
    for (let weekday = 0; weekday < 7; weekday += 1) {
      if ((week === 0 && weekday < firstDayIndex) || day > totalDays) {
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
  const { width } = useWindowDimensions();
  const compact = width < 420;

  const month = selectedDate.getMonth();
  const year = selectedDate.getFullYear();

  // compute a day cell size so 7 days + week-number column fit within available width
  const containerPadding = compact ? theme.spacing.small * 2 : theme.spacing.medium * 2;
  const weekNumberWidth = 32 + 6; // cell + marginRight
  const available = Math.max(240, width - containerPadding - weekNumberWidth - 32);
  const daySize = Math.max(24, Math.floor(available / 7));

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
    <View style={[styles.calendarContainer, compact && styles.compactContainer]}>
      <View style={[styles.header, compact && styles.compactHeader]}>
        <TouchableOpacity onPress={() => handleMonthChange(-1)} style={styles.navButton}>
          <Text style={[styles.navText, compact && styles.compactNavText]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.monthLabel, compact && styles.compactMonthLabel]}>{formatMonthYear(selectedDate)}</Text>
        <TouchableOpacity onPress={() => handleMonthChange(1)} style={styles.navButton}>
          <Text style={[styles.navText, compact && styles.compactNavText]}>›</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.weekRowHeader}>
        {/** optionally show week-number header cell */}
        <View style={styles.weekNumberHeader} />
        <View style={styles.weekLabelsRow}>
          {dayLabels.map((label) => (
            <Text key={label} style={[styles.dayLabel, compact && styles.compactDayLabel, { width: daySize }]}>{label}</Text>
          ))}
        </View>
      </View>
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRowWithNumber}>
          {/** week number cell */}
          <View style={styles.weekNumberCell}>
            <Text style={styles.weekNumberText}>{getWeekNumber(new Date(year, month, week[0] ?? 1))}</Text>
          </View>
          {week.map((day, dayIndex) => {
            if (day === null) {
              return <View key={dayIndex} style={[styles.dayCell, styles.emptyCell, compact && styles.compactDayCell, { width: daySize, height: Math.round(daySize * 1.4) }]} />;
            }

            const dateKey = getDateKey(day);
            const event = events[dateKey];
            const isSelected = dateKey === selectedKey;

            return (
              <TouchableOpacity
                key={dayIndex}
                style={[styles.dayCell, compact && styles.compactDayCell, { width: daySize, height: Math.round(daySize * 1.4) }, isSelected && styles.selectedDay]}
                onPress={() => onDateChange(new Date(year, month, day))}
              >
                <Text style={[styles.dayNumber, compact && styles.compactDayNumber, isSelected && styles.selectedDayNumber]}>{day}</Text>
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

function getWeekNumber(d: Date) {
  // Copy date so don't modify original
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  // Year of the Thursday
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return weekNo;
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
  weekRowWithNumber: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small / 4,
  },
  weekNumberHeader: {
    width: 32,
  },
  weekLabelsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekNumberCell: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  weekNumberText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
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
  compactContainer: {
    padding: theme.spacing.small,
    marginBottom: theme.spacing.small,
  },
  compactHeader: {
    marginBottom: theme.spacing.small / 2,
  },
  compactNavText: {
    fontSize: 18,
  },
  compactMonthLabel: {
    fontSize: 14,
  },
  compactDayLabel: {
    width: 30,
  },
  compactDayCell: {
    width: 30,
    height: 42,
    borderRadius: 10,
    paddingVertical: 4,
    marginBottom: theme.spacing.small / 3,
  },
  compactDayNumber: {
    fontSize: 12,
  },
});
