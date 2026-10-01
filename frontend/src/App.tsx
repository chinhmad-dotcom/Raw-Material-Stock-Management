import { useEffect } from 'react';
import { useThemeStore } from './store/themeStore';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const DashboardPage = lazy(() => import('./components/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const StockKho = lazy(() => import('./pages/stock/StockKho'));
const StockSilo = lazy(() => import('./pages/stock/StockSilo'));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ExtruderPage = lazy(() => import('./pages/ExtruderPage'));
const TruckTrackingPage = lazy(() => import('./pages/TruckTrackingPage'));
const FanReportPage = lazy(() => import('./pages/FanReportPage'));
const FumigationReportPage = lazy(() => import('./pages/FumigationReportPage'));
const ElectricityCostReport = lazy(() => import('./pages/ElectricityCostReport'));
const KpiDashboard = lazy(() => import('./pages/KpiDashboard'));

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex h-full w-full items-center justify-center min-h-[50vh]">
    <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
  </div>
);

import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';

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
        <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
          <Route path="stock-kho" element={<Suspense fallback={<PageLoader />}><StockKho /></Suspense>} />
          <Route path="stock-silo" element={<Suspense fallback={<PageLoader />}><StockSilo /></Suspense>} />
          <Route path="extruder" element={<Suspense fallback={<PageLoader />}><ExtruderPage /></Suspense>} />
          <Route path="kpi-rm" element={<Suspense fallback={<PageLoader />}><KpiDashboard /></Suspense>} />
          <Route path="truck-tracking" element={<Suspense fallback={<PageLoader />}><TruckTrackingPage /></Suspense>} />
          <Route path="reports/fans" element={<Suspense fallback={<PageLoader />}><FanReportPage /></Suspense>} />
          <Route path="reports/fumigation" element={<Suspense fallback={<PageLoader />}><FumigationReportPage /></Suspense>} />
          <Route path="reports/electricity-cost" element={<Suspense fallback={<PageLoader />}><ElectricityCostReport /></Suspense>} />
          <Route path="reports" element={<Navigate to="/reports/electricity-cost" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;


