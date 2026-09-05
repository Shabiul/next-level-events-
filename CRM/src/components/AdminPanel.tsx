import React, { useEffect, useState } from 'react';
import { Menu, Crown, Search, ChevronLeft, ChevronRight, X, Settings, Database, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { AdminView, AuthUser } from '../types';
import { Sidebar, DashboardView, CategoriesView, ProductsView, AddonsView, ActivitiesView, UsersView, EnquiriesView, SiteSettingsView, PaymentsView, StaffView } from './admin';
import { getApiUrl, getApiBaseUrl, setApiBaseUrl, DEFAULT_API_BASE_URL } from '../lib/api';
import { cn } from '../lib/utils';
import { toast } from 'react-toastify';

interface AdminPanelProps {
  user: AuthUser;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [message, setMessage] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, string>>({});
  const [orderDetail, setOrderDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // API Config modal state
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [currentApiUrl, setCurrentApiUrl] = useState(() => getApiBaseUrl());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const handleTestApi = async (urlToTest: string) => {
    setIsTesting(true);
    setTestStatus('testing');
    setTestMessage('Pinging server...');
    const clean = urlToTest.trim().replace(/\/$/, '');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const pingUrl = clean ? `${clean}/api/health` : getApiUrl('/api/health');
      const res = await fetch(pingUrl, { signal: controller.signal }).catch(async () => {
        return await fetch(clean ? `${clean}/api/dashboard/stats` : getApiUrl('/api/dashboard/stats'), { signal: controller.signal });
      });
      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type') || '';
      if (res.status === 200 && !contentType.includes('text/html')) {
        setTestStatus('success');
        setTestMessage('Connected successfully! Backend is active.');
      } else if (res.status === 405) {
        setTestStatus('failed');
        setTestMessage('Received HTTP 405 (Method Not Allowed). Check backend routing.');
      } else if (contentType.includes('text/html')) {
        setTestStatus('failed');
        setTestMessage('Host returned HTML document. Ensure this URL points to the backend server.');
      } else {
        setTestStatus('success');
        setTestMessage(`Server responded with HTTP ${res.status}. Route reachable.`);
      }
    } catch (err: any) {
      setTestStatus('failed');
      setTestMessage(err?.name === 'AbortError' ? 'Connection timed out after 6 seconds.' : 'Could not reach server. Verify the URL.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveApiUrl = () => {
    setApiBaseUrl(currentApiUrl);
    setShowApiSettings(false);
    toast.success('API URL saved! Reloading view...');
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  const handleResetApiUrl = () => {
    setCurrentApiUrl(DEFAULT_API_BASE_URL);
    setApiBaseUrl(DEFAULT_API_BASE_URL);
    setTestStatus('idle');
    setTestMessage('Reset to default production endpoint.');
  };

  // "Details" on an order navigates to /orders/:id, but the view router below
  // only ever resolves the top-level segment to 'orders' -- it silently
  // ignored the id entirely, so clicking Details did nothing visible. Pull
  // the id back out of the path and fetch+show it as a modal over the list.
  const orderDetailId = React.useMemo(() => {
    const parts = location.pathname.replace(/^\//, '').split('/');
    return parts[0] === 'orders' && parts[1] ? parts[1] : null;
  }, [location.pathname]);

  useEffect(() => {
    if (!orderDetailId) {
      setOrderDetail(null);
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoadingDetail(true);
    setOrderDetail(null);
    fetch(getApiUrl(`/api/admin/orders/${orderDetailId}`), { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setOrderDetail(data?.error ? null : data))
      .catch(() => setOrderDetail(null))
      .finally(() => setLoadingDetail(false));
  }, [orderDetailId]);

  const view = React.useMemo<AdminView>(() => {
    const path = location.pathname.replace(/^\//, '').split('/')[0] || 'dashboard';
    switch (path) {
      case 'categories':
        return 'categories';
      case 'products':
        return 'products';
      case 'addons':
        return 'addons';
      case 'activities':
        return 'activities';
      case 'orders':
        return 'orders';
      case 'bookings':
        return 'orders';
      case 'payments':
        return 'payments';
      case 'enquiries':
        return 'enquiries';
      case 'users':
        return 'users';
      case 'settings':
        return 'settings';
      case 'staff':
        return 'staff';
      default:
        return 'dashboard';
    }
  }, [location.pathname]);

  // Client-side mirror of the server-side requirePermission checks: a
  // staff account with a direct/bookmarked URL to a section they weren't
  // granted sees "Access Denied" instead of the real view. The API itself
  // still enforces this independently -- this is just so the UI doesn't
  // render a blank/broken screen for the parts it can't fetch.
  const allowedView =
    user.role === 'admin'
      ? true
      : view === 'dashboard'
        ? true
        : view === 'staff'
          ? false
          : user.permissions?.includes(view) ?? false;

  const navigateToView = (nextView: AdminView) => {
    const routes: Record<AdminView, string> = {
      dashboard: '/',
      categories: '/categories',
      products: '/products',
      addons: '/addons',
      activities: '/activities',
      orders: '/orders',
      payments: '/payments',
      enquiries: '/enquiries',
      users: '/users',
      settings: '/settings',
      staff: '/staff',
    };
    navigate(routes[nextView]);
  };

  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
  if (view !== "orders") {
    return;
  }

  const loadOrders = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    setLoadingOrders(true);

    try {
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        page: String(page),
        limit: String(limit),
        sortBy,
        sortDir,
      });

      const url = `${getApiUrl("/api/admin/orders")}?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      const payload = JSON.parse(text);

      setOrders(payload.orders || []);

      setPagination(
        payload.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        }
      );
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  loadOrders();
}, [
  view,
  search,
  statusFilter,
  page,
  limit,
  sortBy,
  sortDir,
]);

  const updateOrderStatus = async (orderId: string, nextOrderStatus: string, nextPaymentStatus?: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const requestUrl = getApiUrl(`/api/admin/orders/${orderId}/status`);
    const requestBody = { orderStatus: nextOrderStatus, paymentStatus: nextPaymentStatus };

    try {
      const response = await fetch(requestUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      let responseBody: any = null;
      try {
        responseBody = responseText ? JSON.parse(responseText) : null;
      } catch {
        responseBody = responseText;
      }

      if (!response.ok) {
        const backendError = responseBody?.error || responseBody?.msg || responseText || 'Unable to update order';
        throw new Error(backendError);
      }

      const savedOrder = responseBody;
      setMessage('Order updated');
      setOrders(prev => prev.map(order => order._id === orderId ? { ...order, ...savedOrder } : order));
      setSelectedStatuses(prev => ({ ...prev, [orderId]: savedOrder.orderStatus || nextOrderStatus }));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to update order');
    }
  };

  const deleteOrder = async (orderId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(getApiUrl(`/api/admin/orders/${orderId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Unable to delete order');
      setMessage('Order deleted');
      setOrders(prev => prev.filter(order => order._id !== orderId));
    } catch {
      setMessage('Unable to delete order');
    }
  };

  if (user.role !== 'admin' && user.role !== 'staff') {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-ink">Access Denied</h2>
        <p className="mt-2 text-sm text-ink-muted">You are not authorized to access the admin panel.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#FFF3E6] dark:bg-[#381932] overflow-hidden">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex w-64 flex-shrink-0">
        <Sidebar currentView={view} onViewChange={navigateToView} user={user} onLogout={onLogout} />
      </div>

      {/* Mobile & Tablet Slide-over Drawer Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-[200] w-72 transition-transform duration-300 ease-[cubic-bezier(0.34,1.1,0.64,1)] lg:hidden shadow-2xl',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar currentView={view} onViewChange={navigateToView} user={user} onCloseMobile={() => setSidebarOpen(false)} onLogout={onLogout} />
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[150] bg-[#381932]/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Workspace */}
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <div className="sticky top-0 z-[100] flex h-16 shrink-0 items-center justify-between border-b border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-4 md:px-7 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] text-[#381932] dark:text-[#381932] shadow-2xs transition-all hover:bg-[#FFF3E6] dark:hover:bg-[#381932] lg:hidden cursor-pointer"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Toggle menu"
            >
              <Menu size={18} />
            </button>
            <div className="text-xs sm:text-sm font-bold text-[#381932] dark:text-[#381932]">
              <span className="text-[#381932] dark:text-[#381932]">Admin</span> / <span className="capitalize text-[#381932] dark:text-[#FFF3E6]">{view}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setCurrentApiUrl(getApiBaseUrl());
                setTestStatus('idle');
                setTestMessage('');
                setShowApiSettings(true);
              }}
              title="API Backend Settings"
              className="flex items-center gap-1.5 rounded-full bg-[#FFF3E6] dark:bg-[#381932]/60 px-2.5 py-1 text-[11px] font-bold text-[#381932] dark:text-[#FFF3E6] border border-[#381932]/20 hover:border-[#381932]/50 transition-all cursor-pointer"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">API Config</span>
              <Settings size={12} />
            </button>
            <span className="hidden text-xs font-semibold text-[#381932] dark:text-[#381932] sm:inline truncate max-w-[180px]">{user.email}</span>
            <span className="flex items-center gap-1 rounded-full bg-[#FFF3E6] dark:bg-[#381932]/60 px-2.5 py-1 text-xs font-extrabold text-[#381932] dark:text-[#381932] border border-[#381932] dark:border-[#381932]">
              <Crown size={12} /> {user.role === 'admin' ? 'ADMIN' : 'STAFF'}
            </span>
          </div>
        </div>

        {/* Dynamic Main View Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-7 space-y-6">
          {!allowedView ? (
            <div className="rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-10 text-center">
              <h2 className="text-lg font-black text-[#381932] dark:text-[#FFF3E6]">Access Denied</h2>
              <p className="mt-2 text-xs font-semibold text-[#381932] dark:text-[#381932]">
                Your staff account doesn't have access to this section. Ask an admin to grant it from Staff Accounts.
              </p>
            </div>
          ) : (
            <>
          {view === 'dashboard' && <DashboardView />}
          {view === 'categories' && <CategoriesView />}
          {view === 'products' && <ProductsView />}
          {view === 'addons' && <AddonsView />}
          {view === 'activities' && <ActivitiesView />}
          {view === 'orders' && (
            <div className="space-y-5">
              {/* Header card */}
              <div className="flex flex-col gap-3 rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#381932] dark:text-[#FFF3E6]">Orders &amp; Bookings</h2>
                  <p className="text-xs font-semibold text-[#381932] dark:text-[#381932] mt-0.5">Search, filter, and manage customer event bookings in real time.</p>
                </div>
                {message && <div className="text-xs font-bold text-[#381932] dark:text-[#381932]">{message}</div>}
              </div>

              {/* Controls & Search */}
              <div className="rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <label className="flex flex-1 items-center gap-2 rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3.5 py-2.5 text-xs text-[#381932] dark:text-[#FFF3E6] outline-none">
                    <Search size={16} className="text-[#381932]" />
                    <input
                      value={search}
                      onChange={e => { setSearch(e.target.value); setPage(1); }}
                      placeholder="Search order number or customer name/email..."
                      className="w-full bg-transparent outline-none font-semibold placeholder:text-[#381932]"
                    />
                  </label>

                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3 py-2 text-xs font-bold text-[#381932] dark:text-[#FFF3E6] outline-none">
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3 py-2 text-xs font-bold text-[#381932] dark:text-[#FFF3E6] outline-none">
                      <option value="createdAt">Created Date</option>
                      <option value="grandTotal">Order Amount</option>
                      <option value="orderNumber">Order Number</option>
                    </select>
                    <select value={sortDir} onChange={e => setSortDir(e.target.value)} className="rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3 py-2 text-xs font-bold text-[#381932] dark:text-[#FFF3E6] outline-none">
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                    <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} className="rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3 py-2 text-xs font-bold text-[#381932] dark:text-[#FFF3E6] outline-none">
                      <option value={10}>10 / page</option>
                      <option value={20}>20 / page</option>
                      <option value={50}>50 / page</option>
                    </select>
                  </div>
                </div>

                {/* Orders Content: Table on Desktop, Cards on Mobile/Tablet */}
                {loadingOrders ? (
                  <div className="rounded-xl border border-dashed border-[#381932] dark:border-[#381932] p-12 text-center text-xs font-bold text-[#381932]">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#381932] dark:border-[#381932] p-12 text-center text-xs font-bold text-[#381932]">No orders found.</div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#381932] dark:border-[#381932] text-[#381932] dark:text-[#381932] uppercase tracking-wider font-extrabold">
                            <th className="px-3.5 py-3">Order</th>
                            <th className="px-3.5 py-3">Customer</th>
                            <th className="px-3.5 py-3">Product Package</th>
                            <th className="px-3.5 py-3">Event Date</th>
                            <th className="px-3.5 py-3">Amount</th>
                            <th className="px-3.5 py-3">Payment</th>
                            <th className="px-3.5 py-3">Status</th>
                            <th className="px-3.5 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#381932] dark:divide-[#381932]">
                          {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-[#FFF3E6]/60 dark:hover:bg-[#381932]/40 transition-colors">
                              <td className="px-3.5 py-3 font-extrabold text-[#381932] dark:text-[#FFF3E6]">
                                <button type="button" onClick={() => navigate(`/orders/${order._id}`)} className="hover:text-[#381932] text-left">
                                  <div>{order.orderNumber || `#${order._id.slice(-8)}`}</div>
                                  <div className="text-[10px] font-semibold text-[#381932]">{new Date(order.createdAt).toLocaleDateString()}</div>
                                </button>
                              </td>
                              <td className="px-3.5 py-3">
                                <div className="font-bold text-[#381932] dark:text-[#FFF3E6]">{order.customer?.name || order.booking?.name || 'N/A'}</div>
                                <div className="text-[11px] text-[#381932] truncate max-w-[150px]">{order.customer?.email || 'N/A'}</div>
                              </td>
                              <td className="px-3.5 py-3">
                                <div className="font-bold text-[#381932] dark:text-[#FFF3E6] truncate max-w-[180px]">{order.product?.name || order.productName}</div>
                                <div className="text-[11px] text-[#381932]">{order.categoryName || 'General'}</div>
                              </td>
                              <td className="px-3.5 py-3 font-semibold text-[#381932] dark:text-[#381932]">{order.booking?.eventDate || 'N/A'}</td>
                              <td className="px-3.5 py-3 font-black text-[#381932] dark:text-[#FFF3E6]">₹{Number(order.grandTotal || order.amount || 0).toLocaleString('en-IN')}</td>
                              <td className="px-3.5 py-3">
                                <span className={cn(
                                  "inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase border",
                                  order.paymentStatus === 'paid' ? "bg-[#FFF3E6] dark:bg-[#381932]/60 text-[#381932] dark:text-[#381932] border-[#381932] dark:border-[#381932]" : "bg-[#FFF3E6] dark:bg-[#381932]/60 text-[#381932] dark:text-[#FFF3E6] border-[#381932] dark:border-[#381932]"
                                )}>
                                  {order.paymentStatus || 'pending'}
                                </span>
                              </td>
                              <td className="px-3.5 py-3 font-semibold text-[#381932] dark:text-[#381932]">{order.orderStatus || 'Pending'}</td>
                              <td className="px-3.5 py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button type="button" onClick={() => navigate(`/orders/${order._id}`)} className="rounded-lg border border-[#381932] dark:border-[#381932] px-2.5 py-1 text-[11px] font-bold text-[#381932] dark:text-[#381932] hover:bg-[#FFF3E6] dark:hover:bg-[#381932]/50 cursor-pointer">Details</button>
                                  <select value={selectedStatuses[order._id] || order.orderStatus || 'Pending'} onChange={e => setSelectedStatuses(prev => ({ ...prev, [order._id]: e.target.value }))} className="rounded-lg border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-2 py-1 text-xs font-semibold text-[#381932] dark:text-[#FFF3E6] outline-none">
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Team Assigned">Team Assigned</option>
                                    <option value="Preparation Started">Preparation Started</option>
                                    <option value="Decoration In Progress">Decoration In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                  <button type="button" onClick={() => void updateOrderStatus(order._id, selectedStatuses[order._id] || order.orderStatus || 'Pending')} className="rounded-lg bg-[#381932] hover:opacity-90 text-[#FFF3E6] px-2.5 py-1 text-[11px] font-bold shadow-xs cursor-pointer">Save</button>
                                  <button type="button" onClick={() => void deleteOrder(order._id)} className="rounded-lg border border-[#381932] dark:border-[#381932]/50 bg-[#FFF3E6]/50 dark:bg-[#381932]/40 text-[#381932] dark:text-[#381932] px-2 py-1 text-[11px] font-bold hover:bg-[#FFF3E6] cursor-pointer">Del</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile & Tablet Card View */}
                    <div className="space-y-3 lg:hidden">
                      {orders.map((order) => (
                        <div key={order._id} className="rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6]/70 dark:bg-[#381932]/50 p-4 space-y-3 shadow-2xs">
                          <div className="flex items-center justify-between border-b border-[#381932]/80 dark:border-[#381932]/60 pb-2">
                            <span className="text-xs font-black text-[#381932] dark:text-[#FFF3E6] uppercase">{order.orderNumber || `#${order._id.slice(-8)}`}</span>
                            <span className={cn(
                              "text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase",
                              order.paymentStatus === 'paid' ? "bg-[#FFF3E6] dark:bg-[#381932]/60 text-[#381932] dark:text-[#381932] border-[#381932] dark:border-[#381932]" : "bg-[#FFF3E6] dark:bg-[#381932]/60 text-[#381932] dark:text-[#FFF3E6] border-[#381932] dark:border-[#381932]"
                            )}>
                              {order.paymentStatus || 'pending'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <div className="text-[10px] uppercase font-extrabold text-[#381932]">Customer</div>
                              <div className="font-bold text-[#381932] dark:text-[#FFF3E6] truncate">{order.customer?.name || order.booking?.name || 'N/A'}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] uppercase font-extrabold text-[#381932]">Amount</div>
                              <div className="font-black text-[#381932] dark:text-[#FFF3E6]">₹{Number(order.grandTotal || order.amount || 0).toLocaleString('en-IN')}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase font-extrabold text-[#381932]">Product Package</div>
                              <div className="font-bold text-[#381932] dark:text-[#FFF3E6] truncate">{order.product?.name || order.productName}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] uppercase font-extrabold text-[#381932]">Event Date</div>
                              <div className="font-bold text-[#381932] dark:text-[#381932]">{order.booking?.eventDate || 'N/A'}</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#381932]/80 dark:border-[#381932]/60 pt-2.5">
                            <select value={selectedStatuses[order._id] || order.orderStatus || 'Pending'} onChange={e => setSelectedStatuses(prev => ({ ...prev, [order._id]: e.target.value }))} className="flex-1 rounded-lg border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-2.5 py-1.5 text-xs font-bold text-[#381932] dark:text-[#FFF3E6] outline-none">
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Team Assigned">Team Assigned</option>
                              <option value="Preparation Started">Preparation Started</option>
                              <option value="Decoration In Progress">Decoration In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>

                            <div className="flex items-center gap-1.5">
                              <button type="button" onClick={() => void updateOrderStatus(order._id, selectedStatuses[order._id] || order.orderStatus || 'Pending')} className="rounded-lg bg-[#381932] text-[#FFF3E6] px-3 py-1.5 text-xs font-bold shadow-2xs">Save</button>
                              <button type="button" onClick={() => navigate(`/orders/${order._id}`)} className="rounded-lg border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3 py-1.5 text-xs font-bold text-[#381932] dark:text-[#381932]">View</button>
                              <button type="button" onClick={() => void deleteOrder(order._id)} className="rounded-lg border border-[#381932] text-[#381932] px-2.5 py-1.5 text-xs font-bold">Del</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Pagination */}
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#381932] dark:border-[#381932] pt-3">
                  <div className="text-xs font-semibold text-[#381932] dark:text-[#381932]">Showing {orders.length} of {pagination.total} orders</div>
                  <div className="flex items-center gap-2">
                    <button type="button" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-2 text-xs font-bold text-[#381932] dark:text-[#381932] disabled:opacity-50 cursor-pointer"><ChevronLeft size={16} /></button>
                    <span className="text-xs font-bold text-[#381932] dark:text-[#FFF3E6] px-2">Page {pagination.page} / {pagination.totalPages}</span>
                    <button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-2 text-xs font-bold text-[#381932] dark:text-[#381932] disabled:opacity-50 cursor-pointer"><ChevronRight size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {view === 'payments' && <PaymentsView isAdmin={user.role === 'admin'} />}
          {view === 'enquiries' && <EnquiriesView />}
          {view === 'users' && <UsersView />}
          {view === 'settings' && <SiteSettingsView />}
          {view === 'staff' && <StaffView />}
            </>
          )}
        </div>
      </div>

      {orderDetailId && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-5 bg-[#381932]/60 backdrop-blur-xs" onClick={() => navigate('/orders')}>
          <div
            className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#381932] dark:border-[#381932] pb-4 mb-4">
              <h2 className="text-lg font-black text-[#381932] dark:text-[#FFF3E6]">Booking Details</h2>
              <button type="button" onClick={() => navigate('/orders')} className="rounded-full p-1.5 text-[#381932] dark:text-[#FFF3E6] hover:bg-[#381932]/10 cursor-pointer" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-16 text-center text-xs font-bold text-[#381932] dark:text-[#FFF3E6]">Loading booking...</div>
            ) : !orderDetail ? (
              <div className="py-16 text-center text-xs font-bold text-[#381932] dark:text-[#FFF3E6]">Booking not found.</div>
            ) : (
              <div className="space-y-5 text-xs text-[#381932] dark:text-[#FFF3E6]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-black">{orderDetail.orderNumber || `#${String(orderDetail._id).slice(-8)}`}</div>
                    <div className="text-[11px] font-semibold opacity-70">{new Date(orderDetail.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <span className="rounded-full border border-[#381932] dark:border-[#381932] px-2.5 py-1 text-[10px] font-extrabold uppercase">{orderDetail.orderStatus || 'Pending'}</span>
                    <span className="rounded-full border border-[#381932] dark:border-[#381932] px-2.5 py-1 text-[10px] font-extrabold uppercase">{orderDetail.paymentStatus || 'pending'}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-[#381932] dark:border-[#381932] p-4 space-y-1">
                  <div className="font-extrabold uppercase text-[10px] opacity-70 mb-1.5">Customer</div>
                  <div className="font-bold">{orderDetail.customer?.name || orderDetail.booking?.name || 'N/A'}</div>
                  <div>{orderDetail.customer?.email || 'N/A'}</div>
                  <div>{orderDetail.customer?.phone || orderDetail.booking?.mobile || 'N/A'}</div>
                </div>

                <div className="rounded-xl border border-[#381932] dark:border-[#381932] p-4 space-y-1">
                  <div className="font-extrabold uppercase text-[10px] opacity-70 mb-1.5">Package</div>
                  <div className="font-bold">{orderDetail.product?.name || orderDetail.productName}</div>
                  <div className="opacity-70">{orderDetail.categoryName}{orderDetail.subcategory ? ` · ${orderDetail.subcategory}` : ''}</div>
                  <div className="font-bold">₹{Number(orderDetail.packagePrice || orderDetail.product?.price || 0).toLocaleString('en-IN')}</div>
                </div>

                {(orderDetail.booking?.eventDate || orderDetail.bookingDetails?.[0]?.eventDate) && (
                  <div className="rounded-xl border border-[#381932] dark:border-[#381932] p-4 space-y-1">
                    <div className="font-extrabold uppercase text-[10px] opacity-70 mb-1.5">Event</div>
                    <div>Date: <span className="font-bold">{orderDetail.booking?.eventDate || orderDetail.bookingDetails?.[0]?.eventDate}</span> at <span className="font-bold">{orderDetail.booking?.eventTime || orderDetail.bookingDetails?.[0]?.eventTime}</span></div>
                    <div>Venue: <span className="font-bold">{orderDetail.booking?.location || orderDetail.bookingDetails?.[0]?.location || 'N/A'}</span></div>
                    {(orderDetail.booking?.requests || orderDetail.bookingDetails?.[0]?.requests) && (
                      <div>Requests: <span className="font-bold">{orderDetail.booking?.requests || orderDetail.bookingDetails?.[0]?.requests}</span></div>
                    )}
                  </div>
                )}

                {(orderDetail.addons?.length > 0 || orderDetail.activities?.length > 0) && (
                  <div className="rounded-xl border border-[#381932] dark:border-[#381932] p-4 space-y-1.5">
                    <div className="font-extrabold uppercase text-[10px] opacity-70 mb-1.5">Add-ons &amp; Activities</div>
                    {[...(orderDetail.addons || []), ...(orderDetail.activities || [])].map((a: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span>{a.name}{a.qty > 1 ? ` × ${a.qty}` : ''}</span>
                        <span className="font-bold">₹{Number(a.price || 0).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="rounded-xl border border-[#381932] dark:border-[#381932] p-4 space-y-1">
                  <div className="font-extrabold uppercase text-[10px] opacity-70 mb-1.5">Payment</div>
                  <div className="flex items-center justify-between"><span>Subtotal</span><span>₹{Number(orderDetail.subtotal || 0).toLocaleString('en-IN')}</span></div>
                  {orderDetail.addonTotal > 0 && <div className="flex items-center justify-between"><span>Add-ons</span><span>₹{Number(orderDetail.addonTotal).toLocaleString('en-IN')}</span></div>}
                  {orderDetail.activityTotal > 0 && <div className="flex items-center justify-between"><span>Activities</span><span>₹{Number(orderDetail.activityTotal).toLocaleString('en-IN')}</span></div>}
                  <div className="flex items-center justify-between font-black border-t border-[#381932]/30 pt-1.5 mt-1.5"><span>Grand Total</span><span>₹{Number(orderDetail.grandTotal || 0).toLocaleString('en-IN')}</span></div>
                  <div className="opacity-70 pt-1">Method: {orderDetail.paymentMethod || 'N/A'}{orderDetail.razorpayPaymentId ? ` · ${orderDetail.razorpayPaymentId}` : ''}</div>
                </div>

                {orderDetail.statusHistory?.length > 0 && (
                  <div className="rounded-xl border border-[#381932] dark:border-[#381932] p-4 space-y-1.5">
                    <div className="font-extrabold uppercase text-[10px] opacity-70 mb-1.5">Status History</div>
                    {orderDetail.statusHistory.map((h: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="font-bold">{h.status}</span>
                        <span className="opacity-70">{new Date(h.updatedAt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {/* API Connection & Backend Settings Modal */}
      {showApiSettings && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-[#381932]/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl border border-[#381932]/20 bg-[#FFF3E6] dark:bg-[#381932] p-6 sm:p-7 shadow-2xl text-[#381932] dark:text-[#FFF3E6] space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#381932]/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#381932] text-[#FFF3E6] dark:bg-[#FFF3E6] dark:text-[#381932]">
                  <Database size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black">CRM Backend Connection</h3>
                  <p className="text-xs opacity-70">Configure your API server endpoint</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowApiSettings(false)}
                className="rounded-xl p-1.5 opacity-70 hover:opacity-100 hover:bg-[#381932]/5 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider block mb-1.5 opacity-80">
                  Backend API Base URL
                </label>
                <input
                  type="text"
                  value={currentApiUrl}
                  onChange={(e) => {
                    setCurrentApiUrl(e.target.value);
                    setTestStatus('idle');
                    setTestMessage('');
                  }}
                  placeholder="e.g. https://the-decor-party.vercel.app"
                  className="w-full rounded-2xl border border-[#381932]/30 dark:border-[#FFF3E6]/20 bg-[#FFF3E6] dark:bg-[#381932]/80 px-4 py-3 text-xs font-semibold outline-none focus:border-[#381932] dark:focus:border-[#FFF3E6]"
                />
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-[11px] font-bold opacity-70 block mb-1.5">Quick Presets:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentApiUrl(DEFAULT_API_BASE_URL);
                      setTestStatus('idle');
                      setTestMessage('');
                    }}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-bold border border-[#381932]/20 hover:bg-[#381932]/5 transition-all cursor-pointer"
                  >
                    Vercel Production
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentApiUrl('http://localhost:5000');
                      setTestStatus('idle');
                      setTestMessage('');
                    }}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-bold border border-[#381932]/20 hover:bg-[#381932]/5 transition-all cursor-pointer"
                  >
                    Local Port 5000
                  </button>
                </div>
              </div>

              {/* Test status banner */}
              {testStatus !== 'idle' && (
                <div
                  className={cn(
                    'rounded-2xl p-3.5 text-xs font-bold flex items-center gap-2',
                    testStatus === 'testing' && 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30',
                    testStatus === 'success' && 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
                    testStatus === 'failed' && 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                  )}
                >
                  {testStatus === 'testing' && <RefreshCw size={14} className="animate-spin shrink-0" />}
                  {testStatus === 'success' && <CheckCircle2 size={14} className="shrink-0" />}
                  {testStatus === 'failed' && <AlertCircle size={14} className="shrink-0" />}
                  <span className="flex-1">{testMessage}</span>
                </div>
              )}

              <div className="rounded-2xl bg-[#381932]/5 p-3.5 text-[11px] font-medium opacity-80 leading-relaxed">
                💡 <strong>Direct Supabase Fallback:</strong> Even if your Express backend server is cold or restarting, this CRM automatically queries your Supabase database directly for live stats and catalog views.
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-[#381932]/10">
              <button
                type="button"
                onClick={handleResetApiUrl}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#381932]/20 text-xs font-bold hover:bg-[#381932]/5 transition-all cursor-pointer"
              >
                Reset Default
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isTesting}
                  onClick={() => handleTestApi(currentApiUrl)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#381932] dark:border-[#FFF3E6] text-xs font-bold hover:bg-[#381932]/5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiUrl}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#381932] text-[#FFF3E6] dark:bg-[#FFF3E6] dark:text-[#381932] text-xs font-black shadow-md cursor-pointer hover:opacity-90 transition-all"
                >
                  Save &amp; Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
