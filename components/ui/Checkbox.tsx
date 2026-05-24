import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { useAppStore } from '@/lib/store';
import { colors, borderRadius, spacing } from '@/lib/theme';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, disabled = false }: CheckboxProps) {
  const { theme } = useAppStore();
  const themeColors = colors[theme];
  const scaleAnim = React.useRef(new Animated.Value(checked ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: checked ? 1 : 0,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [checked, scaleAnim]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => !disabled && onChange(!checked)}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: checked ? themeColors.primary : 'transparent',
            borderColor: checked ? themeColors.primary : themeColors.border,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.checkmark,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={[styles.checkmarkShort, { backgroundColor: '#fff' }]} />
          <View style={[styles.checkmarkLong, { backgroundColor: '#fff' }]} />
        </Animated.View>
      </View>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: disabled ? themeColors.textMuted : themeColors.textSecondary,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm - 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkShort: {
    position: 'absolute',
    width: 5,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }, { translateX: -3 }, { translateY: 1 }],
  },
  checkmarkLong: {
    position: 'absolute',
    width: 9,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }, { translateX: 1 }, { translateY: 0 }],
  },
  label: {
    marginLeft: spacing.sm,
    fontSize: 14,
    fontWeight: '500',
  },
});
