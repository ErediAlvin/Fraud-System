import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import {
  FileText,
  Download,
  TrendingUp,
  DollarSign,
  Activity,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../lib/api';

export function ReportsAnalytics() {
  const [activeTab, setActiveTab] = useState<'trends' | 'financial' | 'health' | 'models'>('trends');

  // Datasets from backend
  const [reportTypes, setReportTypes] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [countyData, setCountyData] = useState<any[]>([]);
  const [resolutionData, setResolutionData] = useState<any[]>([]);
  const [financialData, setFinancialData] = useState<any[]>([]);
  const [financialTrend, setFinancialTrend] = useState<any[]>([]);
  const [programHealth, setProgramHealth] = useState<any[]>([]);
  const [modelPerformance, setModelPerformance] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Generator form controls
  const [selectedReportType, setSelectedReportType] = useState('daily_summary');
  const [selectedCounty, setSelectedCounty] = useState('All Counties');
  const [selectedDate, setSelectedDate] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadReports() {
      try {
        setLoading(true);
        const res = await api.get<any>('/reports');
        if (isMounted) {
          setReportTypes(res.reportTypes || []);
          setTrendData(res.trendData || []);
          setCountyData(res.countyData || []);
          setResolutionData(res.resolutionData || []);
          setFinancialData(res.financialData || []);
          setFinancialTrend(res.financialTrend || []);
          setProgramHealth(res.programHealth || []);
          setModelPerformance(res.modelPerformance || []);
          setError('');
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load reports data.');
          setLoading(false);
        }
      }
    }
    loadReports();
    return () => {
      isMounted = false;
    };
  }, []);

  // Download export trigger
  const handleExport = (typeKey: string, format = 'csv') => {
    setExporting(true);
    const params = new URLSearchParams({
      type: typeKey,
      format: format,
    });
    if (selectedCounty && selectedCounty !== 'All Counties') {
      params.append('county', selectedCounty);
    }
    if (selectedDate) {
      params.append('date_from', selectedDate);
    }

    // Trigger download via proxy URL
    window.location.href = `/api/reports/export?${params.toString()}`;
    setTimeout(() => setExporting(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header breadcrumbs={['Reports & Analytics']} />

      <main className="flex-1 overflow-y-auto bg-[#F4F6F9] p-6">
        {/* ── Top Report Generator Bar ── */}
        <div className="bg-white rounded-lg border border-[#DDE1E7] p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-[#1A3C5E]">On-Demand Report & Audit Export Generator</h3>
            {exporting && (
              <span className="text-xs text-[#2E7D52] font-semibold flex items-center gap-1.5 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Preparing download...
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1">Report Format / Type</label>
              <select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="border border-[#DDE1E7] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1A3C5E]"
              >
                <option value="daily_summary">Daily Fraud Summary</option>
                <option value="weekly_fraud">Weekly Fraud Trend Report</option>
                <option value="ghost_beneficiaries">Ghost Beneficiary Risk Report</option>
                <option value="supplier_integrity">Supplier Integrity Report</option>
                <option value="blockchain_audit">Blockchain Audit Trail</option>
                <option value="model_performance">Model Performance Benchmark</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1">Date Filter (Optional)</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-[#DDE1E7] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1A3C5E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1">County Scope</label>
              <select
                value={selectedCounty}
                onChange={(e) => setSelectedCounty(e.target.value)}
                className="border border-[#DDE1E7] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1A3C5E]"
              >
                <option value="All Counties">All Counties (National)</option>
                <option value="Nairobi">Nairobi</option>
                <option value="Mombasa">Mombasa</option>
                <option value="Kisumu">Kisumu</option>
                <option value="Nakuru">Nakuru</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleExport(selectedReportType, 'csv')}
                disabled={exporting}
                className="bg-[#1A3C5E] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2E7D52] transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
              <button
                onClick={() => handleExport(selectedReportType, 'excel')}
                disabled={exporting}
                className="border border-[#DDE1E7] bg-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#F4F6F9] transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-[#2E7D52]" />
                Excel Spreadsheet
              </button>
            </div>
          </div>
        </div>

        {/* ── Pre-built Report Cards ── */}
        {loading ? (
          <div className="bg-white rounded-lg border border-[#DDE1E7] p-8 text-center text-sm text-[#6B7280] mb-6 shadow-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1A3C5E]" />
            Loading reporting metrics and templates...
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg border border-[#DDE1E7] p-8 text-center text-sm text-[#C0392B] font-medium mb-6 shadow-sm">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {reportTypes.map((report, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-[#DDE1E7] p-4.5 hover:shadow-md transition-shadow shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2.5 bg-[#EBF5FB] rounded-lg">
                    <FileText className="w-5 h-5 text-[#1A3C5E]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-[#1F2937] mb-1">{report.name}</h4>
                    <p className="text-xs text-[#6B7280] leading-relaxed mb-2">{report.description}</p>
                    <p className="text-[11px] text-[#9CA3AF]">Last run: {report.lastGenerated}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F3F4F6] flex justify-end">
                  <button
                    onClick={() => handleExport(report.key, 'csv')}
                    className="text-[#1A3C5E] hover:text-[#2E7D52] text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Interactive Analytics Section ── */}
        <div className="bg-white rounded-lg border border-[#DDE1E7] p-6 shadow-sm">
          {/* Navigation Tabs */}
          <div className="border-b border-[#DDE1E7] mb-6">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('trends')}
                className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
                  activeTab === 'trends'
                    ? 'border-[#1A3C5E] text-[#1A3C5E]'
                    : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                Fraud Trends
              </button>

              <button
                onClick={() => setActiveTab('financial')}
                className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
                  activeTab === 'financial'
                    ? 'border-[#1A3C5E] text-[#1A3C5E]'
                    : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                Financial Exposure
              </button>

              <button
                onClick={() => setActiveTab('health')}
                className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
                  activeTab === 'health'
                    ? 'border-[#1A3C5E] text-[#1A3C5E]'
                    : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                Program Health
              </button>

              <button
                onClick={() => setActiveTab('models')}
                className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
                  activeTab === 'models'
                    ? 'border-[#1A3C5E] text-[#1A3C5E]'
                    : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                Model Benchmarks
              </button>
            </div>
          </div>

          {/* ── TAB 1: Fraud Trends ── */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-base text-[#1A3C5E] mb-3">30-Day Alert Trends by Severity Tier</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="CRITICAL" stroke="#C0392B" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="HIGH" stroke="#E8A020" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="MEDIUM" stroke="#2471A3" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="LOW" stroke="#2E7D52" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#E5E7EB]">
                <div>
                  <h3 className="font-bold text-sm text-[#1A3C5E] mb-3">Alert Distribution by County</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={countyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="alerts" fill="#1A3C5E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[#1A3C5E] mb-3">Investigation Resolution Breakdown</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={resolutionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={75}
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
          )}

          {/* ── TAB 2: Financial Impact ── */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              {/* Financial KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {financialData.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                    <span className="text-xs text-[#6B7280] font-medium block mb-1">{item.metric}</span>
                    <p className="text-2xl font-bold text-[#1A3C5E]">{item.value}</p>
                    <span className="text-xs font-semibold text-[#2E7D52] mt-1 inline-block">{item.change} vs prior mo.</span>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="font-bold text-base text-[#1A3C5E] mb-3">Monthly Exposure vs Blocked Leakage (KES Millions)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={financialTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="monitored" fill="#1A3C5E" name="Total Monitored" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="atRisk" fill="#E8A020" name="At Risk" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="prevented" fill="#2E7D52" name="Prevented by Smart Contract" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── TAB 3: Program Health ── */}
          {activeTab === 'health' && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-[#1A3C5E] mb-2">School Feeding Operational Health Index</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {programHealth.map((ph, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-[#E2E8F0] bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-[#1F2937]">{ph.metric}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#E8F8F0] text-[#2E7D52]">
                        {ph.status}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between mt-3">
                      <span className="text-2xl font-mono font-bold text-[#1A3C5E]">{ph.value}</span>
                      <span className="text-xs text-[#6B7280]">Target Benchmark: {ph.target}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 4: Model Performance Benchmarks ── */}
          {activeTab === 'models' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold text-base text-[#1A3C5E]">ML Detection Model Benchmarks</h3>
                  <p className="text-xs text-[#6B7280]">Real-time precision, recall, and concept drift diagnostics</p>
                </div>
              </div>

              <div className="border border-[#DDE1E7] rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#F4F6F9] border-b border-[#DDE1E7]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-[#6B7280] uppercase">Model Architecture</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#6B7280] uppercase">Precision</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#6B7280] uppercase">Recall</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#6B7280] uppercase">F1 Score</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#6B7280] uppercase">Drift Status</th>
                      <th className="px-4 py-3 text-right font-semibold text-[#6B7280] uppercase">Last Retrained</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelPerformance.map((mp, idx) => (
                      <tr key={idx} className="border-b border-[#DDE1E7] hover:bg-[#F9FAFB]">
                        <td className="px-4 py-3 font-semibold text-[#1F2937]">{mp.model}</td>
                        <td className="px-4 py-3 font-mono text-[#2E7D52] font-bold">{mp.precision}</td>
                        <td className="px-4 py-3 font-mono text-[#1A3C5E] font-bold">{mp.recall}</td>
                        <td className="px-4 py-3 font-mono">{mp.f1}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              mp.drift.includes('DRIFTING')
                                ? 'bg-[#FEF3E2] text-[#E8A020]'
                                : 'bg-[#E8F8F0] text-[#2E7D52]'
                            }`}
                          >
                            {mp.drift}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-[#6B7280]">{mp.retrained}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
