import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';

interface TimeSelectProps {
  value: string;
  onChange: (time: string) => void;
  disabled?: boolean;
}

// Generate time options in 30-minute intervals
const generateTimeOptions = (): string[] => {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      options.push(`${h}:${m}`);
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

// Format 24h time to 12h with AM/PM
const formatTime12h = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export default function TimeSelect({ value, onChange, disabled = false }: TimeSelectProps) {
  const [modalVisible, setModalVisible] = React.useState(false);

  const handleSelect = (time: string) => {
    onChange(time);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.selectButton, disabled && styles.selectButtonDisabled]}
        onPress={() => setModalVisible(true)}
        disabled={disabled}
      >
        <Text style={[styles.selectButtonText, disabled && styles.selectButtonTextDisabled]}>
          {formatTime12h(value)}
        </Text>
        <Text style={styles.selectButtonIcon}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.timeList} showsVerticalScrollIndicator={false}>
              {TIME_OPTIONS.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeOption,
                    time === value && styles.timeOptionSelected,
                  ]}
                  onPress={() => handleSelect(time)}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      time === value && styles.timeOptionTextSelected,
                    ]}
                  >
                    {formatTime12h(time)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    minWidth: 120,
  },
  selectButtonDisabled: {
    backgroundColor: COLORS.gray50,
    borderColor: COLORS.gray200,
  },
  selectButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  selectButtonTextDisabled: {
    color: COLORS.textTertiary,
  },
  selectButtonIcon: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    width: '80%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  modalClose: {
    fontSize: 24,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  timeList: {
    maxHeight: 400,
  },
  timeOption: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  timeOptionSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  timeOptionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  timeOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});
