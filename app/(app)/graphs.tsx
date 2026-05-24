import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as math from 'mathjs';
import Svg, { Path, Line, Text as SvgText, G, Circle } from 'react-native-svg';
import { useAppStore } from '@/lib/store';
import { colors, borderRadius, spacing, shadows } from '@/lib/theme';
import { AppShell } from '@/components/AppShell';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRAPH_PADDING = 40;
const GRAPH_WIDTH = Math.min(SCREEN_WIDTH - spacing.md * 2, 600);
const GRAPH_HEIGHT = 300;

interface GraphProps {
  expression: string;
  xMin: number;
  xMax: number;
  theme: 'light' | 'dark';
}

function Graph({ expression, xMin, xMax, theme }: GraphProps) {
  const themeColors = colors[theme];
  
  const graphData = useMemo(() => {
    if (!expression) return null;
    
    try {
      const compiled = math.compile(expression);
      const points: { x: number; y: number }[] = [];
      const step = (xMax - xMin) / 200;
      let yMin = Infinity;
      let yMax = -Infinity;
      
      for (let x = xMin; x <= xMax; x += step) {
        try {
          const y = compiled.evaluate({ x });
          if (typeof y === 'number' && isFinite(y) && !isNaN(y)) {
            points.push({ x, y });
            yMin = Math.min(yMin, y);
            yMax = Math.max(yMax, y);
          }
        } catch {
          // Skip invalid points
        }
      }
      
      if (points.length === 0) return null;
      
      // Add some padding to y range
      const yPadding = (yMax - yMin) * 0.1 || 1;
      yMin -= yPadding;
      yMax += yPadding;
      
      // Clamp extreme values
      yMin = Math.max(yMin, -100);
      yMax = Math.min(yMax, 100);
      
      return { points, yMin, yMax };
    } catch {
      return null;
    }
  }, [expression, xMin, xMax]);
  
  if (!graphData) {
    return (
      <View style={[styles.graphPlaceholder, { backgroundColor: themeColors.surfaceSecondary }]}>
        <Text style={[styles.placeholderText, { color: themeColors.textMuted }]}>
          Enter a valid function to plot
        </Text>
      </View>
    );
  }
  
  const { points, yMin, yMax } = graphData;
  
  // Scale functions
  const scaleX = (x: number) => 
    GRAPH_PADDING + ((x - xMin) / (xMax - xMin)) * (GRAPH_WIDTH - GRAPH_PADDING * 2);
  const scaleY = (y: number) => 
    GRAPH_PADDING + ((yMax - y) / (yMax - yMin)) * (GRAPH_HEIGHT - GRAPH_PADDING * 2);
  
  // Generate path
  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`)
    .join(' ');
  
  // Calculate axis positions
  const xAxisY = yMin <= 0 && yMax >= 0 ? scaleY(0) : GRAPH_HEIGHT - GRAPH_PADDING;
  const yAxisX = xMin <= 0 && xMax >= 0 ? scaleX(0) : GRAPH_PADDING;
  
  // Generate tick marks
  const xTicks = [];
  const yTicks = [];
  const xStep = (xMax - xMin) / 4;
  const yStep = (yMax - yMin) / 4;
  
  for (let i = 0; i <= 4; i++) {
    xTicks.push(xMin + i * xStep);
    yTicks.push(yMin + i * yStep);
  }
  
  return (
    <View style={[styles.graphContainer, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
      <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
        {/* Grid lines */}
        <G opacity={0.3}>
          {xTicks.map((tick, i) => (
            <Line
              key={`vgrid-${i}`}
              x1={scaleX(tick)}
              y1={GRAPH_PADDING}
              x2={scaleX(tick)}
              y2={GRAPH_HEIGHT - GRAPH_PADDING}
              stroke={themeColors.border}
              strokeWidth={1}
            />
          ))}
          {yTicks.map((tick, i) => (
            <Line
              key={`hgrid-${i}`}
              x1={GRAPH_PADDING}
              y1={scaleY(tick)}
              x2={GRAPH_WIDTH - GRAPH_PADDING}
              y2={scaleY(tick)}
              stroke={themeColors.border}
              strokeWidth={1}
            />
          ))}
        </G>
        
        {/* Axes */}
        <Line
          x1={GRAPH_PADDING}
          y1={xAxisY}
          x2={GRAPH_WIDTH - GRAPH_PADDING}
          y2={xAxisY}
          stroke={themeColors.textSecondary}
          strokeWidth={1.5}
        />
        <Line
          x1={yAxisX}
          y1={GRAPH_PADDING}
          x2={yAxisX}
          y2={GRAPH_HEIGHT - GRAPH_PADDING}
          stroke={themeColors.textSecondary}
          strokeWidth={1.5}
        />
        
        {/* Axis labels */}
        {xTicks.map((tick, i) => (
          <SvgText
            key={`xlabel-${i}`}
            x={scaleX(tick)}
            y={GRAPH_HEIGHT - 10}
            fontSize={10}
            fill={themeColors.textMuted}
            textAnchor="middle"
          >
            {tick.toFixed(1)}
          </SvgText>
        ))}
        {yTicks.map((tick, i) => (
          <SvgText
            key={`ylabel-${i}`}
            x={10}
            y={scaleY(tick) + 4}
            fontSize={10}
            fill={themeColors.textMuted}
            textAnchor="start"
          >
            {tick.toFixed(1)}
          </SvgText>
        ))}
        
        {/* Function curve */}
        <Path
          d={pathData}
          stroke={themeColors.primary}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Origin marker */}
        {xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0 && (
          <Circle
            cx={scaleX(0)}
            cy={scaleY(0)}
            r={4}
            fill={themeColors.primary}
          />
        )}
      </Svg>
    </View>
  );
}

export default function GraphsScreen() {
  const { t } = useTranslation();
  const { theme, addToHistory } = useAppStore();
  const themeColors = colors[theme];
  
  const [functionExpr, setFunctionExpr] = useState('sin(x)');
  const [xMin, setXMin] = useState('-10');
  const [xMax, setXMax] = useState('10');
  const [activeFunction, setActiveFunction] = useState('sin(x)');
  const [activeXMin, setActiveXMin] = useState(-10);
  const [activeXMax, setActiveXMax] = useState(10);
  
  const handlePlot = () => {
    const min = parseFloat(xMin) || -10;
    const max = parseFloat(xMax) || 10;
    
    if (min >= max) {
      return;
    }
    
    setActiveFunction(functionExpr);
    setActiveXMin(min);
    setActiveXMax(max);
    
    // Add to history
    addToHistory({
      expression: `f(x) = ${functionExpr}`,
      latex: `f(x) = ${functionExpr}`,
      result: `[${min}, ${max}]`,
    });
  };
  
  // Quick function presets
  const presets = [
    { label: 'sin(x)', value: 'sin(x)' },
    { label: 'cos(x)', value: 'cos(x)' },
    { label: 'x^2', value: 'x^2' },
    { label: 'sqrt(x)', value: 'sqrt(x)' },
    { label: 'log(x)', value: 'log(x)' },
    { label: '1/x', value: '1/x' },
  ];
  
  return (
    <AppShell showHistory={false}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          {/* Function Input */}
          <View style={styles.inputRow}>
            <Text style={[styles.functionLabel, { color: themeColors.textSecondary }]}>
              {t('functionInput')}
            </Text>
            <View style={styles.functionInputWrapper}>
              <TextInput
                value={functionExpr}
                onChangeText={setFunctionExpr}
                placeholder="sin(x)"
                style={styles.functionInput}
                containerStyle={{ flex: 1 }}
              />
            </View>
          </View>
          
          {/* Range Inputs */}
          <View style={styles.rangeRow}>
            <View style={styles.rangeInput}>
              <View style={[styles.rangeBadge, { backgroundColor: themeColors.surfaceSecondary }]}>
                <Text style={[styles.rangeBadgeText, { color: themeColors.text }]}>{xMin}</Text>
              </View>
              <Text style={[styles.rangeLabel, { color: themeColors.textMuted }]}>{t('to')}</Text>
              <View style={[styles.rangeBadge, { backgroundColor: themeColors.surfaceSecondary }]}>
                <Text style={[styles.rangeBadgeText, { color: themeColors.text }]}>{xMax}</Text>
              </View>
            </View>
          </View>
          
          {/* Range Sliders as Inputs */}
          <View style={styles.rangeInputsRow}>
            <TextInput
              value={xMin}
              onChangeText={setXMin}
              keyboardType="numeric"
              placeholder="-10"
              containerStyle={{ flex: 1 }}
            />
            <Text style={[styles.toLabel, { color: themeColors.textMuted }]}>{t('to')}</Text>
            <TextInput
              value={xMax}
              onChangeText={setXMax}
              keyboardType="numeric"
              placeholder="10"
              containerStyle={{ flex: 1 }}
            />
          </View>
          
          {/* Presets */}
          <View style={styles.presetsRow}>
            {presets.map((preset) => (
              <Button
                key={preset.value}
                title={preset.label}
                variant={functionExpr === preset.value ? 'primary' : 'secondary'}
                size="sm"
                onPress={() => setFunctionExpr(preset.value)}
                style={styles.presetButton}
              />
            ))}
          </View>
        </View>
        
        {/* Graph */}
        <Graph
          expression={activeFunction}
          xMin={activeXMin}
          xMax={activeXMax}
          theme={theme}
        />
        
        {/* Plot Button */}
        <Button
          title={t('plotFunction')}
          onPress={handlePlot}
          fullWidth
          style={styles.plotButton}
        />
      </ScrollView>
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
    marginBottom: spacing.md,
  },
  inputRow: {
    marginBottom: spacing.md,
  },
  functionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  functionInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  functionInput: {
    fontFamily: 'monospace',
  },
  rangeRow: {
    marginBottom: spacing.md,
  },
  rangeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  rangeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  rangeBadgeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  rangeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  rangeInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  toLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetButton: {
    minWidth: 70,
  },
  graphContainer: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  graphPlaceholder: {
    width: GRAPH_WIDTH,
    height: GRAPH_HEIGHT,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  placeholderText: {
    fontSize: 14,
  },
  plotButton: {
    marginBottom: spacing.xl,
  },
});
