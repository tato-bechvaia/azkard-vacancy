import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, fontSize } from '../theme';
import api from '../api/axios';
import JobCard from '../components/JobCard';

export default function SavedJobsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSaved = useCallback(async () => {
    try {
      const { data } = await api.get('/saved-jobs');
      setSavedJobs(data);
    } catch {
      setSavedJobs([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSaved().finally(() => setLoading(false));
    }, [fetchSaved])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSaved();
    setRefreshing(false);
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
        <Text style={styles.title}>შენახული ვაკანსიები</Text>
        <Text style={styles.count}>{savedJobs.length}</Text>
      </View>

      <FlatList
        data={savedJobs}
        keyExtractor={(item) => `saved-${item.job.id}`}
        renderItem={({ item }) => (
          <JobCard
            job={item.job}
            onPress={(j) => navigation.navigate('JobDetail', { jobId: j.id })}
            onCompanyPress={(employer) => {
              const slug = employer.companyName.replace(/\s+/g, '-').toLowerCase();
              navigation.navigate('Company', { slug });
            }}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[500]} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="bookmark-outline" size={48} color={colors.text.muted} />
            <Text style={styles.emptyTitle}>შენახული ვაკანსიები არ არის</Text>
            <Text style={styles.emptySubtitle}>ვაკანსიებზე ბუქმარკზე დაჭერით შეინახავთ</Text>
          </View>
        }
      />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  title: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  count: {
    color: colors.brand[400],
    fontSize: fontSize.lg,
    fontWeight: '700',
    backgroundColor: 'rgba(107, 70, 224, 0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: 100,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  emptySubtitle: {
    color: colors.text.muted,
    fontSize: fontSize.sm,
    textAlign: 'center',
    paddingHorizontal: spacing['4xl'],
  },
});
