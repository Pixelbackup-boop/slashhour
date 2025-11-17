import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from './icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';

interface ReportReason {
  id: string;
  label: string;
  icon: IconName;
}

const REPORT_REASONS: ReportReason[] = [
  { id: 'spam', label: 'Spam or misleading', icon: 'alert' },
  { id: 'fraud', label: 'Scam or fraud', icon: 'shield' },
  { id: 'inappropriate', label: 'Inappropriate content', icon: 'x-circle' },
  { id: 'wrong_info', label: 'Wrong information', icon: 'alert' },
  { id: 'unavailable', label: 'Deal not available', icon: 'x-circle' },
  { id: 'other', label: 'Other reason', icon: 'message' },
];

interface ReportDealModalProps {
  visible: boolean;
  dealId: string;
  dealTitle: string;
  onClose: () => void;
  onSubmit: (reason: string, description: string) => Promise<void>;
}

export default function ReportDealModal({
  visible,
  dealId,
  dealTitle,
  onClose,
  onSubmit,
}: ReportDealModalProps) {
  const insets = useSafeAreaInsets();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('🚨 [ReportDealModal] Rendering:', { visible, dealId, dealTitle });
  console.log('🚨 [ReportDealModal] Safe area insets:', insets);

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Select a reason', 'Please select a reason for reporting this deal.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(selectedReason, description);
      // Reset form
      setSelectedReason('');
      setDescription('');
      onClose();
      Alert.alert(
        'Report Submitted',
        'Thank you for reporting. Our team will review this deal shortly.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to submit report. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedReason('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.innerContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Icon name="target" size={24} color={COLORS.error} />
                <Text style={styles.headerTitle}>Report Deal</Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                disabled={isSubmitting}
                style={styles.closeButton}
              >
                <Icon name="x-circle" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Deal Info */}
            <View style={styles.dealInfo}>
              <Text style={styles.dealTitle} numberOfLines={2}>
                {dealTitle}
              </Text>
              <Text style={styles.dealSubtext}>
                Help us keep Slashhour safe by reporting inappropriate content
              </Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Reason Selection */}
              <Text style={styles.sectionTitle}>Select a reason</Text>
              <View style={styles.reasonsContainer}>
                {REPORT_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason.id}
                    style={[
                      styles.reasonOption,
                      selectedReason === reason.id && styles.reasonOptionSelected,
                    ]}
                    onPress={() => setSelectedReason(reason.id)}
                    disabled={isSubmitting}
                  >
                    <View style={styles.reasonLeft}>
                      <Icon
                        name={reason.icon as any}
                        size={20}
                        color={
                          selectedReason === reason.id
                            ? COLORS.primary
                            : COLORS.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.reasonLabel,
                          selectedReason === reason.id && styles.reasonLabelSelected,
                        ]}
                      >
                        {reason.label}
                      </Text>
                    </View>
                    {selectedReason === reason.id && (
                      <Icon name="check" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Additional Details */}
              <Text style={styles.sectionTitle}>Additional details (optional)</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder="Provide more context about your report..."
                placeholderTextColor={COLORS.textTertiary}
                value={description}
                onChangeText={setDescription}
                editable={!isSubmitting}
                maxLength={500}
              />
              <Text style={styles.charCount}>{description.length}/500</Text>
            </ScrollView>

            {/* Actions */}
            <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 16) + 24 }]}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!selectedReason || isSubmitting) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!selectedReason || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    height: '88%',
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  dealInfo: {
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dealTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  dealSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  reasonsContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
  },
  reasonOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  reasonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  reasonLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  reasonLabelSelected: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  submitButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.error,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textTertiary,
  },
  submitButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.white,
  },
});
