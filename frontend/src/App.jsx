import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { SocketProvider } from './store/SocketContext';
import { SavedJobsProvider } from './store/SavedJobsContext';
import Toast from './components/Toast';
import AdminChatbot from './components/AdminChatbot';

import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import JobsPage       from './pages/JobsPage';
import JobDetailPage  from './pages/JobDetailPage';
import ProfilePage    from './pages/ProfilePage';
import CompanyPage    from './pages/CompanyPage';
import SavedJobsPage  from './pages/SavedJobsPage';
import PricingPage    from './pages/PricingPage';
import VacanciesPage  from './pages/VacanciesPage';
import CVBoxesPage    from './pages/CVBoxesPage';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to='/login' replace />;
}

function AppContent() {
  const { user } = useAuth();
  return (
    <>
      <Toast />
      {user?.isAdmin && <AdminChatbot />}
      <BrowserRouter>
        <Routes>
          <Route path='/'            element={<JobsPage />} />
          <Route path='/jobs'        element={<JobsPage />} />
          <Route path='/jobs/:id'    element={<JobDetailPage />} />
          <Route path='/login'       element={<LoginPage />} />
          <Route path='/register'    element={<RegisterPage />} />
          <Route path='/companies/:slug' element={<CompanyPage />} />
          <Route path='/pricing'     element={<PricingPage />} />
          <Route path='/vacancies'   element={<VacanciesPage />} />
          <Route path='/cv-boxes'    element={<CVBoxesPage />} />
          <Route path='/profile'     element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path='/saved'       element={<PrivateRoute><SavedJobsPage /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <SavedJobsProvider>
          <AppContent />
        </SavedJobsProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
