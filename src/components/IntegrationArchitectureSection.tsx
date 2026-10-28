import React, { useState } from 'react';
import {
  Network,
  Shield,
  Key,
  FileCode,
  CheckCircle2,
  Clock,
  Layers,
  ExternalLink,
  Lock,
  Server,
  Database,
  ArrowRight,
} from 'lucide-react';

interface IntegrationAdapter {
  id: string;
  name: string;
  category: string;
  status: 'Mock Prototype Interface' | 'Roadmap Architecture';
  purpose: string;
  authMethod: string;
  dataContract: {
    format: string;
    samplePayload: string;
  };
  requiredApprovals: string[];
  testingCriteria: string[];
}

export const IntegrationArchitectureSection: React.FC = () => {
  const [selectedAdapterId, setSelectedAdapterId] = useState<string>('salesforce');

  const adapters: IntegrationAdapter[] = [
    {
      id: 'salesforce',
      name: 'Salesforce CRM (Broker & Opportunity Sync)',
      category: 'Customer Relationship Management',
      status: 'Mock Prototype Interface',
      purpose:
        'Bi-directional sync of broker opportunities, SME company records, uploaded census attachments, and calculated quote proposals into Salesforce Financial Services Cloud.',
      authMethod: 'OAuth 2.0 Client Credentials Grant with mTLS (Mutual TLS 1.3)',
      dataContract: {
        format: 'REST JSON / Salesforce Enterprise Composite API',
        samplePayload: JSON.stringify(
          {
            opportunity_id: '006XX00000abc123',
            account_name: 'Synthetic SME Trading LLC',
            broker_code: 'BRK-DXB-9921',
            quote_reference: 'CQ-2026-X892F',
            selected_tier: 'Enhanced',
            copay_percent: 10,
            rated_member_count: 50,
            illustrative_annual_premium_aed: 75000.0,
            status: 'Illustrative_Quote_Generated',
          },
          null,
          2
        ),
      },
      requiredApprovals: [
        'Enterprise Architecture Review Board (ARB) sign-off',
        'Cigna Salesforce Sandbox Security & Access Control Review',
        'Broker Data Privacy Agreement (DPA) validation',
      ],
      testingCriteria: [
        'Sandbox mTLS certificate handshake verification',
        'Idempotent record creation to prevent duplicate quotes',
        'Error queue monitoring for retry resilience',
      ],
    },
    {
      id: 'rating_engine',
      name: 'Insurer-Approved Live Rating Engine',
      category: 'Actuarial & Underwriting Pricing',
      status: 'Mock Prototype Interface',
      purpose:
        'Transfers verified, normalized employee records to official Cigna actuarial pricing services for binding underwriting rates, risk factors, and regulatory filing adherence.',
      authMethod: 'GCP Service Account JWT / API Gateway with HMAC-SHA256 Signatures',
      dataContract: {
        format: 'JSON REST / gRPC Protobuf',
        samplePayload: JSON.stringify(
          {
            actuarial_product_code: 'AE-SME-COMMUNITY-V4',
            underwriting_year: 2026,
            emirate_of_residence: 'Dubai',
            group_size_band: '51-100',
            members: [
              { id: 'EMP001', rel: 'employee', age: 41, plan: 'enhanced', copay: '10' },
              { id: 'EMP001-S1', rel: 'spouse', age: 38, plan: 'enhanced', copay: '10' },
            ],
          },
          null,
          2
        ),
      },
      requiredApprovals: [
        'Chief Actuary & Product Underwriting Committee approval',
        'Regulatory tariff validation (DHA / DOH / CBUAE compliance)',
        'Model Governance & Risk Management verification',
      ],
      testingCriteria: [
        'Batch reconciliation testing against historical manual rating worksheets',
        'Sub-500ms SLA stress test on 5,000-member census batches',
        'Discrepancy alerting within 0.01 AED delta threshold',
      ],
    },
    {
      id: 'pas',
      name: 'Policy Administration System (PAS)',
      category: 'Core Insurance Engine',
      status: 'Roadmap Architecture',
      purpose:
        'Downstream issuance of insurance policy schedule, member digital health cards, and direct billing network enablement upon broker acceptance of quotation.',
      authMethod: 'Enterprise Service Bus (ESB) Kafka / AS4 Secure Messaging',
      dataContract: {
        format: 'ACORD / ISO 20022 Insurance Standard XML & JSON',
        samplePayload: JSON.stringify(
          {
            policy_issuance_request: {
              binder_id: 'BIND-2026-DXB-4412',
              insurer: 'Cigna Insurance Middle East',
              effective_date: '2026-11-01',
              expiry_date: '2027-10-31',
              total_annual_premium_aed: 75000.0,
              payment_terms: 'Annual In Advance',
            },
          },
          null,
          2
        ),
      },
      requiredApprovals: [
        'Core Insurance Operations Leadership clearance',
        'UAE Health Insurance Registry (eClaimLink / Shafafiya) onboarding',
        'Financial Treasury & Banking Gateway integration review',
      ],
      testingCriteria: [
        'End-to-end sandbox policy issuance simulation',
        'Digital health card generation and QR validation',
        'Audit trail immutability verification',
      ],
    },
    {
      id: 'iam',
      name: 'IAM & Single Sign-On (Okta / Azure AD / Cigna SSO)',
      category: 'Security & Access Control',
      status: 'Mock Prototype Interface',
      purpose:
        'Role-Based Access Control (RBAC) enforcing least-privilege permissions across Brokers, Underwriting Reviewers, Actuaries, and Operations Administrators.',
      authMethod: 'OpenID Connect (OIDC) / SAML 2.0 with Hardware Token 2FA',
      dataContract: {
        format: 'JSON Web Token (JWT)',
        samplePayload: JSON.stringify(
          {
            sub: 'usr_cigna_op_981',
            email: 'reviewer@brokerage-partner.ae',
            roles: ['SME_Census_Reviewer', 'Quote_Authorizer'],
            organization_id: 'ORG-UAE-0091',
            mfa_verified: true,
          },
          null,
          2
        ),
      },
      requiredApprovals: [
        'Cigna Corporate Information Security (InfoSec) sign-off',
        'Zero Trust Architecture compliance check',
        'Third-party Vendor Risk Assessment',
      ],
      testingCriteria: [
        'Privilege escalation penetration testing',
        'Session revocation and token timeout verification',
        'Audit log telemetry ingestion into enterprise SIEM',
      ],
    },
  ];

  const current = adapters.find((a) => a.id === selectedAdapterId) || adapters[0];

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Step 9: Integration Architecture & Implementation Roadmap
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Architectural blueprints and contract specifications for bridging this concept prototype to
            enterprise CRM, PAS, and live rating systems.
          </p>
        </div>

        {/* Safety Disclaimer */}
        <div className="mt-4 p-3 bg-slate-900 text-slate-200 rounded-lg text-xs space-y-1">
          <div className="text-teal-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Strict Truth and Safety Requirement:</span>
          </div>
          <p className="text-slate-300">
            This prototype does <strong>not</strong> claim live connections or production API access to
            Cigna, Salesforce, or live rating engines. The interfaces below define the formal technical
            contracts and security governance required for a future production phase.
          </p>
        </div>

        {/* Adapter Selector Pills */}
        <div className="mt-6 flex flex-wrap gap-2">
          {adapters.map((ad) => {
            const isSel = ad.id === selectedAdapterId;
            return (
              <button
                key={ad.id}
                onClick={() => setSelectedAdapterId(ad.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSel
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {ad.name.split(' (')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Adapter Deep-Dive Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{current.name}</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200">
                {current.status}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium">{current.category}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            <Key className="w-3.5 h-3.5 text-teal-600" />
            <span>Auth: {current.authMethod.split(' ')[0]}</span>
          </div>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed">{current.purpose}</p>

        {/* 2-Column: Left Auth & Approvals, Right Data Contract */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Requirements & Testing */}
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-2">
                Authentication & Transport Security:
              </span>
              <p className="text-slate-700 font-mono text-[11px] bg-white p-2 rounded border border-slate-200">
                {current.authMethod}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-2">
                Required Approvals & Governance Gates:
              </span>
              <ul className="space-y-1.5 text-slate-700">
                {current.requiredApprovals.map((appr, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{appr}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-2">
                Verification & Testing Criteria:
              </span>
              <ul className="space-y-1.5 text-slate-700">
                {current.testingCriteria.map((crit, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <span>{crit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Data Contract JSON Schema */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Target Data Contract Schema:
              </span>
              <span className="text-[11px] font-mono text-slate-500">{current.dataContract.format}</span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 text-teal-300 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed max-h-80">
              {current.dataContract.samplePayload}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
