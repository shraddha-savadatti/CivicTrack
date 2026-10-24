import React, { useEffect, useState } from 'react';
import {
  Building2, Search, Filter, AlertTriangle, CheckCircle2,
  Clock, Shield, User, MapPin, Calendar, Lock, Unlock,
  Check, ArrowRight, ExternalLink, Image, AlertCircle
} from 'lucide-react';
import { api, imageUrl } from '../api';
import {
  Alert, Badge, PriorityBadge, DemoTag, STATUSES, PRIORITIES,
  EmptyState, getCategoryIcon
} from '../ui';
import { useAuth } from '../auth';

const COMMON_DEPARTMENTS = [
  'Public Works',
  'Sanitation',
  'Water Authority',
  'Electrical & Lighting',
  'Parks & Recreation',
  'Traffic Management',
];

export default function Staff() {
  const { user } = useAuth();
  const [list, setList] = useState(null);
  const [sel, setSel] = useState(null);
  const [ticket, setTicket] = useState('');
  const [status, setStatus] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);

  const [f, setF] = useState({
    status: 'Under Review',
    note: '',
    internal: false,
    resolution: '',
    department: '',
    priority: 'Medium',
  });

  const load = () => {
    setLoading(true);
    setErr('');
    api(
      `/reports?limit=50&${new URLSearchParams({
        ...(ticket && { ticket }),
        ...(status && { status }),
      })}`
    )
      .then((data) => {
        setList(data);
        if (sel) {
          const updated = data.items?.find((i) => i.ticketId === sel.ticketId);
          if (updated) setSel(updated);
        }
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [status]);

  const act = async (path, body, label) => {
    setErr('');
    setOk('');
    setActionBusy(true);
    try {
      const d = await api(`/reports/${sel.ticketId}/${path}`, {
        method: 'PATCH',
        body,
      });
      setSel(d.report);
      setOk(`${label} successfully recorded.`);
      // Clear progress note / resolution after status update
      if (path === 'status') {
        setF((prev) => ({ ...prev, note: '', resolution: '' }));
      }
      load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setActionBusy(false);
    }
  };

  const pick = (r) => {
    setSel(r);
    setOk('');
    setErr('');
    setF({
      ...f,
      department: r.department || '',
      priority: r.priority || 'Medium',
      status: r.status || 'Under Review',
      note: '',
      resolution: r.resolution || '',
      internal: false,
    });
  };

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-navy-900">
              Staff Operations Console
            </h1>
            <span className="rounded-full bg-navy-800 text-teal-300 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider">
              {user?.role} {user?.department ? `• ${user.department}` : ''}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Triage citizen submissions, dispatch responsible departments, and maintain public audit trails.
          </p>
        </div>
        <div className="text-xs text-slate-500 font-medium self-start sm:self-auto flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200">
          <Clock size={13} className="text-teal-600" />
          <span>Active queue: {list?.total || 0} reports</span>
        </div>
      </div>

      <Alert onDismiss={() => setErr('')}>{err}</Alert>
      <Alert type="ok" onDismiss={() => setOk('')}>{ok}</Alert>

      {/* Main Master-Detail Split Grid */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Tickets Queue */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filter / Search Form */}
          <div className="card p-4 space-y-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                load();
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  aria-label="Ticket search input"
                  className="input pl-9 text-xs"
                  placeholder="Search ticket ID..."
                  value={ticket}
                  onChange={(e) => setTicket(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-sm">
                Filter
              </button>
            </form>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Status:
              </span>
              <select
                aria-label="Filter status dropdown"
                className="select text-xs font-medium py-1.5"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Statuses ({list?.total || 0})</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ticket Cards List */}
          <div className="max-h-[calc(100vh-280px)] space-y-2.5 overflow-y-auto pr-1">
            {loading && !list ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="card p-4 h-24 animate-pulse bg-slate-100" />
                ))}
              </div>
            ) : list?.items?.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No matching reports"
                description="There are currently no complaints matching the selected search query or status filter."
              />
            ) : (
              list?.items?.map((r) => {
                const isSelected = sel?.ticketId === r.ticketId;
                return (
                  <button
                    key={r.ticketId}
                    type="button"
                    onClick={() => pick(r)}
                    className={`card block w-full text-left p-4 transition-all duration-150 ${
                      isSelected
                        ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md bg-teal-50/10'
                        : 'card-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-navy-900">
                          {r.ticketId}
                        </span>
                        {r.isDemo && <DemoTag />}
                      </div>
                      <div className="flex items-center gap-1">
                        <PriorityBadge p={r.priority} />
                        <Badge s={r.status} />
                      </div>
                    </div>

                    <h3 className="mt-1.5 text-sm font-bold text-navy-900 line-clamp-1">
                      {r.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                      <span className="font-medium text-slate-700 truncate max-w-[140px]">
                        {r.category}
                      </span>
                      <span>•</span>
                      <span>{r.ward}</span>
                      {r.department && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-teal-700">{r.department}</span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Ticket Inspection & Triage Actions */}
        <div className="lg:col-span-7">
          {!sel ? (
            <div className="card p-12 text-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto">
                <Building2 size={28} />
              </div>
              <h2 className="text-base font-bold text-navy-900">No Ticket Selected</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select an incoming complaint from the left queue to inspect details, dispatch departments, adjust priority, or publish resolution notes.
              </p>
            </div>
          ) : (
            <div className="card shadow-civic p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-black text-navy-900">
                      {sel.ticketId}
                    </span>
                    {sel.isDemo && <DemoTag />}
                    <Badge s={sel.status} />
                  </div>
                  <h2 className="text-lg font-bold text-navy-900 mt-1">{sel.title}</h2>
                </div>
                <div className="text-xs text-slate-400">
                  Logged: {new Date(sel.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Submitter & Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <User size={14} className="text-teal-600" />
                  <span className="font-semibold">Reporter:</span>
                  <span>
                    {sel.anonymous
                      ? 'Anonymous Citizen (Identity Protected)'
                      : sel.reporter?.name || sel.reporter || 'Registered Citizen'}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line p-3 bg-white rounded-lg border border-slate-200/80">
                  {sel.description}
                </p>

                <div className="flex flex-wrap gap-2 text-xs text-slate-500 pt-1">
                  <span className="rounded bg-slate-100 px-2 py-0.5">
                    <b>Category:</b> {sel.category}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5">
                    <b>Ward:</b> {sel.ward}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5">
                    <b>Location:</b> {sel.location}
                  </span>
                  {sel.landmark && (
                    <span className="rounded bg-slate-100 px-2 py-0.5">
                      <b>Landmark:</b> {sel.landmark}
                    </span>
                  )}
                </div>
              </div>

              {/* Image attachment if any */}
              {sel.image && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Photographic Evidence
                  </span>
                  <div className="rounded-xl overflow-hidden border border-slate-200 inline-block">
                    <img
                      src={imageUrl(sel.image)}
                      alt="Complaint evidence"
                      className="max-h-48 w-auto object-cover rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* Action 1: Department Routing */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-teal-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900">
                    1. Assign Department
                  </h3>
                </div>

                <div className="flex gap-2">
                  <input
                    aria-label="Department input"
                    className="input text-xs"
                    placeholder="Enter department name"
                    value={f.department}
                    onChange={(e) => setF({ ...f, department: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => act('assign', { department: f.department }, 'Department assignment')}
                    className="btn btn-sm shrink-0"
                    disabled={actionBusy || !f.department.trim()}
                  >
                    Assign
                  </button>
                </div>

                {/* Quick department selection chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {COMMON_DEPARTMENTS.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setF({ ...f, department: dept })}
                      className="rounded bg-white border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-teal-500 hover:text-teal-700 transition-colors"
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action 2: Priority Adjustment */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900">
                    2. Adjust Urgency / Priority
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {PRIORITIES.map((p) => {
                    const isSelected = f.priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setF({ ...f, priority: p })}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                          isSelected
                            ? p === 'Urgent'
                              ? 'bg-red-600 text-white'
                              : 'bg-navy-900 text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => act('priority', { priority: f.priority }, 'Priority update')}
                    className="btn btn-ghost btn-sm ml-auto"
                    disabled={actionBusy}
                  >
                    Save Priority
                  </button>
                </div>
              </div>

              {/* Action 3: Status Advancement & Notes */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-teal-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900">
                    3. Update Status & Audit Notes
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Operational Status
                  </label>
                  <select
                    aria-label="New status selector"
                    className="select text-xs font-bold"
                    value={f.status}
                    onChange={(e) => setF({ ...f, status: e.target.value })}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Progress Note
                  </label>
                  <textarea
                    className="textarea text-xs"
                    rows={2}
                    placeholder="Enter dispatch note, inspection finding, or status update..."
                    value={f.note}
                    onChange={(e) => setF({ ...f, note: e.target.value })}
                  />
                </div>

                {/* Conditional resolution field */}
                {f.status === 'Resolved' && (
                  <div className="space-y-2 p-3 bg-teal-50 rounded-lg border border-teal-200">
                    <label className="block text-xs font-bold text-teal-900">
                      Formal Resolution Details (Required to Resolve) *
                    </label>
                    <input
                      className="input text-xs"
                      placeholder="e.g. Streetlight bulb replaced and wiring repaired by crew #4"
                      value={f.resolution}
                      onChange={(e) => setF({ ...f, resolution: e.target.value })}
                    />
                  </div>
                )}

                {/* Internal note toggle */}
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={f.internal}
                    onChange={(e) => setF({ ...f, internal: e.target.checked })}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="flex items-center gap-1 font-medium">
                    <Lock size={12} className="text-slate-400" />
                    Internal note only (Conceal from public timeline view)
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() =>
                    act(
                      'status',
                      {
                        status: f.status,
                        note: f.note || undefined,
                        internal: f.internal,
                        resolution: f.resolution || undefined,
                      },
                      'Status updated'
                    )
                  }
                  className="btn btn-sm w-full"
                  disabled={actionBusy || (f.status === 'Resolved' && !f.resolution.trim())}
                >
                  {actionBusy ? 'Updating…' : 'Publish Status Update'}
                </button>
              </div>

              {/* Audit History Stream */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Full Internal Audit Trail
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {sel.history?.map((h, i) => (
                    <div
                      key={i}
                      className={`rounded-lg border p-2.5 text-xs ${
                        h.internal
                          ? 'bg-amber-50/70 border-amber-200/80 text-amber-900'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-navy-900 flex items-center gap-1">
                          {h.internal && <Lock size={11} className="text-amber-600" />}
                          {h.actorRole || 'staff'} • {h.status}
                        </span>
                        <span>{new Date(h.at).toLocaleString()}</span>
                      </div>
                      {h.note && <p className="mt-1 font-medium">{h.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
