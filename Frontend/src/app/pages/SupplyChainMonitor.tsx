import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RiskBadge } from '../components/RiskBadge';
import { StatCard } from '../components/StatCard';
import { Package, AlertTriangle, ShieldAlert, DollarSign, X } from 'lucide-react';
import { api } from '../lib/api';

interface Supplier {
  id: string;
  name: string;
  schoolsServed: number;
  tier: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  monopolyFlag: boolean;
  invoiceFrequency: number;
  quantityVariance: number;
  deliveryConfirmation: number;
  blockchainVerified: number;
}

export function SupplyChainMonitor() {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState({
    activeSuppliers: 0,
    flaggedSuppliers: 0,
    deliveryMismatchRate: '0%',
    procurementValueAtRisk: 'KES 0',
    smartContractBlocked: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    county: 'ALL',
    tier: 'ALL'
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadSupplyChain() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.county !== 'ALL') params.append('county', filters.county);
        if (filters.tier !== 'ALL') params.append('tier', filters.tier);
        if (search) params.append('search', search);

        const res = await api.get<any>(`/supply-chain?${params.toString()}`);
        if (isMounted) {
          setSuppliers(res.suppliers);
          setStats(res.stats);
          setError('');
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load supply chain data.');
          setLoading(false);
        }
      }
    }

    const timer = setTimeout(() => {
      loadSupplyChain();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [filters, search]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header breadcrumbs={['Supply Chain Monitor']} />

      <main className="flex-1 overflow-y-auto bg-[#F4F6F9] p-6">
        {/* Summary cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <StatCard icon={Package} label="Active Suppliers" value={loading ? '...' : stats.activeSuppliers} />
          <StatCard icon={AlertTriangle} label="Flagged Suppliers" value={loading ? '...' : stats.flaggedSuppliers} variant="warning" />
          <StatCard label="Delivery Mismatch Rate" value={loading ? '...' : stats.deliveryMismatchRate} />
          <StatCard icon={DollarSign} label="Procurement Value at Risk" value={loading ? '...' : stats.procurementValueAtRisk} variant="critical" />
          <StatCard icon={ShieldAlert} label="Smart Contract Blocked" value={loading ? '...' : stats.smartContractBlocked} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-[#DDE1E7] p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">County</label>
              <select
                className="border border-[#DDE1E7] rounded px-3 py-1.5 text-sm"
                value={filters.county}
                onChange={(e) => setFilters({ ...filters, county: e.target.value })}
              >
                <option value="ALL">All Counties</option>
                <option value="Nairobi">Nairobi</option>
                <option value="Mombasa">Mombasa</option>
                <option value="Kisumu">Kisumu</option>
              </select>
            </div>

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

            <div className="flex-1"></div>

            <div className="self-end">
              <input
                type="text"
                placeholder="Search by supplier name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-[#DDE1E7] rounded px-3 py-1.5 text-sm w-64"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Supplier table */}
          <div className="lg:col-span-7 bg-white rounded-lg border border-[#DDE1E7] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F4F6F9] border-b border-[#DDE1E7]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                      Supplier
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                      Schools
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                      Risk
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                      Monopoly
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                      Delivery Rate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-sm text-[#6B7280]">
                        Loading suppliers data...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-sm text-[#C0392B] font-medium">
                        {error}
                      </td>
                    </tr>
                  ) : suppliers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-sm text-[#6B7280]">
                        No suppliers found matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    suppliers.map((supplier, index) => (
                      <tr
                        key={supplier.id}
                        className={`border-b border-[#DDE1E7] hover:bg-[#F4F6F9] cursor-pointer ${
                          index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                        }`}
                        onClick={() => setSelectedSupplier(supplier)}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium">{supplier.name}</p>
                            <p className="text-xs text-[#6B7280] font-mono">{supplier.id}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{supplier.schoolsServed}</td>
                        <td className="px-4 py-3">
                          <RiskBadge tier={supplier.tier} />
                        </td>
                        <td className="px-4 py-3">
                          {supplier.monopolyFlag && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#C0392B] text-white">
                              YES
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {(supplier.deliveryConfirmation * 100).toFixed(0)}%
                        </td>
                        <td className="px-4 py-3">
                          <button className="text-[#1A3C5E] hover:text-[#2E7D52] text-sm font-medium">
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Supply chain graph */}
          <div className="lg:col-span-5 bg-white rounded-lg border border-[#DDE1E7] p-6">
            <h3 className="font-bold text-lg mb-4">Supply Chain Network</h3>
            <div className="relative h-96 bg-[#F4F6F9] rounded-lg flex items-center justify-center">
              <div className="text-center text-[#6B7280]">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Network graph visualization</p>
                <p className="text-xs">Supplier → School relationships</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#C0392B]"></div>
                <span className="text-[#6B7280]">High-risk relationships</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#E8A020]"></div>
                <span className="text-[#6B7280]">Monopoly patterns</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#2E7D52]"></div>
                <span className="text-[#6B7280]">Normal supply chains</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Supplier Profile Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-[#DDE1E7] p-6 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-xl">Supplier Profile</h2>
                <p className="text-sm font-mono text-[#6B7280]">{selectedSupplier.id}</p>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="p-2 hover:bg-[#F4F6F9] rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-[#F4F6F9] rounded-lg p-4">
                <h3 className="font-bold mb-3">Supplier Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[#6B7280]">Name:</span>
                    <p className="font-medium">{selectedSupplier.name}</p>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Schools Served:</span>
                    <p className="font-bold">{selectedSupplier.schoolsServed}</p>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Invoice Frequency:</span>
                    <p>{selectedSupplier.invoiceFrequency}/month</p>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Quantity Variance:</span>
                    <p className={selectedSupplier.quantityVariance > 0.2 ? 'text-[#C0392B]' : ''}>
                      {(selectedSupplier.quantityVariance * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm mb-3">Risk Assessment</h3>
                <RiskBadge tier={selectedSupplier.tier} />
                {selectedSupplier.monopolyFlag && (
                  <div className="mt-3 bg-[#FEF3E2] border border-[#E8A020] rounded-lg p-3">
                    <p className="text-sm">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      Monopoly flag: Serving {selectedSupplier.schoolsServed} schools (threshold: 20)
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm mb-3">Performance Metrics</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Delivery Confirmation Rate</span>
                      <span className="text-sm font-mono">
                        {(selectedSupplier.deliveryConfirmation * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-[#F4F6F9] rounded-full h-2">
                      <div
                        className="bg-[#2E7D52] h-2 rounded-full"
                        style={{ width: `${selectedSupplier.deliveryConfirmation * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Blockchain Verified Deliveries</span>
                      <span className="text-sm font-mono">
                        {(selectedSupplier.blockchainVerified * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-[#F4F6F9] rounded-full h-2">
                      <div
                        className="bg-[#2471A3] h-2 rounded-full"
                        style={{ width: `${selectedSupplier.blockchainVerified * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-[#E8A020] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#C0392B] transition-colors">
                  Flag Supplier
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
