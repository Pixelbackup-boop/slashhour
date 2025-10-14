import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLogin } from '../../hooks/useLogin';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SIZES } from '../../theme';

export default function LoginScreen() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, error, handleLogin: login } = useLogin();

  const handleLoginPress = () => {
    login(emailOrPhone, password);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>🍕 Slashhour</Text>
        <Text style={styles.subtitle}>Essential Deals Platform</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email or Phone</Text>
          <TextInput
            style={styles.input}
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            placeholder="Enter email or phone"
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
            textAlignVertical="center"
            includeFontPadding={false}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry={!showPassword}
              editable={!isLoading}
              textAlignVertical="center"
              includeFontPadding={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLoginPress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>v1.0.0 - MVP Development</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  logo: {
    ...TYPOGRAPHY.styles.displayLarge,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.styles.bodyLarge,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xxl,
  },
  form: {
    width: '100%',
  },
  label: {
    ...TYPOGRAPHY.styles.label,
    marginBottom: SPACING.xs,
    color: COLORS.textPrimary,
    textTransform: 'none',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.gray50,
    height: Platform.OS === 'android' ? 56 : SIZES.input.md,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    paddingRight: 50,
    fontSize: TYPOGRAPHY.fontSize.md,
    backgroundColor: COLORS.gray50,
    height: Platform.OS === 'android' ? 56 : SIZES.input.md,
  },
  eyeButton: {
    position: 'absolute',
    right: SPACING.md,
    top: Platform.OS === 'android' ? 16 : SPACING.md,
    padding: SPACING.xs,
  },
  eyeIcon: {
    fontSize: SIZES.icon.md,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
    height: SIZES.button.lg,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  buttonText: {
    ...TYPOGRAPHY.styles.button,
    color: COLORS.textInverse,
  },
  error: {
    color: COLORS.error,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  version: {
    marginTop: SPACING.xxl,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
});
