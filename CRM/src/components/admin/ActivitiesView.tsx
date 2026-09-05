import { useEffect, useState } from 'react';
import { Plus, Eye, EyeOff, Pencil, Trash2, Search } from 'lucide-react';
import { Modal } from './Modal';
import { ConfirmModal } from './ConfirmModal';
import { getApiUrl, authFetch } from '../../lib/api';
import type { AdminProduct } from '../../types';
import { ProductSearchSelector } from './ProductSearchSelector';
import { toast } from 'react-toastify';

const API = getApiUrl('/api/activities');
const PRODUCT_API = getApiUrl('/api/products');

interface ActivityItem {
  _id: string;
  product: AdminProduct;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const ActivitiesView = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [editTarget, setEditTarget] = useState<ActivityItem | null>(null);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ActivityItem | null>(null);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await authFetch(PRODUCT_API);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load products');
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await authFetch(API);
      const data = await res.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load activities');
    }
  };

  useEffect(() => {
    void fetchProducts();
    void fetchActivities();
  }, []);

  const openAdd = () => {
    setSelectedProductIds([]);
    setShowModal(true);
  };

  const excludedProductIds = activities
    .map((activity) => activity.product?._id)
    .filter((id): id is string => Boolean(id));

  const save = async () => {
    if (selectedProductIds.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    const payload = { products: selectedProductIds };
    try {
      const res = await authFetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.error || 'Unable to save activity');
      }

      const saved = await res.json();
      setActivities((prev) => [...(Array.isArray(saved) ? saved : [saved]), ...prev]);
      toast.success('Activity created');
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save activity');
    }
  };

  const openEdit = (activity: ActivityItem) => {
    setEditTarget(activity);
    setEditProductId(activity.product?._id || null);
  };

  const saveEdit = async () => {
    if (!editTarget || !editProductId) return;
    try {
      const res = await authFetch(`${API}/${editTarget._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: editProductId }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.error || 'Unable to update activity');
      }
      const updated = await res.json();
      setActivities((prev) => prev.map((item) => item._id === updated._id ? updated : item));
      toast.success('Activity updated');
      setEditTarget(null);
      setEditProductId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update activity');
    }
  };

  const remove = async (activity: ActivityItem) => {
    try {
      await authFetch(`${API}/${activity._id}`, { method: 'DELETE' });
      setActivities((prev) => prev.filter((item) => item._id !== activity._id));
      setDeleteConfirm(null);
      toast.success('Activity deleted');
    } catch {
      toast.error('Failed to delete activity');
    }
  };

  const toggleVisibility = async (activity: ActivityItem) => {
    try {
      const res = await authFetch(`${API}/${activity._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !activity.active }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.error || 'Unable to update activity');
      }
      const updated = await res.json();
      setActivities((prev) => prev.map((item) => item._id === updated._id ? updated : item));
      toast.success(`Activity ${updated.active ? 'shown' : 'hidden'}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update activity');
    }
  };

  const filteredActivities = activities.filter((activity) => {
    if (!search.trim()) return true;
    return activity.product?.name?.toLowerCase().includes(search.trim().toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-[#381932] dark:text-[#FFF3E6]">Activity Add-ons</h2>
          <p className="text-xs font-semibold text-[#381932] dark:text-[#381932] mt-0.5">Manage party entertainment &amp; game activities available for customer bookings.</p>
        </div>
        <button 
          type="button" 
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#381932] hover:opacity-90 text-[#FFF3E6] px-4 py-2.5 text-xs font-bold shadow-md shadow-[#381932]/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={16} /> Add Activity
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#381932]" />
          <input
            className="w-full rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] pl-10 pr-4 py-2.5 text-xs font-semibold text-[#381932] dark:text-[#FFF3E6] outline-none placeholder:text-[#381932]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity product names..."
          />
        </div>
        <div className="text-xs font-bold text-[#381932] dark:text-[#381932] self-end sm:self-center">
          {filteredActivities.length} activities
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredActivities.map((activity) => (
          <div key={activity._id} className="overflow-hidden rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] shadow-xs flex flex-col justify-between">
            <div>
              <div className="relative aspect-video w-full bg-[#FFF3E6] dark:bg-[#381932] overflow-hidden">
                {activity.product?.image ? (
                  <img src={activity.product.image} alt={activity.product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-semibold text-[#381932]">No Image</div>
                )}
                <span className={`absolute top-2.5 right-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase border ${
                  activity.active ? 'bg-[#FFF3E6] dark:bg-[#381932]/80 text-[#381932] dark:text-[#381932] border-[#381932] dark:border-[#381932]' : 'bg-[#FFF3E6] dark:bg-[#381932] text-[#381932] border-[#381932] dark:border-[#381932]'
                }`}>
                  {activity.active ? 'Active' : 'Hidden'}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <div className="font-bold text-sm text-[#381932] dark:text-[#FFF3E6] line-clamp-1">{activity.product?.name || 'Unnamed Product'}</div>
                <div className="text-xs font-black text-[#381932] dark:text-[#381932]">₹{Number(activity.product?.price || 0).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="p-4 pt-0 flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3 py-2 text-xs font-bold text-[#381932] dark:text-[#381932] hover:bg-[#FFF3E6] dark:hover:bg-[#381932] transition-colors cursor-pointer"
                onClick={() => openEdit(activity)}
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3 py-2 text-xs font-bold text-[#381932] dark:text-[#381932] hover:bg-[#FFF3E6] dark:hover:bg-[#381932] transition-colors cursor-pointer"
                onClick={() => toggleVisibility(activity)}
              >
                {activity.active ? <EyeOff size={14} /> : <Eye size={14} />}
                {activity.active ? 'Hide' : 'Show'}
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#381932] dark:border-[#381932]/50 bg-[#FFF3E6] dark:bg-[#381932]/40 px-3 py-2 text-xs font-bold text-[#381932] dark:text-[#381932] hover:bg-[#FFF3E6] dark:hover:bg-[#381932]/60 transition-colors cursor-pointer"
                onClick={() => setDeleteConfirm(activity)}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title="Add Activity Product" onClose={() => setShowModal(false)} large>
          <div className="space-y-4">
            <label className="text-xs font-extrabold uppercase text-[#381932]">Select Activity Products *</label>
            <ProductSearchSelector
              products={products}
              selectedProductIds={selectedProductIds}
              excludedProductIds={excludedProductIds}
              onChange={setSelectedProductIds}
            />
            <div className="flex items-center justify-end gap-3 border-t border-[#381932] dark:border-[#381932] pt-4">
              <button type="button" className="rounded-xl border border-[#381932] dark:border-[#381932] px-4 py-2.5 text-xs font-bold text-[#381932] dark:text-[#381932] cursor-pointer" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="button" className="rounded-xl bg-[#381932] text-[#FFF3E6] px-4 py-2.5 text-xs font-bold shadow-md shadow-[#381932]/20 cursor-pointer" onClick={save}>Save Activity</button>
            </div>
          </div>
        </Modal>
      )}

      {editTarget && (
        <Modal title="Edit Activity Product" onClose={() => setEditTarget(null)} large>
          <div className="space-y-4">
            <label className="text-xs font-extrabold uppercase text-[#381932]">Linked Product *</label>
            <ProductSearchSelector
              products={products}
              selectedProductIds={editProductId ? [editProductId] : []}
              excludedProductIds={excludedProductIds.filter((id) => id !== editTarget.product?._id)}
              onChange={(ids) => setEditProductId(ids[ids.length - 1] || null)}
            />
            <div className="flex items-center justify-end gap-3 border-t border-[#381932] dark:border-[#381932] pt-4">
              <button type="button" className="rounded-xl border border-[#381932] dark:border-[#381932] px-4 py-2.5 text-xs font-bold text-[#381932] dark:text-[#381932] cursor-pointer" onClick={() => setEditTarget(null)}>Cancel</button>
              <button type="button" disabled={!editProductId} className="rounded-xl bg-[#381932] text-[#FFF3E6] px-4 py-2.5 text-xs font-bold shadow-md shadow-[#381932]/20 disabled:opacity-60 cursor-pointer" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </Modal>
      )}

      {deleteConfirm && (
        <ConfirmModal
          title="Delete Activity"
          message={`Are you sure you want to delete "${deleteConfirm.product?.name}" from activities?`}
          onConfirm={() => remove(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
          confirmText="Delete"
        />
      )}
    </div>
  );
};
