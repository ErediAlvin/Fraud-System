import { Header } from '../components/Header';
import { FileText, Download, TrendingUp, DollarSign } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const reportTypes = [
  { name: 'Daily Fraud Summary', description: 'Daily overview of fraud alerts and cases', lastGenerated: '2026-05-12 06:30' },
  { name: 'Weekly Alert Trend Report', description: 'Weekly trends in fraud detection', lastGenerated: '2026-05-10 18:00' },
  { name: 'Ghost Beneficiary Risk Report', description: 'Analysis of enrollment anomalies', lastGenerated: '2026-05-11 12:00' },
  { name: 'Supplier Integrity Report', description: 'Supply chain fraud assessment', lastGenerated: '2026-05-09 14:00' },
  { name: 'Blockchain Audit Trail Export', description: 'Complete ledger verification export', lastGenerated: '2026-05-12 00:00' },
  { name: 'Model Performance Report', description: 'ML model accuracy and metrics', lastGenerated: '2026-05-11 18:00' },
];

const trendData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  CRITICAL: Math.floor(Math.random() * 15),
  HIGH: Math.floor(Math.random() * 40),
  MEDIUM: Math.floor(Math.random() * 70),
  LOW: Math.floor(Math.random() * 30),
}));

const countyData = [
  { name: 'Nairobi', alerts: 234 },
  { name: 'Mombasa', alerts: 167 },
  { name: 'Kisumu', alerts: 145 },
  { name: 'Nakuru', alerts: 98 },
  { name: 'Eldoret', alerts: 76 },
];

const resolutionData = [
  { name: 'TRUE FRAUD', value: 234, color: '#C0392B' },
  { name: 'FALSE POSITIVE', value: 156, color: '#E8A020' },
  { name: 'INCONCLUSIVE', value: 89, color: '#2471A3' },
  { name: 'PENDING', value: 127, color: '#6B7280' },
];

const financialData = [
  { metric: 'Transactions Flagged', value: 45678, unit: 'KES' },
  { metric: 'Confirmed Fraud', value: 23456, unit: 'KES' },
  { metric: 'Blocked by Smart Contract', value: 12345, unit: 'KES' },
  { metric: 'Recovered', value: 8976, unit: 'KES' },
];

export function ReportsAnalytics() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header breadcrumbs={['Reports & Analytics']} />

      <main className="flex-1 overflow-y-auto bg-[#F4F6F9] p-6">
        {/* Report generator */}
        <div className="bg-white rounded-lg border border-[#DDE1E7] p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">Generate Report</h3>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Report Type</label>
              <select className="border border-[#DDE1E7] rounded px-3 py-2 text-sm">
                <option>Daily Summary</option>
                <option>Weekly Fraud Report</option>
                <option>County Comparison</option>
                <option>Model Performance</option>
                <option>Compliance Audit</option>
                <option>Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Date Range</label>
              <input type="date" className="border border-[#DDE1E7] rounded px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="block text-xs text-[#6B7280] mb-1">County Filter</label>
              <select className="border border-[#DDE1E7] rounded px-3 py-2 text-sm">
                <option>All Counties</option>
                <option>Nairobi</option>
                <option>Mombasa</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button className="bg-[#1A3C5E] text-white px-4 py-2 rounded font-medium hover:bg-[#2E7D52] transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button className="border border-[#DDE1E7] px-4 py-2 rounded font-medium hover:bg-[#F4F6F9] transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Excel
              </button>
              <button className="border border-[#DDE1E7] px-4 py-2 rounded font-medium hover:bg-[#F4F6F9] transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                CSV
              </button>
            </div>
          </div>
        </div>

        {/* Pre-built reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {reportTypes.map((report, index) => (
            <div key={index} className="bg-white rounded-lg border border-[#DDE1E7] p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#F4F6F9] rounded">
                  <FileText className="w-5 h-5 text-[#1A3C5E]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm mb-1">{report.name}</h4>
                  <p className="text-xs text-[#6B7280] mb-2">{report.description}</p>
                  <p className="text-xs text-[#6B7280] mb-3">Last generated: {report.lastGenerated}</p>
                  <button className="text-[#1A3C5E] hover:text-[#2E7D52] text-sm font-medium">
                    Generate Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Analytics tabs */}
        <div className="bg-white rounded-lg border border-[#DDE1E7] p-6">
          <div className="border-b border-[#DDE1E7] mb-6">
            <div className="flex gap-6">
              <button className="pb-3 border-b-2 border-[#1A3C5E] font-medium text-sm">
                Fraud Trends
              </button>
              <button className="pb-3 text-[#6B7280] hover:text-[#1C1C1E] text-sm">
                Financial Impact
              </button>
              <button className="pb-3 text-[#6B7280] hover:text-[#1C1C1E] text-sm">
                Program Health
              </button>
              <button className="pb-3 text-[#6B7280] hover:text-[#1C1C1E] text-sm">
                Model Performance
              </button>
            </div>
          </div>

          {/* Fraud Trends tab content */}
          <div className="space-y-6">
            {/* Alert trends */}
            <div>
              <h3 className="font-bold text-lg mb-4">30-Day Alert Trends by Tier</h3>
              <ResponsiveContainer width="100%" height={300}>
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

            {/* County comparison */}
            <div>
              <h3 className="font-bold text-lg mb-4">Alerts by County</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={countyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="alerts" fill="#C0392B" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Resolution outcomes */}
            <div>
              <h3 className="font-bold text-lg mb-4">Alert Resolution Outcomes</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={resolutionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {resolutionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
