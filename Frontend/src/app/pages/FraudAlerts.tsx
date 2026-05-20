import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import { X, ExternalLink } from 'lucide-react';

interface Alert {
  id: string;
  tier: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  entityType: string;
  entityName: string;
  alertType: string;
  compositeScore: number;
  modelScores: {
    IF: number;
    AE: number;
    LSTM: number;
    GNN: number;
  };
  triggeredAt: string;
  status: string;
  assignedTo: string;
  evidence: Array<{ feature: string; expected: string; actual: string }>;
  blockchainHash: string;
}

const mockAlerts: Alert[] = [
  {
    id: 'ALT-2026-0547',
    tier: 'CRITICAL',
    entityType: 'SCHOOL',
    entityName: 'Kilimani Primary School',
    alertType: 'ENROLLMENT',
    compositeScore: 0.94,
    modelScores: { IF: 0.92, AE: 0.95, LSTM: 0.91, GNN: 0.98 },
    triggeredAt: '2026-05-12 14:23:15',
    status: 'NEW',
    assignedTo: 'Unassigned',
    evidence: [
      { feature: 'Daily enrollment spike', expected: '2-5 students', actual: '47 students' },
      { feature: 'Duplicate identity matches', expected: '0', actual: '12 matches' },
    ],
    blockchainHash: '0x7f3a...9b2c',
  },
  {
    id: 'ALT-2026-0546',
    tier: 'HIGH',
    entityType: 'PAYMENT',
    entityName: 'M-Pesa Account #7842',
    alertType: 'PAYMENT',
    compositeScore: 0.87,
    modelScores: { IF: 0.85, AE: 0.88, LSTM: 0.84, GNN: 0.91 },
    triggeredAt: '2026-05-12 14:15:42',
    status: 'ACKNOWLEDGED',
    assignedTo: 'Jane Mwangi',
    evidence: [
      { feature: 'Payment velocity', expected: '1.2 tx/hour', actual: '12 tx/hour' },
      { feature: 'Amount deviation', expected: 'KES 5,000', actual: 'KES 45,000' },
    ],
    blockchainHash: '0x4c2d...1a8f',
  },
  {
    id: 'ALT-2026-0545',
    tier: 'HIGH',
    entityType: 'SUPPLIER',
    entityName: 'ABC Suppliers Ltd',
    alertType: 'SUPPLY_CHAIN',
    compositeScore: 0.82,
    modelScores: { IF: 0.79, AE: 0.83, LSTM: 0.80, GNN: 0.86 },
    triggeredAt: '2026-05-12 13:47:18',
    status: 'IN_REVIEW',
    assignedTo: 'John Kamau',
    evidence: [
      { feature: 'Quantity inflation', expected: '100 units', actual: '350 units' },
      { feature: 'Schools served', expected: '5-10', actual: '42 schools' },
    ],
    blockchainHash: '0x9e1f...4d3b',
  },
];

export function FraudAlerts() {
  const navigate = useNavigate();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filters, setFilters] = useState({
    tier: 'ALL',
    status: 'ALL',
    alertType: 'ALL',
  });

  const filteredAlerts = mockAlerts.filter((alert) => {
    if (filters.tier !== 'ALL' && alert.tier !== filters.tier) return false;
    if (filters.status !== 'ALL' && alert.status !== filters.status) return false;
    if (filters.alertType !== 'ALL' && alert.alertType !== filters.alertType) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header breadcrumbs={['Fraud Alerts']} />

      <main className="flex-1 overflow-y-auto bg-[#F4F6F9] p-6">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-[#DDE1E7] p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Risk Tier</label>
              <select
                className="border border-[#DDE1E7] rounded px-3 py-1.5 text-sm"
                value={filters.tier}
                onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
              >
                <option value="ALL">All Tiers</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Status</label>
              <select
                className="border border-[#DDE1E7] rounded px-3 py-1.5 text-sm"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">NEW</option>
                <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                <option value="IN_REVIEW">IN_REVIEW</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Alert Type</label>
              <select
                className="border border-[#DDE1E7] rounded px-3 py-1.5 text-sm"
                value={filters.alertType}
                onChange={(e) => setFilters({ ...filters, alertType: e.target.value })}
              >
                <option value="ALL">All Types</option>
                <option value="ENROLLMENT">ENROLLMENT</option>
                <option value="PAYMENT">PAYMENT</option>
                <option value="SUPPLY_CHAIN">SUPPLY_CHAIN</option>
                <option value="TEMPORAL">TEMPORAL</option>
                <option value="GRAPH">GRAPH</option>
              </select>
            </div>

            <div className="flex-1"></div>

            <div className="self-end">
              <input
                type="text"
                placeholder="Search by entity name or ID..."
                className="border border-[#DDE1E7] rounded px-3 py-1.5 text-sm w-64"
              />
            </div>
          </div>
        </div>

        {/* Summary strip */}
        <div className="bg-white rounded-lg border border-[#DDE1E7] p-3 mb-6 flex items-center gap-6">
          <span className="text-sm text-[#6B7280]">
            <span className="font-bold text-[#1C1C1E]">{filteredAlerts.length}</span> alerts
          </span>
          <div className="flex items-center gap-3">
            <span className="text-xs">
              <RiskBadge tier="CRITICAL" className="mr-1" />
              <span className="text-[#6B7280]">
                {filteredAlerts.filter((a) => a.tier === 'CRITICAL').length}
              </span>
            </span>
            <span className="text-xs">
              <RiskBadge tier="HIGH" className="mr-1" />
              <span className="text-[#6B7280]">
                {filteredAlerts.filter((a) => a.tier === 'HIGH').length}
              </span>
            </span>
            <span className="text-xs">
              <RiskBadge tier="MEDIUM" className="mr-1" />
              <span className="text-[#6B7280]">
                {filteredAlerts.filter((a) => a.tier === 'MEDIUM').length}
              </span>
            </span>
          </div>
        </div>

        {/* Alerts table */}
        <div className="bg-white rounded-lg border border-[#DDE1E7] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F4F6F9] border-b border-[#DDE1E7]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Alert ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Risk Tier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Entity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Alert Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Composite Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Assigned To
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((alert, index) => (
                  <tr
                    key={alert.id}
                    className={`border-b border-[#DDE1E7] hover:bg-[#F4F6F9] cursor-pointer ${
                      alert.tier === 'CRITICAL' ? 'border-l-4 border-l-[#C0392B]' : ''
                    } ${index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <td className="px-4 py-3 text-sm font-mono">{alert.id}</td>
                    <td className="px-4 py-3">
                      <RiskBadge tier={alert.tier} />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{alert.entityName}</p>
                        <p className="text-xs text-[#6B7280]">{alert.entityType}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{alert.alertType}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-[#F4F6F9] rounded-full h-2">
                          <div
                            className="bg-[#C0392B] h-2 rounded-full"
                            style={{ width: `${alert.compositeScore * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono">{alert.compositeScore.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={alert.status} />
                    </td>
                    <td className="px-4 py-3 text-sm">{alert.assignedTo}</td>
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
      </main>

      {/* Alert Detail Side Panel */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-[480px] bg-white h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-[#DDE1E7] p-6 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-xl">Alert Details</h2>
                <p className="text-sm font-mono text-[#6B7280]">{selectedAlert.id}</p>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-2 hover:bg-[#F4F6F9] rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header info */}
              <div className="flex items-center justify-between">
                <RiskBadge tier={selectedAlert.tier} />
                <span className="text-xs text-[#6B7280]">{selectedAlert.triggeredAt}</span>
              </div>

              {/* Entity details */}
              <div className="bg-[#F4F6F9] rounded-lg p-4 space-y-2">
                <h3 className="font-bold text-sm">Entity</h3>
                <p className="font-medium">{selectedAlert.entityName}</p>
                <p className="text-sm text-[#6B7280]">{selectedAlert.entityType}</p>
              </div>

              {/* Composite score */}
              <div>
                <h3 className="font-bold text-sm mb-3">Composite Score</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-[#F4F6F9] rounded-full h-4">
                    <div
                      className="bg-[#C0392B] h-4 rounded-full"
                      style={{ width: `${selectedAlert.compositeScore * 100}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-lg">
                    {selectedAlert.compositeScore.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Model scores */}
              <div>
                <h3 className="font-bold text-sm mb-3">Model Scores</h3>
                <div className="space-y-2">
                  {Object.entries(selectedAlert.modelScores).map(([model, score]) => (
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

              {/* Evidence */}
              <div>
                <h3 className="font-bold text-sm mb-3">Evidence</h3>
                <div className="space-y-3">
                  {selectedAlert.evidence.map((item, index) => (
                    <div key={index} className="bg-[#F4F6F9] rounded-lg p-3">
                      <p className="text-sm font-medium mb-2">{item.feature}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[#6B7280]">Expected:</span>
                          <p className="font-medium">{item.expected}</p>
                        </div>
                        <div>
                          <span className="text-[#6B7280]">Actual:</span>
                          <p className="font-medium text-[#C0392B]">{item.actual}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blockchain */}
              <div className="bg-[#F4F6F9] rounded-lg p-4">
                <h3 className="font-bold text-sm mb-2">Blockchain Verification</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#6B7280]">{selectedAlert.blockchainHash}</span>
                  <ExternalLink className="w-4 h-4 text-[#6B7280]" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 bg-[#2E7D52] rounded-full"></span>
                  <span className="text-xs text-[#2E7D52] font-medium">VERIFIED</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/cases')}
                  className="flex-1 bg-[#1A3C5E] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2E7D52] transition-colors"
                >
                  Open Case
                </button>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 border border-[#DDE1E7] rounded-lg font-medium hover:bg-[#F4F6F9] transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
