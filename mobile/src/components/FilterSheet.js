import { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ScrollView, TextInput, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, fontSize } from '../theme';

const REGIMES = [
  { value: 'FULL_TIME', label: 'სრული განაკვეთი' },
  { value: 'PART_TIME', label: 'ნაწილობრივი' },
  { value: 'FREELANCE', label: 'ფრილანსი' },
  { value: 'REMOTE', label: 'დისტანციური' },
];

const EXPERIENCES = [
  { value: '', label: 'ყველა' },
  { value: 'NONE', label: 'გამოცდილების გარეშე' },
  { value: 'JUNIOR', label: 'Junior' },
  { value: 'MID', label: 'Mid' },
  { value: 'SENIOR', label: 'Senior' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'უახლესი' },
  { value: 'salary_desc', label: 'ხელფასი (კლებადი)' },
  { value: 'salary_asc', label: 'ხელფასი (ზრდადი)' },
];

export default function FilterSheet({ visible, onClose, filters, onApply }) {
  const [local, setLocal] = useState({ ...filters });

  const toggleRegime = (v) => {
    const regimes = local.regimes || [];
    setLocal({
      ...local,
      regimes: regimes.includes(v) ? regimes.filter((r) => r !== v) : [...regimes, v],
    });
  };

  const apply = () => {
    onApply(local);
    onClose();
  };

  const reset = () => {
    const empty = { location: '', regimes: [], experience: '', sort: 'newest', salaryMin: '', salaryMax: '' };
    setLocal(empty);
    onApply(empty);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>ფილტრები</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
          {/* Location */}
          <Text style={styles.label}>ლოკაცია</Text>
          <TextInput
            style={styles.input}
            value={local.location}
            onChangeText={(v) => setLocal({ ...local, location: v })}
            placeholder="თბილისი, ბათუმი..."
            placeholderTextColor={colors.text.muted}
          />

          {/* Regime */}
          <Text style={styles.label}>სამუშაო რეჟიმი</Text>
          <View style={styles.chipRow}>
            {REGIMES.map((r) => {
              const active = (local.regimes || []).includes(r.value);
              return (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleRegime(r.value)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{r.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Experience */}
          <Text style={styles.label}>გამოცდილება</Text>
          <View style={styles.chipRow}>
            {EXPERIENCES.map((e) => {
              const active = local.experience === e.value;
              return (
                <TouchableOpacity
                  key={e.value}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setLocal({ ...local, experience: e.value })}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{e.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Salary range */}
          <Text style={styles.label}>ხელფასის დიაპაზონი</Text>
          <View style={styles.salaryRow}>
            <TextInput
              style={[styles.input, styles.salaryInput]}
              value={local.salaryMin}
              onChangeText={(v) => setLocal({ ...local, salaryMin: v })}
              placeholder="მინ"
              placeholderTextColor={colors.text.muted}
              keyboardType="numeric"
            />
            <Text style={styles.salaryDash}>—</Text>
            <TextInput
              style={[styles.input, styles.salaryInput]}
              value={local.salaryMax}
              onChangeText={(v) => setLocal({ ...local, salaryMax: v })}
              placeholder="მაქს"
              placeholderTextColor={colors.text.muted}
              keyboardType="numeric"
            />
          </View>

          {/* Sort */}
          <Text style={styles.label}>სორტირება</Text>
          <View style={styles.chipRow}>
            {SORT_OPTIONS.map((s) => {
              const active = (local.sort || 'newest') === s.value;
              return (
                <TouchableOpacity
                  key={s.value}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setLocal({ ...local, sort: s.value })}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{s.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.resetBtn} onPress={reset}>
            <Text style={styles.resetText}>გასუფთავება</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={apply}>
            <Text style={styles.applyText}>გამოყენება</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: colors.surface[50],
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing['3xl'],
    maxHeight: '85%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surface[400],
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  sheetTitle: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  body: {
    flexGrow: 0,
  },
  label: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface[200],
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text.primary,
    fontSize: fontSize.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface[200],
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  chipActive: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[500],
  },
  chipText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  salaryInput: {
    flex: 1,
  },
  salaryDash: {
    color: colors.text.muted,
    fontSize: fontSize.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  resetBtn: {
    flex: 1,
    backgroundColor: colors.surface[300],
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  resetText: {
    color: colors.text.secondary,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  applyBtn: {
    flex: 2,
    backgroundColor: colors.brand[600],
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  applyText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '700',
  },
});
