import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import { Clock } from 'lucide-react';
import { api } from '../lib/api';

interface Case {
  id: string;
  db_id: number;
  entityName: string;
  entityType: string;
  tier: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  stage: 'DETECTED' | 'TRIAGED' | 'UNDER INVESTIGATION' | 'ESCALATED' | 'RESOLVED';
  score: number;
  assignedTo: string;
  daysOpen: number;
  alertCount: number;
  sla: 'green' | 'amber' | 'red';
}

export function CaseManagement() {
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [cases, setCases] = useState<Case[]>([]);
  const [stats, setStats] = useState({
    open: 0,
    investigating: 0,
    escalated: 0,
    resolved_this_month: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const stages = ['DETECTED', 'TRIAGED', 'UNDER INVESTIGATION', 'ESCALATED', 'RESOLVED'];

  const getCasesByStage = (stage: string) => {
    return cases.filter((c) => c.stage === stage);
  };

  const slaColors = {
    green: 'text-[#2E7D52]',
    amber: 'text-[#E8A020]',
    red: 'text-[#C0392B]',
  };

  useEffect(() => {
    let isMounted = true;
    async function loadCases() {
      try {
        setLoading(true);
        const res = await api.get<{ cases: Case[]; stats: any }>('/cases');
        if (isMounted) {
          setCases(res.cases);
          setStats(res.stats);
          setError('');
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load cases.');
          setLoading(false);
        }
      }
    }
    loadCases();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header breadcrumbs={['Case Management']} />

      <main className="flex-1 overflow-y-auto bg-[#F4F6F9] p-6">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-[#DDE1E7] p-4">
            <p className="text-2xl font-bold">{loading ? '...' : stats.open}</p>
            <p className="text-sm text-[#6B7280]">Open Cases</p>
          </div>
          <div className="bg-white rounded-lg border border-[#DDE1E7] p-4">
            <p className="text-2xl font-bold">{loading ? '...' : stats.investigating}</p>
            <p className="text-sm text-[#6B7280]">Under Investigation</p>
          </div>
          <div className="bg-white rounded-lg border border-[#DDE1E7] p-4">
            <p className="text-2xl font-bold">{loading ? '...' : stats.escalated}</p>
            <p className="text-sm text-[#6B7280]">Escalated</p>
          </div>
          <div className="bg-white rounded-lg border border-[#DDE1E7] p-4">
            <p className="text-2xl font-bold">{loading ? '...' : stats.resolved_this_month}</p>
            <p className="text-sm text-[#6B7280]">Resolved This Month</p>
          </div>
        </div>

        {/* View toggle */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => setView('kanban')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'kanban'
                ? 'bg-[#1A3C5E] text-white'
                : 'bg-white border border-[#DDE1E7] text-[#6B7280] hover:bg-[#F4F6F9]'
            }`}
          >
            Kanban View
          </button>
          <button
            onClick={() => setView('table')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'table'
                ? 'bg-[#1A3C5E] text-white'
                : 'bg-white border border-[#DDE1E7] text-[#6B7280] hover:bg-[#F4F6F9]'
            }`}
          >
            Table View
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-[#6B7280] text-sm">
            Loading cases...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-[#C0392B] text-sm font-medium">
            {error}
          </div>
        ) : (
          <>
            {/* Kanban view */}
            {view === 'kanban' && (
              <div className="grid grid-cols-5 gap-4 overflow-x-auto">
                {stages.map((stage) => (
                  <div key={stage} className="min-w-[280px]">
                    <div className="bg-white rounded-t-lg border border-[#DDE1E7] border-b-0 p-3">
                      <h3 className="font-bold text-sm">{stage}</h3>
                      <p className="text-xs text-[#6B7280]">{getCasesByStage(stage).length} cases</p>
                    </div>
                    <div className="space-y-3 bg-[#FAFAFA] rounded-b-lg border border-[#DDE1E7] border-t-0 p-3 min-h-[500px]">
                      {getCasesByStage(stage).map((caseItem) => (
                        <div
                          key={caseItem.id}
                          className="bg-white rounded-lg border border-[#DDE1E7] p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <RiskBadge tier={caseItem.tier} />
                            <span className={`text-xs ${slaColors[caseItem.sla]}`}>
                              <Clock className="w-3 h-3 inline mr-1" />
                              {caseItem.daysOpen}d
                            </span>
                          </div>

                          <h4 className="font-medium text-sm mb-1">{caseItem.entityName}</h4>
                          <p className="text-xs text-[#6B7280] mb-3">{caseItem.entityType}</p>

                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex-1 bg-[#F4F6F9] rounded-full h-1.5">
                              <div
                                className="bg-[#C0392B] h-1.5 rounded-full"
                                style={{ width: `${caseItem.score * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono">{caseItem.score.toFixed(2)}</span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <div className="w-6 h-6 rounded-full bg-[#2E7D52] flex items-center justify-center text-white text-xs font-bold animate-pulse">
                                {caseItem.assignedTo ? caseItem.assignedTo.split(' ')[0][0] : 'U'}
                              </div>
                              <span className="text-[#6B7280]">{caseItem.assignedTo}</span>
                            </div>
                            <span className="text-[#6B7280]">{caseItem.alertCount} alerts</span>
                          </div>

                          <p className="text-xs font-mono text-[#6B7280] mt-2">{caseItem.id}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Table view */}
            {view === 'table' && (
              <div className="bg-white rounded-lg border border-[#DDE1E7] overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#F4F6F9] border-b border-[#DDE1E7]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                        Case ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                        Entity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                        Risk Tier
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                        Stage
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                        Assigned To
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                        Days Open
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                        Alert Count
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.map((caseItem, index) => (
                      <tr
                        key={caseItem.id}
                        className={`border-b border-[#DDE1E7] hover:bg-[#F4F6F9] cursor-pointer ${
                          index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                        }`}
                      >
                        <td className="px-4 py-3 text-sm font-mono">{caseItem.id}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium">{caseItem.entityName}</p>
                            <p className="text-xs text-[#6B7280]">{caseItem.entityType}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <RiskBadge tier={caseItem.tier} />
                        </td>
                        <td className="px-4 py-3 text-sm">{caseItem.stage}</td>
                        <td className="px-4 py-3 text-sm">{caseItem.assignedTo}</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${slaColors[caseItem.sla]}`}>
                            {caseItem.daysOpen} days
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{caseItem.alertCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
