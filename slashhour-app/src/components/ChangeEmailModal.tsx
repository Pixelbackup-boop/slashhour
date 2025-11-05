/**
 * ChangeEmailModal
 * Cross-platform modal for changing user email
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';
import { usersApi } from '../services/api';
import { TYPOGRAPHY, SPACING, COLORS, RADIUS } from '../theme';

interface ChangeEmailModalProps {
  visible: boolean;
  currentEmail: string | null;
  onClose: () => void;
  onSuccess: (newEmail: string) => void;
}

export default function ChangeEmailModal({
  visible,
  currentEmail,
  onClose,
  onSuccess,
}: ChangeEmailModalProps) {
  const { colors } = useTheme();
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!newEmail || !newEmail.includes('@')) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address',
        position: 'bottom',
      });
      return;
    }

    if (newEmail === currentEmail) {
      Toast.show({
        type: 'error',
        text1: 'Same Email',
        text2: 'This is already your current email',
        position: 'bottom',
      });
      return;
    }

    setIsLoading(true);

    try {
      await usersApi.changeEmail(newEmail);

      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Toast.show({
        type: 'success',
        text1: 'Email Updated',
        text2: 'Verification email sent to your new address',
        position: 'bottom',
      });

      onSuccess(newEmail);
      setNewEmail('');
      onClose();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: error instanceof Error ? error.message : 'Could not update email',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewEmail('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.white }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Change Email</Text>

          <Text style={[styles.currentValue, { color: colors.textSecondary }]}>
            Current: {currentEmail || 'Not set'}
          </Text>

          <TextInput
            style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.textPrimary }]}
            placeholder="New Email Address"
            placeholderTextColor={colors.textTertiary}
            value={newEmail}
            onChangeText={setNewEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: colors.borderLight }]}
              onPress={handleClose}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.white }]}>Change</Text>
              )}
            </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.h2,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  currentValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {},
  submitButton: {},
  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
