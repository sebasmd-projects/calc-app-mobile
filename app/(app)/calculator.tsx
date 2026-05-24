import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  Pressable,
  TextInput,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as math from 'mathjs';
import { useAppStore, HistoryItem } from '@/lib/store';
import { colors, borderRadius, spacing, shadows } from '@/lib/theme';
import { AppShell } from '@/components/AppShell';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 380;

// Delete icon
function DeleteIcon({ size = 24, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M18 9l-6 6M12 9l6 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// History modal component
function HistoryModal({
  visible,
  onClose,
  history,
  onSelect,
  onClear,
  theme,
}: {
  visible: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  theme: 'light' | 'dark';
}) {
  const { t } = useTranslation();
  const themeColors = colors[theme];
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 65,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(300);
    }
  }, [visible, slideAnim]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.historyModal,
            {
              backgroundColor: themeColors.surface,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={[styles.historyHeader, { borderBottomColor: themeColors.border }]}>
              <Text style={[styles.historyTitle, { color: themeColors.text }]}>
                {t('history')}
              </Text>
              {history.length > 0 && (
                <TouchableOpacity onPress={onClear}>
                  <Text style={[styles.clearButton, { color: themeColors.error }]}>
                    {t('clearHistory')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
              {history.length === 0 ? (
                <Text style={[styles.emptyHistory, { color: themeColors.textMuted }]}>
                  {t('noHistory')}
                </Text>
              ) : (
                history.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.historyItem, { borderBottomColor: themeColors.border }]}
                    onPress={() => {
                      onSelect(item);
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.historyExpression, { color: themeColors.textSecondary }]}>
                      {item.expression}
                    </Text>
                    <Text style={[styles.historyResult, { color: themeColors.text }]}>
                      = {item.result}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

// LaTeX-like display formatter
function formatForDisplay(expr: string): string {
  if (!expr) return '';
  
  // Replace operators with display symbols
  let formatted = expr
    .replace(/\*/g, ' · ')
    .replace(/\//g, ' ÷ ')
    .replace(/\+/g, ' + ')
    .replace(/-/g, ' − ')
    .replace(/\^/g, '^')
    .replace(/sqrt\(/g, '√(')
    .replace(/pi/g, 'π');
  
  return formatted;
}

// Format expression with LaTeX-like fractions for display
function formatLatexStyle(expr: string, result: string): { formula: string; hasResult: boolean } {
  if (!expr) return { formula: '0', hasResult: false };
  
  // Simple fraction detection for display
  const parts = expr.split('/');
  if (parts.length === 2 && !parts[0].includes('(') && !parts[1].includes('+') && !parts[1].includes('-')) {
    // Could display as fraction
  }
  
  let formula = formatForDisplay(expr);
  return { formula, hasResult: !!result };
}

const SCIENTIFIC_BUTTONS = [
  ['sin', 'cos', 'tan', 'RAD'],
  ['asin', 'acos', 'atan', 'π'],
  ['ln', 'log', 'e', 'x²'],
  ['√', '^', '!', 'exp'],
];

const BASIC_BUTTONS = [
  ['C', '(', ')', '+'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '÷'],
  ['0', '.', '⌫', '='],
];

export default function CalculatorScreen() {
  const { t } = useTranslation();
  const { theme, angleUnit, toggleAngleUnit, addToHistory, history, clearHistory } = useAppStore();
  const themeColors = colors[theme];

  const [expression, setExpression] = useState('');
  const [previewResult, setPreviewResult] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  const buttonAnims = useRef<{ [key: string]: Animated.Value }>({});

  // Get or create animation value for button
  const getButtonAnim = (key: string) => {
    if (!buttonAnims.current[key]) {
      buttonAnims.current[key] = new Animated.Value(1);
    }
    return buttonAnims.current[key];
  };

  // Animate button press
  const animateButton = (key: string) => {
    const anim = getButtonAnim(key);
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(anim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Calculate preview in real-time
  const calculatePreview = useCallback((expr: string) => {
    if (!expr) {
      setPreviewResult('');
      return;
    }
    
    try {
      // Prepare expression for evaluation
      let evalExpr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/π/g, 'pi');
      
      // Handle angle unit for trig functions
      if (angleUnit === 'deg') {
        evalExpr = evalExpr.replace(/(sin|cos|tan)\(([^)]+)\)/g, '$1($2 deg)');
      }
      
      const result = math.evaluate(evalExpr);
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        const formatted = math.format(result, { precision: 10 });
        setPreviewResult(formatted);
      } else {
        setPreviewResult('');
      }
    } catch {
      setPreviewResult('');
    }
  }, [angleUnit]);

  useEffect(() => {
    calculatePreview(expression);
  }, [expression, calculatePreview]);

  // Handle button press
  const handleButtonPress = (btn: string) => {
    animateButton(btn);
    
    switch (btn) {
      case 'C':
        setExpression('');
        setPreviewResult('');
        break;
      case '⌫':
        setExpression(prev => prev.slice(0, -1));
        break;
      case '=':
        if (expression && previewResult) {
          addToHistory({
            expression: expression,
            latex: expression,
            result: previewResult,
          });
          setExpression(previewResult);
          setPreviewResult('');
        }
        break;
      case 'RAD':
        toggleAngleUnit();
        break;
      case '×':
        setExpression(prev => prev + '*');
        break;
      case '÷':
        setExpression(prev => prev + '/');
        break;
      case '−':
        setExpression(prev => prev + '-');
        break;
      case 'π':
        setExpression(prev => prev + 'pi');
        break;
      case 'x²':
        setExpression(prev => prev + '^2');
        break;
      case '√':
        setExpression(prev => prev + 'sqrt(');
        break;
      case 'sin':
      case 'cos':
      case 'tan':
      case 'asin':
      case 'acos':
      case 'atan':
      case 'ln':
      case 'log':
      case 'exp':
        setExpression(prev => prev + btn + '(');
        break;
      default:
        setExpression(prev => prev + btn);
    }
  };

  // Handle touch-to-edit on display
  const handleDisplayPress = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Handle history item selection
  const handleHistorySelect = (item: HistoryItem) => {
    setExpression(item.expression);
    setPreviewResult(item.result);
  };

  // Render button
  const renderButton = (btn: string, isScientific = false) => {
    const isAction = ['C', '⌫', '='].includes(btn);
    const isOperator = ['+', '×', '−', '÷'].includes(btn);
    const isRAD = btn === 'RAD';
    
    const anim = getButtonAnim(btn);
    
    let bgColor = themeColors.surface;
    let textColor = themeColors.text;
    
    if (isAction) {
      if (btn === 'C') {
        bgColor = themeColors.primary;
        textColor = '#ffffff';
      } else if (btn === '=') {
        bgColor = themeColors.primary;
        textColor = '#ffffff';
      } else {
        bgColor = themeColors.primary;
        textColor = '#ffffff';
      }
    } else if (isOperator) {
      bgColor = theme === 'dark' ? themeColors.surfaceSecondary : themeColors.primaryLight;
      textColor = themeColors.primary;
    } else if (isScientific) {
      bgColor = themeColors.surfaceSecondary;
      textColor = themeColors.text;
    }
    
    const displayText = isRAD ? angleUnit.toUpperCase() : btn;
    
    return (
      <Animated.View
        key={btn}
        style={[
          styles.buttonWrapper,
          { transform: [{ scale: anim }] },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            isScientific && styles.scientificButton,
            { backgroundColor: bgColor, borderColor: themeColors.border },
            !isAction && !isOperator && !isScientific && { borderWidth: 1 },
          ]}
          onPress={() => handleButtonPress(btn)}
          activeOpacity={0.7}
        >
          {btn === '⌫' ? (
            <DeleteIcon size={isSmallScreen ? 20 : 24} color={textColor} />
          ) : (
            <Text
              style={[
                styles.buttonText,
                isScientific && styles.scientificButtonText,
                { color: textColor },
              ]}
            >
              {displayText}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const displayFormula = formatForDisplay(expression);

  return (
    <AppShell showHistory onHistoryPress={() => setShowHistory(true)}>
      <View style={styles.container}>
        {/* Display Area */}
        <TouchableOpacity
          style={[
            styles.display,
            { backgroundColor: themeColors.displayBg },
          ]}
          onPress={handleDisplayPress}
          activeOpacity={0.9}
        >
          <View style={styles.displayHeader}>
            <Text style={[styles.angleUnit, { color: themeColors.displayMuted }]}>
              {angleUnit.toUpperCase()}
            </Text>
            {expression && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.formulaScrollContent}
              >
                <Text style={[styles.formula, { color: themeColors.displayMuted }]}>
                  {displayFormula}
                </Text>
              </ScrollView>
            )}
          </View>
          
          {isEditing ? (
            <TextInput
              ref={inputRef}
              style={[styles.editInput, { color: themeColors.displayText }]}
              value={expression}
              onChangeText={setExpression}
              onBlur={() => setIsEditing(false)}
              autoFocus
              keyboardType="default"
              selectionColor={themeColors.primary}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.resultScrollContent}
            >
              <Text style={[styles.result, { color: themeColors.displayText }]}>
                {previewResult ? `= ${previewResult}` : expression || '0'}
              </Text>
            </ScrollView>
          )}
        </TouchableOpacity>

        {/* Keypad */}
        <View style={styles.keypad}>
          {/* Scientific buttons */}
          <View style={styles.scientificPad}>
            {SCIENTIFIC_BUTTONS.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.buttonRow}>
                {row.map(btn => renderButton(btn, true))}
              </View>
            ))}
          </View>
          
          {/* Basic buttons */}
          <View style={styles.basicPad}>
            {BASIC_BUTTONS.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.buttonRow}>
                {row.map(btn => renderButton(btn, false))}
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* History Modal */}
      <HistoryModal
        visible={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onSelect={handleHistorySelect}
        onClear={clearHistory}
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
  display: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    minHeight: 160,
    justifyContent: 'flex-end',
    marginBottom: spacing.md,
  },
  displayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  angleUnit: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 2,
  },
  formulaScrollContent: {
    alignItems: 'flex-end',
  },
  formula: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'right',
  },
  resultScrollContent: {
    alignItems: 'flex-end',
    minWidth: '100%',
    justifyContent: 'flex-end',
  },
  result: {
    fontSize: isSmallScreen ? 40 : 48,
    fontWeight: '600',
    textAlign: 'right',
  },
  editInput: {
    fontSize: isSmallScreen ? 32 : 40,
    fontWeight: '600',
    textAlign: 'right',
    padding: 0,
  },
  keypad: {
    flex: 1,
    gap: spacing.sm,
  },
  scientificPad: {
    gap: spacing.xs,
  },
  basicPad: {
    flex: 1,
    gap: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    flex: 1,
    aspectRatio: 1.5,
    minHeight: isSmallScreen ? 48 : 56,
    maxHeight: 64,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scientificButton: {
    aspectRatio: 2,
    minHeight: isSmallScreen ? 40 : 48,
    maxHeight: 52,
  },
  buttonText: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: '500',
  },
  scientificButtonText: {
    fontSize: isSmallScreen ? 14 : 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  historyModal: {
    width: 320,
    maxWidth: '90%',
    height: '100%',
    borderTopLeftRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
    ...shadows.lg,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  historyList: {
    flex: 1,
    padding: spacing.md,
  },
  emptyHistory: {
    textAlign: 'center',
    marginTop: spacing.xl,
    fontSize: 14,
  },
  historyItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  historyExpression: {
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  historyResult: {
    fontSize: 20,
    fontWeight: '600',
  },
});
