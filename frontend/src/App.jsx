import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';

import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobsPage     from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import ProfilePage  from './pages/ProfilePage';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to='/login' replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/'         element={<JobsPage />} />
          <Route path='/jobs'     element={<JobsPage />} />
          <Route path='/jobs/:id' element={<JobDetailPage />} />
          <Route path='/login'    element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/profile'  element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

