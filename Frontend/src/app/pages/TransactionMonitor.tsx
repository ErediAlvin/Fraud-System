import { useState } from 'react';
import { Header } from '../components/Header';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import { StatCard } from '../components/StatCard';
import { CreditCard, DollarSign, ShieldAlert, Lock, X, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Transaction {
  id: string;
  type: 'MPESA' | 'SUBSIDY' | 'DONOR' | 'PROCUREMENT';
  payer: string;
  recipient: string;
  amount: number;
  tier: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  mlScore: number;
  blockchainStatus: 'VERIFIED' | 'PENDING' | 'FAILED';
  smartContractStatus: 'PASSED' | 'BLOCKED';
  timestamp: string;
  modelScores: { IF: number; AE: number; LSTM: number; GNN: number };
  anomalyFeatures: string[];
  blockchainHash: string;
}

const mockTransactions: Transaction[] = [
  {
    id: 'TXN-2026-78451',
    type: 'MPESA',
    payer: 'M-Pesa #7842',
    recipient: 'Kilimani Primary',
    amount: 45000,
    tier: 'CRITICAL',
    mlScore: 0.92,
    blockchainStatus: 'VERIFIED',
    smartContractStatus: 'BLOCKED',
    timestamp: '2026-05-12 14:23:15',
    modelScores: { IF: 0.91, AE: 0.93, LSTM: 0.89, GNN: 0.95 },
    anomalyFeatures: ['Payment velocity: 12 tx/hour (baseline: 1.2)', 'Amount spike: 9x average'],
    blockchainHash: '0x7f3a...9b2c',
  },
  {
    id: 'TXN-2026-78450',
    type: 'SUBSIDY',
    payer: 'Government Fund',
    recipient: 'Westlands School',
    amount: 125000,
    tier: 'LOW',
    mlScore: 0.15,
    blockchainStatus: 'VERIFIED',
    smartContractStatus: 'PASSED',
    timestamp: '2026-05-12 13:45:22',
    modelScores: { IF: 0.12, AE: 0.14, LSTM: 0.18, GNN: 0.16 },
    anomalyFeatures: [],
    blockchainHash: '0x4c2d...1a8f',
  },
];

const hourlyVolume = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  today: Math.floor(Math.random() * 150) + 50,
  average: 100,
}));

const amountDistribution = Array.from({ length: 20 }, (_, i) => ({
  range: i * 10000,
  count: Math.floor(Math.random() * 50) + 10,
}));

export function TransactionMonitor() {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header breadcrumbs={['Transaction Monitor']} />

      <main className="flex-1 overflow-y-auto bg-[#F4F6F9] p-6">
        {/* Summary cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <StatCard icon={CreditCard} label="Total Transactions Today" value="2,847" />
          <StatCard icon={DollarSign} label="Total Value (KES)" value="24.5M" />
          <StatCard icon={ShieldAlert} label="Flagged Transactions" value={234} variant="warning" />
          <StatCard icon={Lock} label="Blocked by Smart Contract" value={47} variant="critical" />
          <StatCard label="False Positive Rate" value="3.8%" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-[#DDE1E7] p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Transaction Type</label>
              <select className="border border-[#DDE1E7] rounded px-3 py-1.5 text-sm">
                <option value="ALL">All Types</option>
                <option value="MPESA">M-Pesa</option>
                <option value="SUBSIDY">Subsidy</option>
                <option value="DONOR">Donor</option>
                <option value="PROCUREMENT">Procurement</option>
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
              <label className="block text-xs text-[#6B7280] mb-1">Amount Range</label>
              <input
                type="range"
                min="0"
                max="500000"
                className="w-32"
              />
            </div>

            <div className="flex-1"></div>

            <div className="self-end">
              <input
                type="text"
                placeholder="Search by transaction ID..."
                className="border border-[#DDE1E7] rounded px-3 py-1.5 text-sm w-64"
              />
            </div>
          </div>
        </div>

        {/* Transactions table */}
        <div className="bg-white rounded-lg border border-[#DDE1E7] overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F4F6F9] border-b border-[#DDE1E7]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Transaction ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Payer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Recipient
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Amount (KES)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Risk Tier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    ML Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Blockchain
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Smart Contract
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((tx, index) => (
                  <tr
                    key={tx.id}
                    className={`border-b border-[#DDE1E7] hover:bg-[#F4F6F9] cursor-pointer ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                    }`}
                    onClick={() => setSelectedTx(tx)}
                  >
                    <td className="px-4 py-3 text-sm font-mono">{tx.id}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#2471A3] text-white">
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{tx.payer}</td>
                    <td className="px-4 py-3 text-sm">{tx.recipient}</td>
                    <td className="px-4 py-3 text-sm font-mono">
                      {tx.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge tier={tx.tier} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[#F4F6F9] rounded-full h-2">
                          <div
                            className="bg-[#C0392B] h-2 rounded-full"
                            style={{ width: `${tx.mlScore * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono">{tx.mlScore.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={tx.blockchainStatus} variant="filled" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={tx.smartContractStatus}
                        variant={tx.smartContractStatus === 'BLOCKED' ? 'filled' : 'outline'}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-[#1A3C5E] hover:text-[#2E7D52] text-sm font-medium">
                        View
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
          {/* Hourly volume */}
          <div className="bg-white rounded-lg border border-[#DDE1E7] p-6">
            <h3 className="font-bold text-lg mb-4">Transaction Volume (Hourly)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourlyVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="today" fill="#2471A3" name="Today" />
                <Bar dataKey="average" fill="#E8A020" name="7-Day Avg" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Amount distribution */}
          <div className="bg-white rounded-lg border border-[#DDE1E7] p-6">
            <h3 className="font-bold text-lg mb-4">Amount Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={amountDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2E7D52" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>

      {/* Transaction Detail Panel */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-[480px] bg-white h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-[#DDE1E7] p-6 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-xl">Transaction Details</h2>
                <p className="text-sm font-mono text-[#6B7280]">{selectedTx.id}</p>
              </div>
              <button onClick={() => setSelectedTx(null)} className="p-2 hover:bg-[#F4F6F9] rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Transaction info */}
              <div className="bg-[#F4F6F9] rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[#6B7280]">Type:</span>
                    <p className="font-medium">{selectedTx.type}</p>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Amount:</span>
                    <p className="font-bold">KES {selectedTx.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Payer:</span>
                    <p className="font-medium">{selectedTx.payer}</p>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Recipient:</span>
                    <p className="font-medium">{selectedTx.recipient}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#6B7280]">Timestamp:</span>
                    <p className="font-mono text-xs">{selectedTx.timestamp}</p>
                  </div>
                </div>
              </div>

              {/* Risk score */}
              <div>
                <h3 className="font-bold text-sm mb-3">Risk Score</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 bg-[#F4F6F9] rounded-full h-4">
                    <div
                      className="bg-[#C0392B] h-4 rounded-full"
                      style={{ width: `${selectedTx.mlScore * 100}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-lg">{selectedTx.mlScore.toFixed(2)}</span>
                </div>
                <RiskBadge tier={selectedTx.tier} />
              </div>

              {/* Model scores */}
              <div>
                <h3 className="font-bold text-sm mb-3">Model Breakdown</h3>
                <div className="space-y-2">
                  {Object.entries(selectedTx.modelScores).map(([model, score]) => (
                    <div key={model}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-mono">{model}</span>
                        <span className="text-sm font-mono">{score.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-[#F4F6F9] rounded-full h-2">
                        <div
                          className="bg-[#2471A3] h-2 rounded-full"
                          style={{ width: `${score * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anomaly features */}
              {selectedTx.anomalyFeatures.length > 0 && (
                <div>
                  <h3 className="font-bold text-sm mb-3">Anomaly Features</h3>
                  <div className="space-y-2">
                    {selectedTx.anomalyFeatures.map((feature, index) => (
                      <div key={index} className="bg-[#FEF3E2] border border-[#E8A020] rounded-lg p-3">
                        <p className="text-sm text-[#1C1C1E]">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Blockchain verification */}
              <div className="bg-[#F4F6F9] rounded-lg p-4">
                <h3 className="font-bold text-sm mb-3">Blockchain Verification</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Hash:</span>
                    <span className="font-mono text-xs">{selectedTx.blockchainHash}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Status:</span>
                    <div className="flex items-center gap-2">
                      {selectedTx.blockchainStatus === 'VERIFIED' ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-[#2E7D52]" />
                          <span className="text-[#2E7D52] font-medium">VERIFIED</span>
                        </>
                      ) : (
                        <span className="text-[#6B7280]">{selectedTx.blockchainStatus}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Smart contract */}
              <div className="bg-[#F4F6F9] rounded-lg p-4">
                <h3 className="font-bold text-sm mb-2">Smart Contract Evaluation</h3>
                <div className="flex items-center gap-2">
                  {selectedTx.smartContractStatus === 'PASSED' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-[#2E7D52]" />
                      <span className="text-sm text-[#2E7D52] font-medium">PASSED</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#C0392B]" />
                      <span className="text-sm text-[#C0392B] font-medium">BLOCKED</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 bg-[#1A3C5E] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2E7D52] transition-colors">
                  Investigate
                </button>
                <button className="px-4 py-2 border border-[#DDE1E7] rounded-lg font-medium hover:bg-[#F4F6F9] transition-colors">
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
