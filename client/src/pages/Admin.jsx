import React, { useEffect, useState, useMemo } from 'react';
import {
  Shield, UserPlus, Users, Building2, CheckCircle2,
  AlertCircle, Lock, Eye, EyeOff, Search, UserCheck, UserX
} from 'lucide-react';
import { api } from '../api';
import { Alert, Field, StatCard } from '../ui';
import { useAuth } from '../auth';

export default function Admin() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [f, setF] = useState({ name: '', email: '', password: '', department: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);
  const [toggleBusyId, setToggleBusyId] = useState(null);

  const load = () =>
    api('/admin/users')
      .then((d) => setUsers(d.users || []))
      .catch((e) => setErr(e.message));

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');
    setBusy(true);
    try {
      await api('/admin/staff', { method: 'POST', body: f });
      setOk(`Staff account for "${f.name}" successfully created.`);
      setF({ name: '', email: '', password: '', department: '' });
      load();
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (u) => {
    setErr('');
    setOk('');
    setToggleBusyId(u._id);
    try {
      await api(`/admin/users/${u._id}/active`, {
        method: 'PATCH',
        body: { active: !u.active },
      });
      setOk(`User account for ${u.name} ${!u.active ? 'activated' : 'suspended'}.`);
      load();
    } catch (x) {
      setErr(x.message);
    } finally {
      setToggleBusyId(null);
    }
  };

  const s = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.department?.toLowerCase().includes(search.toLowerCase()) ||
        u.role?.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const activeCount = users.filter((u) => u.active).length;
  const suspendedCount = users.filter((u) => !u.active).length;

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 text-teal-300 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider mb-2">
          <Shield size={13} /> Administration Console
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-navy-900">
          Staff Provisioning & Governance
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Create verified municipal staff accounts, assign functional departments, and manage access credentials.
        </p>
      </div>

      <Alert>{err}</Alert>
      <Alert type="ok" onDismiss={() => setOk('')}>{ok}</Alert>

      {/* KPI Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Total Authorized"
          value={users.length}
          icon={Users}
          accent="navy"
          subtitle="Staff & Administrator records"
        />
        <StatCard
          label="Active Personnel"
          value={activeCount}
          icon={UserCheck}
          accent="teal"
          subtitle="Operational accounts"
        />
        <StatCard
          label="Suspended Accounts"
          value={suspendedCount}
          icon={UserX}
          accent="amber"
          subtitle="Access disabled"
        />
      </div>

      {/* Split Grid */}
      <div className="grid gap-6 md:grid-cols-12 items-start">
        {/* Left Column: Create Staff Member */}
        <div className="md:col-span-5">
          <form
            onSubmit={create}
            className="card shadow-civic p-6 space-y-5 border-slate-200/90"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <UserPlus size={18} className="text-teal-600" />
              <h2 className="text-base font-bold text-navy-900">
                Provision New Staff Account
              </h2>
            </div>

            <Field label="Full Name" required>
              <input
                className="input text-sm"
                placeholder="Officer Jane Doe"
                required
                minLength={2}
                maxLength={80}
                value={f.name}
                onChange={s('name')}
              />
            </Field>

            <Field label="Official Email Address" required>
              <input
                className="input text-sm"
                type="email"
                placeholder="jane.doe@civictrack.test"
                required
                value={f.email}
                onChange={s('email')}
              />
            </Field>

            <Field label="Department / Functional Unit" hint="e.g. Public Works, Sanitation, Electrical">
              <input
                className="input text-sm"
                placeholder="Public Works"
                maxLength={80}
                value={f.department}
                onChange={s('department')}
              />
            </Field>

            <Field label="Password" required hint="Must be at least 10 characters">
              <div className="relative">
                <input
                  className="input text-sm pr-10"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  minLength={10}
                  maxLength={100}
                  required
                  value={f.password}
                  onChange={s('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500 border border-slate-200">
              <span className="font-semibold text-navy-900">Assigned Role:</span>{' '}
              <span className="text-teal-700 font-bold uppercase">Staff</span>{' '}
              — Allows triage, assignment, and status updates on all citizen complaints.
            </div>

            <button type="submit" className="btn w-full" disabled={busy}>
              {busy ? 'Creating Staff Member…' : 'Create Staff Account'}
            </button>
          </form>
        </div>

        {/* Right Column: Staff & Admins Roster */}
        <div className="md:col-span-7">
          <div className="card shadow-civic p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-navy-900">
                  Staff & Administrator Roster
                </h2>
                <p className="text-xs text-slate-500">
                  Authorized municipal personnel with internal portal access.
                </p>
              </div>
              <div className="relative w-full sm:w-48">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search personnel..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-8 py-1.5 text-xs"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No municipal staff or administrators match your search.
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = String(currentUser?.id) === String(u._id);
                  const isToggling = toggleBusyId === u._id;

                  return (
                    <div
                      key={u._id}
                      className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 rounded-lg px-2 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar Initial */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200">
                          {u.name ? u.name[0].toUpperCase() : 'U'}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-navy-900 text-sm truncate">
                              {u.name}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                u.role === 'admin'
                                  ? 'bg-navy-900 text-white'
                                  : 'bg-teal-50 text-teal-800 border border-teal-200'
                              }`}
                            >
                              {u.role}
                            </span>
                            {isSelf && (
                              <span className="text-[10px] bg-slate-200 text-slate-700 rounded px-1.5 font-semibold">
                                You
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="truncate">{u.email}</span>
                            {u.department && (
                              <>
                                <span>•</span>
                                <span className="text-slate-600 font-medium truncate">
                                  {u.department}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status & Action */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            u.active ? 'text-teal-700' : 'text-slate-400'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.active ? 'bg-teal-600' : 'bg-slate-400'
                            }`}
                          />
                          {u.active ? 'Active' : 'Disabled'}
                        </span>

                        <button
                          type="button"
                          onClick={() => toggle(u)}
                          disabled={isSelf || isToggling}
                          title={isSelf ? 'Cannot modify your own account access' : undefined}
                          className={`btn btn-xs ${
                            u.active ? 'btn-ghost text-red-600 hover:text-red-700' : 'btn'
                          }`}
                        >
                          {isToggling
                            ? 'Updating…'
                            : u.active
                            ? 'Disable'
                            : 'Enable'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
