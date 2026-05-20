import { Header } from '../components/Header';
import { StatusBadge } from '../components/StatusBadge';
import { CheckCircle, XCircle, Loader, PlayCircle, Clock } from 'lucide-react';

const sobSteps = [
  { step: 1, name: 'System Health Check', status: 'COMPLETED', recordsProcessed: 'N/A', duration: '143ms', error: null },
  { step: 2, name: 'Overnight Batch Scoring', status: 'COMPLETED', recordsProcessed: '12,847', duration: '4.2s', error: null },
  { step: 3, name: 'Risk Profile Refresh', status: 'COMPLETED', recordsProcessed: '15,234', duration: '2.8s', error: null },
  { step: 4, name: 'Alert Generation', status: 'COMPLETED', recordsProcessed: '234', duration: '1.1s', error: null },
  { step: 5, name: 'SLA Review', status: 'COMPLETED', recordsProcessed: '127', duration: '456ms', error: null },
  { step: 6, name: 'Daily Stats Initialization', status: 'COMPLETED', recordsProcessed: 'N/A', duration: '89ms', error: null },
];

const cobSteps = [
  { step: 1, name: 'Real-Time Scoring Flush', status: 'PENDING', recordsProcessed: null, duration: null, error: null },
  { step: 2, name: 'Daily Fraud Summary', status: 'PENDING', recordsProcessed: null, duration: null, error: null },
  { step: 3, name: 'Case Status Sweep', status: 'PENDING', recordsProcessed: null, duration: null, error: null },
  { step: 4, name: 'Model Drift Check', status: 'PENDING', recordsProcessed: null, duration: null, error: null },
  { step: 5, name: 'Label Harvest', status: 'PENDING', recordsProcessed: null, duration: null, error: null },
  { step: 6, name: 'Redis Cleanup', status: 'PENDING', recordsProcessed: null, duration: null, error: null },
  { step: 7, name: 'COB Completion Log', status: 'PENDING', recordsProcessed: null, duration: null, error: null },
];

const procedureHistory = [
  { date: '2026-05-12', sobStatus: 'COMPLETED', sobDuration: '9.2s', cobStatus: 'PENDING', cobDuration: null, alertsGenerated: 234, recordsProcessed: 28081, errors: 0 },
  { date: '2026-05-11', sobStatus: 'COMPLETED', sobDuration: '8.9s', cobStatus: 'COMPLETED', cobDuration: '5.4s', alertsGenerated: 198, recordsProcessed: 27456, errors: 0 },
  { date: '2026-05-10', sobStatus: 'COMPLETED', sobDuration: '9.1s', cobStatus: 'COMPLETED', cobDuration: '5.2s', alertsGenerated: 212, recordsProcessed: 27892, errors: 0 },
];

export function SOBCOBProcedures() {
  const getStatusIcon = (status: string) => {
    if (status === 'COMPLETED') return <CheckCircle className="w-4 h-4 text-[#2E7D52]" />;
    if (status === 'FAILED') return <XCircle className="w-4 h-4 text-[#C0392B]" />;
    if (status === 'RUNNING') return <Loader className="w-4 h-4 text-[#2471A3] animate-spin" />;
    return <Clock className="w-4 h-4 text-[#6B7280]" />;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header breadcrumbs={['SOB / COB Procedures']} />

      <main className="flex-1 overflow-y-auto bg-[#F4F6F9] p-6">
        {/* Status banner */}
        <div className="bg-white rounded-lg border border-[#DDE1E7] p-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">Today's SOB</h3>
                <StatusBadge status="COMPLETED" variant="filled" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#6B7280]">Completion Time:</span>
                  <p className="font-mono">06:00:09</p>
                </div>
                <div>
                  <span className="text-[#6B7280]">Duration:</span>
                  <p className="font-mono">9.2s</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">Today's COB</h3>
                <StatusBadge status="PENDING" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#6B7280]">Scheduled Time:</span>
                  <p className="font-mono">18:00:00</p>
                </div>
                <div>
                  <span className="text-[#6B7280]">Countdown:</span>
                  <p className="font-mono">3h 42m</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* SOB Panel */}
          <div className="bg-white rounded-lg border border-[#DDE1E7] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">SOB Procedure</h3>
              <button className="bg-[#1A3C5E] text-white px-4 py-2 rounded font-medium hover:bg-[#2E7D52] transition-colors text-sm flex items-center gap-2">
                <PlayCircle className="w-4 h-4" />
                Re-run SOB
              </button>
            </div>

            <div className="space-y-3">
              {sobSteps.map((step) => (
                <div
                  key={step.step}
                  className="bg-[#F4F6F9] rounded-lg p-3 border border-[#DDE1E7]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(step.status)}
                      <span className="font-medium text-sm">
                        {step.step}. {step.name}
                      </span>
                    </div>
                    <StatusBadge status={step.status} variant={step.status === 'COMPLETED' ? 'filled' : 'outline'} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs ml-6">
                    <div>
                      <span className="text-[#6B7280]">Records:</span>
                      <span className="ml-1 font-mono">{step.recordsProcessed}</span>
                    </div>
                    <div>
                      <span className="text-[#6B7280]">Duration:</span>
                      <span className="ml-1 font-mono">{step.duration}</span>
                    </div>
                  </div>

                  {step.error && (
                    <div className="mt-2 ml-6 text-xs text-[#C0392B]">
                      Error: {step.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* COB Panel */}
          <div className="bg-white rounded-lg border border-[#DDE1E7] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">COB Procedure</h3>
              <button className="bg-[#E8A020] text-white px-4 py-2 rounded font-medium hover:bg-[#C0392B] transition-colors text-sm flex items-center gap-2">
                <PlayCircle className="w-4 h-4" />
                Trigger COB Now
              </button>
            </div>

            <div className="space-y-3">
              {cobSteps.map((step) => (
                <div
                  key={step.step}
                  className="bg-[#F4F6F9] rounded-lg p-3 border border-[#DDE1E7]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(step.status)}
                      <span className="font-medium text-sm">
                        {step.step}. {step.name}
                      </span>
                    </div>
                    <StatusBadge status={step.status} />
                  </div>

                  {step.recordsProcessed && (
                    <div className="grid grid-cols-2 gap-2 text-xs ml-6">
                      <div>
                        <span className="text-[#6B7280]">Records:</span>
                        <span className="ml-1 font-mono">{step.recordsProcessed}</span>
                      </div>
                      <div>
                        <span className="text-[#6B7280]">Duration:</span>
                        <span className="ml-1 font-mono">{step.duration}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* History table */}
        <div className="bg-white rounded-lg border border-[#DDE1E7] p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">SOB / COB History (Last 30 Days)</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F4F6F9] border-b border-[#DDE1E7]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">SOB Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">SOB Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">COB Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">COB Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Alerts Generated</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Records Processed</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Errors</th>
                </tr>
              </thead>
              <tbody>
                {procedureHistory.map((record, index) => (
                  <tr
                    key={record.date}
                    className={`border-b border-[#DDE1E7] ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-mono">{record.date}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={record.sobStatus} variant="filled" />
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">{record.sobDuration}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={record.cobStatus} variant={record.cobStatus === 'PENDING' ? 'outline' : 'filled'} />
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">{record.cobDuration || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">{record.alertsGenerated}</td>
                    <td className="px-4 py-3 text-sm">{record.recordsProcessed.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-[#2E7D52]">{record.errors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System health */}
        <div className="bg-white rounded-lg border border-[#DDE1E7] p-6">
          <h3 className="font-bold text-lg mb-4">System Health Indicators</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { name: 'MySQL Status', status: 'HEALTHY', lastChecked: '30s ago' },
              { name: 'Redis Status', status: 'HEALTHY', lastChecked: '30s ago' },
              { name: 'Blockchain Sync', status: 'HEALTHY', lastChecked: '1m ago' },
              { name: 'ML Models Status', status: 'HEALTHY', lastChecked: '2m ago' },
            ].map((indicator, index) => (
              <div key={index} className="bg-[#F4F6F9] rounded-lg p-4 border border-[#DDE1E7]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-[#2E7D52] rounded-full"></div>
                  <span className="text-sm font-medium">{indicator.name}</span>
                </div>
                <StatusBadge status={indicator.status} variant="filled" />
                <p className="text-xs text-[#6B7280] mt-2">Last checked: {indicator.lastChecked}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
