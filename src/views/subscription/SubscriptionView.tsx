import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Award, 
  HardDrive, 
  Users, 
  Mail,
  Lock,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Organisation } from '../../types';
import { api } from '../../services/apiClient';

interface SubscriptionViewProps {
  currentOrg: Organisation;
  onPlanUpdated?: (updatedOrg: Organisation) => void;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ currentOrg, onPlanUpdated }) => {
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const tiers: Array<{
    name: string;
    planKey: 'Free' | 'Professional' | 'Enterprise';
    price: string;
    period: string;
    quota: string;
    description: string;
    features: string[];
    isCurrent: boolean;
    highlight?: boolean;
  }> = [
    {
      name: 'Starter Tier (Free)',
      planKey: 'Free',
      price: '$0',
      period: 'Forever free',
      quota: '100 Certificates / mo',
      description: 'Default tier for all self-onboarded institutions and pilot programs.',
      features: [
        'Standard SHA-256 Hashing',
        'Public Web Verifier',
        '2 Reusable Templates',
        'Standard Email Dispatch',
        'Community Support'
      ],
      isCurrent: currentOrg.plan === 'Free'
    },
    {
      name: 'Professional',
      planKey: 'Professional',
      price: '$299',
      period: 'per month',
      quota: '1,000 Certificates / mo',
      description: 'For growing universities & certification institutes requiring higher throughput.',
      features: [
        'Ed25519 Cryptographic Signatures',
        'Bulk CSV / Excel Importer',
        'Unlimited Certificate Templates',
        'Amazon SES Dedicated Throughput',
        'Candidate Digital Portfolios',
        'Custom Institutional Subdomain'
      ],
      isCurrent: currentOrg.plan === 'Professional'
    },
    {
      name: 'Enterprise Sovereign',
      planKey: 'Enterprise',
      price: '$899',
      period: 'per month',
      quota: '50,000 Certificates / mo',
      description: 'High-volume academic authorities & global cloud certification providers.',
      features: [
        'Dedicated HSM Signing Keys (FIPS 140-3)',
        'Custom Verified Domain (e.g. stanford.edu)',
        'Automated S3 Archival & JSON-LD Proofs',
        'Immutable Cryptographic Audit Trail',
        '99.99% Verification SLA Guarantee',
        'Dedicated Solutions Architect'
      ],
      isCurrent: currentOrg.plan === 'Enterprise',
      highlight: true
    }
  ];

  const handleUpgrade = async (tierPlan: 'Free' | 'Professional' | 'Enterprise') => {
    setUpgradingTier(tierPlan);
    setErrorMsg(null);
    try {
      const updated = await api.updateOrganisationPlan(currentOrg.id, tierPlan);
      if (updated) {
        setToastMsg(`Plan successfully updated to ${tierPlan}. Monthly quota increased to ${updated.certificateQuota?.total || 100} certificates.`);
        setTimeout(() => setToastMsg(null), 4000);
        if (onPlanUpdated) {
          onPlanUpdated(updated);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update subscription plan.');
    } finally {
      setUpgradingTier(null);
    }
  };

  const quotaPercent = Math.min(100, Math.round((currentOrg.certificateQuota.used / currentOrg.certificateQuota.total) * 100));

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0c1a30] text-white px-5 py-3 rounded-full shadow-2xl text-xs font-mono font-bold flex items-center gap-2.5 border border-[#2ea6ff]/40 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-[#7bd94f] animate-pulse" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header Card */}
      <div className="icx-card p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-sky-50 text-[#1877e0] rounded-2xl flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-sora tracking-tight text-[#0c1a30]">
              Subscription & Plan Utilization
            </h1>
          </div>
          <p className="text-xs text-[#66748c] mt-1.5 font-jakarta">
            Current multi-tenant subscription tier, monthly issuance quotas, and institutional feature limits.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3.5 py-1.5 bg-sky-100 text-[#1877e0] text-xs font-mono font-bold uppercase rounded-full border border-sky-200">
            Active Plan: {currentOrg.plan}
          </span>
        </div>
      </div>

      {/* Quota Usage Meter */}
      <div className="icx-card p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-sora text-sm font-bold uppercase tracking-wider text-[#0c1a30]">
              Monthly Certificate Issuance Quota
            </h3>
            <span className="text-xs text-[#66748c] font-mono">
              Billing cycle resets on the 1st of every month
            </span>
          </div>
          <div className="sm:text-right">
            <span className="text-xl font-bold font-sora text-[#0c1a30]">
              {currentOrg.certificateQuota.used}
            </span>
            <span className="text-xs text-[#66748c] font-mono"> / {currentOrg.certificateQuota.total} Used</span>
          </div>
        </div>

        <div className="w-full bg-[#f4f7fc] h-3.5 rounded-full overflow-hidden border border-[#e5ebf4]">
          <div 
            className="btn-primary-gradient h-full rounded-full transition-all duration-500"
            style={{ width: `${quotaPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#e5ebf4] text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-sky-50 text-[#1877e0] rounded-xl flex items-center justify-center shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#0c1a30] block">S3 Document Storage</span>
              <span className="text-[11px] text-[#66748c] font-mono">1.2 GB of 50 GB Used</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 text-[#5cbf3c] rounded-xl flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#0c1a30] block">Amazon SES Limit</span>
              <span className="text-[11px] text-[#66748c] font-mono">10,000 emails / day</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#0c1a30] block">HSM Key Security</span>
              <span className="text-[11px] text-[#66748c] font-mono">FIPS 140-3 Hardware</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Tiers Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tiers.map((tier, idx) => (
          <div 
            key={idx}
            className={`icx-card p-7 rounded-3xl flex flex-col justify-between transition-all ${
              tier.isCurrent 
                ? 'border-[#2ea6ff] ring-2 ring-[#2ea6ff]/20 shadow-md' 
                : ''
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-sora text-lg font-bold text-[#0c1a30]">{tier.name}</h3>
                {tier.isCurrent && (
                  <span className="px-3 py-0.5 btn-primary-gradient text-[10px] font-mono font-bold uppercase rounded-full shadow-2xs">
                    Current Plan
                  </span>
                )}
              </div>

              <div>
                <span className="text-3xl sm:text-4xl font-bold font-sora text-[#0c1a30]">{tier.price}</span>
                <span className="text-xs text-[#66748c] font-mono ml-1">{tier.period}</span>
              </div>

              <div className="text-xs text-[#1877e0] font-bold font-mono bg-sky-50 p-2.5 rounded-xl border border-sky-200">
                {tier.quota}
              </div>

              <p className="text-xs text-[#66748c] font-jakarta leading-relaxed">{tier.description}</p>

              <div className="space-y-2.5 pt-4 border-t border-[#e5ebf4] text-xs">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Features Included:</span>
                {tier.features.map((f, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2 text-[#42506a]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5cbf3c] shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#e5ebf4]">
              <button
                disabled={tier.isCurrent || upgradingTier !== null}
                onClick={() => handleUpgrade(tier.planKey)}
                className={`w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  tier.isCurrent
                    ? 'bg-[#eef3fb] text-slate-400 cursor-default border border-[#e5ebf4]'
                    : 'btn-primary-gradient shadow-xs'
                }`}
              >
                {upgradingTier === tier.planKey ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating Plan...</span>
                  </>
                ) : tier.isCurrent ? (
                  'Active Subscription'
                ) : (
                  `Upgrade to ${tier.name.split(' ')[0]}`
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
