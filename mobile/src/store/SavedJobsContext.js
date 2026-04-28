import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const SavedJobsContext = createContext(null);

export function SavedJobsProvider({ children }) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState([]);

  const fetchIds = useCallback(async () => {
    if (!user || user.role !== 'CANDIDATE') return;
    try {
      const { data } = await api.get('/saved-jobs/ids');
      setSavedIds(data);
    } catch {
      setSavedIds([]);
    }
  }, [user]);

  useEffect(() => {
    fetchIds();
  }, [fetchIds]);

  const toggleSave = async (jobId) => {
    if (!user) return;
    const wasSaved = savedIds.includes(jobId);
    // Optimistic update — toggle immediately
    setSavedIds((prev) => wasSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]);
    try {
      if (wasSaved) {
        await api.delete(`/saved-jobs/${jobId}`);
      } else {
        await api.post(`/saved-jobs/${jobId}`);
      }
    } catch {
      // Rollback on failure
      setSavedIds((prev) => wasSaved ? [...prev, jobId] : prev.filter((id) => id !== jobId));
    }
  };

  const isSaved = (jobId) => savedIds.includes(jobId);

  return (
    <SavedJobsContext.Provider value={{ savedIds, isSaved, toggleSave, refetch: fetchIds }}>
      {children}
    </SavedJobsContext.Provider>
  );
}

export const useSavedJobs = () => useContext(SavedJobsContext);
