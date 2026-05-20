import { Header } from '../components/Header';
import { StatusBadge } from '../components/StatusBadge';
import { Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const models = [
  { name: 'Isolation Forest', version: 'v2.1.4', deployed: '2026-04-15', status: 'HEALTHY', threshold: 0.65 },
  { name: 'Autoencoder', version: 'v3.0.2', deployed: '2026-04-20', status: 'HEALTHY', threshold: 0.70 },
  { name: 'LSTM Autoencoder', version: 'v1.8.1', deployed: '2026-04-18', status: 'DRIFTING', threshold: 0.68 },
  { name: 'Graph Neural Network', version: 'v2.3.0', deployed: '2026-04-22', status: 'HEALTHY', threshold: 0.72 },
  { name: 'XGBoost Supervised', version: 'v4.1.0', deployed: '2026-05-01', status: 'HEALTHY', threshold: 0.75 },
];

const scoreDistribution = Array.from({ length: 20 }, (_, i) => ({
  range: (i * 0.05).toFixed(2),
  count: Math.floor(Math.random() * 150) + 50,
}));

const performanceMetrics = [
  { model: 'IF', precision: 0.87, recall: 0.82, f1: 0.84 },
  { model: 'AE', precision: 0.89, recall: 0.85, f1: 0.87 },
  { model: 'LSTM', precision: 0.83, recall: 0.79, f1: 0.81 },
  { model: 'GNN', precision: 0.92, recall: 0.88, f1: 0.90 },
  { model: 'XGB', precision: 0.94, recall: 0.91, f1: 0.92 },
];

const labelAccumulation = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  labels: Math.floor(Math.random() * 10) + 5,
  cumulative: (i + 1) * 8,
}));

export function ModelPerformance() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header breadcrumbs={['Model Performance']} />

      <main className="flex-1 overflow-y-auto bg-[#F4F6F9] p-6">
        {/* Model status cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {models.map((model, index) => (
            <div key={index} className="bg-white rounded-lg border border-[#DDE1E7] p-4">
              <div className="flex items-start justify-between mb-3">
                <Activity className="w-5 h-5 text-[#6B7280]" />
                <StatusBadge
                  status={model.status}
                  variant={model.status === 'DRIFTING' ? 'filled' : 'outline'}
                />
              </div>
              <h3 className="font-bold text-sm mb-1">{model.name}</h3>
              <p className="text-xs text-[#6B7280] mb-2">{model.version}</p>
              <p className="text-xs text-[#6B7280]">Deployed: {model.deployed}</p>
            </div>
          ))}
        </div>

        {/* Model tabs */}
        <div className="bg-white rounded-lg border border-[#DDE1E7] p-6 mb-6">
          <div className="border-b border-[#DDE1E7] mb-6">
            <div className="flex gap-6 overflow-x-auto">
              {models.map((model, index) => (
                <button
                  key={index}
                  className={`pb-3 whitespace-nowrap ${
                    index === 0
                      ? 'border-b-2 border-[#1A3C5E] font-medium text-sm'
                      : 'text-[#6B7280] hover:text-[#1C1C1E] text-sm'
                  }`}
                >
                  {model.name}
                </button>
              ))}
            </div>
          </div>

          {/* Model details */}
          <div className="space-y-6">
            {/* Threshold */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm">Current Threshold</h3>
                <button className="text-[#1A3C5E] hover:text-[#2E7D52] text-sm font-medium">
                  Adjust
                </button>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={models[0].threshold}
                  className="flex-1"
                />
                <span className="font-mono font-bold text-lg">{models[0].threshold}</span>
              </div>
            </div>

            {/* Score distribution */}
            <div>
              <h3 className="font-bold text-sm mb-3">Score Distribution (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2471A3" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Performance metrics */}
            <div>
              <h3 className="font-bold text-sm mb-3">Performance Metrics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#F4F6F9] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-[#1C1C1E]">0.87</p>
                  <p className="text-sm text-[#6B7280]">Precision</p>
                </div>
                <div className="bg-[#F4F6F9] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-[#1C1C1E]">0.82</p>
                  <p className="text-sm text-[#6B7280]">Recall</p>
                </div>
                <div className="bg-[#F4F6F9] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-[#1C1C1E]">0.84</p>
                  <p className="text-sm text-[#6B7280]">F1 Score</p>
                </div>
              </div>
            </div>

            {/* Drift detection */}
            <div className="bg-[#F4F6F9] rounded-lg p-4">
              <h3 className="font-bold text-sm mb-2">Drift Detection Status</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm">KS-Statistic:</span>
                <span className="font-mono">0.042</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm">Drift Detected:</span>
                <span className="text-[#2E7D52] font-medium">NO</span>
              </div>
            </div>

            {/* Retraining */}
            <div className="bg-[#FEF3E2] border border-[#E8A020] rounded-lg p-4">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Retraining Trigger Status
              </h3>
              <p className="text-sm mb-2">
                Next retraining triggered at <span className="font-bold">50 new labels</span> —
                currently <span className="font-bold">34 labels</span> accumulated
              </p>
              <div className="w-full bg-white rounded-full h-2 mb-3">
                <div className="bg-[#E8A020] h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
              <button className="bg-[#1A3C5E] text-white px-4 py-2 rounded font-medium hover:bg-[#2E7D52] transition-colors text-sm">
                Manual Retrain
              </button>
            </div>
          </div>
        </div>

        {/* Comparison charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Model comparison */}
          <div className="bg-white rounded-lg border border-[#DDE1E7] p-6">
            <h3 className="font-bold text-lg mb-4">Model Performance Comparison</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="precision" fill="#2E7D52" />
                <Bar dataKey="recall" fill="#2471A3" />
                <Bar dataKey="f1" fill="#E8A020" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Label accumulation */}
          <div className="bg-white rounded-lg border border-[#DDE1E7] p-6">
            <h3 className="font-bold text-lg mb-4">Label Accumulation (30 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={labelAccumulation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cumulative" stroke="#1A3C5E" strokeWidth={2} name="Cumulative Labels" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
