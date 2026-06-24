import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
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

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/alerts"
          element={
            <DashboardLayout>
              <FraudAlerts />
            </DashboardLayout>
          }
        />
        <Route
          path="/cases"
          element={
            <DashboardLayout>
              <CaseManagement />
            </DashboardLayout>
          }
        />
        <Route
          path="/beneficiaries"
          element={
            <DashboardLayout>
              <BeneficiaryMonitor />
            </DashboardLayout>
          }
        />
        <Route
          path="/transactions"
          element={
            <DashboardLayout>
              <TransactionMonitor />
            </DashboardLayout>
          }
        />
        <Route
          path="/supply-chain"
          element={
            <DashboardLayout>
              <SupplyChainMonitor />
            </DashboardLayout>
          }
        />
        <Route
          path="/blockchain"
          element={
            <DashboardLayout>
              <BlockchainLedger />
            </DashboardLayout>
          }
        />
        <Route
          path="/risk-profiles"
          element={
            <DashboardLayout>
              <RiskProfiles />
            </DashboardLayout>
          }
        />
        <Route
          path="/reports"
          element={
            <DashboardLayout>
              <ReportsAnalytics />
            </DashboardLayout>
          }
        />
        <Route
          path="/model-performance"
          element={
            <DashboardLayout>
              <ModelPerformance />
            </DashboardLayout>
          }
        />
        <Route
          path="/procedures"
          element={
            <DashboardLayout>
              <SOBCOBProcedures />
            </DashboardLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <DashboardLayout>
              <SystemSettings />
            </DashboardLayout>
          }
        />
      </Routes>
    </Router>
  );
}