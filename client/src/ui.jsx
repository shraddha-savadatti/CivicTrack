import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Landmark, LogOut, CheckCircle2, Clock, AlertTriangle, AlertCircle,
  Building2, Shield, Info, Menu, X, ArrowRight, Check,
  Car, Lightbulb, Trash2, Droplets, Trees, HelpCircle, FileText
} from 'lucide-react';
import { useAuth } from './auth';

export const CATEGORIES = [
  'Roads and potholes',
  'Streetlights',
  'Garbage and sanitation',
  'Water supply',
  'Drainage',
  'Parks and public facilities',
  'Traffic signals',
  'Public safety',
  'Other civic issues'
];

export const STATUSES = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export function getCategoryIcon(cat, className = 'w-4 h-4') {
  switch (cat) {
    case 'Roads and potholes': return <Car className={className} />;
    case 'Streetlights': return <Lightbulb className={className} />;
    case 'Garbage and sanitation': return <Trash2 className={className} />;
    case 'Water supply': return <Droplets className={className} />;
    case 'Drainage': return <Droplets className={className} />;
    case 'Parks and public facilities': return <Trees className={className} />;
    case 'Traffic signals': return <AlertTriangle className={className} />;
    case 'Public safety': return <Shield className={className} />;
    default: return <WrenchIcon className={className} />;
  }
}

function WrenchIcon({ className }) {
  return <HelpCircle className={className} />;
}

export function Badge({ s }) {
  const styles = {
    'Submitted': 'bg-slate-100 text-slate-700 border-slate-200/80',
    'Under Review': 'bg-amber-50 text-amber-800 border-amber-200/80',
    'In Progress': 'bg-sky-50 text-sky-800 border-sky-200/80',
    'Resolved': 'bg-teal-50 text-teal-800 border-teal-200/80',
  };

  const dots = {
    'Submitted': 'bg-slate-400',
    'Under Review': 'bg-amber-500 animate-pulse',
    'In Progress': 'bg-sky-500',
    'Resolved': 'bg-teal-600',
  };

  const statusName = s || 'Submitted';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[statusName] || styles.Submitted}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[statusName] || dots.Submitted}`} />
      {statusName}
    </span>
  );
}

export function PriorityBadge({ p }) {
  const styles = {
    'Low': 'bg-slate-100 text-slate-600 border-slate-200',
    'Medium': 'bg-teal-50 text-teal-700 border-teal-200',
    'High': 'bg-amber-50 text-amber-700 border-amber-200',
    'Urgent': 'bg-red-50 text-red-700 border-red-200 font-bold',
  };
  const priority = p || 'Medium';
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${styles[priority] || styles.Medium}`}>
      {priority === 'Urgent' && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />}
      {priority}
    </span>
  );
}

export function DemoTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-amber-100/80 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200 tracking-wide uppercase">
      <Info size={11} /> DEMO DATA
    </span>
  );
}

export function Alert({ type = 'error', children, onDismiss }) {
  if (!children) return null;

  const isSuccess = type === 'ok' || type === 'success';
  const isWarning = type === 'warning';
  const isInfo = type === 'info';

  const cfg = isSuccess
    ? {
        bg: 'bg-teal-50/90 border-teal-200 text-teal-800',
        icon: <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0" />,
      }
    : isWarning
    ? {
        bg: 'bg-amber-50/90 border-amber-200 text-amber-800',
        icon: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
      }
    : isInfo
    ? {
        bg: 'bg-sky-50/90 border-sky-200 text-sky-800',
        icon: <Info className="h-5 w-5 text-sky-600 shrink-0" />,
      }
    : {
        bg: 'bg-red-50/90 border-red-200 text-red-800',
        icon: <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />,
      };

  return (
    <div role="alert" className={`flex items-start gap-3 rounded-xl border p-4 text-sm shadow-sm transition-all ${cfg.bg}`}>
      {cfg.icon}
      <div className="flex-1 font-medium leading-relaxed">{children}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          type="button"
          aria-label="Dismiss alert"
          className="text-slate-400 hover:text-slate-600 rounded p-0.5"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

export function Field({ label, required, hint, error, children }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}
      <div>{children}</div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, subtitle, accent = 'teal' }) {
  const accentColors = {
    teal: 'text-teal-600 bg-teal-50 border-teal-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    navy: 'text-navy-800 bg-slate-100 border-slate-200',
    sky: 'text-sky-600 bg-sky-50 border-sky-100',
    green: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  };

  return (
    <div className="card card-hover relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        {Icon && (
          <div className={`rounded-lg p-2 border ${accentColors[accent] || accentColors.teal}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-3xl font-extrabold text-navy-900 tracking-tight">{value}</div>
        {subtitle && <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
}

export function StatusStepper({ currentStatus }) {
  const steps = [
    { key: 'Submitted', label: 'Submitted' },
    { key: 'Under Review', label: 'Under Review' },
    { key: 'In Progress', label: 'In Progress' },
    { key: 'Resolved', label: 'Resolved' },
  ];

  const currentIndex = steps.findIndex(s => s.key === currentStatus);
  const activeIdx = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="w-full py-3" aria-label="Issue Progress Stepper">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-teal-600 -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: `${(activeIdx / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((step, i) => {
          const isDone = i < activeIdx;
          const isCurrent = i === activeIdx;
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shadow-sm ${
                  isDone
                    ? 'bg-teal-600 text-white ring-4 ring-white'
                    : isCurrent
                    ? 'bg-teal-700 text-white ring-4 ring-teal-100 border-2 border-white'
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}
              >
                {isDone ? <Check size={14} /> : i + 1}
              </div>
              <span
                className={`mt-2 text-center text-xs font-semibold whitespace-nowrap transition-colors ${
                  isCurrent ? 'text-teal-700' : isDone ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon = FileText, title, description, action }) {
  return (
    <div className="card flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-3 border border-slate-200">
        <Icon size={26} />
      </div>
      <h3 className="text-base font-bold text-navy-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="card w-full max-w-md shadow-civic-lg animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-navy-900">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="py-4">{children}</div>
      </div>
    </div>
  );
}

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-teal-700/80 text-white shadow-sm font-semibold'
        : 'text-slate-200 hover:text-white hover:bg-navy-800/80'
    }`;

  const mobileNavClass = ({ isActive }) =>
    `block px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-teal-700 text-white font-semibold' : 'text-slate-200 hover:bg-navy-800 hover:text-white'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Notice Bar */}
      <div className="bg-navy-950 text-slate-300 text-[11px] font-medium py-1.5 px-4 text-center border-b border-navy-800/80 flex items-center justify-center gap-2">
        <Shield size={12} className="text-teal-400" />
        <span>CivicTrack Municipal Services Portal • Transparent Public Infrastructure Resolution</span>
      </div>

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-40 bg-navy-900/95 backdrop-blur border-b border-navy-800 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-teal-glow transition-transform group-hover:scale-105">
              <Landmark size={20} />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                CivicTrack
                <span className="rounded bg-teal-500/20 px-1.5 py-0.5 text-[9px] font-bold text-teal-300 tracking-wider uppercase border border-teal-500/30">
                  PORTAL
                </span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">Community Follow-up System</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            <NavLink to="/transparency" className={navClass}>
              Transparency
            </NavLink>
            <NavLink to="/track" className={navClass}>
              Track Ticket
            </NavLink>
            {user?.role === 'citizen' && (
              <>
                <NavLink to="/dashboard" className={navClass}>
                  My Reports
                </NavLink>
                <NavLink to="/report" className={navClass}>
                  File Report
                </NavLink>
              </>
            )}
            {['staff', 'admin'].includes(user?.role) && (
              <NavLink to="/staff" className={navClass}>
                Staff Console
              </NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={navClass}>
                Administration
              </NavLink>
            )}
          </nav>

          {/* User / Authentication Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5 bg-navy-800/80 border border-navy-700/80 rounded-xl px-3 py-1.5">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-white leading-tight">{user.name}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-400 capitalize">
                    {user.role} {user.department ? `• ${user.department}` : ''}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-navy-700 transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink
                  to="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-slate-200 hover:text-white transition-colors"
                >
                  Sign In
                </NavLink>
                <Link to="/register" className="btn btn-sm">
                  Register Citizen
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              aria-label="Toggle navigation menu"
              className="rounded-lg p-2 text-slate-300 hover:bg-navy-800 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-navy-800 bg-navy-900 px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200">
            <NavLink
              to="/transparency"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavClass}
            >
              Transparency
            </NavLink>
            <NavLink
              to="/track"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavClass}
            >
              Track Ticket
            </NavLink>
            {user?.role === 'citizen' && (
              <>
                <NavLink
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavClass}
                >
                  My Reports
                </NavLink>
                <NavLink
                  to="/report"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavClass}
                >
                  File Report
                </NavLink>
              </>
            )}
            {['staff', 'admin'].includes(user?.role) && (
              <NavLink
                to="/staff"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavClass}
              >
                Staff Console
              </NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavClass}
              >
                Administration
              </NavLink>
            )}
            <div className="pt-3 border-t border-navy-800">
              {user ? (
                <div className="flex items-center justify-between p-2">
                  <div>
                    <p className="text-sm font-bold text-white">{user.name}</p>
                    <p className="text-xs text-teal-400 capitalize">{user.role} role</p>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="btn btn-sm btn-ghost"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-ghost flex-1"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn flex-1"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {children}
      </main>

      {/* Modern Civic Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white text-slate-600 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
                  <Landmark size={15} />
                </div>
                <span className="text-base font-bold text-navy-900">CivicTrack</span>
              </div>
              <p className="text-slate-500 max-w-md leading-relaxed">
                Empowering residents with direct, accountable, and transparent public infrastructure tracking.
                Every issue is assigned a unique tracking ticket with a verifiable public timeline.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                <Shield size={13} className="text-teal-600" />
                <span>Protected by SameSite HTTP-only cookies, CSRF defense, and magic-byte media inspection.</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-wider text-navy-900 text-[11px] mb-3">Public Services</h4>
              <ul className="space-y-2">
                <li><Link to="/report" className="hover:text-teal-600 transition-colors">Submit Issue</Link></li>
                <li><Link to="/track" className="hover:text-teal-600 transition-colors">Track Complaint</Link></li>
                <li><Link to="/transparency" className="hover:text-teal-600 transition-colors">Open Transparency Data</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-wider text-navy-900 text-[11px] mb-3">Portal Access</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-teal-600 transition-colors">Citizen & Staff Login</Link></li>
                <li><Link to="/register" className="hover:text-teal-600 transition-colors">Create Citizen Account</Link></li>
                <li><Link to="/staff" className="hover:text-teal-600 transition-colors">Municipal Staff Portal</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 text-slate-500">
            <p>
              © {new Date().getFullYear()} CivicTrack Portal. Built for community issue reporting and verified follow-up.
            </p>
            <div className="rounded-lg bg-amber-50 px-3 py-1 text-amber-800 border border-amber-200 text-[11px] font-medium">
              Demo Project — Sample records are labelled DEMO and are not affiliated with any actual municipal agency.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
