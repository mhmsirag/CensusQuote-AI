import React from 'react';
import {
  ShieldAlert,
  CheckSquare,
  AlertTriangle,
  Lock,
  FileText,
  Building,
  Server,
  UserCheck,
  Scale,
} from 'lucide-react';

export const ComplianceChecklistSection: React.FC = () => {
  const checklistCategories = [
    {
      category: '1. UAE Personal Data Protection Law (PDPL - Federal Decree Law No. 45/2021)',
      icon: <Scale className="w-4 h-4 text-teal-600" />,
      items: [
        {
          title: 'Lawful Basis for Processing',
          desc: 'Ensure explicit consent or contractual necessity exists before ingesting employee census information.',
          status: 'Concept Requirement',
        },
        {
          title: 'Purpose Limitation & Data Minimization',
          desc: 'Restrict collected fields solely to rating factors (age, relationship, coverage option); eliminate unnecessary biometric or financial inputs.',
          status: 'Enforced in Prototype',
        },
        {
          title: 'Data Subject Rights (Access & Rectification)',
          desc: 'Provide clear workflows for members to review and rectify demographic data in the quoting pipeline.',
          status: 'Enforced via Exception Queue',
        },
      ],
    },
    {
      category: '2. UAE Healthcare Regulators (DHA, DOH, CBUAE Standards)',
      icon: <Building className="w-4 h-4 text-sky-600" />,
      items: [
        {
          title: 'Mandatory Health Insurance Minimums',
          desc: 'Compliance with Essential Benefits Plan (EBP) minimum benefit schedules for Dubai and Abu Dhabi.',
          status: 'Actuarial Gate Required',
        },
        {
          title: 'No Unauthorized Medical Underwriting',
          desc: 'Automated algorithms are strictly prohibited from evaluating medical conditions or rejecting coverage without licensed underwriter sign-off.',
          status: 'Enforced (No Health Underwriting)',
        },
        {
          title: 'Anti-Discrimination & Standard Premium Bands',
          desc: 'Adherence to community rating guidelines and age-band restrictions registered with Central Bank of the UAE.',
          status: 'Actuarial Gate Required',
        },
      ],
    },
    {
      category: '3. Data Residency & Cross-Border Processing Constraints',
      icon: <Server className="w-4 h-4 text-indigo-600" />,
      items: [
        {
          title: 'In-Country Data Sovereign Hosting',
          desc: 'Production infrastructure must reside within certified UAE cloud regions (e.g., UAE Central / UAE North) compliant with local data sovereignty laws.',
          status: 'Infrastructure Roadmap',
        },
        {
          title: 'Prohibition on Unapproved Cross-Border Exfiltration',
          desc: 'Zero transmission of identifiable UAE employee census records to foreign LLM or cloud endpoints without bilateral approval.',
          status: 'Enforced (Synthetic Demo Only)',
        },
      ],
    },
    {
      category: '4. Enterprise Security, Cryptography & Audit Logging',
      icon: <Lock className="w-4 h-4 text-rose-600" />,
      items: [
        {
          title: 'End-to-End Encryption Standards',
          desc: 'Mandatory TLS 1.3 for all traffic in transit and AES-256 for persistent databases and backups.',
          status: 'Baseline Requirement',
        },
        {
          title: 'Immutable Audit Logging',
          desc: 'Cryptographically signed audit logs recording every exception review, field modification, and quote issuance timestamp.',
          status: 'Enforced in Demo Session Log',
        },
        {
          title: 'Statutory Retention & Automated Deletion',
          desc: 'Enforce 30-day purge for unquoted temporary census files; 10-year archival for bound policy records.',
          status: 'Policy Roadmap',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Step 10: Limitations & UAE Compliance Readiness Checklist
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational and regulatory governance framework required before progressing from prototype
            to production SME quoting.
          </p>
        </div>

        {/* Mandatory Prominent Legal Disclaimer */}
        <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-950 text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm uppercase tracking-wider">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Requires Review and Approval by Qualified Legal, Security, and Compliance Teams</span>
          </div>
          <p className="leading-relaxed text-amber-900">
            This application is an independent concept prototype created for the Cigna “The Quote in
            Seconds Challenge”. It does <strong>not</strong> claim UAE regulatory certification, legal
            compliance, or official endorsement by Cigna, the Dubai Health Authority (DHA), Department
            of Health Abu Dhabi (DOH), or Central Bank of the UAE (CBUAE).
          </p>
        </div>

        {/* Checklist Categories */}
        <div className="mt-6 space-y-6">
          {checklistCategories.map((cat, idx) => (
            <div key={idx} className="bg-slate-50/70 rounded-xl p-5 border border-slate-200">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200 text-xs font-bold text-slate-900">
                {cat.icon}
                <span>{cat.category}</span>
              </div>

              <div className="mt-3 space-y-3">
                {cat.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="p-3 bg-white rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        <CheckSquare className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{item.title}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed pl-5.5">
                        {item.desc}
                      </p>
                    </div>

                    <span className="shrink-0 px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto font-mono">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
