import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Shield, Lock, Mail, User } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('fraud-analyst');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('2fa');
  };

  const handle2FA = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="flex-1 bg-gradient-to-br from-[#1A3C5E] to-[#2E7D52] p-12 flex flex-col justify-center text-white">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-bold text-2xl">DSFMP</h1>
              <p className="text-sm text-white/80">Fraud Detection Module</p>
            </div>
          </div>

          <h2 className="font-bold text-3xl mb-4">
            Protecting School Feeding Programs Through Intelligent Oversight
          </h2>

          <p className="text-white/80 text-lg">
            Advanced machine learning and blockchain-powered fraud detection for Kenya's Digital School
            Feeding Management Platform.
          </p>

          <div className="mt-12 space-y-4 text-sm text-white/70">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <span>Multi-layer ML anomaly detection</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <span>Hyperledger Fabric blockchain verification</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span>Real-time case management workflow</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-[40%] bg-white flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          {step === 'login' ? (
            <div>
              <h2 className="font-bold text-2xl mb-2">Sign In</h2>
              <p className="text-[#6B7280] mb-8">Access the fraud detection dashboard</p>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-[#DDE1E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C5E]"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-[#DDE1E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C5E]"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-[#DDE1E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C5E] appearance-none"
                    >
                      <option value="fraud-analyst">Fraud Analyst</option>
                      <option value="county-officer">County Officer</option>
                      <option value="system-admin">System Administrator</option>
                      <option value="supervisor">Supervisor / Senior Investigator</option>
                      <option value="school-admin">School Administrator</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1A3C5E] text-white py-3 rounded-lg font-medium hover:bg-[#2E7D52] transition-colors"
                >
                  Sign In
                </button>

                <div className="text-center">
                  <a href="#" className="text-sm text-[#1A3C5E] hover:underline">
                    Forgot password?
                  </a>
                </div>
              </form>

              <div className="mt-8 pt-8 border-t border-[#DDE1E7]">
                <div className="flex items-center justify-center gap-2 text-sm text-[#6B7280]">
                  <Shield className="w-4 h-4" />
                  <span>Secure Government System</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="font-bold text-2xl mb-2">Two-Factor Authentication</h2>
              <p className="text-[#6B7280] mb-8">
                Enter the 6-digit code from your authenticator app
              </p>

              <form onSubmit={handle2FA} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-[#DDE1E7] rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#1A3C5E]"
                    placeholder="000000"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1A3C5E] text-white py-3 rounded-lg font-medium hover:bg-[#2E7D52] transition-colors"
                >
                  Verify & Continue
                </button>

                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="w-full text-[#6B7280] hover:text-[#1C1C1E] text-sm"
                >
                  Back to login
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
