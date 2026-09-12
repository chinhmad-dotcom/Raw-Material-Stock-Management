import { useEffect } from 'react';
import { useThemeStore } from './store/themeStore';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './components/dashboard/DashboardPage';
import StockKho from './pages/stock/StockKho';
import StockSilo from './pages/stock/StockSilo';
import { LoginPage } from './pages/LoginPage';
import { SettingsPage } from './pages/SettingsPage';
import ExtruderPage from './pages/ExtruderPage';
import TruckTrackingPage from './pages/TruckTrackingPage';
import ReportsPage from './pages/ReportsPage';

import { useAuthStore } from './features/auth/store/authStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="stock-kho" element={<StockKho />} />
          <Route path="stock-silo" element={<StockSilo />} />
                    <Route path="extruder" element={<ExtruderPage />} />
          <Route path="truck-tracking" element={<TruckTrackingPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;


