import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as math from 'mathjs';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { useAppStore } from '@/lib/store';
import { colors, borderRadius, spacing, shadows } from '@/lib/theme';
import { AppShell } from '@/components/AppShell';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';

// Icons
function FunctionIcon({ size = 24, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 4v16M15 4v16M4 9h16M4 15h16"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
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

function ChevronIcon({ size = 20, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

// Dropdown component
function Dropdown({
  value,
  options,
  onChange,
  theme,
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  theme: 'light' | 'dark';
}) {
  const [visible, setVisible] = useState(false);
  const themeColors = colors[theme];
  const selectedOption = options.find(o => o.value === value);
  
  return (
    <>
      <TouchableOpacity
        style={[styles.dropdown, { backgroundColor: themeColors.surfaceSecondary, borderColor: themeColors.border }]}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownText, { color: themeColors.text }]}>
          {selectedOption?.label || value}
        </Text>
        <ChevronIcon size={18} color={themeColors.textSecondary} />
      </TouchableOpacity>
      
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.surface }]}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    value === item.value && { backgroundColor: themeColors.primaryLight },
                  ]}
                  onPress={() => {
                    onChange(item.value);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: value === item.value ? themeColors.primary : themeColors.text },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

// Tab component
function TabBar({
  activeTab,
  onTabChange,
  theme,
}: {
  activeTab: 'cas' | 'matrix';
  onTabChange: (tab: 'cas' | 'matrix') => void;
  theme: 'light' | 'dark';
}) {
  const { t } = useTranslation();
  const themeColors = colors[theme];
  
  return (
    <View style={[styles.tabBar, { backgroundColor: themeColors.surfaceSecondary }]}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'cas' && { backgroundColor: themeColors.surface },
        ]}
        onPress={() => onTabChange('cas')}
        activeOpacity={0.7}
      >
        <FunctionIcon
          size={16}
          color={activeTab === 'cas' ? themeColors.primary : themeColors.textSecondary}
        />
        <Text
          style={[
            styles.tabText,
            { color: activeTab === 'cas' ? themeColors.primary : themeColors.textSecondary },
          ]}
        >
          {t('casAlgebra')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'matrix' && { backgroundColor: themeColors.surface },
        ]}
        onPress={() => onTabChange('matrix')}
        activeOpacity={0.7}
      >
        <MatrixIcon
          size={16}
          color={activeTab === 'matrix' ? themeColors.primary : themeColors.textSecondary}
        />
        <Text
          style={[
            styles.tabText,
            { color: activeTab === 'matrix' ? themeColors.primary : themeColors.textSecondary },
          ]}
        >
          {t('matrices')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// CAS Component
function CASPanel({ theme }: { theme: 'light' | 'dark' }) {
  const { t } = useTranslation();
  const themeColors = colors[theme];
  const { addToHistory } = useAppStore();
  
  const [casInput, setCasInput] = useState('');
  const [casAction, setCasAction] = useState<'simplify' | 'derivative'>('simplify');
  const [casResult, setCasResult] = useState('');
  const [casError, setCasError] = useState('');
  
  const casOptions = [
    { label: t('simplify'), value: 'simplify' },
    { label: t('derivative'), value: 'derivative' },
  ];
  
  const handleCalculate = () => {
    if (!casInput) return;
    
    setCasError('');
    setCasResult('');
    
    try {
      let result: string;
      
      if (casAction === 'simplify') {
        const simplified = math.simplify(casInput);
        result = simplified.toString();
      } else {
        const derived = math.derivative(casInput, 'x');
        result = derived.toString();
      }
      
      setCasResult(result);
      
      addToHistory({
        expression: `${casAction}(${casInput})`,
        latex: `${casAction}(${casInput})`,
        result: result,
      });
    } catch (e: any) {
      setCasError(t('invalidExpression'));
    }
  };
  
  return (
    <View style={styles.panelContent}>
      <View style={styles.panelHeader}>
        <CalculatorIcon size={24} color={themeColors.primary} />
        <Text style={[styles.panelTitle, { color: themeColors.text }]}>
          {t('symbolicCas')}
        </Text>
      </View>
      
      <Dropdown
        value={casAction}
        options={casOptions}
        onChange={(v) => setCasAction(v as 'simplify' | 'derivative')}
        theme={theme}
      />
      
      <TextInput
        value={casInput}
        onChangeText={setCasInput}
        placeholder={t('enterExpression')}
        containerStyle={styles.inputContainer}
      />
      
      <Button
        title={t('evaluate')}
        onPress={handleCalculate}
        fullWidth
      />
      
      {casError && (
        <View style={[styles.resultBox, { backgroundColor: themeColors.error + '20', borderColor: themeColors.error }]}>
          <Text style={[styles.resultText, { color: themeColors.error }]}>
            {casError}
          </Text>
        </View>
      )}
      
      {casResult && (
        <View style={[styles.resultBox, { backgroundColor: themeColors.surfaceSecondary, borderColor: themeColors.border }]}>
          <Text style={[styles.resultLabel, { color: themeColors.textMuted }]}>
            {t('result')}:
          </Text>
          <Text style={[styles.resultValue, { color: themeColors.text }]}>
            {casResult}
          </Text>
        </View>
      )}
    </View>
  );
}

// Matrix Component
function MatrixPanel({ theme }: { theme: 'light' | 'dark' }) {
  const { t } = useTranslation();
  const themeColors = colors[theme];
  const { addToHistory } = useAppStore();
  
  const [matrixA, setMatrixA] = useState('[[1, 2], [3, 4]]');
  const [matrixB, setMatrixB] = useState('[[5, 6], [7, 8]]');
  const [matrixAction, setMatrixAction] = useState<'multiply' | 'add' | 'det' | 'inv'>('multiply');
  const [matrixResult, setMatrixResult] = useState('');
  const [matrixError, setMatrixError] = useState('');
  
  const matrixOptions = [
    { label: t('multiplyAB'), value: 'multiply' },
    { label: t('addAB'), value: 'add' },
    { label: t('determinant'), value: 'det' },
    { label: t('inverse'), value: 'inv' },
  ];
  
  const handleCalculate = () => {
    setMatrixError('');
    setMatrixResult('');
    
    try {
      let result;
      let expLabel = '';
      
      const A = math.evaluate(matrixA);
      const B = (matrixAction === 'add' || matrixAction === 'multiply') 
        ? math.evaluate(matrixB) 
        : null;
      
      switch (matrixAction) {
        case 'add':
          result = math.add(A, B);
          expLabel = 'A + B';
          break;
        case 'multiply':
          result = math.multiply(A, B);
          expLabel = 'A × B';
          break;
        case 'det':
          result = math.det(A);
          expLabel = 'det(A)';
          break;
        case 'inv':
          result = math.inv(A);
          expLabel = 'A⁻¹';
          break;
      }
      
      const resultStr = math.format(result, { precision: 6 });
      setMatrixResult(resultStr);
      
      addToHistory({
        expression: expLabel,
        latex: expLabel,
        result: resultStr,
      });
    } catch (e: any) {
      setMatrixError(t('invalidMatrices'));
    }
  };
  
  const showSecondMatrix = matrixAction === 'add' || matrixAction === 'multiply';
  
  return (
    <View style={styles.panelContent}>
      <View style={styles.panelHeader}>
        <MatrixIcon size={24} color={themeColors.primary} />
        <Text style={[styles.panelTitle, { color: themeColors.text }]}>
          {t('matrixOperations')}
        </Text>
      </View>
      
      <View style={styles.matrixInputs}>
        <Text style={[styles.matrixLabel, { color: themeColors.textMuted }]}>
          {t('matrixA')}
        </Text>
        <TextInput
          value={matrixA}
          onChangeText={setMatrixA}
          placeholder={t('matrixPlaceholder')}
          style={styles.monoInput}
        />
      </View>
      
      {showSecondMatrix && (
        <View style={styles.matrixInputs}>
          <Text style={[styles.matrixLabel, { color: themeColors.textMuted }]}>
            {t('matrixB')}
          </Text>
          <TextInput
            value={matrixB}
            onChangeText={setMatrixB}
            placeholder={t('matrixPlaceholder')}
            style={styles.monoInput}
          />
        </View>
      )}
      
      <Dropdown
        value={matrixAction}
        options={matrixOptions}
        onChange={(v) => setMatrixAction(v as 'multiply' | 'add' | 'det' | 'inv')}
        theme={theme}
      />
      
      <Button
        title={t('calculate')}
        onPress={handleCalculate}
        fullWidth
        style={styles.calculateButton}
      />
      
      {matrixError && (
        <View style={[styles.resultBox, { backgroundColor: themeColors.error + '20', borderColor: themeColors.error }]}>
          <Text style={[styles.resultText, { color: themeColors.error }]}>
            {matrixError}
          </Text>
        </View>
      )}
      
      {matrixResult && (
        <View style={[styles.resultBox, { backgroundColor: themeColors.surfaceSecondary, borderColor: themeColors.border }]}>
          <Text style={[styles.resultLabel, { color: themeColors.textMuted }]}>
            {t('result')}:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text style={[styles.matrixResultValue, { color: themeColors.text }]}>
              {matrixResult}
            </Text>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

export default function MatrixCASScreen() {
  const { theme } = useAppStore();
  const themeColors = colors[theme];
  const [activeTab, setActiveTab] = useState<'cas' | 'matrix'>('cas');
  
  return (
    <AppShell showHistory={false}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} theme={theme} />
        
        <View style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          {activeTab === 'cas' ? (
            <CASPanel theme={theme} />
          ) : (
            <MatrixPanel theme={theme} />
          )}
        </View>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: borderRadius.xl,
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  panelContent: {
    gap: spacing.md,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '500',
  },
  inputContainer: {
    marginTop: spacing.xs,
  },
  resultBox: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  matrixInputs: {
    gap: spacing.xs,
  },
  matrixLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  monoInput: {
    fontFamily: 'monospace',
    fontSize: 14,
  },
  calculateButton: {
    marginTop: spacing.sm,
  },
  matrixResultValue: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'monospace',
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
    maxHeight: 300,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    ...shadows.lg,
  },
  optionItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
