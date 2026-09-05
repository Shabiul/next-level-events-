import { useCallback, useEffect, useState } from 'react';
import { Mail, Phone, Calendar, Inbox } from 'lucide-react';
import { LoadingState, EmptyState } from '../EmptyState';
import { cn } from '../../lib/utils';
import { getApiUrl, authFetch } from '../../lib/api';
import { toast } from 'react-toastify';

interface Enquiry {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  eventType?: string;
  eventDate?: string;
  message: string;
  source?: string;
  status: 'new' | 'in_progress' | 'responded' | 'closed';
  createdAt: string;
}

const STATUSES: Enquiry['status'][] = ['new', 'in_progress', 'responded', 'closed'];
const STATUS_LABEL: Record<Enquiry['status'], string> = {
  new: 'New',
  in_progress: 'In Progress',
  responded: 'Responded',
  closed: 'Closed',
};

export const EnquiriesView = () => {
  const [items, setItems] = useState<Enquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Enquiry['status']>('all');
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const qs = filter !== 'all' ? `?status=${filter}&limit=100` : '?limit=100';
      const res = await authFetch(getApiUrl('/api/contact') + qs);
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.success) throw new Error(body?.message || 'Failed to load enquiries');
      setItems(Array.isArray(body.data?.items) ? body.data.items : []);
      setTotal(Number(body.data?.total || 0));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load enquiries');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void fetchEnquiries();
  }, [fetchEnquiries]);

  const updateStatus = async (id: string, status: Enquiry['status']) => {
    setSavingId(id);
    try {
      const res = await authFetch(getApiUrl(`/api/contact/${id}`), {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.success) throw new Error(body?.message || 'Failed to update');
      setItems((prev) => prev.map((e) => (e._id === id ? { ...e, status } : e)));
      toast.success(`Marked as ${STATUS_LABEL[status]}`);
    } catch (err: any) {
      toast.error(err?.message || 'Could not update enquiry');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black text-[#381932] dark:text-[#FFF3E6]">
            <Inbox size={20} /> Customer Enquiries
          </h2>
          <p className="text-xs font-semibold text-[#381932] dark:text-[#381932] mt-0.5">
            {total} total &middot; from the Contact page
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[#381932] dark:border-[#381932] pb-1">
        {(['all', ...STATUSES] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={cn(
              'border-b-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer',
              filter === tab
                ? 'border-[#381932] text-[#381932] dark:text-[#381932]'
                : 'border-transparent text-[#381932] dark:text-[#381932] hover:text-[#381932] dark:hover:text-[#FFF3E6]'
            )}
          >
            {tab === 'all' ? 'All' : STATUS_LABEL[tab]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12"><LoadingState label="Loading enquiries..." /></div>
      ) : items.length === 0 ? (
        <EmptyState title="No enquiries yet" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((e) => (
            <div
              key={e._id}
              className="flex flex-col gap-3 rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-[#381932] dark:text-[#FFF3E6]">{e.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-[#381932] dark:text-[#381932]">
                    <span className="inline-flex items-center gap-1"><Phone size={11} />{e.phone}</span>
                    {e.email && <span className="inline-flex items-center gap-1"><Mail size={11} />{e.email}</span>}
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-[#381932] px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#381932] dark:text-[#381932]">
                  {STATUS_LABEL[e.status]}
                </span>
              </div>

              {(e.eventType || e.eventDate) && (
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#381932] dark:text-[#381932]">
                  <Calendar size={11} />
                  {[e.eventType, e.eventDate].filter(Boolean).join(' · ')}
                </div>
              )}

              <p className="whitespace-pre-wrap text-xs leading-relaxed text-[#381932] dark:text-[#FFF3E6]">{e.message}</p>

              <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#381932]/60 pt-3">
                <span className="text-[10px] font-semibold text-[#381932] dark:text-[#381932]">
                  {new Date(e.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
                <select
                  value={e.status}
                  disabled={savingId === e._id}
                  onChange={(ev) => void updateStatus(e._id, ev.target.value as Enquiry['status'])}
                  className="rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3 py-1.5 text-xs font-bold text-[#381932] dark:text-[#FFF3E6] outline-none disabled:opacity-40"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnquiriesView;
