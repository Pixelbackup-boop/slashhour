/**
 * Paper TextInput Examples
 * Reusable input components using React Native Paper
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import type { TextInputProps } from 'react-native-paper';

interface PaperInputProps extends Omit<TextInputProps, 'mode'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
  icon?: string;
}

/**
 * Standard Text Input
 * Outlined mode with optional icon and helper text
 */
export function PaperInput({
  label,
  value,
  onChangeText,
  error,
  helperText,
  icon,
  ...rest
}: PaperInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        mode="outlined"
        error={!!error}
        left={icon ? <TextInput.Icon icon={icon} /> : undefined}
        {...rest}
      />
      {(error || helperText) && (
        <HelperText type={error ? 'error' : 'info'} visible={!!(error || helperText)}>
          {error || helperText}
        </HelperText>
      )}
    </View>
  );
}

/**
 * Password Input
 * With show/hide toggle
 */
export function PasswordInput({
  label = 'Password',
  value,
  onChangeText,
  error,
  helperText,
  ...rest
}: Omit<PaperInputProps, 'icon'>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        mode="outlined"
        error={!!error}
        secureTextEntry={!showPassword}
        left={<TextInput.Icon icon="lock" />}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
        {...rest}
      />
      {(error || helperText) && (
        <HelperText type={error ? 'error' : 'info'} visible={!!(error || helperText)}>
          {error || helperText}
        </HelperText>
      )}
    </View>
  );
}

/**
 * Email Input
 * Pre-configured for email addresses
 */
export function EmailInput({
  label = 'Email',
  value,
  onChangeText,
  error,
  helperText,
  ...rest
}: Omit<PaperInputProps, 'icon' | 'keyboardType' | 'autoCapitalize'>) {
  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        mode="outlined"
        error={!!error}
        keyboardType="email-address"
        autoCapitalize="none"
        left={<TextInput.Icon icon="email" />}
        {...rest}
      />
      {(error || helperText) && (
        <HelperText type={error ? 'error' : 'info'} visible={!!(error || helperText)}>
          {error || helperText}
        </HelperText>
      )}
    </View>
  );
}

/**
 * Search Input
 * Pre-configured for search with clear button
 */
export function SearchInput({
  label = 'Search',
  value,
  onChangeText,
  placeholder = 'Search...',
  ...rest
}: Omit<PaperInputProps, 'icon' | 'error' | 'helperText'>) {
  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      mode="outlined"
      placeholder={placeholder}
      left={<TextInput.Icon icon="magnify" />}
      right={
        value ? (
          <TextInput.Icon
            icon="close"
            onPress={() => onChangeText('')}
          />
        ) : undefined
      }
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
});
