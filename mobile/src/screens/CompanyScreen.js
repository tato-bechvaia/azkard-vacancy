import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Linking, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, fontSize } from '../theme';
import api, { API_URL } from '../api/axios';
import JobCard from '../components/JobCard';

function avatarUri(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function CompanyScreen({ route, navigation }) {
  const { slug } = route.params;
  const insets = useSafeAreaInsets();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/profiles/company/${slug}`);
        setCompany(data);
      } catch (err) {
        Alert.alert('შეცდომა', 'კომპანია ვერ მოიძებნა');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <View style={[styles.loadingBox, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.brand[500]} />
      </View>
    );
  }

  if (!company) return null;

  const avatar = avatarUri(company.avatarUrl || company.logoUrl);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Company card */}
        <View style={styles.companyCard}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="business" size={36} color={colors.text.muted} />
            </View>
          )}
          <Text style={styles.companyName}>{company.companyName}</Text>

          {company.website && (
            <TouchableOpacity
              onPress={() => Linking.openURL(company.website)}
              style={styles.websiteBtn}
            >
              <Ionicons name="globe-outline" size={14} color={colors.brand[400]} />
              <Text style={styles.websiteText}>{company.website.replace(/^https?:\/\//, '')}</Text>
            </TouchableOpacity>
          )}

          {company.description && (
            <Text style={styles.description}>{company.description}</Text>
          )}

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Ionicons name="briefcase-outline" size={16} color={colors.brand[400]} />
              <Text style={styles.statText}>{company.jobs?.length || 0} ვაკანსია</Text>
            </View>
          </View>
        </View>

        {/* Jobs */}
        {company.jobs?.length > 0 && (
          <View style={styles.jobsSection}>
            <Text style={styles.sectionTitle}>ვაკანსიები</Text>
            {company.jobs.map((j) => (
              <JobCard
                key={j.id}
                job={j}
                onPress={(jj) => navigation.navigate('JobDetail', { jobId: jj.id })}
              />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
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
  topBar: {
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
  scroll: {
    paddingHorizontal: spacing.xl,
  },
  companyCard: {
    backgroundColor: colors.surface[100],
    borderRadius: radius.xl,
    padding: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
  },
  avatarPlaceholder: {
    backgroundColor: colors.surface[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyName: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  websiteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  websiteText: {
    color: colors.brand[400],
    fontSize: fontSize.sm,
  },
  description: {
    color: colors.text.secondary,
    fontSize: fontSize.base,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.xl,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  jobsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
});
