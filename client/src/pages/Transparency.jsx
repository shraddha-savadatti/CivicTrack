import React, { useEffect, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Legend
} from 'recharts';
import {
  BarChart3, CheckCircle2, Clock, AlertTriangle, ShieldCheck,
  TrendingUp, FileText, Info
} from 'lucide-react';
import { api } from '../api';
import { Alert, StatCard } from '../ui';

const STATUS_COLORS = {
  'Submitted': '#94A3B8',
  'Under Review': '#F59E0B',
  'In Progress': '#0284C7',
  'Resolved': '#0D9488',
};

const PIE_COLORS = ['#94A3B8', '#F59E0B', '#0284C7', '#0D9488'];

export default function Transparency() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api('/analytics')
      .then(setD)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (err) return <Alert>{err}</Alert>;

  if (loading || !d) {
    return (
      <div className="space-y-6 py-6">
        <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="card h-24 animate-pulse bg-slate-100" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card h-80 animate-pulse bg-slate-100" />
          <div className="card h-80 animate-pulse bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 border border-teal-200 mb-2">
          <ShieldCheck size={13} /> Open Municipal Transparency
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-navy-900">
          City Infrastructure Performance & Transparency
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Public, privacy-safe analytics aggregating community issue velocity, department follow-through, and ward-by-ward turnaround.
        </p>
      </div>

      {/* Demo Notice Banner */}
      {d.demoRecords > 0 && (
        <div className="rounded-xl bg-amber-50/90 border border-amber-200 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
          <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Demonstration Dataset Active:</span>{' '}
            {d.demoRecords} of {d.total} total reports in this installation are generated demonstration records for evaluation and testing.
            No private citizen PII leaves the aggregation pipeline.
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Total Reports"
          value={d.total}
          icon={FileText}
          accent="navy"
          subtitle="All complaints logged"
        />
        <StatCard
          label="Open / Triage"
          value={d.open}
          icon={Clock}
          accent="amber"
          subtitle="Awaiting resolution"
        />
        <StatCard
          label="In Progress"
          value={d.inProgress}
          icon={Clock}
          accent="sky"
          subtitle="Active field work orders"
        />
        <StatCard
          label="Resolved"
          value={d.resolved}
          icon={CheckCircle2}
          accent="green"
          subtitle="Verified community fixes"
        />
        <div className="card card-hover flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Resolution Rate
            </span>
            <div className="rounded-lg p-2 border text-teal-700 bg-teal-50 border-teal-100">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-teal-700 tracking-tight">
              {d.resolutionRate}%
            </div>
            {/* Visual mini bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-teal-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, d.resolutionRate)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Donut Chart */}
        <div className="card shadow-civic p-6 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-2">
            <h2 className="text-base font-bold text-navy-900">Lifecycle Status Breakdown</h2>
            <p className="text-xs text-slate-500">
              Current proportion of issues across operational phases.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={d.byStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {d.byStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.status] || PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} reports`, name]}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    border: 'none',
                  }}
                  itemStyle={{ color: '#FFFFFF' }}
                  labelStyle={{ color: '#FFFFFF' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ward-by-Ward Comparison */}
        <div className="card shadow-civic p-6 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-2">
            <h2 className="text-base font-bold text-navy-900">Ward Performance (Reported vs. Fixed)</h2>
            <p className="text-xs text-slate-500">
              Total volume compared directly against verified resolutions.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.byWard} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="ward" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    border: 'none',
                  }}
                  itemStyle={{ color: '#FFFFFF' }}
                  labelStyle={{ color: '#FFFFFF' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="total" name="Total Filed" fill="#0F172A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Horizontal Bar */}
        <div className="card shadow-civic p-6 md:col-span-2 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-navy-900">Complaints by Infrastructure Category</h2>
            <p className="text-xs text-slate-500">
              Volume distribution across public works domains (high to low).
            </p>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={d.byCategory}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 140, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 600 }}
                  width={130}
                />
                <Tooltip
                  formatter={(val) => [`${val} complaints`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    border: 'none',
                  }}
                  itemStyle={{ color: '#FFFFFF' }}
                  labelStyle={{ color: '#FFFFFF' }}
                />
                <Bar dataKey="count" name="Complaints" fill="#0D9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ward Breakdown Table */}
      <div className="card shadow-civic p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-navy-900">Ward Jurisdiction Audit Table</h2>
          <p className="text-xs text-slate-500">
            Tabular breakdown of complaints and resolution rates by administrative district.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Ward Jurisdiction</th>
                <th className="py-2.5 px-3">Total Issues</th>
                <th className="py-2.5 px-3">Resolved</th>
                <th className="py-2.5 px-3">Pending Action</th>
                <th className="py-2.5 px-3">Resolution %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {d.byWard.map((w) => {
                const rate = w.total ? Math.round((w.resolved / w.total) * 100) : 0;
                return (
                  <tr key={w.ward} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-navy-900">{w.ward}</td>
                    <td className="py-3 px-3 text-slate-700">{w.total}</td>
                    <td className="py-3 px-3 font-bold text-teal-700">{w.resolved}</td>
                    <td className="py-3 px-3 text-amber-700">{w.total - w.resolved}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-900 w-9">{rate}%</span>
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-teal-600 h-1.5 rounded-full"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
