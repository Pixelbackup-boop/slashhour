/**
 * VerifyEmailScreen
 * Email verification code input screen
 * Following TypeScript 2025 guidelines
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { trackScreenView } from '../../services/analytics';
import { verificationApi } from '../../services/api';
import { TYPOGRAPHY, SPACING, COLORS, RADIUS } from '../../theme';

// ============================================
// Type Definitions
// ============================================

interface VerifyEmailScreenProps {
  navigation: {
    goBack: () => void;
  };
  route: {
    params: {
      email: string;
    };
  };
}

// ============================================
// Component
// ============================================

export default function VerifyEmailScreen({ navigation, route }: VerifyEmailScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { email } = route.params;

  // State
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(60);

  // Refs for input management
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // ============================================
  // Effects
  // ============================================

  useEffect(() => {
    trackScreenView('VerifyEmail');
    // Auto-focus first input
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Auto-verify when all 6 digits are entered
  useEffect(() => {
    const isComplete = code.every((digit) => digit !== '');
    if (isComplete) {
      handleVerify();
    }
  }, [code]);

  // ============================================
  // Handlers
  // ============================================

  const handleCodeChange = (text: string, index: number) => {
    // Only allow digits
    if (text && !/^\d+$/.test(text)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Handle backspace
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      return;
    }

    setIsVerifying(true);

    try {
      await verificationApi.verifyEmailCode(verificationCode);

      // Success
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Toast.show({
        type: 'success',
        text1: 'Email Verified!',
        text2: 'Your email has been successfully verified',
        position: 'bottom',
      });

      // Navigate back after delay
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      // Error
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      Toast.show({
        type: 'error',
        text1: 'Invalid Code',
        text2: error instanceof Error ? error.message : 'Please check the code and try again',
        position: 'bottom',
      });

      // Clear code
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || isResending) {
      return;
    }

    setIsResending(true);

    try {
      await verificationApi.sendEmailVerification();

      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Toast.show({
        type: 'success',
        text1: 'Code Resent',
        text2: `A new verification code has been sent to ${email}`,
        position: 'bottom',
      });

      // Reset timer
      setTimer(60);
      setCanResend(false);

      // Clear code
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to Resend',
        text2: error instanceof Error ? error.message : 'Please try again later',
        position: 'bottom',
      });
    } finally {
      setIsResending(false);
    }
  };

  // ============================================
  // Render
  // ============================================

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Verify Your Email</Text>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          We sent a 6-digit code to{'\n'}
          <Text style={{ fontWeight: '600' }}>{email}</Text>
        </Text>

        {/* Code Input */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.codeInput,
                {
                  backgroundColor: colors.white,
                  borderColor: digit ? colors.primary : colors.borderLight,
                  color: colors.textPrimary,
                },
              ]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!isVerifying}
            />
          ))}
        </View>

        {/* Loading Indicator */}
        {isVerifying && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Verifying...
            </Text>
          </View>
        )}

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity
              onPress={handleResendCode}
              disabled={isResending}
              activeOpacity={0.7}
            >
              <Text style={[styles.resendText, { color: colors.primary }]}>
                {isResending ? 'Sending...' : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.timerText, { color: colors.textTertiary }]}>
              Resend code in {timer}s
            </Text>
          )}
        </View>

        {/* Info */}
        <View style={[styles.infoBox, { backgroundColor: colors.info + '10' }]}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            💡 Didn't receive the code? Check your spam folder or try resending.
          </Text>
        </View>
      </View>
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 32,
    fontWeight: '300',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl * 2,
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.h1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    lineHeight: 24,
    marginBottom: SPACING.xl * 2,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    fontSize: TYPOGRAPHY.fontSize.h1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  resendContainer: {
    marginBottom: SPACING.xl,
  },
  resendText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  timerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  infoBox: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xl,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
});
