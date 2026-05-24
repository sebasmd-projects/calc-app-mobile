import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { colors, borderRadius, spacing, shadows } from '@/lib/theme';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { Checkbox } from '@/components/ui/Checkbox';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Espanol' },
] as const;

// Calculator icon component
function CalculatorIcon({ size = 32, color = '#ffffff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
      <Rect x="6" y="6" width="12" height="4" rx="1" fill={color} />
      <Rect x="6" y="13" width="3" height="3" rx="0.5" fill={color} />
      <Rect x="10.5" y="13" width="3" height="3" rx="0.5" fill={color} />
      <Rect x="15" y="13" width="3" height="3" rx="0.5" fill={color} />
      <Rect x="6" y="17.5" width="3" height="3" rx="0.5" fill={color} />
      <Rect x="10.5" y="17.5" width="3" height="3" rx="0.5" fill={color} />
      <Rect x="15" y="17.5" width="3" height="3" rx="0.5" fill={color} />
    </Svg>
  );
}

// Arrow icon
function ArrowRightIcon({ size = 20, color = '#ffffff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12h14m-7-7l7 7-7 7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Globe icon for language selector
function GlobeIcon({ size = 24, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme, login, keepSignedIn, setKeepSignedIn, language, setLanguage } = useAppStore();
  const themeColors = colors[theme];

  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const handleLanguageChange = (lang: 'en' | 'es') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const toggleView = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    setTimeout(() => {
      setIsLoginView(!isLoginView);
      setErrors({});
    }, 150);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!isLoginView) {
      if (!name) newErrors.name = 'Name is required';
      if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    login(email, name || undefined);
    setLoading(false);
    router.replace('/(app)/calculator');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Language Selector at top */}
      <View style={styles.languageSelectorContainer}>
        <View style={[styles.languageSelector, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <GlobeIcon size={18} color={themeColors.textSecondary} />
          <View style={styles.languageButtons}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageButton,
                  {
                    backgroundColor: language === lang.code ? themeColors.primary : 'transparent',
                  },
                ]}
                onPress={() => handleLanguageChange(lang.code as 'en' | 'es')}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    { color: language === lang.code ? '#ffffff' : themeColors.text },
                  ]}
                >
                  {lang.code.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
                opacity: fadeAnim,
              },
              shadows.lg,
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: themeColors.primary }]}>
                <CalculatorIcon size={32} color="#ffffff" />
              </View>
              <Text style={[styles.title, { color: themeColors.text }]}>
                {isLoginView ? t('welcomeBack') : t('createAccount')}
              </Text>
              <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                {isLoginView ? t('signInSubtitle') : t('registerSubtitle')}
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {!isLoginView && (
                <TextInput
                  label={t('fullName')}
                  placeholder="John Doe"
                  value={name}
                  onChangeText={setName}
                  error={errors.name}
                  autoCapitalize="words"
                  containerStyle={styles.inputContainer}
                />
              )}
              
              <TextInput
                label={t('email')}
                placeholder="user@example.com"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                containerStyle={styles.inputContainer}
              />
              
              <TextInput
                label={t('password')}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                secureTextEntry
                containerStyle={styles.inputContainer}
              />
              
              {!isLoginView && (
                <TextInput
                  label={t('confirmPassword')}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  error={errors.confirmPassword}
                  secureTextEntry
                  containerStyle={styles.inputContainer}
                />
              )}
              
              <View style={styles.checkboxContainer}>
                <Checkbox
                  checked={keepSignedIn}
                  onChange={setKeepSignedIn}
                  label={t('keepMeSignedIn')}
                />
              </View>

              <Button
                title={isLoginView ? t('accessCalculator') : t('registerAccess')}
                onPress={handleSubmit}
                loading={loading}
                fullWidth
                icon={<ArrowRightIcon size={20} color="#ffffff" />}
                style={styles.submitButton}
              />
            </View>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: themeColors.border }]}>
              <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
                {isLoginView ? t('noAccount') + ' ' : t('haveAccount') + ' '}
                <Text
                  style={[styles.footerLink, { color: themeColors.primary }]}
                  onPress={toggleView}
                >
                  {isLoginView ? t('registerHere') : t('signInHere')}
                </Text>
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  languageSelectorContainer: {
    position: 'absolute',
    top: spacing.xl + spacing.lg,
    right: spacing.md,
    zIndex: 10,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  languageButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  languageButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  card: {
    borderRadius: borderRadius.xl + 8,
    borderWidth: 1,
    padding: spacing.xl,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    gap: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.xs,
  },
  checkboxContainer: {
    marginTop: spacing.xs,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  footer: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontWeight: '600',
  },
});
