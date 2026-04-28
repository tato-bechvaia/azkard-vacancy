import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, fontSize } from '../theme';
import { useAuth } from '../store/AuthContext';
import api from '../api/axios';

export default function LoginScreen({ navigation }) {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in — go home
  useEffect(() => {
    if (user) navigation.reset({ index: 0, routes: [{ name: 'HomeTabs' }] });
  }, [user]);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError('შეავსეთ ყველა ველი');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      await login(data.token, data.role, data.displayName, data.isAdmin);
      navigation.reset({ index: 0, routes: [{ name: 'HomeTabs' }] });
    } catch (err) {
      setError(err.response?.data?.message || 'შესვლა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.surface.DEFAULT, colors.surface[50], colors.surface[100]]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand */}
          <View style={styles.brandBlock}>
            <View style={styles.logoPill}>
              <Text style={styles.logoText}>Azkard</Text>
            </View>
            <Text style={styles.headline}>გახადე შენი{'\n'}კარიერა{'\n'}
              <Text style={styles.headlineAccent}>სპეციალური</Text>
            </Text>
            <Text style={styles.subtitle}>ათასობით ვაკანსია, სერიოზული კომპანიები</Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>მოგესალმებით</Text>
            <Text style={styles.formSubtitle}>შედით თქვენს ანგარიშზე</Text>

            {error !== '' && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Text style={styles.label}>ელ-ფოსტა</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(v) => setForm({ ...form, email: v })}
              placeholder="you@example.com"
              placeholderTextColor={colors.text.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>პაროლი</Text>
            <TextInput
              style={styles.input}
              value={form.password}
              onChangeText={(v) => setForm({ ...form, password: v })}
              placeholder="••••••••"
              placeholderTextColor={colors.text.muted}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.submitText}>შესვლა</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.switchRow}>
              <Text style={styles.switchText}>
                ანგარიში არ გაქვთ? <Text style={styles.switchLink}>დარეგისტრირდით</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['4xl'],
  },
  brandBlock: {
    marginBottom: spacing['3xl'],
  },
  logoPill: {
    backgroundColor: colors.brand[600],
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing['2xl'],
  },
  logoText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headline: {
    color: colors.text.primary,
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    lineHeight: 42,
    marginBottom: spacing.md,
  },
  headlineAccent: {
    color: colors.brand[400],
  },
  subtitle: {
    color: colors.text.muted,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: colors.surface[100],
    borderRadius: radius.xl,
    padding: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  formTitle: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: 2,
  },
  formSubtitle: {
    color: colors.text.muted,
    fontSize: fontSize.sm,
    marginBottom: spacing.xl,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSize.sm,
  },
  label: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface[200],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text.primary,
    fontSize: fontSize.base,
  },
  submitBtn: {
    backgroundColor: colors.brand[600],
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '700',
  },
  switchRow: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  switchText: {
    color: colors.text.muted,
    fontSize: fontSize.sm,
  },
  switchLink: {
    color: colors.brand[400],
    fontWeight: '600',
  },
});
