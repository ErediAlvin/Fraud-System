import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { FraudAlerts } from './pages/FraudAlerts';
import { CaseManagement } from './pages/CaseManagement';
import { BeneficiaryMonitor } from './pages/BeneficiaryMonitor';
import { TransactionMonitor } from './pages/TransactionMonitor';
import { SupplyChainMonitor } from './pages/SupplyChainMonitor';
import { BlockchainLedger } from './pages/BlockchainLedger';
import { RiskProfiles } from './pages/RiskProfiles';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { ModelPerformance } from './pages/ModelPerformance';
import { SOBCOBProcedures } from './pages/SOBCOBProcedures';
import { SystemSettings } from './pages/SystemSettings';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="size-full flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  );
}

/** Wraps a page in both the ProtectedRoute guard and the DashboardLayout */
function ProtectedPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedPage>
                <Dashboard />
              </ProtectedPage>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedPage>
                <FraudAlerts />
              </ProtectedPage>
            }
          />
          <Route
            path="/cases"
            element={
              <ProtectedPage>
                <CaseManagement />
              </ProtectedPage>
            }
          />
          <Route
            path="/beneficiaries"
            element={
              <ProtectedPage>
                <BeneficiaryMonitor />
              </ProtectedPage>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedPage>
                <TransactionMonitor />
              </ProtectedPage>
            }
          />
          <Route
            path="/supply-chain"
            element={
              <ProtectedPage>
                <SupplyChainMonitor />
              </ProtectedPage>
            }
          />
          <Route
            path="/blockchain"
            element={
              <ProtectedPage>
                <BlockchainLedger />
              </ProtectedPage>
            }
          />
          <Route
            path="/risk-profiles"
            element={
              <ProtectedPage>
                <RiskProfiles />
              </ProtectedPage>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedPage>
                <ReportsAnalytics />
              </ProtectedPage>
            }
          />
          <Route
            path="/model-performance"
            element={
              <ProtectedPage>
                <ModelPerformance />
              </ProtectedPage>
            }
          />
          <Route
            path="/procedures"
            element={
              <ProtectedPage>
                <SOBCOBProcedures />
              </ProtectedPage>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedPage>
                <SystemSettings />
              </ProtectedPage>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}