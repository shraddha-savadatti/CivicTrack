import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Search, MapPin, Calendar, Clock, Building2,
  CheckCircle2, AlertTriangle, ShieldAlert, Copy, Check,
  ExternalLink, ArrowRight, UserCheck, Flag
} from 'lucide-react';
import { api, imageUrl } from '../api';
import {
  Alert, Badge, PriorityBadge, DemoTag, StatusStepper,
  Modal, getCategoryIcon
} from '../ui';

export default function Track() {
  const { ticketId } = useParams();
  const nav = useNavigate();
  const [q, setQ] = useState(ticketId || '');
  const [r, setR] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Abuse modal state
  const [abuseModalOpen, setAbuseModalOpen] = useState(false);
  const [abuseReason, setAbuseReason] = useState('Spam or duplicate content');
  const [abuseDetails, setAbuseDetails] = useState('');
  const [abuseBusy, setAbuseBusy] = useState(false);

  useEffect(() => {
    setR(null);
    setErr('');
    setMsg('');
    if (ticketId) {
      setQ(ticketId);
      setLoading(true);
      api(`/reports/${ticketId}`)
        .then((d) => setR(d.report))
        .catch((e) => setErr(e.message))
        .finally(() => setLoading(false));
    }
  }, [ticketId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim()) {
      nav(`/track/${q.trim().toUpperCase()}`);
    }
  };

  const copyTicketId = () => {
    if (!r?.ticketId) return;
    navigator.clipboard?.writeText(r.ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitAbuseReport = async (e) => {
    e.preventDefault();
    setAbuseBusy(true);
    try {
      const fullReason = `${abuseReason}${abuseDetails.trim() ? ': ' + abuseDetails.trim() : ''}`;
      await api('/abuse', {
        method: 'POST',
        body: { ticketId: r.ticketId, reason: fullReason },
      });
      setAbuseModalOpen(false);
      setMsg('Abuse report submitted. Municipal moderators will inspect this ticket.');
    } catch (e) {
      setErr(e.message);
    } finally {
      setAbuseBusy(false);
    }
  };

  const sampleTickets = ['CT-DEMO-001', 'CT-DEMO-002', 'CT-DEMO-004'];

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      {/* Search Header */}
      <div className="card shadow-civic p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-navy-900">
            Track Issue Progress
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter your unique reference ticket ID to inspect the full public timeline and assigned department.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Ticket ID input"
              className="input pl-10 font-mono text-sm uppercase"
              placeholder="e.g. CT-2026-123456"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <button type="submit" className="btn shadow-sm">
            <Search size={16} /> Track Ticket
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
          <span>Sample tickets for testing:</span>
          {sampleTickets.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => nav(`/track/${t}`)}
              className="rounded bg-slate-100 hover:bg-slate-200 px-2 py-0.5 font-mono text-[11px] text-teal-800 transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <Alert>{err}</Alert>
      <Alert type="ok" onDismiss={() => setMsg('')}>{msg}</Alert>

      {/* Loading state */}
      {loading && (
        <div className="card p-8 text-center space-y-3 animate-pulse">
          <div className="h-6 w-48 bg-slate-200 rounded mx-auto" />
          <div className="h-4 w-64 bg-slate-100 rounded mx-auto" />
          <div className="h-24 bg-slate-100 rounded-xl mt-4" />
        </div>
      )}

      {/* Ticket Details View */}
      {r && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main Status & Header Card */}
          <div className="card shadow-civic p-6 md:p-8 space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl font-black text-navy-900 tracking-tight">
                  {r.ticketId}
                </span>
                <button
                  type="button"
                  onClick={copyTicketId}
                  title="Copy ticket ID"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  {copied ? <Check size={16} className="text-teal-600" /> : <Copy size={16} />}
                </button>
                {r.isDemo && <DemoTag />}
              </div>

              <div className="flex items-center gap-2">
                <PriorityBadge p={r.priority} />
                <Badge s={r.status} />
              </div>
            </div>

            {/* Stepper visualization */}
            <div className="py-2">
              <StatusStepper currentStatus={r.status} />
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-navy-900">{r.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {r.description}
              </p>
            </div>

            {/* Key Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl bg-slate-50 border border-slate-200/80 p-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Category
                </span>
                <span className="font-bold text-navy-900 flex items-center gap-1 mt-0.5 truncate">
                  {getCategoryIcon(r.category, 'w-3.5 h-3.5 text-teal-600 shrink-0')}
                  <span className="truncate">{r.category}</span>
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Jurisdiction
                </span>
                <span className="font-bold text-navy-900 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin size={12} className="text-slate-500 shrink-0" />
                  <span>{r.ward}</span>
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Location
                </span>
                <span className="font-bold text-navy-900 block truncate mt-0.5" title={r.location}>
                  {r.location}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Assigned Unit
                </span>
                <span className="font-bold text-teal-700 flex items-center gap-1 mt-0.5 truncate">
                  <Building2 size={12} className="shrink-0" />
                  <span>{r.department || 'Pending triage'}</span>
                </span>
              </div>
            </div>

            {/* Landmark if provided */}
            {r.landmark && (
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Landmark:</span>
                <span>{r.landmark}</span>
              </div>
            )}

            {/* Evidence Image */}
            {r.image && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Attached Photographic Evidence
                </span>
                <div className="rounded-xl overflow-hidden border border-slate-200 inline-block bg-slate-900">
                  <img
                    src={imageUrl(r.image)}
                    alt="Civic issue photo evidence"
                    className="max-h-80 w-auto object-cover rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Resolution Box */}
            {r.resolution && (
              <div className="rounded-2xl bg-teal-50 border border-teal-200 p-5 space-y-2 text-teal-900">
                <div className="flex items-center gap-2 font-bold text-teal-800">
                  <CheckCircle2 size={18} className="text-teal-600" />
                  <span>Official Resolution Details</span>
                </div>
                <p className="text-sm leading-relaxed">{r.resolution}</p>
              </div>
            )}
          </div>

          {/* Activity Timeline Card */}
          <div className="card shadow-civic p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-navy-900">Official Activity Timeline</h3>
                <p className="text-xs text-slate-500">
                  Chronological record of status adjustments, notes, and department assignments.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                {r.history?.length || 0} events
              </span>
            </div>

            {/* Timeline Stream */}
            <ol className="relative border-l-2 border-teal-500/80 ml-3 space-y-6 pt-2">
              {r.history?.map((h, i) => (
                <li key={i} className="ml-6 relative group">
                  {/* Stepper node */}
                  <span className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 ring-4 ring-white text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>

                  <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 space-y-1.5 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge s={h.status} />
                        <span className="text-xs font-semibold text-navy-900">
                          {h.by || 'Municipal staff'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {h.at ? new Date(h.at).toLocaleString() : ''}
                      </span>
                    </div>

                    {h.note && (
                      <p className="text-xs text-slate-700 leading-relaxed pt-1">
                        {h.note}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            {/* Abuse Report Action Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Notice inappropriate or fraudulent content?</span>
              <button
                type="button"
                onClick={() => setAbuseModalOpen(true)}
                className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-red-600 transition-colors"
              >
                <Flag size={12} /> Flag report as abusive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag as abusive modal dialog */}
      <Modal
        isOpen={abuseModalOpen}
        onClose={() => setAbuseModalOpen(false)}
        title="Report Ticket as Abusive or Spam"
      >
        <form onSubmit={submitAbuseReport} className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Flags submitted here are reviewed by municipal moderators. Reports containing profanity, harassment, or fraudulent complaints will be removed.
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Reason for concern
            </label>
            <select
              className="select text-xs font-medium"
              value={abuseReason}
              onChange={(e) => setAbuseReason(e.target.value)}
            >
              <option value="Spam or advertising">Spam or advertising</option>
              <option value="False or fabricated report">False or fabricated report</option>
              <option value="Inappropriate or offensive language">Inappropriate or offensive language</option>
              <option value="Duplicate or harassment">Duplicate or harassment</option>
              <option value="Other reason">Other reason</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Additional context (Optional)
            </label>
            <textarea
              className="textarea text-xs"
              rows={3}
              placeholder="Provide any additional explanation..."
              value={abuseDetails}
              onChange={(e) => setAbuseDetails(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAbuseModalOpen(false)}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger btn-sm"
              disabled={abuseBusy}
            >
              {abuseBusy ? 'Submitting…' : 'Submit Flag'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
