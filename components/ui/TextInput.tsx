import React from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
} from 'react-native';
import { useAppStore } from '@/lib/store';
import { colors, borderRadius, spacing } from '@/lib/theme';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function TextInput({
  label,
  error,
  containerStyle,
  style,
  ...props
}: TextInputProps) {
  const { theme } = useAppStore();
  const themeColors = colors[theme];
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: themeColors.textSecondary },
          ]}
        >
          {label}
        </Text>
      )}
      <RNTextInput
        style={[
          styles.input,
          {
            backgroundColor: themeColors.surfaceSecondary,
            borderColor: error
              ? themeColors.error
              : isFocused
              ? themeColors.primary
              : themeColors.border,
            color: themeColors.text,
          },
          style,
        ]}
        placeholderTextColor={themeColors.textMuted}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && (
        <Text style={[styles.error, { color: themeColors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.xs + 2,
  },
  input: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
