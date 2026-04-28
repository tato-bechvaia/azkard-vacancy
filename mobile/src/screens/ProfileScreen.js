import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Image, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, fontSize } from '../theme';
import api, { API_URL } from '../api/axios';
import { useAuth } from '../store/AuthContext';

function avatarUri(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  // Candidate application stats
  const [appStats, setAppStats] = useState({ total: 0, pending: 0, reviewing: 0 });

  useEffect(() => {
    if (user) fetchProfile();
    else setLoading(false);
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profiles/me');
      setProfile(data);
      setForm(data);

      if (user?.role === 'CANDIDATE') {
        try {
          const { data: apps } = await api.get('/applications/mine');
          setAppStats({
            total: apps.length,
            pending: apps.filter((a) => a.status === 'PENDING').length,
            reviewing: apps.filter((a) => a.status === 'REVIEWING' || a.status === 'SHORTLISTED').length,
          });
        } catch {}
      }
    } catch (err) {
      Alert.alert('შეცდომა', 'პროფილი ვერ ჩაიტვირთა');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = user.role === 'CANDIDATE'
        ? { firstName: form.firstName, lastName: form.lastName, headline: form.headline, location: form.location, phone: form.user?.phone }
        : { companyName: form.companyName, description: form.description, website: form.website, phone: form.user?.phone };
      const { data } = await api.put('/profiles/me', payload);
      setProfile({ ...profile, ...data });
      setEditing(false);
    } catch (err) {
      Alert.alert('შეცდომა', 'პროფილის განახლება ვერ მოხერხდა');
    } finally {
      setSaving(false);
    }
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const formData = new FormData();
    formData.append('avatar', {
      uri: asset.uri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    });

    try {
      const { data } = await api.post('/profiles/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile((p) => ({ ...p, avatarUrl: data.avatarUrl }));
    } catch {
      Alert.alert('შეცდომა', 'ფოტოს ატვირთვა ვერ მოხერხდა');
    }
  };

  const [uploadingCv, setUploadingCv] = useState(false);

  const pickCv = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const file = result.assets[0];
    setUploadingCv(true);
    try {
      const fd = new FormData();
      fd.append('cv', {
        uri: file.uri,
        type: file.mimeType || 'application/pdf',
        name: file.name || 'cv.pdf',
      });
      const { data } = await api.post('/profiles/cv', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile((p) => ({ ...p, cvUrl: data.cvUrl }));
      Alert.alert('წარმატება', 'CV წარმატებით აიტვირთა');
    } catch {
      Alert.alert('შეცდომა', 'CV-ს ატვირთვა ვერ მოხერხდა');
    } finally {
      setUploadingCv(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('გასვლა', 'ნამდვილად გსურთ გასვლა?', [
      { text: 'გაუქმება', style: 'cancel' },
      { text: 'გასვლა', style: 'destructive', onPress: logout },
    ]);
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.authGateway}>
          <View style={styles.authIconWrap}>
            <Ionicons name="person-circle-outline" size={72} color={colors.brand[400]} />
          </View>
          <Text style={styles.authTitle}>შედი ანგარიშზე</Text>
          <Text style={styles.authSubtitle}>
            შეინახე ვაკანსიები, გაგზავნე განაცხადები და მართე პროფილი
          </Text>
          <TouchableOpacity
            style={styles.authPrimaryBtn}
            onPress={() => navigation.getParent()?.navigate('Login')}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in-outline" size={20} color={colors.white} />
            <Text style={styles.authPrimaryText}>შესვლა</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.authSecondaryBtn}
            onPress={() => navigation.getParent()?.navigate('Register')}
            activeOpacity={0.8}
          >
            <Text style={styles.authSecondaryText}>
              ანგარიში არ გაქვთ? <Text style={{ color: colors.brand[400], fontWeight: '700' }}>დარეგისტრირდით</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.loadingBox, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.brand[500]} />
      </View>
    );
  }

  const isCandidate = user?.role === 'CANDIDATE';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>პროფილი</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Avatar + Name card */}
        <View style={styles.card}>
          <TouchableOpacity onPress={pickAvatar} style={styles.avatarWrap}>
            {profile?.avatarUrl ? (
              <Image source={{ uri: avatarUri(profile.avatarUrl) }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={32} color={colors.text.muted} />
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={12} color={colors.white} />
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>
            {isCandidate
              ? `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim()
              : profile?.companyName || ''}
          </Text>
          <Text style={styles.email}>{profile?.user?.email}</Text>

          {!editing && (
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <Ionicons name="create-outline" size={16} color={colors.brand[400]} />
              <Text style={styles.editBtnText}>რედაქტირება</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Employer: Create vacancy button */}
        {!isCandidate && (
          <TouchableOpacity
            style={styles.createJobBtn}
            onPress={() => navigation.getParent()?.navigate('CreateJob')}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={22} color={colors.white} />
            <Text style={styles.createJobText}>ვაკანსიის დამატება</Text>
          </TouchableOpacity>
        )}

        {/* Stats for candidates */}
        {isCandidate && (
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{appStats.total}</Text>
              <Text style={styles.statLabel}>განაცხადი</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{appStats.pending}</Text>
              <Text style={styles.statLabel}>მოლოდინში</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{appStats.reviewing}</Text>
              <Text style={styles.statLabel}>განიხილება</Text>
            </View>
          </View>
        )}

        {/* CV section for candidates */}
        {isCandidate && (
          <View style={styles.cvCard}>
            <View style={styles.cvHeader}>
              <Ionicons name="document-text" size={20} color={colors.brand[400]} />
              <Text style={styles.cvTitle}>ჩემი CV</Text>
            </View>
            {profile?.cvUrl ? (
              <View style={styles.cvAttached}>
                <View style={styles.cvFileRow}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                  <Text style={styles.cvFileName} numberOfLines={1}>CV ატვირთულია</Text>
                </View>
                <TouchableOpacity
                  style={styles.cvReplaceBtn}
                  onPress={pickCv}
                  disabled={uploadingCv}
                >
                  {uploadingCv ? (
                    <ActivityIndicator color={colors.brand[400]} size="small" />
                  ) : (
                    <>
                      <Ionicons name="swap-horizontal" size={14} color={colors.brand[400]} />
                      <Text style={styles.cvReplaceText}>შეცვლა</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.cvUploadBtn}
                onPress={pickCv}
                disabled={uploadingCv}
                activeOpacity={0.8}
              >
                {uploadingCv ? (
                  <ActivityIndicator color={colors.text.muted} size="small" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={22} color={colors.text.muted} />
                    <Text style={styles.cvUploadText}>ატვირთეთ CV</Text>
                    <Text style={styles.cvUploadHint}>PDF, DOC, DOCX</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Edit form */}
        {editing && (
          <View style={styles.card}>
            {isCandidate ? (
              <>
                <Text style={styles.label}>სახელი</Text>
                <TextInput
                  style={styles.input}
                  value={form.firstName}
                  onChangeText={(v) => setForm({ ...form, firstName: v })}
                  placeholderTextColor={colors.text.muted}
                />
                <Text style={styles.label}>გვარი</Text>
                <TextInput
                  style={styles.input}
                  value={form.lastName}
                  onChangeText={(v) => setForm({ ...form, lastName: v })}
                  placeholderTextColor={colors.text.muted}
                />
                <Text style={styles.label}>სათაური</Text>
                <TextInput
                  style={styles.input}
                  value={form.headline || ''}
                  onChangeText={(v) => setForm({ ...form, headline: v })}
                  placeholder="React Developer"
                  placeholderTextColor={colors.text.muted}
                />
                <Text style={styles.label}>ლოკაცია</Text>
                <TextInput
                  style={styles.input}
                  value={form.location || ''}
                  onChangeText={(v) => setForm({ ...form, location: v })}
                  placeholder="თბილისი"
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
                  placeholderTextColor={colors.text.muted}
                />
                <Text style={styles.label}>აღწერა</Text>
                <TextInput
                  style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                  value={form.description || ''}
                  onChangeText={(v) => setForm({ ...form, description: v })}
                  placeholder="კომპანიის აღწერა..."
                  placeholderTextColor={colors.text.muted}
                  multiline
                />
                <Text style={styles.label}>ვებ-საიტი</Text>
                <TextInput
                  style={styles.input}
                  value={form.website || ''}
                  onChangeText={(v) => setForm({ ...form, website: v })}
                  placeholder="https://..."
                  placeholderTextColor={colors.text.muted}
                  keyboardType="url"
                />
              </>
            )}

            <Text style={styles.label}>ტელეფონი</Text>
            <TextInput
              style={styles.input}
              value={form.user?.phone || ''}
              onChangeText={(v) => setForm({ ...form, user: { ...form.user, phone: v } })}
              placeholder="+995..."
              placeholderTextColor={colors.text.muted}
              keyboardType="phone-pad"
            />

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setEditing(false); setForm(profile); }}>
                <Text style={styles.cancelText}>გაუქმება</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.saveText}>შენახვა</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.DEFAULT,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface.DEFAULT,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  screenTitle: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.surface[100],
    borderRadius: radius.xl,
    padding: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
  },
  avatarPlaceholder: {
    backgroundColor: colors.surface[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.brand[600],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface[100],
  },
  name: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  email: {
    color: colors.text.muted,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(107, 70, 224, 0.1)',
    borderRadius: radius.full,
  },
  editBtnText: {
    color: colors.brand[400],
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface[100],
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.lg,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.text.muted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border.DEFAULT,
  },
  label: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    width: '100%',
    backgroundColor: colors.surface[200],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text.primary,
    fontSize: fontSize.base,
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: colors.surface[300],
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.text.secondary,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    backgroundColor: colors.brand[600],
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '700',
  },
  cvCard: {
    backgroundColor: colors.surface[100],
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.lg,
  },
  cvHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cvTitle: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  cvAttached: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cvFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  cvFileName: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    flex: 1,
  },
  cvReplaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(107, 70, 224, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  cvReplaceText: {
    color: colors.brand[400],
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  cvUploadBtn: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  cvUploadText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  cvUploadHint: {
    color: colors.text.muted,
    fontSize: fontSize.xs,
  },
  createJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brand[600],
    borderRadius: radius.xl,
    paddingVertical: 15,
    marginBottom: spacing.lg,
  },
  createJobText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  // Auth gateway styles
  authGateway: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  authIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(107, 70, 224, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  authTitle: {
    color: colors.text.primary,
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  authSubtitle: {
    color: colors.text.muted,
    fontSize: fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing['3xl'],
  },
  authPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brand[600],
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: spacing['3xl'],
    width: '100%',
  },
  authPrimaryText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  authSecondaryBtn: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  authSecondaryText: {
    color: colors.text.muted,
    fontSize: fontSize.sm,
  },
});
