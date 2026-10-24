import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud, Image, X, AlertTriangle, CheckCircle2,
  Shield, MapPin, FileText, ArrowRight, Copy, Check, Sparkles
} from 'lucide-react';
import { api } from '../api';
import { Alert, Field, CATEGORIES, PRIORITIES, getCategoryIcon } from '../ui';

const blank = {
  title: '',
  description: '',
  category: CATEGORIES[0],
  location: '',
  landmark: '',
  ward: '',
  priority: 'Medium',
  anonymous: false,
};

export default function ReportForm() {
  const [f, setF] = useState(blank);
  const [img, setImg] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [dups, setDups] = useState([]);
  const [copied, setCopied] = useState(false);

  const set = (k) => (e) =>
    setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  // Handle image selection and local preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImg(file);
      const url = URL.createObjectURL(file);
      setImgPreview(url);
    }
  };

  const removeImage = () => {
    setImg(null);
    if (imgPreview) URL.revokeObjectURL(imgPreview);
    setImgPreview(null);
  };

  // Live duplicate detection
  useEffect(() => {
    if (f.title.length < 5 || !f.ward) {
      setDups([]);
      return;
    }
    const t = setTimeout(() => {
      api(
        `/reports/duplicates?${new URLSearchParams({
          category: f.category,
          ward: f.ward,
          title: f.title,
          description: f.description,
        })}`
      )
        .then((d) => setDups(d.duplicates || []))
        .catch(() => {});
    }, 500);

    return () => clearTimeout(t);
  }, [f.title, f.category, f.ward, f.description]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const form = new FormData();
      Object.entries(f).forEach(([k, v]) => form.append(k, v));
      if (img) form.append('image', img);

      const res = await api('/reports', { method: 'POST', form });
      setDone(res);
    } catch (x) {
      setErr(
        x.message +
          (x.details
            ? ' — ' + Object.entries(x.details).map(([k, v]) => `${k}: ${v}`).join('; ')
            : '')
      );
    } finally {
      setBusy(false);
    }
  };

  const copyTicketId = () => {
    if (!done?.ticketId) return;
    navigator.clipboard?.writeText(done.ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Success view
  if (done) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="card shadow-civic-lg border-teal-200 p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-50 text-teal-600 border border-teal-200 shadow-teal-glow">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-navy-900">Report Successfully Filed!</h1>
            <p className="text-sm text-slate-500">
              Your civic complaint has been registered into the municipal follow-up queue.
            </p>
          </div>

          {/* Ticket ID Box */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Official Ticket Reference ID
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-3xl font-black text-teal-700 tracking-tight">
                {done.ticketId}
              </span>
              <button
                type="button"
                onClick={copyTicketId}
                title="Copy ticket ID"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 hover:text-navy-900 transition-colors"
              >
                {copied ? <Check size={20} className="text-teal-600" /> : <Copy size={20} />}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Save this ticket ID to track progress or share with neighborhood residents.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to={`/track/${done.ticketId}`} className="btn btn-lg shadow-sm">
              Track This Ticket <ArrowRight size={17} />
            </Link>
            <button
              type="button"
              onClick={() => {
                setDone(null);
                setF(blank);
                removeImage();
              }}
              className="btn btn-lg btn-ghost"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 border border-teal-200 mb-2">
          <Sparkles size={12} /> Public Works Intake Portal
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-navy-900">
          File a Community Infrastructure Report
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Reports are logged with verified timestamps and forwarded to municipal field teams.
        </p>
      </div>

      <Alert>{err}</Alert>

      {/* Main Report Form */}
      <form onSubmit={submit} className="card shadow-civic p-6 md:p-8 space-y-8">
        {/* Section 1: Issue Classification */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <FileText size={18} className="text-teal-600" />
            <h2 className="text-base font-bold text-navy-900">1. Issue Classification</h2>
          </div>

          <Field label="Category" required hint="Select the primary department category for this complaint">
            <div className="relative">
              <select
                className="select font-medium"
                value={f.category}
                onChange={set('category')}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </Field>

          <Field label="Title / Brief Summary" required hint={`${f.title.length}/120 characters`}>
            <input
              className="input font-medium"
              placeholder="e.g. Deep pothole on 4th Main near grocery store"
              required
              minLength={5}
              maxLength={120}
              value={f.title}
              onChange={set('title')}
            />
          </Field>

          <Field label="Detailed Description" required hint={`${f.description.length}/2000 characters`}>
            <textarea
              className="textarea"
              rows={4}
              placeholder="Describe the severity, hazard to pedestrians or vehicles, and any pertinent details..."
              required
              minLength={10}
              maxLength={2000}
              value={f.description}
              onChange={set('description')}
            />
          </Field>
        </div>

        {/* Section 2: Location & Ward */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <MapPin size={18} className="text-teal-600" />
            <h2 className="text-base font-bold text-navy-900">2. Geographic Location</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Ward / District" required hint="e.g. Ward 4, Downtown, Sector 7">
              <input
                className="input font-medium"
                placeholder="e.g. Ward 3"
                required
                maxLength={40}
                value={f.ward}
                onChange={set('ward')}
              />
            </Field>

            <Field label="Approximate Street Address" required hint="Street name or intersection">
              <input
                className="input"
                placeholder="e.g. Corner of Elm St & 5th Ave"
                required
                minLength={3}
                maxLength={200}
                value={f.location}
                onChange={set('location')}
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Nearby Landmark (Optional)" hint="Helps municipal crews locate the issue rapidly">
                <input
                  className="input"
                  placeholder="e.g. Opposite the Public Library or Metro Gate 2"
                  maxLength={120}
                  value={f.landmark}
                  onChange={set('landmark')}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Section 3: Priority & Media Evidence */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <AlertTriangle size={18} className="text-teal-600" />
            <h2 className="text-base font-bold text-navy-900">3. Urgency & Photo Evidence</h2>
          </div>

          <Field label="Perceived Urgency" required>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRIORITIES.map((p) => {
                const isSelected = f.priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setF({ ...f, priority: p })}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition-all text-center ${
                      isSelected
                        ? p === 'Urgent'
                          ? 'bg-red-50 text-red-700 border-red-300 ring-2 ring-red-400'
                          : 'bg-teal-50 text-teal-700 border-teal-300 ring-2 ring-teal-400'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Photo upload dropzone */}
          <Field label="Attach Photo Evidence (Optional)" hint="JPEG, PNG, or WebP up to 3MB">
            {!imgPreview ? (
              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 text-center hover:bg-slate-100/70 hover:border-teal-400 cursor-pointer transition-colors">
                <UploadCloud size={28} className="text-slate-400 mb-2" />
                <span className="text-sm font-semibold text-slate-700">Click to upload photo</span>
                <span className="text-xs text-slate-400 mt-1">Image validated via magic-bytes</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative inline-block rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img
                  src={imgPreview}
                  alt="Selected issue preview"
                  className="max-h-48 w-auto rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 rounded-full bg-navy-900/80 p-1.5 text-white hover:bg-navy-950 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            )}
          </Field>
        </div>

        {/* Section 4: Privacy & Anonymity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Shield size={18} className="text-teal-600" />
            <h2 className="text-base font-bold text-navy-900">4. Privacy Options</h2>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-50/80 transition-colors">
            <input
              type="checkbox"
              checked={f.anonymous}
              onChange={set('anonymous')}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-navy-900">
                Lodge this report anonymously
              </span>
              <p className="text-xs text-slate-500">
                Your name and user profile will be concealed from public views and municipal staff.
              </p>
            </div>
          </label>
        </div>

        {/* Duplicate warning banner */}
        {dups.length > 0 && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-2 text-sm text-amber-900 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <AlertTriangle size={17} className="text-amber-600" />
              <span>Similar reports detected in your ward:</span>
            </div>
            <p className="text-xs text-amber-700">
              A similar issue was recently reported nearby. You can view existing tickets below, or proceed with submitting this report.
            </p>
            <div className="space-y-1.5 pt-1">
              {dups.map((d) => (
                <div key={d.ticketId} className="flex items-center justify-between text-xs bg-white/70 p-2 rounded-lg border border-amber-200/80">
                  <span className="font-medium truncate max-w-sm">{d.title}</span>
                  <Link
                    to={`/track/${d.ticketId}`}
                    target="_blank"
                    className="font-bold underline text-amber-900 hover:text-amber-950 shrink-0 ml-2"
                  >
                    View {d.ticketId} ↗
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submission Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="btn btn-lg w-full shadow-md"
            disabled={busy}
          >
            {busy ? 'Submitting to Municipal Registry…' : 'Submit Infrastructure Report'}
          </button>
          <p className="text-center text-xs text-slate-400 mt-2">
            By submitting, you confirm the accuracy of the complaint location and details.
          </p>
        </div>
      </form>
    </div>
  );
}
