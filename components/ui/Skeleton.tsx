import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useAppStore } from '@/lib/store';
import { colors, borderRadius, spacing } from '@/lib/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius: br = borderRadius.md,
  style,
}: SkeletonProps) {
  const { theme } = useAppStore();
  const themeColors = colors[theme];
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: br,
          backgroundColor: themeColors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonText({ lines = 3, lastLineWidth = '60%' }: { lines?: number; lastLineWidth?: string }) {
  return (
    <View style={styles.textContainer}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          height={16}
          style={{ marginBottom: index < lines - 1 ? spacing.sm : 0 }}
        />
      ))}
    </View>
  );
}

export function SkeletonButton() {
  return <Skeleton width="100%" height={52} borderRadius={borderRadius.lg} />;
}

export function SkeletonCard() {
  const { theme } = useAppStore();
  const themeColors = colors[theme];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: themeColors.surface, borderColor: themeColors.border },
      ]}
    >
      <Skeleton width={60} height={60} borderRadius={borderRadius.lg} />
      <View style={styles.cardContent}>
        <Skeleton width="70%" height={20} style={{ marginBottom: spacing.sm }} />
        <Skeleton width="100%" height={16} style={{ marginBottom: spacing.xs }} />
        <Skeleton width="40%" height={16} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  cardContent: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
});
