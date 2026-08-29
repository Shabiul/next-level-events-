import { useCallback, useEffect, useRef, useState } from 'react';
import type { CartItem, AdminProduct, BookingDetails } from '../types';
import { useAuth } from './useAuth';
import { getApiUrl, authFetch } from '../services/api.service';

const LS_KEY = 'cart';

const readLocal = (): CartItem[] => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
};
const writeLocal = (items: CartItem[]) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch { /* ignore */ }
};

/** Map a backend cart line into the client CartItem shape. */
function fromServer(row: any): CartItem {
  return {
    _id: String(row.productId),
    name: row.name || '',
    image: row.image || '',
    price: Number(row.price) || 0,
    originalPrice: row.originalPrice != null ? Number(row.originalPrice) : undefined,
    categoryName: row.categoryName || '',
    badge: row.badge,
    badgeColor: row.badgeColor,
    qty: Number(row.qty) || 1,
    bookingDetails: [],
  } as CartItem;
}

/**
 * Cart state. For a signed-in customer it is backed by the server (prices are
 * always recomputed from the DB there); for a guest it lives in localStorage
 * and is merged into the account on the next login.
 */
export function useCart() {
  const auth = useAuth();
  const loggedIn = auth.isLoggedIn && !!auth.user?.id;
  const [items, setItems] = useState<CartItem[]>(() => readLocal());
  const mergedFor = useRef<string | null>(null);

  const applyServer = useCallback((data: any) => {
    const rows = Array.isArray(data?.items) ? data.items.map(fromServer) : [];
    setItems(rows);
  }, []);

  // Load / merge when auth state settles.
  useEffect(() => {
    if (!loggedIn) {
      mergedFor.current = null;
      setItems(readLocal());
      return;
    }
    const uid = auth.user!.id;
    let cancelled = false;

    (async () => {
      try {
        const guest = readLocal();
        if (guest.length && mergedFor.current !== uid) {
          const res = await authFetch(getApiUrl('/api/cart/merge'), {
            method: 'POST',
            body: JSON.stringify({ items: guest.map((i) => ({ productId: i._id, qty: i.qty })) }),
          });
          const body = await res.json().catch(() => null);
          if (!cancelled && body?.success) {
            applyServer(body.data);
            writeLocal([]);
            mergedFor.current = uid;
            return;
          }
        }
        const res = await authFetch(getApiUrl('/api/cart'));
        const body = await res.json().catch(() => null);
        if (!cancelled && body?.success) {
          applyServer(body.data);
          mergedFor.current = uid;
        }
      } catch {
        /* keep whatever is in state */
      }
    })();

    return () => { cancelled = true; };
  }, [loggedIn, auth.user, applyServer]);

  const addItem = useCallback((product: AdminProduct, bookingDetails?: BookingDetails) => {
    if (loggedIn) {
      setItems((prev) => {
        const ex = prev.find((i) => i._id === product._id);
        return ex
          ? prev.map((i) => (i._id === product._id ? { ...i, qty: i.qty + 1 } : i))
          : [...prev, { ...fromServer({ productId: product._id, name: product.name, image: product.image, price: product.price, originalPrice: product.originalPrice, categoryName: product.categoryName, badge: product.badge, badgeColor: product.badgeColor, qty: 1 }) }];
      });
      authFetch(getApiUrl('/api/cart/items'), {
        method: 'POST',
        body: JSON.stringify({ productId: product._id, qty: 1 }),
      })
        .then((r) => r.json())
        .then((b) => { if (b?.success) applyServer(b.data); })
        .catch(() => {});
      return;
    }
    setItems((prev) => {
      const exists = prev.find((i) => i._id === product._id);
      if (!exists) {
        fetch(`/api/products/${product._id}/order`, { method: 'POST' }).catch(() => {});
      }
      const next = exists
        ? prev.map((i) => i._id === product._id
            ? { ...i, qty: i.qty + 1, bookingDetails: bookingDetails ? [...i.bookingDetails, bookingDetails] : i.bookingDetails }
            : i)
        : [...prev, {
            _id: product._id, name: product.name, image: product.image,
            price: product.price, originalPrice: product.originalPrice,
            categoryName: product.categoryName, badge: product.badge, badgeColor: product.badgeColor,
            qty: 1, bookingDetails: bookingDetails ? [bookingDetails] : [],
          }];
      writeLocal(next);
      return next;
    });
  }, [loggedIn, applyServer]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i._id !== id);
      if (!loggedIn) writeLocal(next);
      return next;
    });
    if (loggedIn) {
      authFetch(getApiUrl(`/api/cart/items/${id}`), { method: 'DELETE' })
        .then((r) => r.json()).then((b) => { if (b?.success) applyServer(b.data); }).catch(() => {});
    }
  }, [loggedIn, applyServer]);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty < 1) return;
    setItems((prev) => {
      const next = prev.map((i) => (i._id === id ? { ...i, qty } : i));
      if (!loggedIn) writeLocal(next);
      return next;
    });
    if (loggedIn) {
      authFetch(getApiUrl(`/api/cart/items/${id}`), { method: 'PATCH', body: JSON.stringify({ qty }) })
        .then((r) => r.json()).then((b) => { if (b?.success) applyServer(b.data); }).catch(() => {});
    }
  }, [loggedIn, applyServer]);

  const clearCart = useCallback(() => {
    setItems([]);
    if (loggedIn) {
      authFetch(getApiUrl('/api/cart'), { method: 'DELETE' }).catch(() => {});
    } else {
      try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
    }
  }, [loggedIn]);

  const total = items.reduce((sum, i) => {
    const addOnTotal = i.bookingDetails.reduce((bookingSum, booking) =>
      bookingSum + booking.addOns.reduce((addonSum, addon) => addonSum + addon.price, 0), 0);
    return sum + (i.price * i.qty) + addOnTotal;
  }, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return { items, addItem, removeItem, updateQty, clearCart, total, count };
}
