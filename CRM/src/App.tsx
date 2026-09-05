import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import { AdminPanel } from './components/AdminPanel';

function Gate() {
  const auth = useAuth();

  if (auth.isLoading || !auth.initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF3E6] dark:bg-[#381932] text-sm text-[#381932] dark:text-[#FFF3E6]">
        Verifying admin access...
      </div>
    );
  }

  if (!auth.isLoggedIn || !auth.user || (!auth.isAdmin && !auth.isStaff)) {
    return <LoginPage />;
  }

  return <AdminPanel user={auth.user} onLogout={auth.logout} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
        <Routes>
          {/* AdminPanel reads the active view from the URL itself
              (/, /products, /orders, ...); everything routes through
              the same auth gate. */}
          <Route path="/*" element={<Gate />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
