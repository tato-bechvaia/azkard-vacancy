import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Linking, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, fontSize } from '../theme';
import api, { API_URL } from '../api/axios';
import { useAuth } from '../store/AuthContext';
import { useSavedJobs } from '../store/SavedJobsContext';
import JobCard from '../components/JobCard';

const REGIME_LABELS = {
  FULL_TIME: 'სრული განაკვეთი',
  PART_TIME: 'ნაწილობრივი განაკვეთი',
  FREELANCE: 'ფრილანსი',
  REMOTE: 'დისტანციური',
};

const EXP_LABELS = {
  NONE: 'გამოცდილების გარეშე',
  JUNIOR: 'Junior',
  MID: 'Mid',
  SENIOR: 'Senior',
};

function avatarUri(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function JobDetailScreen({ route, navigation }) {
  const { jobId } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedJobs();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [hasCv, setHasCv] = useState(false);
  const [overrideCv, setOverrideCv] = useState(null); // { uri, name, mimeType }

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/jobs/${jobId}`);
        setJob(data);
      } catch (err) {
        Alert.alert('შეცდომა', 'ვაკანსია ვერ მოიძებნა');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  // Check if already applied + has CV
  useEffect(() => {
    if (!user || user.role !== 'CANDIDATE') return;
    (async () => {
      try {
        const [{ data: apps }, { data: profile }] = await Promise.all([
          api.get('/applications/mine'),
          api.get('/profiles/me'),
        ]);
        if (apps.some((a) => a.jobId === jobId)) setApplied(true);
        if (profile?.cvUrl) setHasCv(true);
      } catch {}
    })();
  }, [user, jobId]);

  const handleApply = async () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    if (!hasCv) {
      Alert.alert(
        'CV საჭიროა',
        'განაცხადის გასაგზავნად CV აუცილებელია. გთხოვთ ატვირთოთ CV პროფილის განყოფილებაში.',
        [
          { text: 'გაუქმება', style: 'cancel' },
          { text: 'პროფილზე გადასვლა', onPress: () => navigation.navigate('HomeTabs', { screen: 'Profile' }) },
        ]
      );
      return;
    }
    setApplying(true);
    try {
      await api.post(`/applications/job/${jobId}`, {});
      setApplied(true);
      Alert.alert('წარმატება', 'განაცხადი გაიგზავნა');
    } catch (err) {
      Alert.alert('შეცდომა', err.response?.data?.message || 'განაცხადის გაგზავნა ვერ მოხერხდა');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingBox, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.brand[500]} />
      </View>
    );
  }

  if (!job) return null;

  const saved = user?.role === 'CANDIDATE' && isSaved(job.id);
  const avatarUrl = avatarUri(job.employer?.avatarUrl || job.employer?.logoUrl);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        {user?.role === 'CANDIDATE' && (
          <TouchableOpacity onPress={() => toggleSave(job.id)}>
            <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={24} color={saved ? colors.brand[500] : colors.text.muted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Company header */}
        <View style={styles.companyRow}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.companyAvatar} />
          ) : (
            <View style={[styles.companyAvatar, styles.companyPlaceholder]}>
              <Ionicons name="business" size={24} color={colors.text.muted} />
            </View>
          )}
          <View style={styles.companyInfo}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            {job.employer?.companyName && (
              <TouchableOpacity
                onPress={() => {
                  const slug = job.employer.companyName.replace(/\s+/g, '-').toLowerCase();
                  navigation.navigate('Company', { slug });
                }}
              >
                <Text style={styles.companyName}>{job.employer.companyName}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick info tags */}
        <View style={styles.infoGrid}>
          {job.location && (
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={16} color={colors.brand[400]} />
              <Text style={styles.infoText}>{job.location}</Text>
            </View>
          )}
          {job.jobRegime && (
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={16} color={colors.brand[400]} />
              <Text style={styles.infoText}>{REGIME_LABELS[job.jobRegime] || job.jobRegime}</Text>
            </View>
          )}
          {job.experience && (
            <View style={styles.infoItem}>
              <Ionicons name="trending-up-outline" size={16} color={colors.brand[400]} />
              <Text style={styles.infoText}>{EXP_LABELS[job.experience] || job.experience}</Text>
            </View>
          )}
          {job.salary > 0 && (
            <View style={styles.infoItem}>
              <Ionicons name="cash-outline" size={16} color={colors.success} />
              <Text style={[styles.infoText, { color: colors.success }]}>
                {job.salary.toLocaleString()} {job.currency || '₾'}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>აღწერა</Text>
          <Text style={styles.description}>{job.description}</Text>
        </View>

        {/* Company's other jobs */}
        {job.companyJobs?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>კომპანიის სხვა ვაკანსიები</Text>
            {job.companyJobs.slice(0, 5).map((j) => (
              <JobCard
                key={j.id}
                job={j}
                onPress={(jj) => navigation.push('JobDetail', { jobId: jj.id })}
                compact
              />
            ))}
          </View>
        )}

        {/* Similar jobs */}
        {job.similarJobs?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>მსგავსი ვაკანსიები</Text>
            {job.similarJobs.slice(0, 5).map((j) => (
              <JobCard
                key={j.id}
                job={j}
                onPress={(jj) => navigation.push('JobDetail', { jobId: jj.id })}
                onCompanyPress={(employer) => {
                  const slug = employer.companyName.replace(/\s+/g, '-').toLowerCase();
                  navigation.navigate('Company', { slug });
                }}
                compact
              />
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Apply button */}
      {user?.role === 'CANDIDATE' && (
        <View style={[styles.applyBar, { paddingBottom: insets.bottom + spacing.md }]}>
          <TouchableOpacity
            style={[styles.applyBtn, applied && styles.applyBtnDone]}
            onPress={handleApply}
            disabled={applied || applying}
            activeOpacity={0.8}
          >
            {applying ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                <Ionicons
                  name={applied ? 'checkmark-circle' : 'paper-plane'}
                  size={18}
                  color={colors.white}
                />
                <Text style={styles.applyText}>
                  {applied ? 'გაგზავნილია' : 'განაცხადის გაგზავნა'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  companyRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  companyAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
  },
  companyPlaceholder: {
    backgroundColor: colors.surface[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  jobTitle: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: '700',
    lineHeight: 28,
  },
  companyName: {
    color: colors.brand[400],
    fontSize: fontSize.base,
    marginTop: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface[100],
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  infoText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  description: {
    color: colors.text.secondary,
    fontSize: fontSize.base,
    lineHeight: 22,
  },
  applyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface.DEFAULT,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  applyBtn: {
    backgroundColor: colors.brand[600],
    borderRadius: radius.lg,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  applyBtnDone: {
    backgroundColor: colors.success,
  },
  applyText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '700',
  },
});
