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
} from 'react-native';
import { useLogin } from '../../hooks/useLogin';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTheme } from '../../context/ThemeContext';
import { TYPOGRAPHY, SPACING, SIZES } from '../../theme';
import { STATIC_RADIUS } from '../../theme/constants';

export default function LoginScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, error, handleLogin: login } = useLogin();
  const { clearError } = useAuthStore();

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [emailOrPhone, password]);

  const handleLoginPress = () => {
    login(emailOrPhone, password);
  };

  const handleSignUpPress = () => {
    navigation.navigate('SignUp');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.textPrimary,
    },
    subtitle: {
      ...TYPOGRAPHY.styles.bodyLarge,
      textAlign: 'center',
      color: colors.textSecondary,
      marginBottom: SPACING.xxl,
    },
    form: {
      width: '100%',
    },
    label: {
      ...TYPOGRAPHY.styles.label,
      marginBottom: SPACING.xs,
      color: colors.textPrimary,
      textTransform: 'none',
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: STATIC_RADIUS.md,
      padding: SPACING.md,
      fontSize: TYPOGRAPHY.fontSize.md,
      marginBottom: SPACING.lg,
      backgroundColor: colors.gray50,
      color: colors.textPrimary,
      height: Platform.OS === 'android' ? 56 : SIZES.input.md,
    },
    passwordContainer: {
      position: 'relative',
      marginBottom: SPACING.lg,
    },
    passwordInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: STATIC_RADIUS.md,
      padding: SPACING.md,
      paddingRight: 50,
      fontSize: TYPOGRAPHY.fontSize.md,
      backgroundColor: colors.gray50,
      color: colors.textPrimary,
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
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderRadius: STATIC_RADIUS.md,
      alignItems: 'center',
      marginTop: SPACING.sm,
      minHeight: SIZES.button.lg,
      justifyContent: 'center',
    },
    buttonDisabled: {
      backgroundColor: colors.gray300,
    },
    buttonText: {
      ...TYPOGRAPHY.styles.button,
      color: colors.textInverse,
      lineHeight: Platform.OS === 'android' ? 24 : undefined,
    },
    error: {
      color: colors.white,
      backgroundColor: colors.error,
      padding: SPACING.md,
      borderRadius: STATIC_RADIUS.md,
      marginBottom: SPACING.md,
      textAlign: 'center',
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    signUpLink: {
      marginTop: SPACING.lg,
      alignItems: 'center',
    },
    signUpLinkText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textSecondary,
    },
    signUpLinkBold: {
      color: colors.primary,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    version: {
      marginTop: SPACING.xxl,
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textTertiary,
      textAlign: 'center',
    },
  });

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
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
            textAlignVertical="center"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry={!showPassword}
              editable={!isLoading}
              textAlignVertical="center"
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

          <TouchableOpacity
            style={styles.signUpLink}
            onPress={handleSignUpPress}
            disabled={isLoading}
          >
            <Text style={styles.signUpLinkText}>
              Don't have an account? <Text style={styles.signUpLinkBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>v1.0.0 - MVP Development</Text>
      </View>
    </KeyboardAvoidingView>
  );
}
