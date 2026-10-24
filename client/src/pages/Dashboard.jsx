import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle, Search, Filter, MapPin, Calendar, Clock,
  ArrowRight, CheckCircle2, AlertCircle, FileText, Copy, Check
} from 'lucide-react';
import { api } from '../api';
import {
  Alert, Badge, PriorityBadge, DemoTag, STATUSES,
  StatCard, EmptyState, getCategoryIcon
} from '../ui';
import { useAuth } from '../auth';

export default function Dashboard() {
  const { user } = useAuth();
  const [d, setD] = useState(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const fetchReports = () => {
    setLoading(true);
    setErr('');
    api(`/reports/mine?limit=50${status ? `&status=${encodeURIComponent(status)}` : ''}`)
      .then((data) => {
        setD(data);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, [status]);

  const copyTicket = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Client-side search and category filtering over the retrieved list
  const filteredItems = useMemo(() => {
    if (!d?.items) return [];
    return d.items.filter((item) => {
      const matchesSearch =
        !search.trim() ||
        item.ticketId?.toLowerCase().includes(search.toLowerCase()) ||
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.ward?.toLowerCase().includes(search.toLowerCase()) ||
        item.location?.toLowerCase().includes(search.toLowerCase());

      const matchesCat = !category || item.category === category;
      return matchesSearch && matchesCat;
    });
  }, [d, search, category]);

  // Metric breakdown computed from loaded items
  const stats = useMemo(() => {
    const items = d?.items || [];
    return {
      total: d?.total || items.length,
      submitted: items.filter((i) => i.status === 'Submitted').length,
      underReview: items.filter((i) => i.status === 'Under Review').length,
      inProgress: items.filter((i) => i.status === 'In Progress').length,
      resolved: items.filter((i) => i.status === 'Resolved').length,
    };
  }, [d]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 tracking-tight">
              Citizen Workspace
            </h1>
            <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 border border-teal-200">
              {user?.name || 'Registered Resident'}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Track real-time progress, municipal notes, and resolution evidence for your submitted issues.
          </p>
        </div>
        <Link to="/report" className="btn shadow-sm self-start sm:self-auto">
          <PlusCircle size={17} /> File New Complaint
        </Link>
      </div>

      <Alert>{err}</Alert>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Filed"
          value={stats.total}
          icon={FileText}
          accent="navy"
          subtitle="All-time reports"
        />
        <StatCard
          label="Under Review"
          value={stats.underReview + stats.submitted}
          icon={Clock}
          accent="amber"
          subtitle="Pending field triage"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={Clock}
          accent="sky"
          subtitle="Active municipal works"
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          accent="green"
          subtitle="Verified fixes"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label="Search my reports"
              placeholder="Search by Ticket ID, title, or ward..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>

          <div className="flex gap-2">
            <select
              aria-label="Filter by category"
              className="select text-xs font-medium"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {Array.from(new Set(d?.items?.map((i) => i.category) || [])).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter size={12} /> Status:
          </span>
          <button
            type="button"
            onClick={() => setStatus('')}
            className={`rounded-full px-3 py-1 font-semibold transition-all ${
              status === ''
                ? 'bg-navy-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({d?.total || 0})
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1 font-semibold transition-all ${
                status === s
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid / Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="card p-5 space-y-3 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-5 w-28 bg-slate-200 rounded" />
                <div className="h-5 w-20 bg-slate-200 rounded-full" />
              </div>
              <div className="h-5 w-3/4 bg-slate-200 rounded" />
              <div className="h-4 w-1/2 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={status || search || category ? 'No reports match your filters' : 'No civic reports filed yet'}
          description={
            status || search || category
              ? 'Try resetting the filters or searching with a different keyword.'
              : 'Spot a pothole, broken streetlight, or garbage overflow? File an issue in 60 seconds with location and photo evidence.'
          }
          action={
            status || search || category ? (
              <button
                type="button"
                onClick={() => {
                  setStatus('');
                  setSearch('');
                  setCategory('');
                }}
                className="btn btn-sm btn-ghost"
              >
                Clear all filters
              </button>
            ) : (
              <Link to="/report" className="btn btn-sm">
                <PlusCircle size={15} /> File Your First Report
              </Link>
            )
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredItems.map((r) => (
            <Link
              key={r.ticketId}
              to={`/track/${r.ticketId}`}
              className="card card-hover flex flex-col justify-between p-5 group border-slate-200/90 hover:border-teal-500"
            >
              <div className="space-y-3">
                {/* Header: Ticket ID & Badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-navy-900 group-hover:text-teal-700 transition-colors">
                      {r.ticketId}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => copyTicket(r.ticketId, e)}
                      title="Copy ticket ID"
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                      {copiedId === r.ticketId ? (
                        <Check size={12} className="text-teal-600" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                    {r.isDemo && <DemoTag />}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PriorityBadge p={r.priority} />
                    <Badge s={r.status} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-navy-900 line-clamp-1 group-hover:text-teal-700 transition-colors">
                  {r.title}
                </h3>

                {/* Description excerpt */}
                {r.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {r.description}
                  </p>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    {getCategoryIcon(r.category, 'w-3.5 h-3.5 text-teal-600')}
                    <span className="truncate max-w-[160px]">{r.category}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400" />
                    <span>{r.ward}</span>
                    {r.location && <span className="text-slate-400 truncate max-w-[140px]">· {r.location}</span>}
                  </span>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-400 font-medium">
                  <Calendar size={12} />
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}
                </span>

                <span className="font-semibold text-teal-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Track Live Progress <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
