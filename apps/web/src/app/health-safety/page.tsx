'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HealthSafetyPage() {
  const [risks, setRisks] = useState<any[]>([]);
  const [compliance, setCompliance] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [health, setHealth] = useState<any[]>([]);
  const [training, setTraining] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeRisks: 0,
    complianceScore: 0,
    incidentsThisMonth: 0,
    trainingCompleted: 0,
  });

  useEffect(() => {
    // Fetch data in production
    setRisks([
      {
        id: '1',
        location: 'Office',
        riskType: 'ergonomic',
        severity: 'high',
        description: 'Poor desk setup causing back pain',
        mitigation: 'Ergonomic assessment + equipment',
        assessedAt: '2025-01-15',
        resolved: false,
      },
      {
        id: '2',
        location: 'Office',
        riskType: 'fire',
        severity: 'critical',
        description: 'Blocked fire exit',
        mitigation: 'Clear exit immediately',
        assessedAt: '2025-01-15',
        resolved: false,
      },
      {
        id: '3',
        location: 'Warehouse',
        riskType: 'physical',
        severity: 'medium',
        description: 'Loose cables on floor',
        mitigation: 'Cable management system',
        assessedAt: '2025-01-14',
        resolved: true,
      },
    ]);

    setCompliance({
      status: 'non_compliant',
      score: 75,
      issues: [
        {
          regulation: 'HSE',
          requirement: 'Fire safety training',
          status: 'overdue',
          deadline: '2025-01-30',
        },
        {
          regulation: 'HSE',
          requirement: 'First aid kit',
          status: 'expired',
          deadline: '2025-01-20',
        },
      ],
    });

    setIncidents([
      {
        id: '1',
        type: 'near_miss',
        severity: 'medium',
        description: 'Employee tripped over loose cable',
        location: 'Office, Floor 2',
        reportedAt: '2025-01-15',
        resolved: true,
      },
    ]);

    setHealth([
      {
        id: '1',
        employee: 'Team Member A',
        metric: 'work_hours',
        value: 65,
        period: 'Last 3 weeks',
        riskLevel: 'high',
        action: 'Mandatory time off',
      },
      {
        id: '2',
        employee: 'Team Member B',
        metric: 'breaks',
        value: 0,
        period: 'Last 2 weeks',
        riskLevel: 'medium',
        action: 'Enforce break policy',
      },
    ]);

    setTraining([
      {
        id: '1',
        type: 'fire_safety',
        status: 'overdue',
        employees: 12,
        required: 15,
        expiryDate: '2025-01-30',
      },
      {
        id: '2',
        type: 'first_aid',
        status: 'overdue',
        employees: 8,
        required: 15,
        expiryDate: '2025-01-20',
      },
      {
        id: '3',
        type: 'ergonomics',
        status: 'completed',
        employees: 15,
        required: 15,
        completedDate: '2025-01-10',
      },
    ]);

    setStats({
      activeRisks: 2,
      complianceScore: 75,
      incidentsThisMonth: 1,
      trainingCompleted: 8,
    });
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  const getRiskTypeIcon = (type: string) => {
    switch (type) {
      case 'fire':
        return '🔥';
      case 'ergonomic':
        return '🪑';
      case 'physical':
        return '⚠️';
      case 'chemical':
        return '🧪';
      case 'electrical':
        return '⚡';
      default:
        return '⚠️';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'non_compliant':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_55%)]" />
      
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-emerald-950 sm:h-10 sm:w-10 sm:text-base">
              HS
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-200 sm:text-xs">
                Health & Safety
              </p>
              <h1 className="text-sm font-semibold text-white sm:text-lg">
                Workplace Safety & Compliance
              </h1>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/20 px-3 py-2 text-xs text-white transition hover:border-emerald-300/60 hover:text-emerald-200 sm:px-4 sm:text-sm"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-5 sm:py-8 lg:px-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active Risks" value={stats.activeRisks} icon="⚠️" />
          <StatCard label="Compliance Score" value={`${stats.complianceScore}%`} icon="✅" />
          <StatCard label="Incidents (Month)" value={stats.incidentsThisMonth} icon="📋" />
          <StatCard label="Training Completed" value={stats.trainingCompleted} icon="🎓" />
        </div>

        {/* Active Risks */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white sm:text-xl">Active Risk Assessments</h2>
            <button className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200 transition hover:border-emerald-300/60 hover:text-emerald-100 sm:px-4 sm:text-sm">
              + New Assessment
            </button>
          </div>
          <div className="space-y-3">
            {risks
              .filter((r) => !r.resolved)
              .map((risk) => (
                <div
                  key={risk.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getRiskTypeIcon(risk.riskType)}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{risk.description}</h3>
                        <p className="mt-1 text-xs text-slate-400">
                          {risk.location} • {risk.riskType}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getSeverityColor(risk.severity)}`}
                    >
                      {risk.severity}
                    </span>
                  </div>
                  <div className="mt-3 rounded-lg border border-white/10 bg-slate-800/40 p-3">
                    <p className="text-xs font-medium text-slate-300">Mitigation:</p>
                    <p className="mt-1 text-sm text-white">{risk.mitigation}</p>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Compliance Status */}
        <section className="mb-8 rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white sm:text-xl">Compliance Status</h2>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${getComplianceColor(compliance?.status || 'non_compliant')}`}
            >
              {compliance?.status === 'compliant' ? '✅ Compliant' : '⚠️ Non-Compliant'}
            </span>
          </div>
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-300">Overall Score</span>
              <span className="font-semibold text-white">{compliance?.score}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${compliance?.score || 0}%` }}
              />
            </div>
          </div>
          {compliance?.issues && compliance.issues.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Issues to Address</h3>
              {compliance.issues.map((issue: any, idx: number) => (
                <div
                  key={idx}
                  className="rounded-lg border border-white/10 bg-slate-800/40 p-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{issue.requirement}</h4>
                      <p className="mt-1 text-xs text-slate-400">
                        {issue.regulation} • Status: {issue.status}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">Deadline: {issue.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Incidents */}
        <section className="mb-8 rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white sm:text-xl">Recent Incidents</h2>
            <span className="text-xs text-slate-400">{incidents.length} this month</span>
          </div>
          {incidents.length === 0 ? (
            <div className="rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-center text-green-300">
              No incidents reported this month ✅
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="rounded-lg border border-white/10 bg-slate-800/40 p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{incident.description}</h3>
                      <p className="mt-1 text-xs text-slate-400">
                        {incident.location} • {incident.type}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getSeverityColor(incident.severity)}`}
                    >
                      {incident.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Reported: {incident.reportedAt}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Health Monitoring */}
        <section className="mb-8 rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-white sm:text-xl">Health Monitoring</h2>
          <div className="space-y-3">
            {health.map((record) => (
              <div
                key={record.id}
                className="rounded-lg border border-white/10 bg-slate-800/40 p-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{record.employee}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {record.metric}: {record.value} ({record.period})
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getSeverityColor(record.riskLevel)}`}
                    >
                      {record.riskLevel} risk
                    </span>
                    <p className="mt-2 text-xs text-slate-400">{record.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Training Status */}
        <section className="mb-8 rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-white sm:text-xl">Training Status</h2>
          <div className="space-y-3">
            {training.map((t) => (
              <div
                key={t.id}
                className="rounded-lg border border-white/10 bg-slate-800/40 p-3"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white capitalize">{t.type.replace('_', ' ')}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {t.employees} / {t.required} employees
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                      t.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                {t.status === 'overdue' && (
                  <p className="text-xs text-red-300">Expires: {t.expiryDate}</p>
                )}
                {t.status === 'completed' && (
                  <p className="text-xs text-emerald-300">Completed: {t.completedDate}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Emergency Procedures */}
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-white sm:text-xl">Emergency Procedures</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <EmergencyCard type="fire" title="Fire Emergency" />
            <EmergencyCard type="medical" title="Medical Emergency" />
            <EmergencyCard type="evacuation" title="Evacuation" />
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:text-xs">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        </div>
        {icon && <div className="text-2xl opacity-60">{icon}</div>}
      </div>
    </div>
  );
}

function EmergencyCard({ type, title }: { type: string; title: string }) {
  const icons: Record<string, string> = {
    fire: '🔥',
    medical: '🏥',
    evacuation: '🚨',
  };

  return (
    <div className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-2xl">{icons[type] || '⚠️'}</span>
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <button className="mt-3 w-full rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20">
        View Procedure
      </button>
    </div>
  );
}


