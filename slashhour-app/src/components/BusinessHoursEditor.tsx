import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { Icon } from './icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';
import TimeSelect from './TimeSelect';

export interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    closed?: boolean;
  };
}

interface BusinessHoursEditorProps {
  hours: BusinessHours;
  onChange: (hours: BusinessHours) => void;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: { [key: string]: string } = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

// Default hours: 9 AM to 5 PM
const DEFAULT_HOURS = {
  open: '09:00',
  close: '17:00',
  closed: false,
};

export default function BusinessHoursEditor({ hours, onChange }: BusinessHoursEditorProps) {
  // Initialize hours if not provided
  const currentHours = hours || DAYS.reduce((acc, day) => {
    acc[day] = { ...DEFAULT_HOURS };
    return acc;
  }, {} as BusinessHours);

  const handleToggleDay = (day: string) => {
    const newHours = {
      ...currentHours,
      [day]: {
        ...currentHours[day],
        closed: !currentHours[day]?.closed,
      },
    };
    onChange(newHours);
  };

  const handleTimeChange = (day: string, field: 'open' | 'close', value: string) => {
    const newHours = {
      ...currentHours,
      [day]: {
        ...currentHours[day],
        [field]: value,
      },
    };

    // Validate that close time is after open time
    if (field === 'close' || field === 'open') {
      const openTime = field === 'open' ? value : newHours[day].open;
      const closeTime = field === 'close' ? value : newHours[day].close;

      if (openTime >= closeTime) {
        Alert.alert('Invalid Hours', 'Closing time must be after opening time.');
        return;
      }
    }

    onChange(newHours);
  };

  const handleCopyToAll = () => {
    Alert.alert(
      'Copy to All Days',
      'Which hours would you like to copy to all days?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Monday Hours',
          onPress: () => {
            const mondayHours = currentHours.monday || DEFAULT_HOURS;
            const newHours = DAYS.reduce((acc, day) => {
              acc[day] = { ...mondayHours };
              return acc;
            }, {} as BusinessHours);
            onChange(newHours);
          },
        },
      ]
    );
  };

  const handleSetWeekdayHours = () => {
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const mondayHours = currentHours.monday || DEFAULT_HOURS;
    const newHours = { ...currentHours };
    weekdays.forEach((day) => {
      newHours[day] = { ...mondayHours };
    });
    onChange(newHours);
  };

  return (
    <View style={styles.container}>
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleSetWeekdayHours}>
          <View style={styles.actionButtonContent}>
            <Icon name="calendar" size={16} color={COLORS.textPrimary} style="line" />
            <Text style={styles.actionButtonText}>Set Mon-Fri</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleCopyToAll}>
          <View style={styles.actionButtonContent}>
            <Icon name="clipboard" size={16} color={COLORS.textPrimary} style="line" />
            <Text style={styles.actionButtonText}>Copy to All</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Days List */}
      {DAYS.map((day) => {
        const dayHours = currentHours[day] || DEFAULT_HOURS;
        const isClosed = dayHours.closed;

        return (
          <View key={day} style={styles.dayRow}>
            {/* Day Label and Toggle */}
            <View style={styles.dayHeader}>
              <Text style={styles.dayLabel}>{DAY_LABELS[day]}</Text>
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>{isClosed ? 'Closed' : 'Open'}</Text>
                <Switch
                  value={!isClosed}
                  onValueChange={() => handleToggleDay(day)}
                  trackColor={{ false: COLORS.gray300, true: COLORS.primaryLight }}
                  thumbColor={!isClosed ? COLORS.primary : COLORS.gray400}
                />
              </View>
            </View>

            {/* Time Selectors */}
            {!isClosed && (
              <View style={styles.timeRow}>
                <View style={styles.timeSection}>
                  <Text style={styles.timeLabel}>Open</Text>
                  <TimeSelect
                    value={dayHours.open}
                    onChange={(time) => handleTimeChange(day, 'open', time)}
                  />
                </View>
                <Text style={styles.timeSeparator}>—</Text>
                <View style={styles.timeSection}>
                  <Text style={styles.timeLabel}>Close</Text>
                  <TimeSelect
                    value={dayHours.close}
                    onChange={(time) => handleTimeChange(day, 'close', time)}
                  />
                </View>
              </View>
            )}
          </View>
        );
      })}

      {/* Helper Text */}
      <Text style={styles.helperText}>
        💡 Tip: Set Monday's hours, then use "Set Mon-Fri" or "Copy to All" to save time!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  dayRow: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dayLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  toggleLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  timeSection: {
    flex: 1,
  },
  timeLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.xs,
  },
  timeSeparator: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.sm,
    marginTop: SPACING.md,
  },
  helperText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 18,
  },
});
