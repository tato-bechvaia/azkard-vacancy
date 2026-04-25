import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/axios';

const SavedJobsContext = createContext({ savedIds: new Set(), toggle: () => {}, isSaved: () => false });

export function SavedJobsProvider({ children }) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    if (user?.role === 'CANDIDATE') {
      api.get('/saved-jobs/ids')
        .then(({ data }) => setSavedIds(new Set(data)))
        .catch(() => {});
    } else {
      setSavedIds(new Set());
    }
  }, [user?.role]);

  const isSaved = useCallback((jobId) => savedIds.has(+jobId), [savedIds]);

  const toggle = useCallback(async (jobId) => {
    if (!user) return false;
    const id = +jobId;
    const prev = savedIds.has(id);
    setSavedIds(s => {
      const next = new Set(s);
      if (prev) next.delete(id); else next.add(id);
      return next;
    });
    try {
      if (prev) await api.delete('/saved-jobs/' + id);
      else       await api.post('/saved-jobs/' + id);
      return true;
    } catch {
      setSavedIds(s => {
        const next = new Set(s);
        if (prev) next.add(id); else next.delete(id);
        return next;
      });
      return false;
    }
  }, [user, savedIds]);

  return (
    <SavedJobsContext.Provider value={{ savedIds, toggle, isSaved }}>
      {children}
    </SavedJobsContext.Provider>
  );
}

export const useSavedJobs = () => useContext(SavedJobsContext);
