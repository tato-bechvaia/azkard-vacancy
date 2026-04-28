import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, RefreshControl, ActivityIndicator, Modal, TextInput,
  Pressable, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { colors, radius, spacing, fontSize } from '../theme';
import api, { API_URL } from '../api/axios';

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

function avatarUri(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function CVBoxesScreen() {
  const insets = useSafeAreaInsets();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Submit modal state
  const [modal, setModal] = useState(null); // { boxId, companyName }
  const [form, setForm] = useState({ candidateName: '', candidateEmail: '', message: '', categories: [] });
  const [cvFile, setCvFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCompanies = useCallback(async () => {
    try {
      const { data } = await api.get('/company-boxes/public');
      setCompanies(data);
    } catch {
      setCompanies([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCompanies().finally(() => setLoading(false));
    }, [fetchCompanies])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCompanies();
    setRefreshing(false);
  };

  const openSubmitModal = (company) => {
    setModal({ boxId: company.boxId, companyName: company.companyName });
    setForm({ candidateName: '', candidateEmail: '', message: '', categories: [] });
    setCvFile(null);
  };

  const pickCV = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      setCvFile(result.assets[0]);
    }
  };

  const toggleCategory = (val) => {
    setForm((p) => {
      const cats = p.categories.includes(val)
        ? p.categories.filter((c) => c !== val)
        : p.categories.length < 3 ? [...p.categories, val] : p.categories;
      return { ...p, categories: cats };
    });
  };

  const handleSubmit = async () => {
    if (!form.candidateName.trim()) return Alert.alert('შეცდომა', 'სახელი სავალდებულოა');
    if (!form.candidateEmail.trim()) return Alert.alert('შეცდომა', 'ელ-ფოსტა სავალდებულოა');
    if (!cvFile) return Alert.alert('შეცდომა', 'CV ფაილი სავალდებულოა');

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('candidateName', form.candidateName.trim());
      fd.append('candidateEmail', form.candidateEmail.trim());
      if (form.message.trim()) fd.append('message', form.message.trim());
      fd.append('categories', JSON.stringify(form.categories));
      fd.append('cv', {
        uri: cvFile.uri,
        type: cvFile.mimeType || 'application/pdf',
        name: cvFile.name || 'cv.pdf',
      });

      await api.post(`/company-boxes/${modal.boxId}/submit`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('წარმატება', 'CV წარმატებით გაიგზავნა!');
      setModal(null);
    } catch (err) {
      Alert.alert('შეცდომა', err.response?.data?.message || 'CV-ს გაგზავნა ვერ მოხერხდა');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCompany = ({ item }) => {
    const avatar = avatarUri(item.avatarUrl || item.logoUrl);
    return (
      <View style={styles.companyCard}>
        <View style={styles.companyHeader}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="business" size={22} color={colors.text.muted} />
            </View>
          )}
          <View style={styles.companyInfo}>
            <Text style={styles.companyName} numberOfLines={1}>{item.companyName}</Text>
            {item.description ? (
              <Text style={styles.companyDesc} numberOfLines={2}>{item.description}</Text>
            ) : null}
            <View style={styles.companyMeta}>
              {item.jobCount > 0 && (
                <View style={styles.metaTag}>
                  <Ionicons name="briefcase-outline" size={11} color={colors.text.muted} />
                  <Text style={styles.metaText}>{item.jobCount} ვაკანსია</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.sendCvBtn}
          onPress={() => openSubmitModal(item)}
          activeOpacity={0.8}
        >
          <Ionicons name="document-attach-outline" size={16} color={colors.white} />
          <Text style={styles.sendCvText}>CV-ს გაგზავნა</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingBox, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.brand[500]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>CV Boxes</Text>
        <Text style={styles.subtitle}>გაუგზავნე CV კომპანიებს პირდაპირ</Text>
      </View>

      <FlatList
        data={companies}
        keyExtractor={(item) => `box-${item.boxId}`}
        renderItem={renderCompany}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[500]} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="folder-open-outline" size={48} color={colors.text.muted} />
            <Text style={styles.emptyText}>CV Box-ები ვერ მოიძებნა</Text>
          </View>
        }
      />

      {/* Submit CV Modal */}
      <Modal visible={!!modal} animationType="slide" transparent>
        <Pressable style={styles.overlay} onPress={() => setModal(null)} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle} numberOfLines={1}>CV გაგზავნა — {modal?.companyName}</Text>
            <TouchableOpacity onPress={() => setModal(null)}>
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.fieldLabel}>სახელი და გვარი *</Text>
            <TextInput
              style={styles.fieldInput}
              value={form.candidateName}
              onChangeText={(v) => setForm((p) => ({ ...p, candidateName: v }))}
              placeholder="სახელი გვარი"
              placeholderTextColor={colors.text.muted}
            />

            <Text style={styles.fieldLabel}>ელ-ფოსტა *</Text>
            <TextInput
              style={styles.fieldInput}
              value={form.candidateEmail}
              onChangeText={(v) => setForm((p) => ({ ...p, candidateEmail: v }))}
              placeholder="you@example.com"
              placeholderTextColor={colors.text.muted}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.fieldLabel}>შეტყობინება</Text>
            <TextInput
              style={[styles.fieldInput, { minHeight: 80, textAlignVertical: 'top' }]}
              value={form.message}
              onChangeText={(v) => setForm((p) => ({ ...p, message: v }))}
              placeholder="მოტივაცია..."
              placeholderTextColor={colors.text.muted}
              multiline
            />

            <Text style={styles.fieldLabel}>კატეგორიები (მაქს. 3)</Text>
            <View style={styles.catRow}>
              {CATEGORIES.map((c) => {
                const active = form.categories.includes(c.value);
                return (
                  <TouchableOpacity
                    key={c.value}
                    style={[styles.catChip, active && styles.catChipActive]}
                    onPress={() => toggleCategory(c.value)}
                  >
                    <Text style={[styles.catChipText, active && styles.catChipTextActive]}>{c.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>CV ფაილი *</Text>
            <TouchableOpacity style={styles.fileBtn} onPress={pickCV}>
              <Ionicons name="cloud-upload-outline" size={20} color={cvFile ? colors.success : colors.text.muted} />
              <Text style={[styles.fileBtnText, cvFile && { color: colors.success }]}>
                {cvFile ? cvFile.name : 'აირჩიეთ PDF / Word ფაილი'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.submitText}>გაგზავნა</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.DEFAULT },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface.DEFAULT },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md },
  title: { color: colors.text.primary, fontSize: fontSize.xl, fontWeight: '700' },
  subtitle: { color: colors.text.muted, fontSize: fontSize.sm, marginTop: 4 },
  list: { paddingHorizontal: spacing.xl, paddingBottom: 100 },
  companyCard: {
    backgroundColor: colors.surface[100], borderRadius: radius.xl,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border.subtle,
    marginBottom: spacing.md,
  },
  companyHeader: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: radius.lg },
  avatarPlaceholder: { backgroundColor: colors.surface[300], justifyContent: 'center', alignItems: 'center' },
  companyInfo: { flex: 1 },
  companyName: { color: colors.text.primary, fontSize: fontSize.md, fontWeight: '700' },
  companyDesc: { color: colors.text.muted, fontSize: fontSize.xs, marginTop: 4, lineHeight: 18 },
  companyMeta: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  metaTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: colors.text.muted, fontSize: fontSize.xs },
  sendCvBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, backgroundColor: colors.brand[600], borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  sendCvText: { color: colors.white, fontSize: fontSize.sm, fontWeight: '700' },
  emptyBox: { alignItems: 'center', marginTop: 100, gap: spacing.md },
  emptyText: { color: colors.text.muted, fontSize: fontSize.base },
  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: colors.surface[50], borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'], paddingHorizontal: spacing.xl,
    paddingTop: spacing.md, paddingBottom: spacing['3xl'], maxHeight: '90%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.surface[400], alignSelf: 'center', marginBottom: spacing.lg },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  sheetTitle: { color: colors.text.primary, fontSize: fontSize.lg, fontWeight: '700', flex: 1, marginRight: spacing.md },
  fieldLabel: {
    color: colors.text.secondary, fontSize: fontSize.xs, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: spacing.sm, marginTop: spacing.lg,
  },
  fieldInput: {
    backgroundColor: colors.surface[200], borderRadius: radius.lg,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    color: colors.text.primary, fontSize: fontSize.base,
    borderWidth: 1, borderColor: colors.border.subtle,
  },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catChip: {
    backgroundColor: colors.surface[200], borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderWidth: 1, borderColor: colors.border.subtle,
  },
  catChipActive: { backgroundColor: colors.brand[600], borderColor: colors.brand[500] },
  catChipText: { color: colors.text.secondary, fontSize: fontSize.xs },
  catChipTextActive: { color: colors.white, fontWeight: '600' },
  fileBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface[200], borderRadius: radius.lg,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.lg,
    borderWidth: 1, borderColor: colors.border.subtle, borderStyle: 'dashed',
  },
  fileBtnText: { color: colors.text.muted, fontSize: fontSize.sm },
  submitBtn: {
    backgroundColor: colors.brand[600], borderRadius: radius.lg,
    paddingVertical: 14, alignItems: 'center', marginTop: spacing['2xl'],
  },
  submitText: { color: colors.white, fontSize: fontSize.base, fontWeight: '700' },
});
