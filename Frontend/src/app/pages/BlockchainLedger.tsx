import { useState } from 'react';
import { Header } from '../components/Header';
import { StatusBadge } from '../components/StatusBadge';
import { StatCard } from '../components/StatCard';
import { Database, CheckCircle, AlertTriangle, Copy, X } from 'lucide-react';

interface LedgerRecord {
  blockNumber: number;
  txHash: string;
  recordType: 'ENROLLMENT' | 'PAYMENT' | 'DELIVERY' | 'CONTRACT';
  entityId: string;
  entityName: string;
  writtenAt: string;
  verificationStatus: 'CONFIRMED' | 'PENDING' | 'FAILED';
  mysqlMatch: 'MATCH' | 'MISMATCH';
}

const mockRecords: LedgerRecord[] = [
  {
    blockNumber: 45892,
    txHash: '0x7f3a9b2c45d8e1f7890abcdef1234567890abcdef1234567890abcdef1234567',
    recordType: 'PAYMENT',
    entityId: 'TXN-2026-78451',
    entityName: 'M-Pesa #7842 → Kilimani Primary',
    writtenAt: '2026-05-12 14:23:18',
    verificationStatus: 'CONFIRMED',
    mysqlMatch: 'MATCH',
  },
  {
    blockNumber: 45891,
    txHash: '0x4c2d1a8f67e9b3c5890def1234567890abcdef1234567890abcdef1234567890',
    recordType: 'ENROLLMENT',
    entityId: 'STU-45892',
    entityName: 'John Doe - Kilimani Primary',
    writtenAt: '2026-05-12 13:45:22',
    verificationStatus: 'CONFIRMED',
    mysqlMatch: 'MATCH',
  },
];

export function BlockchainLedger() {
  const [selectedRecord, setSelectedRecord] = useState<LedgerRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header breadcrumbs={['Blockchain Ledger']} />

      <main className="flex-1 overflow-y-auto bg-[#F4F6F9] p-6">
        {/* Summary cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <StatCard icon={Database} label="Total Records on Ledger" value="1.2M" />
          <StatCard label="Last Block Written" value="2 mins ago" />
          <StatCard icon={CheckCircle} label="Ledger Sync Status" value="HEALTHY" />
          <StatCard label="Smart Contract Executions" value="2,847" />
          <StatCard icon={AlertTriangle} label="Tamper Attempts" value={0} />
        </div>

        {/* Search bar */}
        <div className="bg-white rounded-lg border border-[#DDE1E7] p-4 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Entity ID, Transaction Hash, or Block Number..."
              className="flex-1 border border-[#DDE1E7] rounded px-4 py-2 text-sm"
            />
            <button className="bg-[#1A3C5E] text-white px-6 py-2 rounded font-medium hover:bg-[#2E7D52] transition-colors">
              Search
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="px-3 py-1 rounded-full text-xs font-medium bg-[#F4F6F9] hover:bg-[#DDE1E7] transition-colors">
              Enrollments
            </button>
            <button className="px-3 py-1 rounded-full text-xs font-medium bg-[#F4F6F9] hover:bg-[#DDE1E7] transition-colors">
              Payments
            </button>
            <button className="px-3 py-1 rounded-full text-xs font-medium bg-[#F4F6F9] hover:bg-[#DDE1E7] transition-colors">
              Deliveries
            </button>
            <button className="px-3 py-1 rounded-full text-xs font-medium bg-[#F4F6F9] hover:bg-[#DDE1E7] transition-colors">
              Smart Contracts
            </button>
          </div>
        </div>

        {/* Ledger table */}
        <div className="bg-white rounded-lg border border-[#DDE1E7] overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F4F6F9] border-b border-[#DDE1E7]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Block Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Transaction Hash
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Record Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Entity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Written At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Verification
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    MySQL Match
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockRecords.map((record, index) => (
                  <tr
                    key={record.blockNumber}
                    className={`border-b border-[#DDE1E7] hover:bg-[#F4F6F9] cursor-pointer ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                    }`}
                    onClick={() => setSelectedRecord(record)}
                  >
                    <td className="px-4 py-3 text-sm font-mono">{record.blockNumber}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[#6B7280]">
                          {record.txHash.substring(0, 10)}...{record.txHash.substring(record.txHash.length - 6)}
                        </span>
                        <button className="p-1 hover:bg-[#F4F6F9] rounded">
                          <Copy className="w-3 h-3 text-[#6B7280]" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#2471A3] text-white">
                        {record.recordType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{record.entityName}</p>
                        <p className="text-xs text-[#6B7280] font-mono">{record.entityId}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-[#6B7280]">
                      {record.writtenAt}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={record.verificationStatus} variant="filled" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={record.mysqlMatch}
                        variant={record.mysqlMatch === 'MISMATCH' ? 'filled' : 'outline'}
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

        {/* Block timeline */}
        <div className="bg-white rounded-lg border border-[#DDE1E7] p-6">
          <h3 className="font-bold text-lg mb-4">Recent Block Timeline</h3>
          <div className="flex gap-2 overflow-x-auto pb-4">
            {Array.from({ length: 20 }, (_, i) => {
              const blockNum = 45900 - i;
              const recordCount = Math.floor(Math.random() * 50) + 10;
              return (
                <div
                  key={blockNum}
                  className="flex-shrink-0 bg-[#F4F6F9] border border-[#DDE1E7] rounded-lg p-3 w-32 hover:bg-[#2471A3] hover:text-white cursor-pointer transition-colors group"
                >
                  <p className="text-xs font-mono mb-1">Block {blockNum}</p>
                  <p className="font-bold text-sm">{recordCount} records</p>
                  <p className="text-xs text-[#6B7280] group-hover:text-white/70">2 mins ago</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-[#DDE1E7] p-6 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-xl">Ledger Record Details</h2>
                <p className="text-sm text-[#6B7280]">Block {selectedRecord.blockNumber}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 hover:bg-[#F4F6F9] rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Transaction hash */}
              <div className="bg-[#F4F6F9] rounded-lg p-4">
                <h3 className="font-bold text-sm mb-2">Transaction Hash</h3>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-mono text-[#6B7280] break-all">{selectedRecord.txHash}</p>
                  <button className="p-1.5 hover:bg-white rounded">
                    <Copy className="w-4 h-4 text-[#6B7280]" />
                  </button>
                </div>
              </div>

              {/* Record info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold text-sm mb-2">Block Number</h3>
                  <p className="text-lg font-mono">{selectedRecord.blockNumber}</p>
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-2">Record Type</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#2471A3] text-white">
                    {selectedRecord.recordType}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-2">Entity ID</h3>
                  <p className="font-mono text-sm">{selectedRecord.entityId}</p>
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-2">Written At</h3>
                  <p className="text-sm">{selectedRecord.writtenAt}</p>
                </div>
              </div>

              {/* Verification panel */}
              <div className="bg-[#F4F6F9] rounded-lg p-4">
                <h3 className="font-bold text-sm mb-3">Verification Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Blockchain Confirmation:</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#2E7D52]" />
                      <StatusBadge status={selectedRecord.verificationStatus} variant="filled" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">MySQL Database Match:</span>
                    <StatusBadge
                      status={selectedRecord.mysqlMatch}
                      variant={selectedRecord.mysqlMatch === 'MISMATCH' ? 'filled' : 'outline'}
                    />
                  </div>
                </div>
              </div>

              {/* Raw payload */}
              <div>
                <h3 className="font-bold text-sm mb-2">Raw Payload (JSON)</h3>
                <div className="bg-[#1C1C1E] text-[#2E7D52] rounded-lg p-4 text-xs font-mono overflow-x-auto">
                  <pre>{JSON.stringify({
                    blockNumber: selectedRecord.blockNumber,
                    transactionHash: selectedRecord.txHash,
                    recordType: selectedRecord.recordType,
                    entityId: selectedRecord.entityId,
                    timestamp: selectedRecord.writtenAt,
                    verified: true
                  }, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
