import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, RefreshCw, Search, ChevronLeft, ChevronRight, IndianRupee } from 'lucide-react';
import { getApiUrl, authFetch } from '../../lib/api';
import { cn } from '../../lib/utils';
import { toast } from 'react-toastify';

const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'cancelled'];

interface RazorpayStatus {
  configured: boolean;
  connected: boolean;
  keyId?: string;
  message: string;
}

interface Payment {
  _id: string;
  orderNumber?: string;
  customer?: { name?: string; email?: string; phone?: string };
  grandTotal?: number;
  amount?: number;
  paymentStatus?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  createdAt: string;
}

const getPaymentsApi = () => getApiUrl('/api/admin/payments');
const PAYMENTS_API = { toString: getPaymentsApi, valueOf: getPaymentsApi };

interface PaymentsViewProps {
  isAdmin?: boolean;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ isAdmin = false }) => {
  const [status, setStatus] = useState<RazorpayStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState({ totalCollected: 0, paidCount: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const checkRazorpayStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await authFetch(getApiUrl('/api/admin/payments/razorpay-status'));
      setStatus(await res.json());
    } catch {
      setStatus({ configured: false, connected: false, message: 'Could not reach the server to check Razorpay.' });
    } finally {
      setCheckingStatus(false);
    }
  };

  const loadPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        page: String(page),
        limit: '10',
      });
      const res = await authFetch(`${PAYMENTS_API}?${params.toString()}`);
      const data = await res.json();
      setPayments(data.payments || []);
      setSummary(data.summary || { totalCollected: 0, paidCount: 0 });
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void checkRazorpayStatus(); }, []);
  useEffect(() => { void loadPayments(); }, [search, statusFilter, page]);

  const updatePaymentStatus = async (paymentId: string, nextStatus: string) => {
    setSavingId(paymentId);
    try {
      const res = await authFetch(getApiUrl(`/api/admin/payments/${paymentId}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: nextStatus }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Unable to update payment status');
      setPayments((prev) => prev.map((p) => (p._id === paymentId ? { ...p, ...body } : p)));
      toast.success('Payment status updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update payment status');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs">
        <h2 className="text-xl font-black text-[#381932] dark:text-[#FFF3E6]">Payments</h2>
        <p className="text-xs font-semibold text-[#381932] dark:text-[#381932] mt-0.5">
          Every payment received through Razorpay, and whether the configured credentials still work.
        </p>
      </div>

      {/* Razorpay connection status */}
      <div className={cn(
        'flex flex-col gap-3 rounded-2xl border p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between',
        status?.connected
          ? 'border-[#381932] bg-[#FFF3E6] dark:bg-[#381932]'
          : 'border-[#381932] bg-[#381932]/5 dark:bg-[#381932]'
      )}>
        <div className="flex items-center gap-3">
          {checkingStatus ? (
            <Loader2 size={22} className="animate-spin text-[#381932]" />
          ) : status?.connected ? (
            <CheckCircle2 size={22} className="text-[#381932]" />
          ) : (
            <XCircle size={22} className="text-[#381932]" />
          )}
          <div>
            <div className="text-sm font-black text-[#381932] dark:text-[#FFF3E6]">
              {checkingStatus
                ? 'Checking Razorpay credentials...'
                : status?.connected
                  ? 'Razorpay connected'
                  : 'Razorpay not connected'}
            </div>
            <div className="text-xs font-semibold text-[#381932] dark:text-[#381932]">
              {status?.message || ''}
              {status?.keyId && <span className="ml-1 font-mono">({status.keyId})</span>}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void checkRazorpayStatus()}
          disabled={checkingStatus}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#381932] dark:border-[#381932] px-4 py-2 text-xs font-bold text-[#381932] dark:text-[#381932] hover:bg-[#FFF3E6] dark:hover:bg-[#381932]/60 disabled:opacity-60 cursor-pointer"
        >
          <RefreshCw size={13} className={checkingStatus ? 'animate-spin' : ''} /> Re-check
        </button>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#381932] text-[#FFF3E6]">
            <IndianRupee size={18} />
          </div>
          <div>
            <div className="text-lg font-black text-[#381932] dark:text-[#FFF3E6]">₹{summary.totalCollected.toLocaleString('en-IN')}</div>
            <div className="text-xs font-semibold text-[#381932] dark:text-[#381932]">Total collected via Razorpay</div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#381932] text-[#FFF3E6]">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="text-lg font-black text-[#381932] dark:text-[#FFF3E6]">{summary.paidCount}</div>
            <div className="text-xs font-semibold text-[#381932] dark:text-[#381932]">Successful payments</div>
          </div>
        </div>
      </div>

      {/* Filters + table */}
      <div className="rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3.5 py-2.5 text-xs text-[#381932] dark:text-[#FFF3E6] outline-none">
            <Search size={16} className="text-[#381932]" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search order number, Razorpay payment/order ID, customer..."
              className="w-full bg-transparent outline-none font-semibold placeholder:text-[#381932]"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3 py-2 text-xs font-bold text-[#381932] dark:text-[#FFF3E6] outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="rounded-xl border border-dashed border-[#381932] dark:border-[#381932] p-12 text-center text-xs font-bold text-[#381932]">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#381932] dark:border-[#381932] p-12 text-center text-xs font-bold text-[#381932]">No Razorpay payments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#381932] dark:border-[#381932] text-[#381932] dark:text-[#381932] uppercase tracking-wider font-extrabold">
                  <th className="px-3.5 py-3">Order</th>
                  <th className="px-3.5 py-3">Customer</th>
                  <th className="px-3.5 py-3">Amount</th>
                  <th className="px-3.5 py-3">Razorpay Payment ID</th>
                  <th className="px-3.5 py-3">Status</th>
                  <th className="px-3.5 py-3">Date</th>
                  <th className="px-3.5 py-3 text-right">{isAdmin ? 'Update' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#381932] dark:divide-[#381932]">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-[#FFF3E6]/60 dark:hover:bg-[#381932]/40 transition-colors">
                    <td className="px-3.5 py-3 font-extrabold text-[#381932] dark:text-[#FFF3E6]">{p.orderNumber || `#${p._id.slice(-8)}`}</td>
                    <td className="px-3.5 py-3">
                      <div className="font-bold text-[#381932] dark:text-[#FFF3E6]">{p.customer?.name || 'N/A'}</div>
                      <div className="text-[11px] text-[#381932] truncate max-w-[160px]">{p.customer?.email || 'N/A'}</div>
                    </td>
                    <td className="px-3.5 py-3 font-black text-[#381932] dark:text-[#FFF3E6]">₹{Number(p.grandTotal || p.amount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-3.5 py-3 font-mono text-[11px] text-[#381932] dark:text-[#381932]">{p.razorpayPaymentId || '—'}</td>
                    <td className="px-3.5 py-3">
                      <span className={cn(
                        'inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase border',
                        p.paymentStatus === 'paid'
                          ? 'bg-[#381932] text-[#FFF3E6] border-[#381932]'
                          : 'bg-[#FFF3E6] dark:bg-[#381932]/60 text-[#381932] dark:text-[#FFF3E6] border-[#381932] dark:border-[#381932]'
                      )}>
                        {p.paymentStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 font-semibold text-[#381932] dark:text-[#381932]">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-3.5 py-3 text-right">
                      {isAdmin ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={selectedStatuses[p._id] || p.paymentStatus || 'pending'}
                            onChange={(e) => setSelectedStatuses((prev) => ({ ...prev, [p._id]: e.target.value }))}
                            className="rounded-lg border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-2 py-1 text-xs font-semibold text-[#381932] dark:text-[#FFF3E6] outline-none"
                          >
                            {PAYMENT_STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={savingId === p._id}
                            onClick={() => void updatePaymentStatus(p._id, selectedStatuses[p._id] || p.paymentStatus || 'pending')}
                            className="rounded-lg bg-[#381932] hover:opacity-90 text-[#FFF3E6] px-2.5 py-1 text-[11px] font-bold shadow-xs disabled:opacity-60 cursor-pointer"
                          >
                            {savingId === p._id ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-[#381932]/60 dark:text-[#FFF3E6]/60 italic">
                          Admin only
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#381932] dark:border-[#381932] pt-3">
          <div className="text-xs font-semibold text-[#381932] dark:text-[#381932]">Showing {payments.length} of {pagination.total} payments</div>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-2 text-xs font-bold text-[#381932] dark:text-[#381932] disabled:opacity-50 cursor-pointer"><ChevronLeft size={16} /></button>
            <span className="text-xs font-bold text-[#381932] dark:text-[#FFF3E6] px-2">Page {pagination.page} / {pagination.totalPages}</span>
            <button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-2 text-xs font-bold text-[#381932] dark:text-[#381932] disabled:opacity-50 cursor-pointer"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsView;
