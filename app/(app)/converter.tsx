import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  Pressable,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';
import { useAppStore } from '@/lib/store';
import { colors, borderRadius, spacing, shadows } from '@/lib/theme';
import { AppShell } from '@/components/AppShell';
import { TextInput } from '@/components/ui/TextInput';

// Swap icon
function SwapIcon({ size = 24, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 16l-4-4m0 0l4-4m-4 4h18M17 8l4 4m0 0l-4 4m4-4H3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Chevron icon
function ChevronIcon({ size = 20, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Unit conversion data
const CATEGORIES = {
  Length: {
    units: ['m', 'cm', 'mm', 'km', 'in', 'ft', 'yd', 'mi'],
    labels: {
      m: 'Meters',
      cm: 'Centimeters',
      mm: 'Millimeters',
      km: 'Kilometers',
      in: 'Inches',
      ft: 'Feet',
      yd: 'Yards',
      mi: 'Miles',
    },
    toBase: {
      m: 1,
      cm: 0.01,
      mm: 0.001,
      km: 1000,
      in: 0.0254,
      ft: 0.3048,
      yd: 0.9144,
      mi: 1609.344,
    },
  },
  Mass: {
    units: ['kg', 'g', 'mg', 'lb', 'oz', 't'],
    labels: {
      kg: 'Kilograms',
      g: 'Grams',
      mg: 'Milligrams',
      lb: 'Pounds',
      oz: 'Ounces',
      t: 'Metric Tons',
    },
    toBase: {
      kg: 1,
      g: 0.001,
      mg: 0.000001,
      lb: 0.453592,
      oz: 0.0283495,
      t: 1000,
    },
  },
  Temperature: {
    units: ['C', 'F', 'K'],
    labels: {
      C: 'Celsius',
      F: 'Fahrenheit',
      K: 'Kelvin',
    },
    special: true,
  },
  Data: {
    units: ['B', 'KB', 'MB', 'GB', 'TB', 'PB'],
    labels: {
      B: 'Bytes',
      KB: 'Kilobytes',
      MB: 'Megabytes',
      GB: 'Gigabytes',
      TB: 'Terabytes',
      PB: 'Petabytes',
    },
    toBase: {
      B: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
      TB: 1024 * 1024 * 1024 * 1024,
      PB: 1024 * 1024 * 1024 * 1024 * 1024,
    },
  },
};

type Category = keyof typeof CATEGORIES;

// Convert temperature
function convertTemperature(value: number, from: string, to: string): number {
  // Convert to Celsius first
  let celsius: number;
  switch (from) {
    case 'C':
      celsius = value;
      break;
    case 'F':
      celsius = (value - 32) * 5 / 9;
      break;
    case 'K':
      celsius = value - 273.15;
      break;
    default:
      celsius = value;
  }
  
  // Convert from Celsius to target
  switch (to) {
    case 'C':
      return celsius;
    case 'F':
      return celsius * 9 / 5 + 32;
    case 'K':
      return celsius + 273.15;
    default:
      return celsius;
  }
}

// General conversion
function convert(value: number, from: string, to: string, category: Category): number {
  const cat = CATEGORIES[category];
  
  if (category === 'Temperature') {
    return convertTemperature(value, from, to);
  }
  
  const toBase = (cat as any).toBase;
  const baseValue = value * toBase[from];
  return baseValue / toBase[to];
}

// Unit picker modal
function UnitPickerModal({
  visible,
  onClose,
  units,
  labels,
  selectedUnit,
  onSelect,
  theme,
}: {
  visible: boolean;
  onClose: () => void;
  units: string[];
  labels: Record<string, string>;
  selectedUnit: string;
  onSelect: (unit: string) => void;
  theme: 'light' | 'dark';
}) {
  const themeColors = colors[theme];
  
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={[styles.modalContent, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.modalTitle, { color: themeColors.text }]}>Select Unit</Text>
          <FlatList
            data={units}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.unitOption,
                  selectedUnit === item && { backgroundColor: themeColors.primaryLight },
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.unitOptionText,
                    { color: selectedUnit === item ? themeColors.primary : themeColors.text },
                  ]}
                >
                  {labels[item]} ({item})
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Pressable>
    </Modal>
  );
}

export default function ConverterScreen() {
  const { t } = useTranslation();
  const { theme } = useAppStore();
  const themeColors = colors[theme];
  
  const [category, setCategory] = useState<Category>('Length');
  const [fromUnit, setFromUnit] = useState(CATEGORIES['Length'].units[0]);
  const [toUnit, setToUnit] = useState(CATEGORIES['Length'].units[1]);
  const [inputValue, setInputValue] = useState('1');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  
  const swapAnim = React.useRef(new Animated.Value(0)).current;
  
  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    setFromUnit(CATEGORIES[cat].units[0]);
    setToUnit(CATEGORIES[cat].units[1]);
    setInputValue('1');
  };
  
  const handleSwap = () => {
    Animated.sequence([
      Animated.timing(swapAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(swapAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };
  
  const result = useMemo(() => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) return '';
    
    try {
      const converted = convert(value, fromUnit, toUnit, category);
      return converted.toLocaleString(undefined, { maximumFractionDigits: 6 });
    } catch {
      return 'Error';
    }
  }, [inputValue, fromUnit, toUnit, category]);
  
  const categoryData = CATEGORIES[category];
  
  const swapRotation = swapAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  
  return (
    <AppShell showHistory={false}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <Text style={[styles.title, { color: themeColors.text }]}>
            {t('unitConverter')}
          </Text>
          
          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContainer}
          >
            {(Object.keys(CATEGORIES) as Category[]).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryTab,
                  {
                    backgroundColor: category === cat ? themeColors.primary : themeColors.surfaceSecondary,
                  },
                ]}
                onPress={() => handleCategoryChange(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    { color: category === cat ? '#ffffff' : themeColors.text },
                  ]}
                >
                  {t(cat.toLowerCase())}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* From Input */}
          <View style={[styles.unitCard, { backgroundColor: themeColors.surfaceSecondary, borderColor: themeColors.border }]}>
            <View style={styles.unitCardHeader}>
              <Text style={[styles.unitCardLabel, { color: themeColors.textMuted }]}>
                {t('from')}
              </Text>
              <TouchableOpacity
                style={styles.unitSelector}
                onPress={() => setShowFromPicker(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.unitSelectorText, { color: themeColors.text }]}>
                  {fromUnit}
                </Text>
                <ChevronIcon size={16} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="decimal-pad"
              placeholder="0"
              style={styles.valueInput}
              containerStyle={{ marginTop: spacing.xs }}
            />
          </View>
          
          {/* Swap Button */}
          <View style={styles.swapContainer}>
            <Animated.View style={{ transform: [{ rotate: swapRotation }] }}>
              <TouchableOpacity
                style={[styles.swapButton, { backgroundColor: themeColors.primary }]}
                onPress={handleSwap}
                activeOpacity={0.8}
              >
                <SwapIcon size={20} color="#ffffff" />
              </TouchableOpacity>
            </Animated.View>
          </View>
          
          {/* To Output */}
          <View style={[styles.unitCard, { backgroundColor: themeColors.surfaceSecondary, borderColor: themeColors.border }]}>
            <View style={styles.unitCardHeader}>
              <Text style={[styles.unitCardLabel, { color: themeColors.textMuted }]}>
                {t('to')}
              </Text>
              <TouchableOpacity
                style={styles.unitSelector}
                onPress={() => setShowToPicker(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.unitSelectorText, { color: themeColors.text }]}>
                  {toUnit}
                </Text>
                <ChevronIcon size={16} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.resultValue, { color: themeColors.primary }]}>
              {result || '0'}
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Unit Picker Modals */}
      <UnitPickerModal
        visible={showFromPicker}
        onClose={() => setShowFromPicker(false)}
        units={categoryData.units}
        labels={categoryData.labels}
        selectedUnit={fromUnit}
        onSelect={setFromUnit}
        theme={theme}
      />
      <UnitPickerModal
        visible={showToPicker}
        onClose={() => setShowToPicker(false)}
        units={categoryData.units}
        labels={categoryData.labels}
        selectedUnit={toUnit}
        onSelect={setToUnit}
        theme={theme}
      />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  card: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  categoryScroll: {
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  categoryContainer: {
    gap: spacing.sm,
  },
  categoryTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  unitCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
  },
  unitCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitCardLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  unitSelectorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  valueInput: {
    fontSize: 32,
    fontWeight: '600',
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  swapContainer: {
    alignItems: 'center',
    marginVertical: -spacing.md,
    zIndex: 1,
  },
  swapButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    maxHeight: 400,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  unitOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  unitOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
