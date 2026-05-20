import { StatCard } from '../components/StatCard';
import { RiskBadge } from '../components/RiskBadge';
import { Header } from '../components/Header';
import {
  AlertTriangle,
  Briefcase,
  Shield,
  Activity,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const alertsByTier = [
  { name: 'CRITICAL', value: 12, color: '#C0392B' },
  { name: 'HIGH', value: 34, color: '#E8A020' },
  { name: 'MEDIUM', value: 67, color: '#2471A3' },
  { name: 'LOW', value: 23, color: '#2E7D52' },
];

const countyData = [
  { name: 'Nairobi', alerts: 45 },
  { name: 'Mombasa', alerts: 32 },
  { name: 'Kisumu', alerts: 28 },
  { name: 'Nakuru', alerts: 18 },
  { name: 'Eldoret', alerts: 13 },
];

const trendData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  CRITICAL: Math.floor(Math.random() * 15),
  HIGH: Math.floor(Math.random() * 40),
  MEDIUM: Math.floor(Math.random() * 70),
  LOW: Math.floor(Math.random() * 30),
}));

const recentAlerts = [
  { id: 'ALT-2026-0547', entity: 'Kilimani Primary School', type: 'ENROLLMENT', tier: 'CRITICAL' as const, time: '5 mins ago' },
  { id: 'ALT-2026-0546', entity: 'M-Pesa Account #7842', type: 'PAYMENT', tier: 'HIGH' as const, time: '12 mins ago' },
  { id: 'ALT-2026-0545', entity: 'ABC Suppliers Ltd', type: 'SUPPLY_CHAIN', tier: 'HIGH' as const, time: '23 mins ago' },
  { id: 'ALT-2026-0544', entity: 'Student ID 45892', type: 'ENROLLMENT', tier: 'MEDIUM' as const, time: '1 hour ago' },
  { id: 'ALT-2026-0543', entity: 'Westlands School', type: 'TEMPORAL', tier: 'LOW' as const, time: '2 hours ago' },
];

const topFlaggedEntities = [
  { name: 'Kilimani Primary', type: 'SCHOOL', score: 0.94, tier: 'CRITICAL' as const },
  { name: 'M-Pesa #7842', type: 'PAYMENT', score: 0.87, tier: 'HIGH' as const },
  { name: 'ABC Suppliers', type: 'SUPPLIER', score: 0.82, tier: 'HIGH' as const },
  { name: 'Student #45892', type: 'STUDENT', score: 0.71, tier: 'MEDIUM' as const },
  { name: 'Westlands School', type: 'SCHOOL', score: 0.65, tier: 'MEDIUM' as const },
];

export function Dashboard() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header breadcrumbs={['Dashboard', 'Overview']} />

      <main className="flex-1 overflow-y-auto bg-[#F4F6F9] p-6">
        {/* Top stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <StatCard
            icon={Briefcase}
            label="Total Active Cases"
            value={127}
            trend={{ value: 8, direction: 'up' }}
          />
          <StatCard
            icon={AlertTriangle}
            label="Critical Alerts Today"
            value={12}
            variant="critical"
          />
          <StatCard
            icon={Shield}
            label="High Risk Entities"
            value={89}
            trend={{ value: 3, direction: 'down' }}
          />
          <StatCard
            icon={Activity}
            label="Transactions Scored Today"
            value="2.4K"
            sparklineData={[12, 19, 15, 23, 18, 29, 22, 31]}
          />
          <StatCard
            icon={CheckCircle}
            label="False Positive Rate"
            value="4.2%"
            trend={{ value: 1.3, direction: 'down' }}
          />
          <StatCard
            icon={TrendingUp}
            label="Models Active"
            value="5/5"
          />
        </div>

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Live Alert Feed */}
          <div className="lg:col-span-5 bg-white rounded-lg border border-[#DDE1E7] p-6">
            <h3 className="font-bold text-lg mb-4">Live Alert Feed</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 border border-[#DDE1E7] rounded-lg hover:bg-[#F4F6F9] cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <RiskBadge tier={alert.tier} />
                      <span className="text-xs text-[#6B7280]">{alert.type}</span>
                    </div>
                    <span className="text-xs text-[#6B7280]">{alert.time}</span>
                  </div>
                  <p className="font-medium text-sm">{alert.entity}</p>
                  <p className="text-xs text-[#6B7280] font-mono">{alert.id}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Center column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Risk Distribution Chart */}
            <div className="bg-white rounded-lg border border-[#DDE1E7] p-6">
              <h3 className="font-bold text-lg mb-4">Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={alertsByTier}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label
                  >
                    {alertsByTier.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* County Heatmap */}
            <div className="bg-white rounded-lg border border-[#DDE1E7] p-6">
              <h3 className="font-bold text-lg mb-4">County Risk Concentration</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={countyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="alerts" fill="#C0392B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-3 space-y-6">
            {/* SOB/COB Status */}
            <div className="bg-white rounded-lg border border-[#DDE1E7] p-6">
              <h3 className="font-bold text-lg mb-4">SOB / COB Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">Today's SOB</span>
                  <span className="text-xs text-[#2E7D52] font-medium">COMPLETED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">COB Scheduled</span>
                  <span className="text-xs font-mono">18:00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">Last Retrain</span>
                  <span className="text-xs font-mono">May 11, 2026</span>
                </div>
              </div>
            </div>

            {/* Top 5 Flagged Entities */}
            <div className="bg-white rounded-lg border border-[#DDE1E7] p-6">
              <h3 className="font-bold text-lg mb-4">Top Flagged Entities</h3>
              <div className="space-y-3">
                {topFlaggedEntities.map((entity, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{entity.name}</p>
                        <p className="text-xs text-[#6B7280]">{entity.type}</p>
                      </div>
                      <RiskBadge tier={entity.tier} />
                    </div>
                    <div className="w-full bg-[#F4F6F9] rounded-full h-1.5">
                      <div
                        className="bg-[#C0392B] h-1.5 rounded-full"
                        style={{ width: `${entity.score * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blockchain Sync Status */}
            <div className="bg-white rounded-lg border border-[#DDE1E7] p-6">
              <h3 className="font-bold text-lg mb-4">Blockchain Sync</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">Status</span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#2E7D52] rounded-full"></span>
                    <span className="text-xs font-medium">HEALTHY</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">Last Sync</span>
                  <span className="text-xs font-mono">2 mins ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 30-day trend */}
        <div className="mt-6 bg-white rounded-lg border border-[#DDE1E7] p-6">
          <h3 className="font-bold text-lg mb-4">30-Day Alert Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="CRITICAL" stroke="#C0392B" strokeWidth={2} />
              <Line type="monotone" dataKey="HIGH" stroke="#E8A020" strokeWidth={2} />
              <Line type="monotone" dataKey="MEDIUM" stroke="#2471A3" strokeWidth={2} />
              <Line type="monotone" dataKey="LOW" stroke="#2E7D52" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}
