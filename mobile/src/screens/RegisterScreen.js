import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, fontSize } from '../theme';
import { useAuth } from '../store/AuthContext';
import api from '../api/axios';

export default function RegisterScreen({ navigation }) {
  const { user, login } = useAuth();
  const [role, setRole] = useState('CANDIDATE');

  // Already logged in — go home
  useEffect(() => {
    if (user) navigation.reset({ index: 0, routes: [{ name: 'HomeTabs' }] });
  }, [user]);
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', companyName: '', phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', { ...form, role });
      await login(data.token, data.role, data.displayName);
      navigation.reset({ index: 0, routes: [{ name: 'HomeTabs' }] });
    } catch (err) {
      setError(err.response?.data?.message || 'რეგისტრაცია ვერ მოხერხდა');
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
          {/* Back */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
          </TouchableOpacity>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>რეგისტრაცია</Text>
            <Text style={styles.formSubtitle}>შექმენით თქვენი ანგარიში</Text>

            {/* Role toggle */}
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleBtn, role === 'CANDIDATE' && styles.roleBtnActive]}
                onPress={() => setRole('CANDIDATE')}
              >
                <Ionicons name="person-outline" size={16} color={role === 'CANDIDATE' ? colors.white : colors.text.muted} />
                <Text style={[styles.roleBtnText, role === 'CANDIDATE' && styles.roleBtnTextActive]}>კანდიდატი</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleBtn, role === 'EMPLOYER' && styles.roleBtnActive]}
                onPress={() => setRole('EMPLOYER')}
              >
                <Ionicons name="business-outline" size={16} color={role === 'EMPLOYER' ? colors.white : colors.text.muted} />
                <Text style={[styles.roleBtnText, role === 'EMPLOYER' && styles.roleBtnTextActive]}>დამსაქმებელი</Text>
              </TouchableOpacity>
            </View>

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

            {role === 'CANDIDATE' ? (
              <>
                <Text style={styles.label}>სახელი</Text>
                <TextInput
                  style={styles.input}
                  value={form.firstName}
                  onChangeText={(v) => setForm({ ...form, firstName: v })}
                  placeholder="სახელი"
                  placeholderTextColor={colors.text.muted}
                />
                <Text style={styles.label}>გვარი</Text>
                <TextInput
                  style={styles.input}
                  value={form.lastName}
                  onChangeText={(v) => setForm({ ...form, lastName: v })}
                  placeholder="გვარი"
                  placeholderTextColor={colors.text.muted}
                />
              </>
            ) : (
              <>
                <Text style={styles.label}>კომპანიის სახელი</Text>
                <TextInput
                  style={styles.input}
                  value={form.companyName}
                  onChangeText={(v) => setForm({ ...form, companyName: v })}
                  placeholder="კომპანია"
                  placeholderTextColor={colors.text.muted}
                />
              </>
            )}

            <Text style={styles.label}>ტელეფონი (არასავალდებულო)</Text>
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={(v) => setForm({ ...form, phone: v })}
              placeholder="+995..."
              placeholderTextColor={colors.text.muted}
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.submitText}>რეგისტრაცია</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.switchRow}>
              <Text style={styles.switchText}>
                უკვე გაქვთ ანგარიში? <Text style={styles.switchLink}>შესვლა</Text>
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
    paddingHorizontal: spacing['2xl'],
    paddingTop: 60,
    paddingBottom: spacing['4xl'],
  },
  backBtn: {
    marginBottom: spacing.xl,
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface[200],
    justifyContent: 'center',
    alignItems: 'center',
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
  roleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface[200],
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  roleBtnActive: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[500],
  },
  roleBtnText: {
    color: colors.text.muted,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  roleBtnTextActive: {
    color: colors.white,
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
  submitDisabled: { opacity: 0.6 },
  submitText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '700',
  },
  switchRow: { marginTop: spacing.xl, alignItems: 'center' },
  switchText: { color: colors.text.muted, fontSize: fontSize.sm },
  switchLink: { color: colors.brand[400], fontWeight: '600' },
});
