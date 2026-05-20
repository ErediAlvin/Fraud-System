import { useState } from 'react';
import { Header } from '../components/Header';
import { Settings, Users, Shield, Database, Clock, FileText, Save } from 'lucide-react';

const settingsNav = [
  { id: 'general', icon: Settings, label: 'General Settings' },
  { id: 'users', icon: Users, label: 'User Management' },
  { id: 'thresholds', icon: Shield, label: 'Risk Thresholds' },
  { id: 'alerts', icon: Shield, label: 'Alert Configuration' },
  { id: 'blockchain', icon: Database, label: 'Blockchain Configuration' },
  { id: 'schedule', icon: Clock, label: 'SOB / COB Schedule' },
  { id: 'audit', icon: FileText, label: 'Audit Log' },
];

const mockUsers = [
  { name: 'Admin User', email: 'admin@dsfmp.go.ke', role: 'System Administrator', county: 'All', status: 'ACTIVE', lastLogin: '2026-05-12 14:23' },
  { name: 'Jane Mwangi', email: 'jane.mwangi@dsfmp.go.ke', role: 'Fraud Analyst', county: 'Nairobi', status: 'ACTIVE', lastLogin: '2026-05-12 13:45' },
  { name: 'John Kamau', email: 'john.kamau@dsfmp.go.ke', role: 'County Officer', county: 'Mombasa', status: 'ACTIVE', lastLogin: '2026-05-11 16:20' },
];

export function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header breadcrumbs={['System Settings']} />

      <main className="flex-1 overflow-y-auto bg-[#F4F6F9]">
        <div className="flex h-full">
          {/* Left navigation */}
          <aside className="w-64 bg-white border-r border-[#DDE1E7] p-4">
            <nav className="space-y-1">
              {settingsNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === item.id
                      ? 'bg-[#1A3C5E] text-white'
                      : 'text-[#6B7280] hover:bg-[#F4F6F9]'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="bg-white rounded-lg border border-[#DDE1E7] p-6">
                <h2 className="font-bold text-xl mb-6">General Settings</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">System Name</label>
                    <input
                      type="text"
                      defaultValue="DSFMP Fraud Detection Module"
                      className="w-full border border-[#DDE1E7] rounded px-3 py-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Version</label>
                      <input
                        type="text"
                        defaultValue="v2.1.4"
                        className="w-full border border-[#DDE1E7] rounded px-3 py-2"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Environment</label>
                      <select className="w-full border border-[#DDE1E7] rounded px-3 py-2">
                        <option>PRODUCTION</option>
                        <option>STAGING</option>
                        <option>DEVELOPMENT</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Default County</label>
                    <select className="w-full border border-[#DDE1E7] rounded px-3 py-2">
                      <option>All Counties</option>
                      <option>Nairobi</option>
                      <option>Mombasa</option>
                      <option>Kisumu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      defaultValue={30}
                      className="w-full border border-[#DDE1E7] rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Notification Preferences</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Email notifications</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">In-app notifications</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">SMS notifications</span>
                      </label>
                    </div>
                  </div>

                  <button className="bg-[#1A3C5E] text-white px-6 py-2 rounded font-medium hover:bg-[#2E7D52] transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* User Management */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-lg border border-[#DDE1E7] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-xl">User Management</h2>
                  <button className="bg-[#1A3C5E] text-white px-4 py-2 rounded font-medium hover:bg-[#2E7D52] transition-colors">
                    Add User
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#F4F6F9] border-b border-[#DDE1E7]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">County Access</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Last Login</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUsers.map((user, index) => (
                        <tr
                          key={index}
                          className={`border-b border-[#DDE1E7] ${
                            index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                          }`}
                        >
                          <td className="px-4 py-3 text-sm font-medium">{user.name}</td>
                          <td className="px-4 py-3 text-sm">{user.email}</td>
                          <td className="px-4 py-3 text-sm">{user.role}</td>
                          <td className="px-4 py-3 text-sm">{user.county}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#2E7D52] text-white">
                              {user.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-[#6B7280]">{user.lastLogin}</td>
                          <td className="px-4 py-3">
                            <button className="text-[#1A3C5E] hover:text-[#2E7D52] text-sm font-medium">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Risk Thresholds */}
            {activeTab === 'thresholds' && (
              <div className="bg-white rounded-lg border border-[#DDE1E7] p-6">
                <h2 className="font-bold text-xl mb-6">Risk Thresholds</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-sm mb-4">Model Thresholds</h3>
                    <div className="space-y-4">
                      {['Isolation Forest', 'Autoencoder', 'LSTM Autoencoder', 'Graph Neural Network'].map((model, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium">{model}</label>
                            <span className="font-mono text-sm">0.{65 + index * 2}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            defaultValue={0.65 + index * 0.02}
                            className="w-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm mb-4">Composite Score Tier Boundaries</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-1 text-[#C0392B]">CRITICAL (above)</label>
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={0.7}
                          className="w-full border border-[#DDE1E7] rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 text-[#E8A020]">HIGH (above)</label>
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={0.5}
                          className="w-full border border-[#DDE1E7] rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 text-[#2471A3]">MEDIUM (above)</label>
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={0.3}
                          className="w-full border border-[#DDE1E7] rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 text-[#2E7D52]">LOW (below)</label>
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={0.3}
                          className="w-full border border-[#DDE1E7] rounded px-3 py-2"
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  <button className="bg-[#1A3C5E] text-white px-6 py-2 rounded font-medium hover:bg-[#2E7D52] transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Thresholds
                  </button>
                </div>
              </div>
            )}

            {/* Blockchain Configuration */}
            {activeTab === 'blockchain' && (
              <div className="bg-white rounded-lg border border-[#DDE1E7] p-6">
                <h2 className="font-bold text-xl mb-6">Blockchain Configuration</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Hyperledger Fabric Endpoint URL</label>
                    <input
                      type="text"
                      defaultValue="https://blockchain.dsfmp.go.ke:7051"
                      className="w-full border border-[#DDE1E7] rounded px-3 py-2 font-mono text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Channel Name</label>
                      <input
                        type="text"
                        defaultValue="dsfmp-channel"
                        className="w-full border border-[#DDE1E7] rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Chaincode Name</label>
                      <input
                        type="text"
                        defaultValue="fraud-detection-cc"
                        className="w-full border border-[#DDE1E7] rounded px-3 py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Sync Interval (seconds)</label>
                    <input
                      type="number"
                      defaultValue={60}
                      className="w-full border border-[#DDE1E7] rounded px-3 py-2"
                    />
                  </div>

                  <div className="bg-[#F4F6F9] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Certificate Status</span>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#2E7D52] rounded-full"></span>
                        <span className="text-sm text-[#2E7D52]">VALID</span>
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280]">Certificate expires: 2027-05-12</p>
                  </div>

                  <div className="flex gap-3">
                    <button className="bg-[#1A3C5E] text-white px-6 py-2 rounded font-medium hover:bg-[#2E7D52] transition-colors flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Configuration
                    </button>
                    <button className="border border-[#DDE1E7] px-6 py-2 rounded font-medium hover:bg-[#F4F6F9] transition-colors">
                      Re-sync Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SOB/COB Schedule */}
            {activeTab === 'schedule' && (
              <div className="bg-white rounded-lg border border-[#DDE1E7] p-6">
                <h2 className="font-bold text-xl mb-6">SOB / COB Schedule</h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">SOB Time (24-hour format)</label>
                      <input
                        type="time"
                        defaultValue="06:00"
                        className="w-full border border-[#DDE1E7] rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">COB Time (24-hour format)</label>
                      <input
                        type="time"
                        defaultValue="18:00"
                        className="w-full border border-[#DDE1E7] rounded px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Enable scheduled SOB runs</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Enable scheduled COB runs</span>
                    </label>
                  </div>

                  <button className="bg-[#1A3C5E] text-white px-6 py-2 rounded font-medium hover:bg-[#2E7D52] transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Schedule
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
