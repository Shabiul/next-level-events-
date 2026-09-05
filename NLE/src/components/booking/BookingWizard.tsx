import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ShieldCheck,
  Lock,
  Zap,
  Calendar,
  Clock,
  MapPin,
  User,
  Sparkles,
  X,
  CreditCard,
  ChevronRight,
  Camera,
  Video,
  Utensils,
  Flower2,
  Cake,
  PartyPopper,
  Lightbulb,
  Gift,
  type LucideIcon,
} from 'lucide-react';
import { BackButton } from '../ui/BackButton';
import type { AdminProduct, BookingAddonSnapshot, BookingDetails, CartItem } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AddOnCard } from './AddOnCard';
import { getApiUrl } from '../../services/api.service';
import { trackPaymentFailed, trackPurchase, trackWhatsappClick, type GAItem } from '../../utils/analytics';
import AuthContext from '../../context/AuthContext';
import { useCart } from '../../hooks/useCart';
import { cn } from '../../utils/utils';

export interface BookingPageProps {
  product: AdminProduct;
  cartItems?: CartItem[];
  preferredMethod?: 'razorpay' | 'whatsapp';
  selectedAddOns?: BookingAddonSnapshot[];
  onBack: () => void;
  onConfirm: (product: AdminProduct, details: BookingDetails, method: 'razorpay' | 'whatsapp') => void;
}

type PaymentDialogState = {
  kind: 'success' | 'cancelled' | 'failed';
  title: string;
  message: string;
  details?: string;
} | null;

const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const loadRazorpayScript = () => {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if ((window as any).Razorpay) return Promise.resolve(true);

  const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
  if (existingScript) {
    return new Promise<boolean>((resolve) => {
      existingScript.addEventListener('load', () => resolve(Boolean((window as any).Razorpay)), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
    });
  }

  return new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(Boolean((window as any).Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const WA_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

interface AddonPreset extends BookingAddonSnapshot {
  description: string;
  icon: LucideIcon;
  badge?: string;
  /** Override display label, e.g. "From ₹1,500" for variable-price add-ons. */
  priceLabel?: string;
}

// Original curated picks -- prices/descriptions here are just the display
// fallback until the /api/catalog fetch resolves each one's real id + price
// by name (see the catalogPicks effect below).
const CURATED_PICKS: AddonPreset[] = [
  { name: 'Photography', price: 5000, kind: 'addon', description: 'Candid + posed shots of the celebration', icon: Camera },
  { name: 'Videography', price: 7500, kind: 'addon', description: 'Cinematic highlight reel of your event', icon: Video },
  { name: 'Live Catering', price: 3500, kind: 'addon', description: 'Curated snack or dessert counter with live service', icon: Utensils, badge: 'POPULAR' },
  { name: 'Flower Decoration', price: 3000, kind: 'addon', description: 'Fresh floral accents across the backdrop & table', icon: Flower2 },
  { name: 'LED Numbers', price: 1500, kind: 'addon', description: 'Warm-glow numeral lights for the backdrop', icon: Lightbulb },
  { name: 'Custom Cake', price: 2500, kind: 'addon', description: 'Themed cake styled to match your celebration', icon: Cake },
  { name: 'Return Gifts', price: 1500, kind: 'addon', description: 'Curated take-home favours for your guests', icon: Gift, priceLabel: 'From ₹1,500' },
  { name: 'Premium Balloon Upgrade', price: 2500, kind: 'addon', description: 'Premium foil & organic balloon styling upgrade', icon: PartyPopper },
];

const toBookingSnapshot = (preset: AddonPreset): BookingAddonSnapshot => ({
  id: preset.id,
  name: preset.name,
  price: preset.price,
  kind: preset.kind,
});

export const BookingWizard: React.FC<BookingPageProps> = ({
  product,
  cartItems = [],
  preferredMethod = 'razorpay',
  selectedAddOns = [],
  onBack,
  onConfirm,
}) => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const { clearCart } = useCart();

  const user = auth?.user || null;
  const [form, setForm] = useState<BookingDetails>({
    name: '',
    email: '',
    mobile: '',
    location: '',
    eventDate: '',
    eventTime: '',
    requests: '',
    addOns: selectedAddOns,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'whatsapp'>(preferredMethod);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentDialog, setPaymentDialog] = useState<PaymentDialogState>(null);

  // Real, backend-priced catalog for the "Popular Celebration Enhancements"
  // quick picker -- these 8 curated names/icons are the original design; the
  // ids used to be fake local placeholders ("preset-led-numbers" etc.) that
  // don't exist in the addons table, so the server's authoritative pricing
  // always rejected them with "Selected package is unavailable" the moment
  // one was selected. They're now real seeded addon rows -- fetch /api/catalog
  // (same one AddonsModule uses) and match by name to pick up the real id and
  // admin-managed price, so the picker keeps its original look but actually
  // prices correctly.
  const [catalogPicks, setCatalogPicks] = useState<AddonPreset[]>(CURATED_PICKS);
  useEffect(() => {
    let cancelled = false;
    fetch(getApiUrl('/api/catalog'))
      .then((res) => (res.ok ? res.json() : { addons: [], activities: [] }))
      .then((data) => {
        if (cancelled) return;
        const byName = new Map<string, any>();
        for (const item of [...(data.addons || []), ...(data.activities || [])]) {
          if (item?.name) byName.set(String(item.name).toLowerCase(), item);
        }
        setCatalogPicks(CURATED_PICKS.map((preset) => {
          const match = byName.get(preset.name.toLowerCase());
          return match ? { ...preset, id: String(match._id || match.id), price: Number(match.price) || preset.price } : preset;
        }));
      })
      .catch(() => { if (!cancelled) setCatalogPicks(CURATED_PICKS); });
    return () => { cancelled = true; };
  }, []);

  const minDateString = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, []);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const nameTrimmed = form.name.trim();
  const isNameValid = nameTrimmed.length >= 3 && nameTrimmed.length <= 60 && !/^\d+$/.test(nameTrimmed);
  const nameError = touched.name && !isNameValid
    ? (nameTrimmed.length === 0 ? 'Full Name is required.' : 'Name must be 3-60 characters.')
    : undefined;

  const cleanPhone = form.mobile.replace(/\D/g, '');
  const isPhoneValid = cleanPhone.length === 10;
  const phoneError = touched.mobile && !isPhoneValid
    ? 'Enter a valid 10-digit mobile number.'
    : undefined;

  const emailTrimmed = (form.email || '').trim();
  const isEmailValid = emailTrimmed.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);
  const emailError = touched.email && !isEmailValid
    ? 'Enter a valid email address.'
    : undefined;

  const isDateValid = Boolean(form.eventDate && form.eventDate >= minDateString);
  const dateError = touched.eventDate && !isDateValid
    ? 'Please select a date from tomorrow onwards.'
    : undefined;

  const isTimeValid = Boolean(form.eventTime);
  const timeError = touched.eventTime && !isTimeValid
    ? 'Please select an event start time.'
    : undefined;

  const locationTrimmed = form.location.trim();
  const isLocationValid = locationTrimmed.length >= 10 && locationTrimmed.length <= 250;
  const locationError = touched.location && !isLocationValid
    ? (locationTrimmed.length === 0 ? 'Venue address is required.' : 'Location address must be at least 10 characters.')
    : undefined;

  const isFormValid = isNameValid && isPhoneValid && isEmailValid && isDateValid && isTimeValid && isLocationValid;

  const markAllTouched = () => {
    setTouched({
      name: true,
      mobile: true,
      email: true,
      eventDate: true,
      eventTime: true,
      location: true,
    });
  };

  const isMultiItem = cartItems && cartItems.length > 0;
  const packagesSubtotal = useMemo(() => {
    if (isMultiItem) {
      return cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
    }
    return Number(product.price) || 0;
  }, [isMultiItem, cartItems, product.price]);

  const addOnsSubtotal = useMemo(() => {
    return form.addOns.reduce((sum, addon) => sum + (Number(addon.price) || 0) * (Number(addon.qty) || 1), 0);
  }, [form.addOns]);

  const totalPrice = packagesSubtotal + addOnsSubtotal;
  const bookingPayload = { ...form, mobile: cleanPhone, name: nameTrimmed, location: locationTrimmed, addOns: form.addOns };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPaymentMethod(preferredMethod);
    setForm(prev => ({ ...prev, addOns: selectedAddOns }));
  }, [product, preferredMethod, selectedAddOns]);

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: user.email || '',
        mobile: prev.mobile || user.phone || '',
      }));
    }
  }, [user]);

  const removeAddon = (idOrName: string) => {
    setForm(prev => ({
      ...prev,
      addOns: prev.addOns.filter(a => (a.id || a.name) !== idOrName && a.name !== idOrName),
    }));
  };

  /**
   * The single booking payload sent to the backend. The server ignores every
   * money field here and recomputes the price + payable amount from the
   * database -- these values are only for display / snapshots.
   */
  const buildOrderPayload = (
    paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled',
    paymentMeta?: { razorpayOrderId?: string; razorpayPaymentId?: string; razorpaySignature?: string }
  ) => {
    const formattedItems = isMultiItem
      ? cartItems.map(item => ({
          productId: item._id,
          _id: item._id,
          id: item._id,
          name: item.name,
          productName: item.name,
          image: item.image,
          price: item.price,
          qty: item.qty,
          categoryName: item.categoryName,
          subcategory: item.subcategory,
          addons: (item.bookingDetails?.[0]?.addOns || []).filter(a => a.kind !== 'activity'),
          activities: (item.bookingDetails?.[0]?.addOns || []).filter(a => a.kind === 'activity'),
        }))
      : undefined;

    return {
      productId: product._id,
      productName: isMultiItem
        ? cartItems.map(i => `${i.name}${i.qty > 1 ? ` (x${i.qty})` : ''}`).join(' + ')
        : product.name,
      productImage: product.image,
      product: {
        id: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        categoryName: product.categoryName,
        subcategory: product.subcategory,
      },
      categoryName: isMultiItem ? 'Multi-Package' : product.categoryName,
      subcategory: isMultiItem ? '' : product.subcategory,
      packagePrice: packagesSubtotal,
      amount: totalPrice,
      paymentMethod,
      paymentStatus,
      customer: {
        name: user?.name || nameTrimmed,
        email: user?.email || emailTrimmed,
        phone: user?.phone || cleanPhone,
      },
      items: formattedItems,
      addons: form.addOns.filter((item) => item.kind !== 'activity'),
      activities: form.addOns.filter((item) => item.kind === 'activity'),
      bookingDetails: [{ ...bookingPayload, email: user?.email || emailTrimmed || '', addOns: form.addOns }],
      razorpayOrderId: paymentMeta?.razorpayOrderId,
      razorpayPaymentId: paymentMeta?.razorpayPaymentId,
      razorpaySignature: paymentMeta?.razorpaySignature,
    };
  };

  const createBookingOrder = async (
    paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled',
    paymentMeta?: { razorpayOrderId?: string; razorpayPaymentId?: string; razorpaySignature?: string; }
  ) => {
    const token = getAuthToken();
    const response = await fetch(getApiUrl('/api/orders'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(buildOrderPayload(paymentStatus, paymentMeta)),
    });

    const responseBody = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(responseBody?.error || responseBody?.message || 'Unable to save booking.');
    }

    return responseBody;
  };

  const updateField = (field: keyof BookingDetails, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const openWhatsApp = async () => {
    trackWhatsappClick('checkout_page', product._id, product.name);
    const selectedSummary = form.addOns.length > 0
      ? ['*Selected Add-ons / Activities:*', ...form.addOns.map(addon => `- ${addon.name} (+₹${addon.price.toLocaleString('en-IN')})`)]
      : [];
    const packageInfo = isMultiItem
      ? cartItems.map(i => `*Package:* ${i.name} (x${i.qty}) — ₹${(i.price * i.qty).toLocaleString('en-IN')}`).join('\n')
      : `*Package:* ${product.name}\n*Category:* ${product.categoryName}${product.subcategory ? ` > ${product.subcategory}` : ''}`;

    const message = [
      '*New Booking Request — The Decor Party*',
      '',
      packageInfo,
      `*Amount:* ₹${totalPrice.toLocaleString('en-IN')}`,
      '',
      ...selectedSummary,
      '',
      `*Event Date:* ${form.eventDate}`,
      `*Event Time:* ${form.eventTime}`,
      `*Venue Address:* ${form.location}`,
      `*Contact Person:* ${nameTrimmed} (${cleanPhone})`,
      ...(form.email ? [`*Email:* ${form.email}`] : []),
      ...(form.requests ? [`*Special Requests:* ${form.requests}`] : []),
      '',
      'Please confirm slot availability and payment schedule. Thank you!',
    ].filter(Boolean).join('\n');

    try {
      await createBookingOrder('pending');
      clearCart();
    } catch (e) {
      console.warn('Draft order save before WhatsApp redirect failed', e);
    }

    window.open(`https://wa.me/917022058460?text=${encodeURIComponent(message)}`, '_blank');
  };

  const startPayment = async () => {
    setError('');
    setLoading(true);

    const savePaymentOutcome = async (
      status: 'paid' | 'failed' | 'cancelled',
      meta?: { razorpayOrderId?: string; razorpayPaymentId?: string; razorpaySignature?: string },
      dialog?: PaymentDialogState
    ) => {
      setLoading(false);

      try {
        const createdOrder = await createBookingOrder(status, meta);
        if (dialog) {
          setPaymentDialog(dialog);
        }
        return createdOrder;
      } catch (err: any) {
        console.error(`Failed to save ${status} booking:`, err);
        const errorMessage = err?.message || 'Unable to save booking.';
        setError(`Payment processed, but order could not be saved: ${errorMessage}`);
        if (dialog) {
          setPaymentDialog(dialog);
        }
        return null;
      }
    };

    try {
      const createToken = getAuthToken();
      const response = await fetch(getApiUrl('/api/payment/create-order'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(createToken ? { Authorization: `Bearer ${createToken}` } : {}),
        },
        body: JSON.stringify({
          receipt: `booking-${product._id}-${Date.now()}`,
          notes: {
            productId: product._id,
            productName: isMultiItem ? cartItems.map(i => i.name).join(' + ') : product.name,
            customerName: nameTrimmed,
            contact: cleanPhone,
          },
          // Server recomputes the amount from this payload against the DB.
          orderPayload: buildOrderPayload('pending'),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || err?.message || 'Unable to start payment.');
      }

      const order = await response.json();
      const scriptLoaded = razorpayKey ? await loadRazorpayScript() : false;

      if (!razorpayKey || !scriptLoaded || !(window as any).Razorpay) {
        const token = getAuthToken();
        const verifyResponse = await fetch(getApiUrl('/api/payment/verify'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            razorpay_order_id: order.id,
            razorpay_payment_id: `pay_sim_${Date.now()}`,
            razorpay_signature: 'simulated_signature',
            orderPayload: buildOrderPayload('paid', { razorpayOrderId: order.id }),
          }),
        });

        const verifyBody = await verifyResponse.json().catch(() => null);
        if (!verifyResponse.ok) {
          throw new Error(verifyBody?.error || verifyBody?.message || 'Payment verification failed.');
        }

        clearCart();
        onConfirm(product, bookingPayload, 'razorpay');
        const purchasedItems: GAItem[] = [
          ...(isMultiItem
            ? cartItems.map((item) => ({
                item_id: item._id,
                item_name: item.name,
                item_category: item.categoryName,
                item_subcategory: item.subcategory,
                price: item.price,
                quantity: item.qty,
              }))
            : [
                {
                  item_id: product._id,
                  item_name: product.name,
                  item_category: product.categoryName,
                  item_subcategory: product.subcategory,
                  price: product.price,
                  quantity: 1,
                },
              ]),
          ...form.addOns.map((addon) => ({
            item_id: `addon-${addon.name.toLowerCase().replace(/\s+/g, '_')}`,
            item_name: addon.name,
            price: addon.price,
            quantity: 1,
          })),
        ];
        trackPurchase(`order-${Date.now()}`, totalPrice, purchasedItems);
        setLoading(false);
        toast.success('Payment successful! Your booking is confirmed.');
        navigate('/bookings');
        return;
      }

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: 'The Decor Party',
        description: `Booking: ${product.name}`,
        image: 'https://www.thedecorparty.com/final_logo.jpg',
        prefill: {
          name: user?.name || nameTrimmed,
          email: user?.email || emailTrimmed || '',
          contact: cleanPhone,
        },
        notes: {
          productId: product._id,
          productName: product.name,
          customer: nameTrimmed,
          mobile: cleanPhone,
        },
        theme: {
          color: '#381932',
        },
        modal: {
          ondismiss: async () => {
            await savePaymentOutcome('cancelled', undefined, {
              kind: 'cancelled',
              title: 'Payment Cancelled',
              message: 'Your booking has not been processed.',
              details: 'You can retry payment whenever you are ready.',
            });
          },
        },
        handler: async (paymentResponse: any) => {
          try {
            setLoading(true);
            const token = getAuthToken();
            const verifyResponse = await fetch(getApiUrl('/api/payment/verify'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                orderPayload: buildOrderPayload('paid', {
                  razorpayOrderId: paymentResponse.razorpay_order_id,
                  razorpayPaymentId: paymentResponse.razorpay_payment_id,
                  razorpaySignature: paymentResponse.razorpay_signature,
                }),
              }),
            });

            const verifyBody = await verifyResponse.json().catch(() => null);

            if (!verifyResponse.ok) {
              throw new Error(verifyBody?.error || 'Payment verification failed.');
            }

            clearCart();
            onConfirm(product, bookingPayload, 'razorpay');
            const purchasedItems: GAItem[] = [
              ...(isMultiItem
                ? cartItems.map((item) => ({
                    item_id: item._id,
                    item_name: item.name,
                    item_category: item.categoryName,
                    item_subcategory: item.subcategory,
                    price: item.price,
                    quantity: item.qty,
                  }))
                : [
                    {
                      item_id: product._id,
                      item_name: product.name,
                      item_category: product.categoryName,
                      item_subcategory: product.subcategory,
                      price: product.price,
                      quantity: 1,
                    },
                  ]),
              ...form.addOns.map((addon) => ({
                item_id: `addon-${addon.name.toLowerCase().replace(/\s+/g, '_')}`,
                item_name: addon.name,
                price: addon.price,
                quantity: 1,
              })),
            ];
            trackPurchase(paymentResponse.razorpay_payment_id || `order-${Date.now()}`, totalPrice, purchasedItems);

            const createdOrder = verifyBody?.order || verifyBody;
            const orderId = createdOrder?._id || createdOrder?.id || createdOrder?.orderId;

            toast.success('Payment successful! Your booking is confirmed.');

            if (orderId && typeof orderId === 'string' && orderId.length > 5) {
              navigate(`/orders/${orderId}`, { replace: true });
            } else {
              navigate('/bookings', { replace: true });
            }
          } catch (err: any) {
            trackPaymentFailed(err?.message || 'Payment verification failed', product._id, totalPrice);
            setError(err?.message || 'Payment verification failed.');
            setLoading(false);
          }
        },
      };

      const rz = new (window as any).Razorpay(options);
      rz.on('payment.failed', async (resp: any) => {
        const reason = resp?.error?.description || resp?.error?.reason || 'Your payment could not be completed.';
        trackPaymentFailed(reason, product._id, totalPrice);
        await savePaymentOutcome('failed', undefined, {
          kind: 'failed',
          title: 'Payment Failed',
          message: "We couldn't complete your transaction.",
          details: reason,
        });
      });
      rz.open();
    } catch (err: any) {
      trackPaymentFailed();
      setError(
        typeof err === 'string'
          ? err
          : err?.message || err?.error?.description || 'Payment initialization failed.'
      );
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    markAllTouched();

    const missingFields: string[] = [];
    if (!isNameValid) missingFields.push('Full Name');
    if (!isPhoneValid) missingFields.push('10-Digit Mobile Number');
    if (!isEmailValid) missingFields.push('Valid Email Address');
    if (!isDateValid) missingFields.push('Event Date');
    if (!isTimeValid) missingFields.push('Event Start Time');
    if (!isLocationValid) missingFields.push('Venue Address');

    if (missingFields.length > 0) {
      setError(`Please complete the required fields: ${missingFields.join(', ')}.`);
      return;
    }

    setError('');
    if (paymentMethod === 'razorpay') {
      await startPayment();
    } else {
      openWhatsApp();
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent text-[#381932] dark:text-[#FFF3E6] font-sans antialiased transition-colors pb-24 overflow-x-hidden">
      
      {/* FIXED ENTIRE PAGE BALLOON WALLPAPER BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img 
          src="/cards-bg.jpg" 
          alt="Fixed Lavender Floral Balloon Wallpaper" 
          className="w-full h-full object-cover opacity-100 scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFF3E6]/75 via-[#FFF3E6]/80 to-[#FFF3E6]/90 dark:from-[#381932]/85 dark:via-[#381932]/90 dark:to-[#381932] backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 py-8 sm:px-6 md:px-8 animate-fade-in pt-24">
        {/* Top Breadcrumb */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[#381932] dark:text-[#381932]">
            <BackButton onClick={onBack} className="hover:text-[#381932] dark:hover:text-[#FFF3E6]">
              Back to Package
            </BackButton>
            <span>/</span>
            <span className="font-semibold text-[#381932] dark:text-[#FFF3E6]">Checkout</span>
          </div>

          {/* 3-Step Progress */}
          <div className="rounded-xl border border-[#381932]/40 bg-[#FFF3E6]/90 dark:bg-[#381932]/90 dark:border-[#381932] p-4 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between max-w-xl mx-auto relative">
              <div className="flex items-center gap-2 z-10">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#381932] text-[#FFF3E6] text-xs font-bold dark:bg-[#FFF3E6] dark:text-[#381932]">
                  1
                </div>
                <span className="text-xs sm:text-sm font-semibold text-[#381932] dark:text-[#FFF3E6]">Event Details</span>
              </div>

              <div className="absolute left-[20%] right-[20%] top-1/2 -translate-y-1/2 h-px bg-[#FFF3E6] dark:bg-[#381932]" />

              <div className="flex items-center gap-2 z-10">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFF3E6] text-[#381932] text-xs font-semibold dark:bg-[#381932] dark:text-[#381932]">
                  2
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#381932] dark:text-[#381932] hidden sm:inline">Review</span>
              </div>

              <div className="flex items-center gap-2 z-10">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFF3E6] text-[#381932] text-xs font-semibold dark:bg-[#381932] dark:text-[#381932]">
                  3
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#381932] dark:text-[#381932] hidden sm:inline">Confirmation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: Form Cards */}
          <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>

              {/* 1. Contact Info */}
              <div className="rounded-xl border border-[#381932]/40 bg-[#FFF3E6]/90 dark:bg-[#381932]/90 dark:border-[#381932] p-5 sm:p-6 shadow-xl backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-2 border-b border-[#381932]/30 dark:border-[#381932] pb-3">
                  <User size={16} className="text-[#381932] dark:text-[#FFF3E6]" />
                  <h2 className="font-editorial text-base font-bold text-[#381932] dark:text-[#FFF3E6]">1. Contact Information</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Full Name"
                    id="name"
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={form.name}
                    onChange={e => updateField('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    required
                    error={nameError}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="mobile" className="text-xs font-semibold tracking-wide uppercase text-[#381932] dark:text-[#381932]">
                      Mobile Number <span className="text-[#381932] ml-0.5">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs font-semibold text-[#381932] border-r border-[#381932]/30 dark:border-[#381932] pr-2">
                        +91
                      </span>
                      <input
                        id="mobile"
                        type="tel"
                        inputMode="numeric"
                        placeholder="9876543210"
                        value={form.mobile}
                        onChange={e => updateField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        onBlur={() => handleBlur('mobile')}
                        required
                        className={cn(
                          'w-full h-10 rounded-lg border bg-[#FFF3E6] dark:bg-[#381932] pl-16 pr-3.5 text-sm text-[#381932] dark:text-[#FFF3E6] placeholder:text-[#381932]/60 outline-none transition-all',
                          phoneError
                            ? 'border-[#381932]'
                            : 'border-[#381932]/30 dark:border-[#381932] focus:border-[#381932] focus:ring-1 focus:ring-[#381932]'
                        )}
                      />
                    </div>
                    {phoneError && <p className="text-xs text-[#381932] font-medium">{phoneError}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <Input
                    label="Email Address"
                    id="email"
                    type="email"
                    placeholder="name@domain.com"
                    value={form.email || ''}
                    onChange={e => updateField('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    error={emailError}
                  />
                </div>
              </div>

              {/* 2. Setup Details */}
              <div className="rounded-xl border border-[#381932]/40 bg-[#FFF3E6]/90 dark:bg-[#381932]/90 dark:border-[#381932] p-5 sm:p-6 shadow-xl backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-2 border-b border-[#381932]/30 dark:border-[#381932] pb-3">
                  <Calendar size={16} className="text-[#381932] dark:text-[#FFF3E6]" />
                  <h2 className="font-editorial text-base font-bold text-[#381932] dark:text-[#FFF3E6]">2. Event Schedule &amp; Venue</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Event Date"
                    id="eventDate"
                    type="date"
                    min={minDateString}
                    value={form.eventDate}
                    onChange={e => updateField('eventDate', e.target.value)}
                    onBlur={() => handleBlur('eventDate')}
                    required
                    error={dateError}
                    hint="Select tomorrow or any upcoming celebration date"
                  />

                  <Input
                    label="Event Start Time"
                    id="eventTime"
                    type="time"
                    value={form.eventTime}
                    onChange={e => updateField('eventTime', e.target.value)}
                    onBlur={() => handleBlur('eventTime')}
                    required
                    error={timeError}
                  />
                </div>

                <div className="mt-4">
                  <Input
                    label="Complete Venue Address"
                    id="location"
                    type="text"
                    placeholder="Flat/House No, Apartment name, Street, Area, Bengaluru"
                    value={form.location}
                    onChange={e => updateField('location', e.target.value)}
                    onBlur={() => handleBlur('location')}
                    required
                    error={locationError}
                  />
                </div>
              </div>

              {/* 3. Add-ons & Experience Upgrades */}
              <div className="rounded-xl border border-[#381932]/40 bg-[#FFF3E6]/90 dark:bg-[#381932]/90 dark:border-[#381932] p-5 sm:p-6 shadow-xl backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between border-b border-[#381932]/30 dark:border-[#381932] pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#A78A9F]" />
                    <h2 className="font-editorial text-base font-bold text-[#381932] dark:text-[#FFF3E6]">3. Selected Add-ons &amp; Upgrades</h2>
                  </div>
                  <span className="text-xs font-semibold text-[#381932] dark:text-[#381932]">
                    {form.addOns.length} selected
                  </span>
                </div>

                {/* Active Selected Addons List */}
                {form.addOns.length > 0 && (
                  <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {form.addOns.map((addon) => (
                      <div
                        key={addon.id || addon.name}
                        className="flex items-center justify-between gap-3 rounded-lg border border-[#381932] bg-[#A78A9F]/12 p-2.5 dark:bg-[#381932] dark:border-[#381932]/50 shadow-xs"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-xs font-semibold text-[#381932] dark:text-[#FFF3E6] flex items-center gap-1">
                            <Sparkles size={11} className="text-[#A78A9F] dark:text-[#381932]" />
                            {addon.name}
                          </div>
                          <div className="text-[11px] font-bold text-[#381932] dark:text-[#381932]">
                            +₹{addon.price.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeAddon(addon.id || addon.name)}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[#381932] hover:text-[#381932] hover:bg-[#FFF3E6] dark:hover:bg-[#381932]/40 transition-colors cursor-pointer"
                          title="Remove Add-on"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Popular Add-ons Quick Picker -- compact catalogue-style cards,
                    4 cols desktop -> 2 cols tablet/mobile */}
                <div className="mt-2">
                  <p className="text-xs font-bold text-[#381932] dark:text-[#381932] mb-2.5 uppercase tracking-wider">
                    Popular Celebration Enhancements:
                  </p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {catalogPicks.map((preset) => {
                      const isSelected = form.addOns.some(a => a.name === preset.name || (preset.id && a.id === preset.id));
                      return (
                        <AddOnCard
                          key={preset.id || preset.name}
                          title={preset.name}
                          description={preset.description}
                          price={preset.price}
                          priceLabel={preset.priceLabel}
                          icon={preset.icon}
                          badge={preset.badge}
                          selected={isSelected}
                          onToggle={() => {
                            if (isSelected) {
                              removeAddon(preset.id || preset.name);
                            } else {
                              setForm(prev => ({ ...prev, addOns: [...prev.addOns, toBookingSnapshot(preset)] }));
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 4. Special Requests */}
              <div className="rounded-xl border border-[#381932]/40 bg-[#FFF3E6]/90 dark:bg-[#381932]/90 dark:border-[#381932] p-5 sm:p-6 shadow-xl backdrop-blur-xl">
                <label htmlFor="requests" className="block text-xs font-semibold uppercase tracking-wide text-[#381932] dark:text-[#FFF3E6] mb-2">
                  4. Special Notes or Customisation Requests (Optional)
                </label>
                <textarea
                  id="requests"
                  value={form.requests}
                  onChange={e => updateField('requests', e.target.value)}
                  placeholder="Mention theme color changes, surprise timings, names to display on board..."
                  rows={3}
                  className="w-full rounded-lg border border-[#381932]/30 bg-[#FFF3E6] p-3 text-xs text-[#381932] outline-none placeholder:text-[#381932]/60 focus:border-[#381932] focus:ring-1 focus:ring-[#381932] dark:bg-[#381932] dark:border-[#381932] dark:text-[#FFF3E6]"
                />
              </div>

              {/* 5. Payment Selection */}
              <div className="rounded-xl border border-[#381932]/40 bg-[#FFF3E6]/90 dark:bg-[#381932]/90 dark:border-[#381932] p-5 sm:p-6 shadow-xl backdrop-blur-xl">
                <h2 className="font-editorial text-base font-bold text-[#381932] dark:text-[#FFF3E6] mb-3">5. Payment Method</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentMethod('razorpay')}
                    className={cn(
                      'flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all',
                      paymentMethod === 'razorpay'
                        ? 'border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] dark:border-[#FFF3E6]'
                        : 'border-[#381932]/30 bg-[#FFF3E6] dark:bg-[#381932] dark:border-[#381932]'
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="mt-0.5 accent-[#381932]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#381932] dark:text-[#FFF3E6]">
                        <CreditCard size={14} /> Pay via Razorpay
                      </div>
                      <p className="mt-0.5 text-[11px] text-[#381932] dark:text-[#381932]">
                        Instant confirmation via UPI, Cards, Netbanking.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('whatsapp')}
                    className={cn(
                      'flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all',
                      paymentMethod === 'whatsapp'
                        ? 'border-[#381932] bg-[#FFF3E6]/50 dark:bg-[#381932]/20'
                        : 'border-[#381932]/30 bg-[#FFF3E6] dark:bg-[#381932] dark:border-[#381932]'
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="whatsapp"
                      checked={paymentMethod === 'whatsapp'}
                      onChange={() => setPaymentMethod('whatsapp')}
                      className="mt-0.5 accent-[#381932]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#381932] dark:text-[#381932]">
                        {WA_SVG} Confirm via WhatsApp
                      </div>
                      <p className="mt-0.5 text-[11px] text-[#381932] dark:text-[#381932]">
                        Send details to decor manager for manual invoicing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-[#381932] bg-[#FFF3E6] p-3 text-xs font-semibold text-[#381932] dark:bg-[#381932]/40 dark:text-[#381932]">
                  {error}
                </div>
              )}

              {/* Submit button on desktop */}
              <div className="hidden sm:flex flex-col gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  disabled={!isFormValid || loading}
                  className="w-full justify-center rounded-xl"
                >
                  {paymentMethod === 'razorpay' ? 'Proceed to Payment' : 'Confirm via WhatsApp'}
                </Button>
              </div>
            </form>
          </section>

          {/* Right Column: Order Summary Sidebar */}
          <aside className="lg:col-span-5 xl:col-span-4 sticky top-24">
            <div className="rounded-xl border border-[#381932]/40 bg-[#FFF3E6]/90 dark:bg-[#381932]/90 dark:border-[#381932] p-5 shadow-xl backdrop-blur-xl flex flex-col gap-4">
              <div className="border-b border-[#381932]/30 dark:border-[#381932] pb-3">
                <h2 className="font-editorial text-sm font-bold uppercase tracking-wider text-[#381932] dark:text-[#FFF3E6]">
                  Booking Summary
                </h2>
              </div>

              {isMultiItem ? (
                <div className="flex flex-col gap-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#381932]/80 dark:text-[#FFF3E6]/80">
                    Selected Packages ({cartItems.length})
                  </div>
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex gap-2.5 items-center rounded-lg border border-[#381932]/20 dark:border-[#381932]/40 p-2 bg-[#FFF3E6]/50 dark:bg-[#381932]/30">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-11 w-11 rounded-md object-cover bg-[#FFF3E6] dark:bg-[#381932] border border-[#381932]/20 dark:border-[#381932]/40 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-bold text-[#381932] dark:text-[#FFF3E6] truncate">{item.name}</h3>
                        <p className="text-[10px] text-[#381932]/70 dark:text-[#FFF3E6]/70">
                          {item.categoryName} {item.qty > 1 ? `· Qty: ${item.qty}` : ''}
                        </p>
                      </div>
                      <div className="text-xs font-bold text-[#381932] dark:text-[#FFF3E6]">
                        ₹{(item.price * item.qty).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 items-center">
                  <img src={product.image} alt={product.name} className="h-14 w-14 rounded-lg object-cover bg-[#FFF3E6] dark:bg-[#381932] border border-[#381932]/30 dark:border-[#381932] flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-[#381932] dark:text-[#FFF3E6] truncate">{product.name}</h3>
                    <p className="text-[11px] text-[#381932] dark:text-[#381932]">{product.categoryName}</p>
                  </div>
                </div>
              )}

              {(form.eventDate || form.eventTime || locationTrimmed) && (
                <div className="rounded-lg border border-[#381932]/30 bg-[#FFF3E6] p-2.5 flex flex-col gap-1.5 text-xs text-[#381932] dark:bg-[#381932] dark:border-[#381932] dark:text-[#FFF3E6]">
                  {form.eventDate && (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Calendar size={13} className="text-[#381932]" />
                      <span>{form.eventDate}</span>
                    </div>
                  )}
                  {form.eventTime && (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Clock size={13} className="text-[#381932]" />
                      <span>{form.eventTime}</span>
                    </div>
                  )}
                  {locationTrimmed && (
                    <div className="flex items-start gap-1.5 text-[11px]">
                      <MapPin size={13} className="text-[#381932] flex-shrink-0 mt-0.5" />
                      <span className="truncate">{locationTrimmed}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Price lines */}
              <div className="flex flex-col gap-2 border-t border-[#381932]/30 dark:border-[#381932] pt-3 text-xs">
                <div className="flex items-center justify-between text-[#381932] dark:text-[#381932]">
                  <span>{isMultiItem ? `Packages Total (${cartItems.reduce((s, i) => s + i.qty, 0)} items)` : 'Base Package'}</span>
                  <span className="font-semibold text-[#381932] dark:text-[#FFF3E6]">₹{packagesSubtotal.toLocaleString('en-IN')}</span>
                </div>

                {form.addOns.map((addon) => (
                  <div key={addon.id || addon.name} className="flex items-center justify-between text-[#381932] dark:text-[#381932]">
                    <span className="truncate pr-2">{addon.name}</span>
                    <span className="font-semibold text-[#381932] dark:text-[#FFF3E6] flex-shrink-0">
                      +₹{addon.price?.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-[#381932]/30 dark:border-[#381932] pt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#381932] block">Total Payable</span>
                  <span className="text-xl font-bold text-[#381932] dark:text-[#FFF3E6]">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <span className="text-[10px] font-semibold text-[#381932] bg-[#FFF3E6] dark:bg-[#381932]/60 px-2 py-0.5 rounded-full">
                  GST Included
                </span>
              </div>

              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => {
                  const fakeEvent = { preventDefault: () => {} } as any;
                  handleSubmit(fakeEvent);
                }}
                disabled={loading}
                className="w-full justify-center rounded-xl"
              >
                <span>{paymentMethod === 'razorpay' ? 'Proceed to Payment' : 'Confirm via WhatsApp'}</span>
                <ChevronRight size={14} />
              </Button>

              <div className="border-t border-[#381932]/30 dark:border-[#381932] pt-3 flex flex-col gap-1.5 text-[11px] text-[#381932] dark:text-[#381932]">
                <span className="flex items-center gap-1.5"><Lock size={12} className="text-[#381932] dark:text-[#FFF3E6]" /> Secure 256-bit encrypted checkout</span>
                <span className="flex items-center gap-1.5"><Zap size={12} className="text-[#381932] dark:text-[#FFF3E6]" /> Instant slot confirmation</span>
                <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-[#381932] dark:text-[#FFF3E6]" /> Free rescheduling 48 hrs before event</span>
              </div>
            </div>
          </aside>
        </div>

        {/* Dialog Modal */}
        {paymentDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#381932]/40 backdrop-blur-xs px-4 py-6 animate-fade-in">
            <div className="w-full max-w-md rounded-2xl border border-[#381932]/30 bg-[#FFF3E6] p-6 shadow-modal dark:bg-[#381932] dark:border-[#381932]" role="dialog">
              <h3 className="text-base font-bold text-[#381932] dark:text-[#FFF3E6]">{paymentDialog.title}</h3>
              <p className="mt-1 text-xs text-[#381932] dark:text-[#381932]">{paymentDialog.message}</p>
              {paymentDialog.details && (
                <p className="mt-2 text-xs font-medium text-[#381932] dark:text-[#FFF3E6]">{paymentDialog.details}</p>
              )}
              <div className="mt-5 flex gap-2 justify-end">
                <Button type="button" variant="primary" size="sm" onClick={() => setPaymentDialog(null)}>
                  OK
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Sticky Mobile Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#381932]/30 bg-[#FFF3E6]/95 backdrop-blur-xs p-3 shadow-modal sm:hidden flex items-center justify-between gap-3 dark:bg-[#381932]/95 dark:border-[#381932]">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#381932]">Total</div>
            <div className="text-base font-bold text-[#381932] dark:text-[#FFF3E6]">₹{totalPrice.toLocaleString('en-IN')}</div>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              const fakeEvent = { preventDefault: () => {} } as any;
              handleSubmit(fakeEvent);
            }}
            disabled={loading}
            className="rounded-lg text-xs"
          >
            {paymentMethod === 'razorpay' ? 'Pay Now' : 'WhatsApp'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingWizard;
