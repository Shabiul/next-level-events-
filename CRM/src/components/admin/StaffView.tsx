import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { UserPlus, Trash2, Clock, X } from 'lucide-react';
import { getApiUrl, authFetch } from '../../lib/api';
import { cn } from '../../lib/utils';
import { STAFF_SCOPES, type AdminView } from '../../types';
import { ConfirmModal } from './ConfirmModal';

const API = getApiUrl('/api/admin/staff');

const SCOPE_LABELS: Record<Exclude<AdminView, 'dashboard' | 'staff'>, string> = {
  categories: 'Categories',
  products: 'Products',
  addons: 'Add-ons',
  activities: 'Activities',
  orders: 'Bookings',
  payments: 'Payments',
  enquiries: 'Enquiries',
  users: 'Users',
  settings: 'Site Settings',
};

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  permissions: string[];
  createdAt: string;
}

/** Ticks once a second so every "time since created" clock in the list stays live. */
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function formatElapsed(fromISO: string, now: number): string {
  let ms = now - new Date(fromISO).getTime();
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (days || hours) parts.push(`${hours}h`);
  if (days || hours || minutes) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(' ');
}

const emptyForm = { firstName: '', lastName: '', email: '', password: '', permissions: [] as string[] };

export const StaffView = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const now = useNow();

  const load = async () => {
    setLoading(true);
    try {
      const res = await authFetch(API);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load staff accounts');
      setStaff(Array.isArray(data.staff) ? data.staff : []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load staff accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const toggleScope = (scope: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(scope)
        ? prev.permissions.filter((p) => p !== scope)
        : [...prev.permissions, scope],
    }));
  };

  const createStaff = async () => {
    if (!form.firstName.trim() || !form.email.trim() || form.password.length < 8) {
      toast.error('First name, email, and a password of at least 8 characters are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await authFetch(API, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create staff account');
      toast.success(`Staff account created for ${form.firstName}`);
      setForm(emptyForm);
      setShowForm(false);
      void load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create staff account');
    } finally {
      setSaving(false);
    }
  };

  const updateScopes = async (id: string, permissions: string[]) => {
    try {
      const res = await authFetch(`${API}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ permissions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to update scopes');
      setStaff((prev) => prev.map((s) => (s.id === id ? data.staff : s)));
      toast.success('Access scopes updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update scopes');
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      const res = await authFetch(`${API}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to remove staff account');
      }
      setStaff((prev) => prev.filter((s) => s.id !== id));
      toast.success('Staff account removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove staff account');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const scopeEntries = useMemo(() => STAFF_SCOPES.map((scope) => ({ scope, label: SCOPE_LABELS[scope] })), []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-[#381932] dark:text-[#FFF3E6]">Staff Accounts</h2>
          <p className="text-xs font-semibold text-[#381932] dark:text-[#381932] mt-0.5">
            Create staff logins and choose exactly which admin sections each one can access.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#381932] text-[#FFF3E6] px-4 py-2.5 text-xs font-bold shadow-md shadow-[#381932]/20 cursor-pointer"
        >
          {showForm ? <X size={14} /> : <UserPlus size={14} />}
          {showForm ? 'Cancel' : 'New Staff Account'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#381932] dark:text-[#381932]">
              <span className="text-[10px] font-extrabold uppercase tracking-wide">First Name</span>
              <input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} className="rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3.5 py-2.5 text-xs font-bold text-[#381932] dark:text-[#FFF3E6] outline-none" />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#381932] dark:text-[#381932]">
              <span className="text-[10px] font-extrabold uppercase tracking-wide">Last Name</span>
              <input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} className="rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3.5 py-2.5 text-xs font-bold text-[#381932] dark:text-[#FFF3E6] outline-none" />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#381932] dark:text-[#381932]">
              <span className="text-[10px] font-extrabold uppercase tracking-wide">Email</span>
              <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3.5 py-2.5 text-xs font-bold text-[#381932] dark:text-[#FFF3E6] outline-none" />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#381932] dark:text-[#381932]">
              <span className="text-[10px] font-extrabold uppercase tracking-wide">Password (min 8 chars)</span>
              <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className="rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3.5 py-2.5 text-xs font-bold text-[#381932] dark:text-[#FFF3E6] outline-none" />
            </label>
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#381932] dark:text-[#381932]">Access Scopes</span>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {scopeEntries.map(({ scope, label }) => (
                <label key={scope} className="flex items-center gap-2 rounded-xl border border-[#381932] dark:border-[#381932] px-3 py-2 text-xs font-bold text-[#381932] dark:text-[#FFF3E6] cursor-pointer">
                  <input type="checkbox" checked={form.permissions.includes(scope)} onChange={() => toggleScope(scope)} className="accent-[#381932]" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void createStaff()}
            disabled={saving}
            className="rounded-xl bg-[#381932] text-[#FFF3E6] px-4 py-2.5 text-xs font-bold shadow-md shadow-[#381932]/20 disabled:opacity-60 cursor-pointer"
          >
            {saving ? 'Creating...' : 'Create Staff Account'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-dashed border-[#381932] dark:border-[#381932] p-12 text-center text-xs font-bold text-[#381932]">Loading staff accounts...</div>
      ) : staff.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#381932] dark:border-[#381932] p-12 text-center text-xs font-bold text-[#381932]">No staff accounts yet.</div>
      ) : (
        <div className="space-y-3">
          {staff.map((s) => (
            <div key={s.id} className="rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-black text-[#381932] dark:text-[#FFF3E6]">{s.firstName} {s.lastName}</div>
                  <div className="text-xs font-semibold text-[#381932] dark:text-[#381932]">{s.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3E6] dark:bg-[#381932]/60 border border-[#381932] dark:border-[#381932] px-2.5 py-1 text-[10px] font-extrabold text-[#381932] dark:text-[#FFF3E6]">
                    <Clock size={11} /> {formatElapsed(s.createdAt, now)} ago
                  </span>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm({ id: s.id, name: `${s.firstName} ${s.lastName}`.trim() })}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#381932] dark:border-[#381932]/50 bg-[#FFF3E6] dark:bg-[#381932]/40 text-[#381932] dark:text-[#381932] hover:bg-[#FFF3E6] dark:hover:bg-[#381932]/60 cursor-pointer"
                    title="Remove staff account"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="text-[10px] font-semibold text-[#381932]/70 dark:text-[#381932]">
                Created {new Date(s.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>

              <div className="flex flex-wrap gap-2 border-t border-[#381932]/60 dark:border-[#381932]/60 pt-3">
                {scopeEntries.map(({ scope, label }) => {
                  const active = s.permissions.includes(scope);
                  return (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => {
                        const next = active ? s.permissions.filter((p) => p !== scope) : [...s.permissions, scope];
                        setStaff((prev) => prev.map((x) => (x.id === s.id ? { ...x, permissions: next } : x)));
                        void updateScopes(s.id, next);
                      }}
                      className={cn(
                        'rounded-full px-3 py-1 text-[11px] font-bold border transition-colors cursor-pointer',
                        active
                          ? 'bg-[#381932] text-[#FFF3E6] border-[#381932]'
                          : 'text-[#381932] dark:text-[#381932] border-[#381932]/50 hover:bg-[#FFF3E6] dark:hover:bg-[#381932]/50'
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <ConfirmModal
          title="Remove Staff Account"
          message={`Are you sure you want to permanently remove "${deleteConfirm.name}"'s staff account? They will lose access immediately.`}
          confirmText="Remove Account"
          onConfirm={() => void deleteStaff(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

export default StaffView;
