import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, fontSize } from '../theme';
import { API_URL } from '../api/axios';
import { useSavedJobs } from '../store/SavedJobsContext';
import { useAuth } from '../store/AuthContext';

const REGIME_LABELS = {
  FULL_TIME: 'სრული',
  PART_TIME: 'ნაწილობრივი',
  FREELANCE: 'ფრილანსი',
  REMOTE: 'დისტანციური',
};

function avatarUri(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function JobCard({ job, onPress, onCompanyPress, compact = false }) {
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedJobs();
  const saved = user?.role === 'CANDIDATE' && isSaved(job.id);
  const isPremiumPlus = job.pricingTier === 'PREMIUM_PLUS';
  const isPremium = job.pricingTier === 'PREMIUM';

  const cardBorder = isPremiumPlus
    ? colors.warning
    : isPremium
      ? colors.brand[400]
      : colors.border.DEFAULT;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress?.(job)}
      style={[styles.card, { borderColor: cardBorder }]}
    >
      {/* Header row */}
      <View style={styles.header}>
        {job.employer?.avatarUrl || job.employer?.logoUrl ? (
          <Image
            source={{ uri: avatarUri(job.employer.avatarUrl || job.employer.logoUrl) }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="business" size={18} color={colors.text.muted} />
          </View>
        )}

        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={2}>{job.title}</Text>
          {job.employer?.companyName && (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={(e) => {
                e?.stopPropagation?.();
                onCompanyPress?.(job.employer);
              }}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            >
              <Text style={styles.company} numberOfLines={1}>{job.employer.companyName}</Text>
            </TouchableOpacity>
          )}
        </View>

        {user?.role === 'CANDIDATE' && (
          <TouchableOpacity
            onPress={(e) => {
              e?.stopPropagation?.();
              toggleSave(job.id);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={saved ? colors.brand[500] : colors.text.muted}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Tags row */}
      <View style={styles.tags}>
        {job.location && (
          <View style={styles.tag}>
            <Ionicons name="location-outline" size={12} color={colors.text.secondary} />
            <Text style={styles.tagText}>{job.location}</Text>
          </View>
        )}
        {job.jobRegime && (
          <View style={styles.tag}>
            <Ionicons name="time-outline" size={12} color={colors.text.secondary} />
            <Text style={styles.tagText}>{REGIME_LABELS[job.jobRegime] || job.jobRegime}</Text>
          </View>
        )}
        {job.salary > 0 && (
          <View style={[styles.tag, styles.salaryTag]}>
            <Text style={styles.salaryText}>
              {job.salary.toLocaleString()} {job.currency || '₾'}
            </Text>
          </View>
        )}
      </View>

      {/* Tier badge */}
      {(isPremiumPlus || isPremium) && (
        <View style={[styles.badge, isPremiumPlus ? styles.badgePremiumPlus : styles.badgePremium]}>
          <Ionicons name="star" size={10} color={isPremiumPlus ? '#FDE68A' : colors.brand[100]} />
          <Text style={[styles.badgeText, isPremiumPlus ? styles.badgeTextGold : null]}>
            {job.premiumBadgeLabel || (isPremiumPlus ? 'Premium+' : 'Premium')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface[100],
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
  },
  avatarPlaceholder: {
    backgroundColor: colors.surface[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
    lineHeight: 20,
  },
  company: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface[200],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  tagText: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
  },
  salaryTag: {
    backgroundColor: 'rgba(107, 70, 224, 0.12)',
  },
  salaryText: {
    color: colors.brand[300],
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgePremiumPlus: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  badgePremium: {
    backgroundColor: 'rgba(107, 70, 224, 0.15)',
  },
  badgeText: {
    color: colors.brand[200],
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeTextGold: {
    color: '#FDE68A',
  },
});
