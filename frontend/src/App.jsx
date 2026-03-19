import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';

import LandingPage       from './pages/LandingPage';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import JobsPage          from './pages/JobsPage';
import JobDetailPage     from './pages/JobDetailPage';
import EmployerDashboard from './pages/EmployerDashboard';
import CandidateDashboard from './pages/CandidateDashboard';

function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to='/login' replace />;
  if (role && user.role !== role) return <Navigate to='/jobs' replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/'         element={<LandingPage />} />
          <Route path='/login'    element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/jobs'     element={<JobsPage />} />
          <Route path='/jobs/:id' element={<JobDetailPage />} />
          <Route path='/employer' element={
            <PrivateRoute role='EMPLOYER'><EmployerDashboard /></PrivateRoute>
          } />
          <Route path='/candidate' element={
            <PrivateRoute role='CANDIDATE'><CandidateDashboard /></PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}