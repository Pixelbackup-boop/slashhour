import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSignUp } from '../../hooks/useSignUp';
import { trackScreenView } from '../../services/analytics';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SIZES } from '../../theme';

export default function SignUpScreen({ navigation }: any) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { formData, isLoading, error, updateField, handleSignUp, resetForm } = useSignUp();

  useEffect(() => {
    trackScreenView('SignUpScreen');
  }, []);

  const handleSignUpPress = async () => {
    const result = await handleSignUp();
    if (result.success) {
      // Navigate to login screen after successful registration
      navigation.navigate('Login');
    }
  };

  const handleLoginPress = () => {
    resetForm();
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.logo}>🍕 Slashhour</Text>
          <Text style={styles.subtitle}>Join the Essential Deals Platform</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Enter your full name"
              autoCapitalize="words"
              editable={!isLoading}
              textAlignVertical="center"
              includeFontPadding={false}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="Enter your email"
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
              textAlignVertical="center"
              includeFontPadding={false}
            />

            <Text style={styles.label}>Phone (Optional)</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              editable={!isLoading}
              textAlignVertical="center"
              includeFontPadding={false}
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                placeholder="Enter password (min 8 characters)"
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

            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
                textAlignVertical="center"
                includeFontPadding={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSignUpPress}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={handleLoginPress}
              disabled={isLoading}
            >
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkBold}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.version}>v1.0.0 - MVP Development</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xxl,
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
  loginLink: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  loginLinkBold: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  version: {
    marginTop: SPACING.xxl,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
});
