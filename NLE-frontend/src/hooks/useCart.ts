import { useCallback, useEffect, useRef, useState } from 'react';
import type { CartItem, AdminProduct, BookingDetails } from '../types';
import { useAuth } from './useAuth';
import { getApiUrl, authFetch } from '../services/api.service';

const LS_KEY = 'cart';

const readLocal = (): CartItem[] => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
};

/**
 * The guest cart is shared across every useCart() consumer on the page (each
 * ProductCard mounts its own hook instance). Writes go read-modify-write against
 * localStorage -- never against a component's possibly-stale `items` -- and then
 * notify all instances so the header count, drawer and cards stay in sync.
 */
const guestListeners = new Set<() => void>();
const notifyGuest = () => { guestListeners.forEach((fn) => fn()); };
const writeLocal = (items: CartItem[]) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  notifyGuest();
};
/** Apply a pure transform to the persisted guest cart atomically. */
const mutateLocal = (fn: (prev: CartItem[]) => CartItem[]): CartItem[] => {
  const next = fn(readLocal());
  writeLocal(next);
  return next;
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

  // Keep every guest useCart() instance (and other tabs) in sync with the
  // shared localStorage cart.
  useEffect(() => {
    if (loggedIn) return;
    const sync = () => setItems(readLocal());
    guestListeners.add(sync);
    window.addEventListener('storage', sync);
    sync();
    return () => {
      guestListeners.delete(sync);
      window.removeEventListener('storage', sync);
    };
  }, [loggedIn]);

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
    if (!readLocal().some((i) => i._id === product._id)) {
      fetch(`/api/products/${product._id}/order`, { method: 'POST' }).catch(() => {});
    }
    setItems(mutateLocal((prev) => {
      const exists = prev.find((i) => i._id === product._id);
      return exists
        ? prev.map((i) => i._id === product._id
            ? { ...i, qty: i.qty + 1, bookingDetails: bookingDetails ? [...i.bookingDetails, bookingDetails] : i.bookingDetails }
            : i)
        : [...prev, {
            _id: product._id, name: product.name, image: product.image,
            price: product.price, originalPrice: product.originalPrice,
            categoryName: product.categoryName, badge: product.badge, badgeColor: product.badgeColor,
            qty: 1, bookingDetails: bookingDetails ? [bookingDetails] : [],
          }];
    }));
  }, [loggedIn, applyServer]);

  const removeItem = useCallback((id: string) => {
    if (loggedIn) {
      setItems((prev) => prev.filter((i) => i._id !== id));
      authFetch(getApiUrl(`/api/cart/items/${id}`), { method: 'DELETE' })
        .then((r) => r.json()).then((b) => { if (b?.success) applyServer(b.data); }).catch(() => {});
    } else {
      setItems(mutateLocal((prev) => prev.filter((i) => i._id !== id)));
    }
  }, [loggedIn, applyServer]);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty < 1) return;
    if (loggedIn) {
      setItems((prev) => prev.map((i) => (i._id === id ? { ...i, qty } : i)));
      authFetch(getApiUrl(`/api/cart/items/${id}`), { method: 'PATCH', body: JSON.stringify({ qty }) })
        .then((r) => r.json()).then((b) => { if (b?.success) applyServer(b.data); }).catch(() => {});
    } else {
      setItems(mutateLocal((prev) => prev.map((i) => (i._id === id ? { ...i, qty } : i))));
    }
  }, [loggedIn, applyServer]);

  const clearCart = useCallback(() => {
    setItems([]);
    if (loggedIn) {
      authFetch(getApiUrl('/api/cart'), { method: 'DELETE' }).catch(() => {});
    } else {
      writeLocal([]);
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
