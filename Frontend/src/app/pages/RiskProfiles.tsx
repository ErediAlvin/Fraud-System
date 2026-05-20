import { Header } from '../components/Header';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import { StatCard } from '../components/StatCard';
import { Shield, AlertTriangle, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const mockProfiles = [
  {
    id: 'PROF-2026-0547',
    name: 'Kilimani Primary School',
    type: 'SCHOOL',
    county: 'Nairobi',
    riskScore: 0.94,
    tier: 'CRITICAL' as const,
    status: 'WATCHLIST',
    totalAlerts: 23,
    falsePositives: 2,
    lastScored: '2026-05-12 14:23',
  },
  {
    id: 'PROF-2026-0546',
    name: 'M-Pesa Account #7842',
    type: 'PAYMENT_ACCOUNT',
    county: 'Nairobi',
    riskScore: 0.87,
    tier: 'HIGH' as const,
    status: 'WATCHLIST',
    totalAlerts: 12,
    falsePositives: 1,
    lastScored: '2026-05-12 14:15',
  },
  {
    id: 'PROF-2026-0545',
    name: 'ABC Suppliers Ltd',
    type: 'SUPPLIER',
    county: 'Multi-County',
    riskScore: 0.82,
    tier: 'HIGH' as const,
    status: 'SUSPENDED',
    totalAlerts: 34,
    falsePositives: 4,
    lastScored: '2026-05-12 13:47',
  },
];

const riskHistoryData = Array.from({ length: 90 }, (_, i) => ({
  day: i + 1,
  score: 0.3 + Math.random() * 0.5,
}));

const radarData = [
  { metric: 'IF Score', value: 0.92 },
  { metric: 'AE Score', value: 0.95 },
  { metric: 'LSTM Score', value: 0.89 },
  { metric: 'GNN Score', value: 0.98 },
];

export function RiskProfiles() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header breadcrumbs={['Entity Risk Profiles']} />

      <main className="flex-1 overflow-y-auto bg-[#F4F6F9] p-6">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard icon={Shield} label="Total Entities Monitored" value="15,234" />
          <StatCard icon={Eye} label="On Watchlist" value={289} variant="warning" />
          <StatCard icon={AlertTriangle} label="Suspended" value={47} variant="critical" />
          <StatCard label="New High Risk (7 days)" value={23} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-[#DDE1E7] p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Entity Type</label>
              <select className="border border-[#DDE1E7] rounded px-3 py-1.5 text-sm">
                <option value="ALL">All Types</option>
                <option value="SCHOOL">School</option>
                <option value="STUDENT">Student</option>
                <option value="SUPPLIER">Supplier</option>
                <option value="PAYMENT_ACCOUNT">Payment Account</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Risk Tier</label>
              <select className="border border-[#DDE1E7] rounded px-3 py-1.5 text-sm">
                <option value="ALL">All Tiers</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Status</label>
              <select className="border border-[#DDE1E7] rounded px-3 py-1.5 text-sm">
                <option value="ALL">All Statuses</option>
                <option value="CLEAN">Clean</option>
                <option value="WATCHLIST">Watchlist</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            <div className="flex-1"></div>

            <div className="self-end">
              <input
                type="text"
                placeholder="Search by name or ID..."
                className="border border-[#DDE1E7] rounded px-3 py-1.5 text-sm w-64"
              />
            </div>
          </div>
        </div>

        {/* Profiles table */}
        <div className="bg-white rounded-lg border border-[#DDE1E7] overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F4F6F9] border-b border-[#DDE1E7]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                    Entity ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                    County
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                    Risk Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                    Tier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                    Total Alerts
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockProfiles.map((profile, index) => (
                  <tr
                    key={profile.id}
                    className={`border-b border-[#DDE1E7] hover:bg-[#F4F6F9] cursor-pointer ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-mono">{profile.id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{profile.name}</td>
                    <td className="px-4 py-3 text-sm">{profile.type}</td>
                    <td className="px-4 py-3 text-sm">{profile.county}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-[#F4F6F9] rounded-full h-2">
                          <div
                            className="bg-[#C0392B] h-2 rounded-full"
                            style={{ width: `${profile.riskScore * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono">{profile.riskScore.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge tier={profile.tier} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={profile.status} />
                    </td>
                    <td className="px-4 py-3 text-sm">{profile.totalAlerts}</td>
                    <td className="px-4 py-3">
                      <button className="text-[#1A3C5E] hover:text-[#2E7D52] text-sm font-medium">
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk history */}
          <div className="bg-white rounded-lg border border-[#DDE1E7] p-6">
            <h3 className="font-bold text-lg mb-4">90-Day Risk Score History</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={riskHistoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#C0392B" strokeWidth={2} name="Risk Score" />
                <Line type="monotone" y={0.7} stroke="#E8A020" strokeDasharray="5 5" />
                <Line type="monotone" y={0.5} stroke="#2471A3" strokeDasharray="5 5" />
                <Line type="monotone" y={0.3} stroke="#2E7D52" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-[#C0392B]"></div>
                <span>Critical (0.7+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-[#E8A020]"></div>
                <span>High (0.5-0.7)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-[#2471A3]"></div>
                <span>Medium (0.3-0.5)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-[#2E7D52]"></div>
                <span>Low (&lt;0.3)</span>
              </div>
            </div>
          </div>

          {/* Model scores radar */}
          <div className="bg-white rounded-lg border border-[#DDE1E7] p-6">
            <h3 className="font-bold text-lg mb-4">Model Score Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 1]} tick={{ fontSize: 10 }} />
                <Radar name="Scores" dataKey="value" stroke="#C0392B" fill="#C0392B" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
