import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, fontSize } from '../theme';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';
import JobCard from '../components/JobCard';
import FilterSheet from '../components/FilterSheet';

const LIMIT = 10;

export default function JobsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    location: '', regimes: [], experience: '', sort: 'newest', salaryMin: '', salaryMax: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const [premiumPlusJobs, setPremiumPlusJobs] = useState([]);
  const [premiumJobs, setPremiumJobs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  const fetchJobs = useCallback(async (p = 1, append = false) => {
    try {
      setError(null);
      const params = { page: p, limit: LIMIT };
      if (search) params.search = search;
      if (filters.location) params.location = filters.location;
      if (filters.regimes.length) params.regime = filters.regimes.join(',');
      if (filters.experience) params.experience = filters.experience;
      if (filters.sort && filters.sort !== 'newest') params.sort = filters.sort;
      if (filters.salaryMin) params.salaryMin = filters.salaryMin;
      if (filters.salaryMax) params.salaryMax = filters.salaryMax;

      const { data } = await api.get('/jobs', { params });

      if (p === 1) {
        setPremiumPlusJobs(data.premiumPlusJobs || []);
        setPremiumJobs(data.premiumJobs || []);
      }
      setJobs((prev) => (append ? [...prev, ...data.standardJobs] : data.standardJobs));
      setTotalPages(data.pages);
      setPage(p);
    } catch (err) {
      console.error('fetchJobs error:', err.message);
      setError(err.message || 'სერვერთან დაკავშირება ვერ მოხერხდა');
    }
  }, [search, filters]);

  // Initial load + filter/search changes
  useEffect(() => {
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      await fetchJobs(1);
      setLoading(false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [fetchJobs]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs(1);
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    await fetchJobs(page + 1, true);
    setLoadingMore(false);
  };

  const activeFilterCount = [
    ...filters.regimes,
    filters.experience,
    filters.location,
    filters.sort !== 'newest' ? filters.sort : '',
    filters.salaryMin,
    filters.salaryMax,
  ].filter(Boolean).length;

  // Combine premium + standard into sections for FlatList
  const allJobs = [
    ...(premiumPlusJobs.length ? [{ type: 'section', title: 'Premium+' }] : []),
    ...premiumPlusJobs.map((j) => ({ type: 'job', data: j })),
    ...(premiumJobs.length ? [{ type: 'section', title: 'Premium' }] : []),
    ...premiumJobs.map((j) => ({ type: 'job', data: j })),
    ...(jobs.length ? [{ type: 'section', title: 'ვაკანსიები' }] : []),
    ...jobs.map((j) => ({ type: 'job', data: j })),
  ];

  const renderItem = ({ item }) => {
    if (item.type === 'section') {
      return <Text style={styles.sectionTitle}>{item.title}</Text>;
    }
    return (
      <JobCard
        job={item.data}
        onPress={(j) => navigation.navigate('JobDetail', { jobId: j.id })}
        onCompanyPress={(employer) => {
          const slug = employer.companyName.replace(/\s+/g, '-').toLowerCase();
          navigation.navigate('Company', { slug });
        }}
      />
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoPill}>
          <Text style={styles.logoText}>Azkard</Text>
        </View>
        {!user && (
          <TouchableOpacity
            style={styles.headerLoginBtn}
            onPress={() => navigation.getParent()?.navigate('Login')}
            activeOpacity={0.8}
          >
            <Ionicons name="person-circle-outline" size={18} color={colors.brand[400]} />
            <Text style={styles.headerLoginText}>შესვლა</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.text.muted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="ვაკანსიის ძებნა..."
            placeholderTextColor={colors.text.muted}
            returnKeyType="search"
          />
          {search !== '' && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.text.muted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilters(true)}>
          <Ionicons name="options-outline" size={20} color={colors.text.primary} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.loadingBox}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.danger} />
          <Text style={[styles.emptyText, { color: colors.danger, marginTop: spacing.md }]}>{error}</Text>
          <TouchableOpacity
            style={{ marginTop: spacing.lg, backgroundColor: colors.brand[600], paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.lg }}
            onPress={onRefresh}
          >
            <Text style={{ color: colors.white, fontWeight: '700' }}>ხელახლა ცდა</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.brand[500]} />
        </View>
      ) : (
        <FlatList
          data={allJobs}
          keyExtractor={(item, i) => (item.type === 'job' ? `job-${item.data.id}` : `sec-${i}`)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[500]} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={{ marginVertical: 20 }} color={colors.brand[500]} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="briefcase-outline" size={48} color={colors.text.muted} />
              <Text style={styles.emptyText}>ვაკანსია ვერ მოიძებნა</Text>
            </View>
          }
        />
      )}

      <FilterSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={setFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.DEFAULT,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  headerLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(107, 70, 224, 0.1)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  headerLoginText: {
    color: colors.brand[400],
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  logoPill: {
    backgroundColor: colors.brand[600],
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  logoText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: '800',
    letterSpacing: 1,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface[100],
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: fontSize.base,
    paddingVertical: spacing.md,
  },
  filterBtn: {
    width: 46,
    height: 46,
    backgroundColor: colors.surface[100],
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.brand[600],
    borderRadius: radius.full,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  sectionTitle: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: 80,
    gap: spacing.md,
  },
  emptyText: {
    color: colors.text.muted,
    fontSize: fontSize.base,
  },
});
