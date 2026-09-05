import { useCallback, useEffect, useRef, useState } from 'react';
import type { CartItem, AdminProduct, BookingDetails } from '../types';
import { useAuth } from './useAuth';
import { getApiUrl, authFetch } from '../services/api.service';

const LS_KEY = 'cart';

const readLocal = (): CartItem[] => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
};

/**
 * Every useCart() consumer on the page (each ProductCard mounts its own hook
 * instance, plus the header badge and the cart drawer) must see the same
 * cart -- otherwise an add-to-cart from a product card never shows up in the
 * drawer until an unrelated remount happens to refetch. So there is exactly
 * ONE shared cart snapshot here that every instance mirrors via `listeners`;
 * every mutator (guest or signed-in) updates it through `setShared` and every
 * hook instance re-renders from that broadcast, never from its own private
 * copy.
 */
let sharedItems: CartItem[] = readLocal();
const listeners = new Set<(items: CartItem[]) => void>();
const setShared = (items: CartItem[]) => {
  sharedItems = items;
  listeners.forEach((fn) => fn(items));
};

const writeLocal = (items: CartItem[]) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  setShared(items);
};
/** Apply a pure transform to the persisted guest cart atomically. */
const mutateLocal = (fn: (prev: CartItem[]) => CartItem[]): CartItem[] => {
  const next = fn(readLocal());
  writeLocal(next);
  return next;
};
/** Apply a pure transform to the shared (server-backed, signed-in) cart atomically. */
const mutateShared = (fn: (prev: CartItem[]) => CartItem[]): CartItem[] => {
  const next = fn(sharedItems);
  setShared(next);
  return next;
};

/**
 * Map a backend cart line into the client CartItem shape. The server prices
 * addons per-line (`row.addons`), not per-"booking" like the guest cart does
 * -- wrap them in a single empty-shell BookingDetails entry so the existing
 * addon-total math and cart UI (which both read `bookingDetails[].addOns`)
 * pick them up without a parallel code path.
 */
function fromServer(row: any): CartItem {
  const addOns = Array.isArray(row.addons)
    ? row.addons.map((a: any) => ({ id: a.addonId, name: a.name, price: Number(a.price) || 0, qty: Number(a.qty) || 1, kind: 'addon' as const }))
    : [];
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
    bookingDetails: addOns.length
      ? [{ name: '', email: '', mobile: '', location: '', eventDate: '', eventTime: '', requests: '', addOns }]
      : [],
  } as CartItem;
}

/**
 * Cart state. For a signed-in customer it is backed by the server (prices are
 * always recomputed from the DB there); for a guest it lives in localStorage
 * and is merged into the account on the next login. Either way, every
 * instance of this hook mirrors the same shared snapshot (see `sharedItems`
 * above) so the header badge, the drawer, and every product card agree.
 */
export function useCart() {
  const auth = useAuth();
  const loggedIn = auth.isLoggedIn && !!auth.user?.id;
  const [items, setItems] = useState<CartItem[]>(sharedItems);
  const mergedFor = useRef<string | null>(null);

  const applyServer = useCallback((data: any) => {
    const rows = Array.isArray(data?.items) ? data.items.map(fromServer) : [];
    setShared(rows);
  }, []);

  // Mirror the shared snapshot, and (guest only) cross-tab localStorage writes.
  useEffect(() => {
    const sync = (next: CartItem[]) => setItems(next);
    listeners.add(sync);
    if (!loggedIn) {
      const storageSync = () => setShared(readLocal());
      window.addEventListener('storage', storageSync);
      storageSync();
      return () => {
        listeners.delete(sync);
        window.removeEventListener('storage', storageSync);
      };
    }
    return () => { listeners.delete(sync); };
  }, [loggedIn]);

  // Load / merge when auth state settles.
  useEffect(() => {
    if (!loggedIn) {
      mergedFor.current = null;
      setShared(readLocal());
      return;
    }
    const uid = auth.user!.id;
    if (mergedFor.current === uid) return;
    let cancelled = false;

    (async () => {
      try {
        const guest = readLocal();
        if (guest.length) {
          const res = await authFetch(getApiUrl('/api/cart/merge'), {
            method: 'POST',
            body: JSON.stringify({
              items: guest.map((i) => ({
                productId: i._id,
                qty: i.qty,
                addons: (i.bookingDetails?.[0]?.addOns || []).map((a) => ({
                  addonId: a.id,
                  name: a.name,
                  price: Number(a.price) || 0,
                  qty: a.qty || 1,
                  kind: a.kind || 'addon',
                })),
              })),
            }),
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
    if (!readLocal().some((i) => i._id === product._id) && !sharedItems.some((i) => i._id === product._id)) {
      fetch(getApiUrl(`/api/products/${product._id}/order`), { method: 'POST' }).catch(() => {});
    }
    const newAddOns = bookingDetails?.addOns || [];

    if (loggedIn) {
      mutateShared((prev) => {
        const ex = prev.find((i) => i._id === product._id);
        if (ex) {
          return prev.map((i) => {
            if (i._id !== product._id) return i;
            const existingAddons = i.bookingDetails?.[0]?.addOns || [];
            const addonMap = new Map(existingAddons.map((a) => [String(a.id || a.name), a]));
            for (const a of newAddOns) {
              addonMap.set(String(a.id || a.name), a);
            }
            const merged = Array.from(addonMap.values());
            return {
              ...i,
              bookingDetails: [{
                name: bookingDetails?.name || '',
                email: bookingDetails?.email || '',
                mobile: bookingDetails?.mobile || '',
                location: bookingDetails?.location || '',
                eventDate: bookingDetails?.eventDate || '',
                eventTime: bookingDetails?.eventTime || '',
                requests: bookingDetails?.requests || '',
                addOns: merged,
              }],
            };
          });
        }
        return [...prev, fromServer({
          productId: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          originalPrice: product.originalPrice,
          categoryName: product.categoryName,
          badge: product.badge,
          badgeColor: product.badgeColor,
          qty: 1,
          addons: newAddOns.map((a) => ({ addonId: a.id || a.name, name: a.name, price: Number(a.price) || 0, qty: a.qty || 1, kind: a.kind })),
        })];
      });

      const existingItem = sharedItems.find((i) => i._id === product._id);
      const combinedAddons = existingItem
        ? (() => {
            const map = new Map((existingItem.bookingDetails?.[0]?.addOns || []).map((a) => [String(a.id || a.name), a]));
            for (const a of newAddOns) map.set(String(a.id || a.name), a);
            return Array.from(map.values());
          })()
        : newAddOns;

      authFetch(getApiUrl('/api/cart'), {
        method: 'POST',
        body: JSON.stringify({
          productId: product._id,
          qty: existingItem ? 0 : 1,
          addons: combinedAddons.map((a) => ({ addonId: a.id || a.name, name: a.name, price: Number(a.price) || 0, qty: a.qty || 1, kind: a.kind || 'addon' })),
        }),
      })
        .then((r) => r.json())
        .then((b) => { if (b?.success) applyServer(b.data); })
        .catch(() => {});
      return;
    }

    mutateLocal((prev) => {
      const exists = prev.find((i) => i._id === product._id);
      if (exists) {
        return prev.map((i) => {
          if (i._id !== product._id) return i;
          const existingDetails = i.bookingDetails?.[0];
          const existingAddons = existingDetails?.addOns || [];
          const addonMap = new Map(existingAddons.map((a) => [String(a.id || a.name), a]));
          for (const a of newAddOns) {
            addonMap.set(String(a.id || a.name), a);
          }
          const merged = Array.from(addonMap.values());
          return {
            ...i,
            qty: newAddOns.length > 0 ? i.qty : i.qty + 1,
            bookingDetails: [{
              name: existingDetails?.name || bookingDetails?.name || '',
              email: existingDetails?.email || bookingDetails?.email || '',
              mobile: existingDetails?.mobile || bookingDetails?.mobile || '',
              location: existingDetails?.location || bookingDetails?.location || '',
              eventDate: existingDetails?.eventDate || bookingDetails?.eventDate || '',
              eventTime: existingDetails?.eventTime || bookingDetails?.eventTime || '',
              requests: existingDetails?.requests || bookingDetails?.requests || '',
              addOns: merged,
            }],
          };
        });
      }
      return [...prev, {
        _id: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        originalPrice: product.originalPrice,
        categoryName: product.categoryName,
        badge: product.badge,
        badgeColor: product.badgeColor,
        qty: 1,
        bookingDetails: bookingDetails ? [bookingDetails] : [],
      }];
    });
  }, [loggedIn, applyServer]);

  const removeCartAddon = useCallback((productId: string, addonIdOrName: string) => {
    const filterAddons = (item: CartItem): CartItem => {
      const existing = item.bookingDetails?.[0]?.addOns || [];
      const updated = existing.filter((a) => String(a.id || a.name) !== String(addonIdOrName));
      return {
        ...item,
        bookingDetails: [{
          ...(item.bookingDetails?.[0] || { name: '', email: '', mobile: '', location: '', eventDate: '', eventTime: '', requests: '' }),
          addOns: updated,
        }],
      };
    };

    if (loggedIn) {
      const current = sharedItems.find((i) => i._id === productId);
      if (!current) return;
      const updatedItem = filterAddons(current);
      const nextAddons = (updatedItem.bookingDetails?.[0]?.addOns || []).map((a) => ({
        addonId: a.id,
        name: a.name,
        price: Number(a.price) || 0,
        qty: a.qty || 1,
        kind: a.kind || 'addon',
      }));
      mutateShared((prev) => prev.map((i) => (i._id === productId ? updatedItem : i)));
      authFetch(getApiUrl(`/api/cart/items/${productId}`), {
        method: 'PUT',
        body: JSON.stringify({ addons: nextAddons }),
      })
        .then((r) => r.json())
        .then((b) => { if (b?.success) applyServer(b.data); })
        .catch(() => {});
    } else {
      mutateLocal((prev) => prev.map((i) => (i._id === productId ? filterAddons(i) : i)));
    }
  }, [loggedIn, applyServer]);

  const removeItem = useCallback((id: string) => {
    if (loggedIn) {
      mutateShared((prev) => prev.filter((i) => i._id !== id));
      authFetch(getApiUrl(`/api/cart/items/${id}`), { method: 'DELETE' })
        .then((r) => r.json()).then((b) => { if (b?.success) applyServer(b.data); }).catch(() => {});
    } else {
      mutateLocal((prev) => prev.filter((i) => i._id !== id));
    }
  }, [loggedIn, applyServer]);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty < 1) return;
    if (loggedIn) {
      mutateShared((prev) => prev.map((i) => (i._id === id ? { ...i, qty } : i)));
      authFetch(getApiUrl(`/api/cart/items/${id}`), { method: 'PUT', body: JSON.stringify({ qty }) })
        .then((r) => r.json()).then((b) => { if (b?.success) applyServer(b.data); }).catch(() => {});
    } else {
      mutateLocal((prev) => prev.map((i) => (i._id === id ? { ...i, qty } : i)));
    }
  }, [loggedIn, applyServer]);

  const clearCart = useCallback(() => {
    setShared([]);
    if (loggedIn) {
      authFetch(getApiUrl('/api/cart'), { method: 'DELETE' }).catch(() => {});
    } else {
      writeLocal([]);
    }
  }, [loggedIn]);

  const total = items.reduce((sum, i) => {
    const addOnTotal = i.bookingDetails.reduce((bookingSum, booking) =>
      bookingSum + booking.addOns.reduce((addonSum, addon) => addonSum + (addon.price || 0) * (addon.qty || 1), 0), 0);
    return sum + (i.price * i.qty) + addOnTotal;
  }, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return { items, addItem, removeItem, removeCartAddon, updateQty, clearCart, total, count };
}
