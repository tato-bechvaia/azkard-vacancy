import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, fontSize } from '../theme';
import api from '../api/axios';

const REGIMES = [
  { value: 'FULL_TIME', label: 'სრული განაკვეთი' },
  { value: 'REMOTE', label: 'დისტანციური' },
  { value: 'HYBRID', label: 'ჰიბრიდული' },
];

const EXPERIENCES = [
  { value: 'NONE', label: 'გამოცდილების გარეშე' },
  { value: 'ONE_TO_THREE', label: '1-3 წელი' },
  { value: 'THREE_TO_FIVE', label: '3-5 წელი' },
  { value: 'FIVE_PLUS', label: '5+ წელი' },
];

const CATEGORIES = [
  { value: 'IT', label: 'IT' },
  { value: 'SALES', label: 'გაყიდვები' },
  { value: 'MARKETING', label: 'მარკეტინგი' },
  { value: 'FINANCE', label: 'ფინანსები' },
  { value: 'DESIGN', label: 'დიზაინი' },
  { value: 'MANAGEMENT', label: 'მენეჯმენტი' },
  { value: 'LOGISTICS', label: 'ლოჯისტიკა' },
  { value: 'HEALTHCARE', label: 'ჯანდაცვა' },
  { value: 'EDUCATION', label: 'განათლება' },
  { value: 'HOSPITALITY', label: 'სტუმართმოყვარეობა' },
  { value: 'OTHER', label: 'სხვა' },
];

const TIERS = [
  { value: 'USUAL', label: 'სტანდარტი', price: '35₾', desc: 'სტანდარტული განთავსება · 30 დღე' },
  { value: 'PREMIUM', label: 'Premium', price: '65₾', desc: 'პრემიუმ + კარუსელი · 30 დღე' },
  { value: 'PREMIUM_PLUS', label: 'Premium+', price: '95₾', desc: 'Premium+ კარუსელი + პრიორიტეტი · 30 დღე' },
];

export default function CreateJobScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    jobRegime: 'FULL_TIME',
    experience: 'NONE',
    category: 'IT',
    pricingTier: 'USUAL',
  });

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async () => {
    if (!form.title.trim()) return Alert.alert('შეცდომა', 'სათაური სავალდებულოა');
    if (!form.description.trim()) return Alert.alert('შეცდომა', 'აღწერა სავალდებულოა');
    if (!form.salary || isNaN(+form.salary)) return Alert.alert('შეცდომა', 'ხელფასი სავალდებულოა');

    setLoading(true);
    try {
      const { data } = await api.post('/payments/create-session', {
        ...form,
        salary: +form.salary,
        applicationMethod: 'CV_ONLY',
      });
      // Open Stripe checkout in browser
      if (data.url) {
        await Linking.openURL(data.url);
        Alert.alert('წარმატება', 'გადახდის შემდეგ ვაკანსია გააქტიურდება', [
          { text: 'კარგი', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert('შეცდომა', err.response?.data?.message || 'ვაკანსიის შექმნა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>ვაკანსიის დამატება</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <Text style={styles.label}>სათაური *</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={(v) => set('title', v)}
          placeholder="მაგ: Frontend Developer"
          placeholderTextColor={colors.text.muted}
        />

        {/* Description */}
        <Text style={styles.label}>აღწერა *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.description}
          onChangeText={(v) => set('description', v)}
          placeholder="ვაკანსიის სრული აღწერა..."
          placeholderTextColor={colors.text.muted}
          multiline
          textAlignVertical="top"
        />

        {/* Location */}
        <Text style={styles.label}>ლოკაცია</Text>
        <TextInput
          style={styles.input}
          value={form.location}
          onChangeText={(v) => set('location', v)}
          placeholder="თბილისი"
          placeholderTextColor={colors.text.muted}
        />

        {/* Salary */}
        <Text style={styles.label}>ხელფასი (₾) *</Text>
        <TextInput
          style={styles.input}
          value={form.salary}
          onChangeText={(v) => set('salary', v)}
          placeholder="2500"
          placeholderTextColor={colors.text.muted}
          keyboardType="numeric"
        />

        {/* Regime */}
        <Text style={styles.label}>სამუშაო რეჟიმი</Text>
        <View style={styles.chipRow}>
          {REGIMES.map((r) => (
            <TouchableOpacity
              key={r.value}
              style={[styles.chip, form.jobRegime === r.value && styles.chipActive]}
              onPress={() => set('jobRegime', r.value)}
            >
              <Text style={[styles.chipText, form.jobRegime === r.value && styles.chipTextActive]}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Experience */}
        <Text style={styles.label}>გამოცდილება</Text>
        <View style={styles.chipRow}>
          {EXPERIENCES.map((e) => (
            <TouchableOpacity
              key={e.value}
              style={[styles.chip, form.experience === e.value && styles.chipActive]}
              onPress={() => set('experience', e.value)}
            >
              <Text style={[styles.chipText, form.experience === e.value && styles.chipTextActive]}>{e.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category */}
        <Text style={styles.label}>კატეგორია</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[styles.chip, form.category === c.value && styles.chipActive]}
              onPress={() => set('category', c.value)}
            >
              <Text style={[styles.chipText, form.category === c.value && styles.chipTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pricing Tier */}
        <Text style={styles.label}>პაკეტი</Text>
        <View style={styles.tierList}>
          {TIERS.map((t) => {
            const active = form.pricingTier === t.value;
            return (
              <TouchableOpacity
                key={t.value}
                style={[styles.tierCard, active && styles.tierCardActive]}
                onPress={() => set('pricingTier', t.value)}
              >
                <View style={styles.tierHeader}>
                  <Text style={[styles.tierLabel, active && styles.tierLabelActive]}>{t.label}</Text>
                  <Text style={[styles.tierPrice, active && styles.tierPriceActive]}>{t.price}</Text>
                </View>
                <Text style={styles.tierDesc}>{t.desc}</Text>
                {active && (
                  <View style={styles.tierCheck}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.brand[400]} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Ionicons name="card-outline" size={18} color={colors.white} />
              <Text style={styles.submitText}>გადახდა და გამოქვეყნება</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.DEFAULT },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: colors.surface[200], justifyContent: 'center', alignItems: 'center',
  },
  screenTitle: { color: colors.text.primary, fontSize: fontSize.lg, fontWeight: '700' },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  label: {
    color: colors.text.secondary, fontSize: fontSize.xs, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: spacing.sm, marginTop: spacing.xl,
  },
  input: {
    backgroundColor: colors.surface[100], borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border.subtle,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    color: colors.text.primary, fontSize: fontSize.base,
  },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    backgroundColor: colors.surface[200], borderRadius: radius.full,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderWidth: 1, borderColor: colors.border.subtle,
  },
  chipActive: { backgroundColor: colors.brand[600], borderColor: colors.brand[500] },
  chipText: { color: colors.text.secondary, fontSize: fontSize.sm },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  tierList: { gap: spacing.md },
  tierCard: {
    backgroundColor: colors.surface[100], borderRadius: radius.xl,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border.subtle,
    position: 'relative',
  },
  tierCardActive: { borderColor: colors.brand[500], backgroundColor: 'rgba(107, 70, 224, 0.06)' },
  tierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tierLabel: { color: colors.text.primary, fontSize: fontSize.md, fontWeight: '700' },
  tierLabelActive: { color: colors.brand[400] },
  tierPrice: { color: colors.text.secondary, fontSize: fontSize.lg, fontWeight: '800' },
  tierPriceActive: { color: colors.brand[400] },
  tierDesc: { color: colors.text.muted, fontSize: fontSize.xs, marginTop: 4 },
  tierCheck: { position: 'absolute', top: spacing.md, right: spacing.md },
  submitBtn: {
    backgroundColor: colors.brand[600], borderRadius: radius.lg,
    paddingVertical: 15, flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: spacing.sm, marginTop: spacing['3xl'],
  },
  submitText: { color: colors.white, fontSize: fontSize.base, fontWeight: '700' },
});
