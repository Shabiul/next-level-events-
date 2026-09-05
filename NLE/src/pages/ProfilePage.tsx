import { useEffect, useState, useMemo, type FormEvent } from 'react';
import { ChevronRight, KeyRound, LogOut, Mail, MapPin, Package, Phone, User, Calendar, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useProducts } from '../hooks/useProducts';
import { BackButton } from '../components/BackButton';
import { SeoHead } from '../components/layout/SeoHead';
import Avatar from '../components/Avatar';
import { cn } from '../lib/utils';
import { getApiUrl } from '../lib/api';
import { getUserDisplayName } from '../lib/avatar';

const valueOrEmpty = (value?: string) => value?.trim() || 'Not provided';

export default function ProfilePage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { grouped } = useProducts();

  const allProductsList = useMemo(() => {
    if (!grouped) return [];
    if (Array.isArray(grouped)) return grouped;
    return Object.values(grouped).flat();
  }, [grouped]);

  const getProductImage = (order: any) => {
    const p = order.product || {};
    if (p.image && !p.image.includes('final_logo')) return p.image;
    if (order.productImage && !order.productImage.includes('final_logo')) return order.productImage;
    if (order.image && !order.image.includes('final_logo')) return order.image;

    const targetId = p.id || p._id || order.productId;
    const targetName = p.name || order.productName;

    const found = allProductsList.find((item: any) =>
      (targetId && (item._id === targetId || item.id === targetId)) ||
      (targetName && item.name?.toLowerCase() === targetName?.toLowerCase())
    );

    return found?.image || p.image || order.productImage || '/final_logo.jpg';
  };
  const { t, LANGS, langCode, changeLang } = useLanguage();
  const user = auth.user;
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    dateOfBirth: user?.dateOfBirth || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    country: user?.country || '',
    pincode: user?.pincode || '',
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [editing, setEditing] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !auth.user) return;

    fetch(getApiUrl('/api/auth/profile'), { headers: { Authorization: `Bearer ${token}` } })
      .then(async response => {
        if (!response.ok) throw new Error('Failed to load profile');
        const payload = await response.json();
        return payload;
      })
      .then(payload => {
        if (!payload?.user) return;
        const normalizedUser = {
          ...auth.user,
          ...payload.user,
          avatar: payload.user.avatar?.trim() || payload.user.photoURL?.trim() || auth.user?.avatar?.trim() || auth.user?.photoURL?.trim() || '',
          photoURL: payload.user.photoURL?.trim() || auth.user?.photoURL?.trim() || '',
          name: payload.user.name?.trim() || [payload.user.firstName, payload.user.lastName].filter(Boolean).join(' ') || auth.user?.name || auth.user?.email || '',
          firstName: payload.user.firstName?.trim() || auth.user?.firstName || '',
          lastName: payload.user.lastName?.trim() || auth.user?.lastName || '',
        };
        auth.updateUser(normalizedUser);
        setForm(current => ({ ...current, ...normalizedUser }));
      })
      .catch(() => setSaveMessage('Unable to load profile details.'));
  }, [auth.user?.id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !auth.user?.id) return;

    const loadOrders = async () => {
      setOrdersLoading(true);
      try {
        const response = await fetch(getApiUrl('/api/orders/my'), { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error('Unable to load orders');
        const payload = await response.json();
        setOrders(Array.isArray(payload) ? payload : []);
      } catch {
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    void loadOrders();
  }, [auth.user?.id]);

  if (!user) {
    navigate('/');
    return null;
  }

  const updateField = (field: keyof typeof form, value: string) => {
    setForm(current => ({ ...current, [field]: value }));
    setSaveMessage('');
  };

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;
    setSaving(true);
    setSaveMessage('');
    try {
      const response = await fetch(getApiUrl('/api/auth/profile'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok || !payload.user) throw new Error(payload.msg || 'Unable to save profile');
      const normalizedUser = {
        ...auth.user!,
        ...payload.user,
        avatar: payload.user.avatar?.trim() || payload.user.photoURL?.trim() || auth.user?.avatar?.trim() || auth.user?.photoURL?.trim() || '',
        photoURL: payload.user.photoURL?.trim() || auth.user?.photoURL?.trim() || '',
        name: payload.user.name?.trim() || [payload.user.firstName, payload.user.lastName].filter(Boolean).join(' ') || auth.user?.name || auth.user?.email || '',
      };
      auth.updateUser(normalizedUser);
      setForm(current => ({ ...current, ...payload.user }));
      setEditing(false);
      setSaveMessage('Profile saved successfully.');
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const fullName = getUserDisplayName(user) || user?.email || '';
  const avatar = <Avatar user={user} alt={fullName || 'User avatar'} className="h-20 w-20 ring-4 ring-[#381932] dark:ring-[#381932]/50" />;

  return (
    <>
      <SeoHead
        title="My Account — The Decor Party"
        noindex={true}
      />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 min-h-[85vh]">
        <div className="mb-5 flex items-center gap-3">
          <BackButton onClick={() => navigate('/')} />
          <h1 className="text-xl font-black text-[#381932] dark:text-[#FFF3E6] md:text-2xl">My Account</h1>
        </div>

        {/* User Card Header */}
        <section className="rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs md:p-7">
          <div className="flex flex-col items-center gap-4 border-b border-[#381932] dark:border-[#381932] pb-6 text-center sm:flex-row sm:text-left">
            {avatar}
            <div>
              <h2 className="text-xl font-extrabold text-[#381932] dark:text-[#FFF3E6]">{fullName}</h2>
              <p className="text-xs font-semibold text-[#381932] dark:text-[#381932] mt-0.5">{user.email}</p>
              {user.role === 'admin' && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#FFF3E6] dark:bg-[#381932]/60 px-2.5 py-0.5 text-[11px] font-bold text-[#381932] dark:text-[#381932] border border-[#381932] dark:border-[#381932]">
                  👑 Admin Account
                </span>
              )}
            </div>
          </div>

          <form onSubmit={saveProfile}>
            <div className="mb-4 mt-6 flex items-center justify-between gap-3">
              <h2 className="text-base font-extrabold text-[#381932] dark:text-[#FFF3E6]">Personal Information</h2>
              <button
                type="button"
                onClick={() => { setEditing(true); setSaveMessage(''); }}
                disabled={editing}
                className="rounded-xl border border-[#381932] px-4 py-2 text-xs font-bold text-[#381932] dark:text-[#381932] transition hover:opacity-90 hover:text-[#FFF3E6] disabled:cursor-default disabled:opacity-50 cursor-pointer"
              >
                Edit Details
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['firstName', 'First Name', User], ['lastName', 'Last Name', User],
                ['phone', 'Phone Number', Phone], ['gender', 'Gender', User],
                ['dateOfBirth', 'Date of Birth', User], ['address', 'Address', MapPin],
                ['city', 'City', MapPin], ['state', 'State', MapPin],
                ['country', 'Country', MapPin], ['pincode', 'Pincode', MapPin],
              ].map(([field, label, Icon]) => (
                <label key={field as string} className="flex flex-col gap-1.5 text-xs font-semibold text-[#381932] dark:text-[#381932]">
                  <span className="flex items-center gap-1.5 text-[#381932] dark:text-[#381932]"><Icon size={14} />{label as string}</span>
                  {field === 'gender' ? (
                    <select
                      value={form.gender}
                      onChange={event => updateField('gender', event.target.value)}
                      disabled={!editing}
                      className={cn(
                        'rounded-xl border border-[#381932] dark:border-[#381932] px-3.5 py-2.5 text-sm text-[#381932] dark:text-[#FFF3E6] outline-none transition-all',
                        editing ? 'bg-[#FFF3E6] dark:bg-[#381932] focus:ring-2 focus:ring-[#381932]/40' : 'cursor-default bg-[#FFF3E6] dark:bg-[#381932]/60'
                      )}
                    >
                      <option value="">Select gender</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  ) : (
                    <input
                      type={field === 'dateOfBirth' ? 'date' : 'text'}
                      value={form[field as keyof typeof form]}
                      onChange={event => updateField(field as keyof typeof form, event.target.value)}
                      readOnly={!editing}
                      className={cn(
                        'rounded-xl border border-[#381932] dark:border-[#381932] px-3.5 py-2.5 text-sm text-[#381932] dark:text-[#FFF3E6] outline-none transition-all',
                        editing ? 'bg-[#FFF3E6] dark:bg-[#381932] focus:ring-2 focus:ring-[#381932]/40' : 'cursor-default bg-[#FFF3E6] dark:bg-[#381932]/60'
                      )}
                    />
                  )}
                </label>
              ))}
              <div className="flex flex-col gap-1.5 text-xs font-semibold text-[#381932] dark:text-[#381932]">
                <span className="flex items-center gap-1.5 text-[#381932] dark:text-[#381932]"><Mail size={14} />Email Address</span>
                <div className="rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932]/60 px-3.5 py-2.5 text-sm font-medium text-[#381932] dark:text-[#381932]">
                  {valueOrEmpty(user.email)}
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <button
                type="submit"
                disabled={!editing || saving}
                className="rounded-xl bg-[#381932] px-5 py-2.5 text-xs font-bold text-[#FFF3E6] shadow-md hover:opacity-90 disabled:cursor-default disabled:opacity-60 cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              {saveMessage && (
                <span className={cn('text-xs font-bold', saveMessage.includes('successfully') ? 'text-[#381932] dark:text-[#381932]' : 'text-[#381932] dark:text-[#381932]')}>
                  {saveMessage}
                </span>
              )}
            </div>
          </form>

          <div className="mt-7 border-t border-[#381932] dark:border-[#381932] pt-6">
            <h2 className="mb-2 text-base font-extrabold text-[#381932] dark:text-[#FFF3E6]">{t.language_preferences || 'Language Preferences'}</h2>
            <select
              value={langCode}
              onChange={e => changeLang(e.target.value as typeof langCode)}
              className="w-full rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3.5 py-2.5 text-xs font-bold text-[#381932] dark:text-[#FFF3E6] sm:max-w-xs outline-none"
            >
              {LANGS.filter(language => ['en', 'kn', 'te', 'ta'].includes(language.code)).map(language => <option key={language.code} value={language.code}>{language.label}</option>)}
            </select>
          </div>
        </section>

        {/* Premium E-commerce My Orders Section */}
        <section className="mt-6 rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs md:p-7">
          <div className="mb-5 flex items-center justify-between border-b border-[#381932] dark:border-[#381932] pb-4">
            <div className="flex items-center gap-2.5">
              <Package size={20} className="text-[#381932] dark:text-[#381932]" />
              <h2 className="text-lg font-black text-[#381932] dark:text-[#FFF3E6]">My Orders &amp; Event Bookings</h2>
            </div>
            <span className="text-xs font-extrabold text-[#381932] dark:text-[#381932]">
              {orders.filter(o => String(o.paymentStatus).toLowerCase() === 'paid' || String(o.paymentStatus).toLowerCase() === 'success').length} confirmed order(s)
            </span>
          </div>

          {ordersLoading ? (
            <div className="rounded-xl border border-dashed border-[#381932] dark:border-[#381932] p-12 text-center text-xs font-bold text-[#381932] dark:text-[#381932]">
              Loading your bookings...
            </div>
          ) : orders.filter(o => String(o.paymentStatus).toLowerCase() === 'paid' || String(o.paymentStatus).toLowerCase() === 'success').length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#381932] dark:border-[#381932] p-12 text-center">
              <Sparkles size={28} className="mx-auto text-[#A78A9F] dark:text-[#381932] mb-2" />
              <div className="text-sm font-bold text-[#381932] dark:text-[#FFF3E6]">No confirmed bookings found</div>
              <p className="text-xs text-[#381932] dark:text-[#381932] mt-1">Explore our premium party &amp; decor packages for your next event.</p>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#381932] px-5 py-2.5 text-xs font-bold text-[#FFF3E6] shadow-md hover:opacity-90 transition-all cursor-pointer"
              >
                Browse Packages
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders
                .filter(o => String(o.paymentStatus).toLowerCase() === 'paid' || String(o.paymentStatus).toLowerCase() === 'success')
                .map((order) => {
                const bookingObj = (Array.isArray(order.bookingDetails) && order.bookingDetails.length > 0)
                  ? order.bookingDetails[0]
                  : (order.booking || {});
                const product = order.product || {};
                const amount = Number(order.grandTotal || order.amount || 0);
                const eventDateVal = bookingObj.eventDate || order.eventDate || 'N/A';
                const eventTimeVal = bookingObj.eventTime || order.eventTime || '';
                const locationVal = bookingObj.location || order.location || order.customer?.address || '';
                const imageSrc = getProductImage(order);
                const orderStatusStr = String(order.orderStatus || 'Pending');

                return (
                  <div
                    key={order._id}
                    className="rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6]/70 dark:bg-[#381932]/60 p-4 sm:p-5 transition-all hover:border-[#381932] dark:hover:border-[#381932]/60 shadow-xs"
                  >
                    {/* Top Bar: Order ID, Date & Workflow Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#381932]/80 dark:border-[#381932]/60 pb-3 mb-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#381932] dark:text-[#FFF3E6] uppercase tracking-wide">
                          {order.orderNumber || `#${order._id.slice(-8)}`}
                        </span>
                        {order.createdAt && (
                          <span className="text-[11px] font-semibold text-[#381932] dark:text-[#381932]">
                            • {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn(
                          "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider",
                          orderStatusStr === 'Completed'
                            ? "bg-[#FFF3E6] dark:bg-[#381932]/60 text-[#381932] dark:text-[#381932] border-[#381932] dark:border-[#381932]"
                            : orderStatusStr === 'Cancelled'
                            ? "bg-[#FFF3E6] dark:bg-[#381932]/60 text-[#381932] dark:text-[#381932] border-[#381932] dark:border-[#381932]"
                            : "bg-[#FFF3E6] dark:bg-[#381932]/60 text-[#381932] dark:text-[#381932] border-[#381932] dark:border-[#381932]"
                        )}>
                          Status: {orderStatusStr}
                        </span>

                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider bg-[#381932] text-[#FFF3E6] border-[#381932] shadow-2xs">
                          ✓ PAID
                        </span>
                      </div>
                    </div>

                    {/* Main Content: Thumbnail, Product Info & Price/CTA */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      
                      {/* Left: Product Thumbnail & Date/Time */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <img
                          src={imageSrc}
                          alt={product.name || order.productName || 'Event Decor'}
                          className="h-16 w-16 rounded-xl object-cover border border-[#381932] dark:border-[#381932] p-0.5 bg-[#FFF3E6] dark:bg-[#381932] shrink-0 shadow-2xs"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/final_logo.jpg'; }}
                        />
                        
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-black text-[#381932] dark:text-[#FFF3E6] truncate">
                            {product.name || order.productName || 'Party Setup'}
                          </h3>

                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#381932] dark:text-[#381932] font-semibold">
                            <span className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-[#381932] dark:text-[#381932]" />
                              <span>Event: <strong>{eventDateVal}</strong></span>
                            </span>
                            {eventTimeVal && (
                              <span className="flex items-center gap-1.5">
                                <Clock size={13} className="text-[#381932] dark:text-[#381932]" />
                                <span>Time: <strong>{eventTimeVal}</strong></span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & View Details CTA */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-[#381932]/80 dark:border-[#381932]/60 pt-3 sm:pt-0 gap-2">
                        <div className="text-left sm:text-right">
                          <div className="text-[10px] uppercase font-extrabold text-[#381932] dark:text-[#381932]">Amount Paid</div>
                          <div className="text-base sm:text-lg font-black text-[#381932] dark:text-[#FFF3E6]">₹{amount.toLocaleString('en-IN')}</div>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate(`/orders/${order._id}`)}
                          className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#381932] hover:opacity-90 text-[#FFF3E6] px-4 py-2 text-xs font-bold shadow-md shadow-[#381932]/20 active:scale-95 transition-all cursor-pointer"
                        >
                          View Details <ChevronRight size={14} />
                        </button>
                      </div>

                    </div>

                    {/* Bottom Venue Address Row */}
                    {locationVal && (
                      <div className="mt-3 flex items-center gap-1.5 border-t border-[#381932]/60 dark:border-[#381932]/60 pt-2.5 text-xs text-[#381932] dark:text-[#381932] font-medium truncate">
                        <MapPin size={13} className="text-[#381932] shrink-0" />
                        <span className="truncate">{locationVal}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Account Actions Section */}
        <section className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between md:p-7">
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-4 py-2.5 text-xs font-bold text-[#381932] dark:text-[#FFF3E6] transition hover:bg-[#FFF3E6] dark:hover:bg-[#381932] cursor-pointer"
          >
            <KeyRound size={16} /> Change Password
          </button>
          <button
            type="button"
            onClick={() => { auth.logout(); navigate('/'); }}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#381932] dark:border-[#381932]/60 bg-[#FFF3E6]/60 dark:bg-[#381932]/40 px-4 py-2.5 text-xs font-bold text-[#381932] dark:text-[#381932] transition hover:bg-[#FFF3E6] dark:hover:bg-[#381932]/60 cursor-pointer"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </section>
      </main>
    </>
  );
}