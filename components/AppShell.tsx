import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  Switch,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/lib/store';
import { colors, borderRadius, spacing, shadows } from '@/lib/theme';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(280, SCREEN_WIDTH * 0.8);

// Icons
function MenuIcon({ size = 24, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12h18M3 6h18M3 18h18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function CalculatorIcon({ size = 24, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="2" width="16" height="20" rx="2" stroke={color} strokeWidth="2" />
      <Rect x="7" y="5" width="10" height="4" rx="1" fill={color} />
      <Circle cx="8" cy="13" r="1" fill={color} />
      <Circle cx="12" cy="13" r="1" fill={color} />
      <Circle cx="16" cy="13" r="1" fill={color} />
      <Circle cx="8" cy="17" r="1" fill={color} />
      <Circle cx="12" cy="17" r="1" fill={color} />
      <Circle cx="16" cy="17" r="1" fill={color} />
    </Svg>
  );
}

function GraphIcon({ size = 24, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 3v18h18" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M7 14l4-4 4 4 5-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ConvertIcon({ size = 24, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 16l-4-4m0 0l4-4m-4 4h18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 8l4 4m0 0l-4 4m4-4H3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function MatrixIcon({ size = 24, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
      <Rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
      <Rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
      <Rect x="14" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

function MoonIcon({ size = 24, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function LogoutIcon({ size = 24, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function HistoryIcon({ size = 24, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <Path d="M12 7v5l3 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function CloseIcon({ size = 24, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  showHistory?: boolean;
  onHistoryPress?: () => void;
}

export function AppShell({ children, title = 'CalcPro', showHistory = true, onHistoryPress }: AppShellProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme, logout, isDrawerOpen, setDrawerOpen } = useAppStore();
  const themeColors = colors[theme];
  
  const drawerAnim = React.useRef(new Animated.Value(0)).current;
  const overlayAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(drawerAnim, {
        toValue: isDrawerOpen ? 1 : 0,
        friction: 8,
        tension: 65,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: isDrawerOpen ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isDrawerOpen, drawerAnim, overlayAnim]);

  const translateX = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  const menuItems = [
    { key: 'calculator', icon: CalculatorIcon, route: '/(app)/calculator' },
    { key: 'graphs', icon: GraphIcon, route: '/(app)/graphs' },
    { key: 'converter', icon: ConvertIcon, route: '/(app)/converter' },
    { key: 'matrixCas', icon: MatrixIcon, route: '/(app)/matrix-cas' },
  ];

  const handleNavigation = (route: string) => {
    setDrawerOpen(false);
    setTimeout(() => {
      router.push(route as any);
    }, 100);
  };

  const handleLogout = () => {
    setDrawerOpen(false);
    logout();
    router.replace('/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={[styles.headerSafeArea, { backgroundColor: themeColors.surface }]}>
        <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
          <TouchableOpacity
            onPress={() => setDrawerOpen(true)}
            style={styles.headerButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MenuIcon size={24} color={themeColors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <View style={[styles.headerIcon, { backgroundColor: themeColors.primary }]}>
              <CalculatorIcon size={16} color="#ffffff" />
            </View>
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>{title}</Text>
          </View>
          
          {showHistory && onHistoryPress ? (
            <TouchableOpacity
              onPress={onHistoryPress}
              style={styles.headerButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <HistoryIcon size={24} color={themeColors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerButton} />
          )}
        </View>
      </SafeAreaView>

      {/* Main Content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayAnim,
            },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setDrawerOpen(false)} />
        </Animated.View>
      )}

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: themeColors.surface,
            transform: [{ translateX }],
          },
        ]}
      >
        <SafeAreaView style={styles.drawerSafeArea}>
          {/* Drawer Header */}
          <View style={[styles.drawerHeader, { borderBottomColor: themeColors.border }]}>
            <View style={styles.drawerHeaderContent}>
              <View style={[styles.drawerIcon, { backgroundColor: themeColors.primary }]}>
                <CalculatorIcon size={20} color="#ffffff" />
              </View>
              <Text style={[styles.drawerTitle, { color: themeColors.text }]}>CalcPro</Text>
            </View>
            <TouchableOpacity
              onPress={() => setDrawerOpen(false)}
              style={[styles.closeButton, { backgroundColor: themeColors.surfaceSecondary }]}
            >
              <CloseIcon size={18} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <ScrollView style={styles.drawerMenu} showsVerticalScrollIndicator={false}>
            {menuItems.map((item) => {
              const isActive = pathname.includes(item.route.replace('/(app)', ''));
              const Icon = item.icon;
              
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.menuItem,
                    isActive && { backgroundColor: themeColors.primaryLight },
                  ]}
                  onPress={() => handleNavigation(item.route)}
                  activeOpacity={0.7}
                >
                  <Icon
                    size={22}
                    color={isActive ? themeColors.primary : themeColors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.menuItemText,
                      { color: isActive ? themeColors.primary : themeColors.text },
                      isActive && { fontWeight: '600' },
                    ]}
                  >
                    {t(item.key)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Drawer Footer */}
          <View style={[styles.drawerFooter, { borderTopColor: themeColors.border }]}>
            <View style={styles.menuItem}>
              <MoonIcon size={22} color={themeColors.textSecondary} />
              <Text style={[styles.menuItemText, { color: themeColors.text, flex: 1 }]}>
                {t('darkMode')}
              </Text>
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: themeColors.border, true: themeColors.primary }}
                thumbColor="#ffffff"
              />
            </View>
            
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <LogoutIcon size={22} color={themeColors.error} />
              <Text style={[styles.menuItemText, { color: themeColors.error }]}>
                {t('logout')}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSafeArea: {
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 100,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    zIndex: 101,
    ...shadows.lg,
  },
  drawerSafeArea: {
    flex: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  drawerHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  drawerIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerMenu: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  drawerFooter: {
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
});
