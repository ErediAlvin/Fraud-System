import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RiskBadge } from '../components/RiskBadge';
import { StatCard } from '../components/StatCard';
import {
  Package,
  AlertTriangle,
  ShieldAlert,
  DollarSign,
  X,
  CheckCircle,
  RefreshCw,
  Building,
  Truck,
  FileCheck,
  ExternalLink,
} from 'lucide-react';
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
  county?: string;
  phone?: string;
  email?: string;
  totalOrders?: number;
  totalValue?: number;
}

interface NetworkNode {
  id: string;
  label: string;
  type: 'SUPPLIER' | 'SCHOOL';
  tier: string;
  score: number;
  x?: number;
  y?: number;
}

interface NetworkLink {
  source: string;
  target: string;
  value: number;
  risk: string;
}

export function SupplyChainMonitor() {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierDetail, setSupplierDetail] = useState<any | null>(null);
  const [supplierDetailLoading, setSupplierDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState({
    activeSuppliers: 0,
    flaggedSuppliers: 0,
    deliveryMismatchRate: '0%',
    procurementValueAtRisk: 'KES 0',
    smartContractBlocked: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    county: 'ALL',
    tier: 'ALL',
  });
  const [search, setSearch] = useState('');

  // Network graph state
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([]);
  const [networkLinks, setNetworkLinks] = useState<NetworkLink[]>([]);
  const [networkLoading, setNetworkLoading] = useState(true);

  // Load suppliers and summary
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
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [filters, search]);

  // Load network topology
  useEffect(() => {
    let isMounted = true;
    async function loadNetwork() {
      try {
        setNetworkLoading(true);
        const res = await api.get<{ nodes: NetworkNode[]; links: NetworkLink[] }>('/supply-chain/network');
        if (isMounted && res) {
          // Layout nodes across SVG canvas (width 480, height 360)
          const supNodes = res.nodes.filter((n) => n.type === 'SUPPLIER');
          const schNodes = res.nodes.filter((n) => n.type === 'SCHOOL');

          const positioned: NetworkNode[] = [];
          supNodes.forEach((node, i) => {
            const angle = (i / Math.max(supNodes.length, 1)) * Math.PI * 2;
            positioned.push({
              ...node,
              x: 180 + Math.cos(angle) * 110,
              y: 170 + Math.sin(angle) * 100,
            });
          });

          schNodes.forEach((node, i) => {
            const angle = (i / Math.max(schNodes.length, 1)) * Math.PI * 2 + 0.3;
            positioned.push({
              ...node,
              x: 180 + Math.cos(angle) * 155,
              y: 170 + Math.sin(angle) * 135,
            });
          });

          setNetworkNodes(positioned);
          setNetworkLinks(res.links || []);
        }
      } catch (e) {
        console.error('Failed to load supply chain network:', e);
      } finally {
        if (isMounted) setNetworkLoading(false);
      }
    }
    loadNetwork();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch detailed dossier when supplier selected
  const handleSelectSupplier = async (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setActionMessage(null);
    try {
      setSupplierDetailLoading(true);
      const data = await api.get<any>(`/supply-chain/suppliers/${supplier.id}`);
      setSupplierDetail(data);
    } catch (e) {
      setSupplierDetail(null);
    } finally {
      setSupplierDetailLoading(false);
    }
  };

  // Flag supplier
  const handleFlagSupplier = async (id: string) => {
    try {
      setActionLoading(true);
      await api.post(`/supply-chain/suppliers/${id}/flag`);
      setActionMessage({ type: 'success', text: 'Supplier successfully flagged as CRITICAL risk' });
      // Update local state
      setSuppliers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, tier: 'CRITICAL', quantityVariance: 0.85 } : s))
      );
      if (selectedSupplier && selectedSupplier.id === id) {
        setSelectedSupplier((prev) => (prev ? { ...prev, tier: 'CRITICAL' } : null));
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to flag supplier.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Clear supplier
  const handleClearSupplier = async (id: string) => {
    try {
      setActionLoading(true);
      await api.post(`/supply-chain/suppliers/${id}/clear`);
      setActionMessage({ type: 'success', text: 'Supplier risk tier reset to LOW' });
      // Update local state
      setSuppliers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, tier: 'LOW', quantityVariance: 0.05 } : s))
      );
      if (selectedSupplier && selectedSupplier.id === id) {
        setSelectedSupplier((prev) => (prev ? { ...prev, tier: 'LOW' } : null));
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to clear supplier.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header breadcrumbs={['Supply Chain Monitor']} />

      <main className="flex-1 overflow-y-auto bg-[#F4F6F9] p-6">
        {/* Summary cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <StatCard icon={Package} label="Active Suppliers" value={loading ? '...' : stats.activeSuppliers} />
          <StatCard
            icon={AlertTriangle}
            label="Flagged Suppliers"
            value={loading ? '...' : stats.flaggedSuppliers}
            variant="warning"
          />
          <StatCard label="Delivery Mismatch Rate" value={loading ? '...' : stats.deliveryMismatchRate} />
          <StatCard
            icon={DollarSign}
            label="Procurement Value at Risk"
            value={loading ? '...' : stats.procurementValueAtRisk}
            variant="critical"
          />
          <StatCard
            icon={ShieldAlert}
            label="Smart Contract Blocked"
            value={loading ? '...' : stats.smartContractBlocked}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-[#DDE1E7] p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1">County Scope</label>
              <select
                className="border border-[#DDE1E7] rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-[#1A3C5E]"
                value={filters.county}
                onChange={(e) => setFilters({ ...filters, county: e.target.value })}
              >
                <option value="ALL">All Counties</option>
                <option value="Nairobi">Nairobi</option>
                <option value="Mombasa">Mombasa</option>
                <option value="Kisumu">Kisumu</option>
                <option value="Nakuru">Nakuru</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1">Risk Tier</label>
              <select
                className="border border-[#DDE1E7] rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-[#1A3C5E]"
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
                placeholder="Search by supplier name or PIN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-[#DDE1E7] rounded-lg px-3 py-1.5 text-sm w-72 focus:outline-none focus:border-[#1A3C5E]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Supplier table */}
          <div className="lg:col-span-7 bg-white rounded-lg border border-[#DDE1E7] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#DDE1E7] bg-[#F8FAFC] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#1A3C5E]">Registered Suppliers & Procurement Integrity</h3>
              <span className="text-xs text-[#6B7280]">{suppliers.length} vendors monitored</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F4F6F9] border-b border-[#DDE1E7]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">Supplier</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">Schools</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">Risk Tier</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">Monopoly</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">Delivery Rate</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase">Actions</th>
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
                        className={`border-b border-[#DDE1E7] hover:bg-[#F4F6F9] cursor-pointer transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                        }`}
                        onClick={() => handleSelectSupplier(supplier)}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-[#1F2937]">{supplier.name}</p>
                            <p className="text-xs text-[#6B7280] font-mono">{supplier.id.slice(0, 12)}...</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{supplier.schoolsServed}</td>
                        <td className="px-4 py-3">
                          <RiskBadge tier={supplier.tier} />
                        </td>
                        <td className="px-4 py-3">
                          {supplier.monopolyFlag ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#C0392B] text-white">
                              YES
                            </span>
                          ) : (
                            <span className="text-xs text-[#6B7280]">No</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono">
                          {(supplier.deliveryConfirmation * 100).toFixed(0)}%
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSupplier(supplier);
                            }}
                            className="text-[#1A3C5E] hover:text-[#2E7D52] text-xs font-semibold px-2.5 py-1 rounded bg-[#EBF5FB] hover:bg-[#D4E6F1] transition-colors"
                          >
                            Dossier
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Supply chain network graph */}
          <div className="lg:col-span-5 bg-white rounded-lg border border-[#DDE1E7] p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-base text-[#1A3C5E]">Supply Chain Network Topology</h3>
                <p className="text-xs text-[#6B7280]">Interactive Supplier ↔ School relationship graph</p>
              </div>
            </div>

            {/* Interactive SVG Network */}
            <div className="relative flex-1 min-h-[360px] bg-[#F8FAFC] rounded-lg border border-[#E5E7EB] overflow-hidden flex items-center justify-center">
              {networkLoading ? (
                <div className="text-center py-12 text-sm text-[#6B7280]">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1A3C5E]" />
                  Rendering network graph...
                </div>
              ) : (
                <svg viewBox="0 0 360 340" className="w-full h-full">
                  {/* Links */}
                  {networkLinks.map((link, idx) => {
                    const sourceNode = networkNodes.find((n) => n.id === link.source);
                    const targetNode = networkNodes.find((n) => n.id === link.target);
                    if (!sourceNode || !targetNode || sourceNode.x === undefined || targetNode.x === undefined) {
                      return null;
                    }
                    const strokeColor =
                      link.risk === 'CRITICAL'
                        ? '#C0392B'
                        : link.risk === 'HIGH'
                        ? '#E8A020'
                        : '#94A3B8';
                    return (
                      <line
                        key={`link-${idx}`}
                        x1={sourceNode.x}
                        y1={sourceNode.y}
                        x2={targetNode.x}
                        y2={targetNode.y}
                        stroke={strokeColor}
                        strokeWidth={link.risk === 'CRITICAL' ? 2 : 1}
                        strokeDasharray={link.risk === 'CRITICAL' ? '4 2' : undefined}
                        opacity={0.7}
                      />
                    );
                  })}

                  {/* Nodes */}
                  {networkNodes.map((node) => {
                    if (node.x === undefined || node.y === undefined) return null;
                    const isSupplier = node.type === 'SUPPLIER';
                    const fillColor = isSupplier
                      ? node.tier === 'CRITICAL'
                        ? '#C0392B'
                        : node.tier === 'HIGH'
                        ? '#E8A020'
                        : '#1A3C5E'
                      : '#2E7D52';

                    return (
                      <g
                        key={node.id}
                        className="cursor-pointer transition-transform hover:scale-110"
                        onClick={() => {
                          if (isSupplier) {
                            const found = suppliers.find((s) => s.id === node.id);
                            if (found) handleSelectSupplier(found);
                          }
                        }}
                      >
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={isSupplier ? 14 : 9}
                          fill={fillColor}
                          stroke="#FFFFFF"
                          strokeWidth={2}
                          className="drop-shadow-sm"
                        />
                        <text
                          x={node.x}
                          y={node.y + (isSupplier ? 22 : 16)}
                          textAnchor="middle"
                          fontSize="9"
                          fill="#374151"
                          fontWeight="600"
                        >
                          {node.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#C0392B]"></div>
                <span className="text-[#6B7280]">Critical Risk Supplier</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#1A3C5E]"></div>
                <span className="text-[#6B7280]">Normal Supplier</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#2E7D52]"></div>
                <span className="text-[#6B7280]">Recipient School</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Detailed Supplier Dossier Modal ── */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#DDE1E7] animate-in fade-in zoom-in duration-150">
            <div className="sticky top-0 bg-white border-b border-[#DDE1E7] px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-bold text-lg text-[#1A3C5E]">Supplier Dossier & Integrity Profile</h2>
                <p className="text-xs font-mono text-[#6B7280]">{selectedSupplier.id}</p>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="p-1.5 hover:bg-[#F4F6F9] rounded-lg text-[#6B7280]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {actionMessage && (
                <div
                  className={`p-3 rounded-lg flex items-center gap-2 text-xs font-medium ${
                    actionMessage.type === 'success'
                      ? 'bg-[#E8F8F0] border border-[#2E7D52] text-[#2E7D52]'
                      : 'bg-[#FDF2F2] border border-[#C0392B] text-[#C0392B]'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{actionMessage.text}</span>
                </div>
              )}

              {/* Top Overview Cards */}
              <div className="bg-[#F8FAFC] rounded-lg p-4 border border-[#E2E8F0]">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[#6B7280] block mb-0.5">Supplier Name:</span>
                    <p className="font-bold text-sm text-[#1F2937]">{selectedSupplier.name}</p>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block mb-0.5">Risk Tier:</span>
                    <RiskBadge tier={selectedSupplier.tier} />
                  </div>
                  <div>
                    <span className="text-[#6B7280] block mb-0.5">Schools Supplied:</span>
                    <p className="font-bold text-sm text-[#1F2937]">{selectedSupplier.schoolsServed} schools</p>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block mb-0.5">Quantity Variance:</span>
                    <p
                      className={`font-bold text-sm ${
                        selectedSupplier.quantityVariance > 0.2 ? 'text-[#C0392B]' : 'text-[#2E7D52]'
                      }`}
                    >
                      {(selectedSupplier.quantityVariance * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Orders & Deliveries Breakdown */}
              {supplierDetailLoading ? (
                <div className="text-center py-6 text-xs text-[#6B7280]">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1 text-[#1A3C5E]" />
                  Loading procurement history...
                </div>
              ) : supplierDetail ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wide text-[#6B7280] mb-2 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#1A3C5E]" />
                      Recent Deliveries & Mismatch Logs
                    </h4>
                    <div className="border border-[#DDE1E7] rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-[#F4F6F9] border-b border-[#DDE1E7]">
                          <tr>
                            <th className="px-3 py-2 text-left">Note #</th>
                            <th className="px-3 py-2 text-left">School</th>
                            <th className="px-3 py-2 text-left">Delivered vs Ordered</th>
                            <th className="px-3 py-2 text-left">Status</th>
                            <th className="px-3 py-2 text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {supplierDetail.deliveries?.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-4 text-[#6B7280]">
                                No delivery logs recorded.
                              </td>
                            </tr>
                          ) : (
                            supplierDetail.deliveries.slice(0, 5).map((d: any) => (
                              <tr key={d.id} className="border-b border-[#DDE1E7] hover:bg-[#F9FAFB]">
                                <td className="px-3 py-2 font-mono">{d.noteNo}</td>
                                <td className="px-3 py-2 font-medium">{d.schoolName}</td>
                                <td className="px-3 py-2">
                                  {d.delivered} / {d.ordered} KG
                                </td>
                                <td className="px-3 py-2">
                                  <span
                                    className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                      d.status === 'DISCREPANCY'
                                        ? 'bg-[#FDF2F2] text-[#C0392B]'
                                        : 'bg-[#E8F8F0] text-[#2E7D52]'
                                    }`}
                                  >
                                    {d.status}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-right text-[#6B7280]">{d.date}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wide text-[#6B7280] mb-2 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#1A3C5E]" />
                      Top Associated Schools
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {supplierDetail.schools?.slice(0, 4).map((sch: any) => (
                        <div key={sch.id} className="p-2.5 rounded-lg border border-[#E2E8F0] bg-white text-xs">
                          <p className="font-bold text-[#1F2937]">{sch.name}</p>
                          <p className="text-[11px] text-[#6B7280]">
                            {sch.county} • {sch.orders} orders (KES {Number(sch.value).toLocaleString()})
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-[#DDE1E7]">
                <button
                  onClick={() => handleFlagSupplier(selectedSupplier.id)}
                  disabled={actionLoading || selectedSupplier.tier === 'CRITICAL'}
                  className="flex-1 bg-[#C0392B] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#962D22] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  Flag Supplier (Critical Alert)
                </button>
                <button
                  onClick={() => handleClearSupplier(selectedSupplier.id)}
                  disabled={actionLoading || selectedSupplier.tier === 'LOW'}
                  className="px-6 py-2 border border-[#2E7D52] text-[#2E7D52] hover:bg-[#E8F8F0] rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Reset Risk to Clean
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
