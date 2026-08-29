import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Pencil, Eye, RotateCcw, Save, Lightbulb } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getApiUrl, authFetch } from '../../lib/api';

const API = getApiUrl('/api/site-content');

const PAGES = [
  { key: 'product-terms', label: 'Product Terms', icon: '📦' },
  { key: 'terms',         label: 'Terms & Conditions', icon: '📋' },
  { key: 'privacy',       label: 'Privacy Policy',      icon: '🔒' },
  { key: 'refund',        label: 'Refund Policy',        icon: '💰' },
  { key: 'about',         label: 'About Us',             icon: '🏢' },
];

export const TermsView = () => {
  const [activeKey, setActiveKey] = useState('terms');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const fetchPage = async (key: string) => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/${key}`);
      const data = await res.json();
      setTitle(data.title || '');
      setContent(data.content || '');
    } catch {
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchPage(activeKey); }, [activeKey]);

  const save = async () => {
    if (!title.trim() || !content.trim()) { toast.error('Title and content are required'); return; }
    setSaving(true);
    try {
      await authFetch(`${API}/${activeKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      toast.success('Page content saved!');
    } catch {
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-[#381932] dark:text-[#FFF3E6]">Pages &amp; Legal Content</h2>
          <p className="text-xs font-semibold text-[#381932] dark:text-[#381932] mt-0.5">Edit customer-facing policy pages and terms displayed on the platform.</p>
        </div>
      </div>

      {/* Page Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-[#381932] dark:border-[#381932] pb-1 no-scrollbar">
        {PAGES.map(p => (
          <button
            key={p.key}
            type="button"
            className={cn(
              'flex items-center gap-2 shrink-0 border-b-2 px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer',
              activeKey === p.key 
                ? 'border-[#381932] text-[#381932] dark:text-[#381932]' 
                : 'border-transparent text-[#381932] dark:text-[#381932] hover:text-[#381932] dark:hover:text-[#FFF3E6]'
            )}
            onClick={() => { setActiveKey(p.key); setPreview(false); }}
          >
            <span>{p.icon}</span> {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs font-bold text-[#381932]">Loading page content...</div>
      ) : (
        <div className="rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs space-y-4">
          <div>
            <label className="text-xs font-extrabold uppercase text-[#381932]">Page Title</label>
            <input
              className="mt-1 w-full rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3.5 py-2.5 text-xs font-bold text-[#381932] dark:text-[#FFF3E6] outline-none"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Page Title"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase text-[#381932]">
              Content Editor <span className="font-semibold text-[#381932] lowercase">(HTML supported)</span>
            </label>
            <div className="flex overflow-hidden rounded-xl border border-[#381932] dark:border-[#381932]">
              <button
                type="button"
                className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer', !preview ? 'bg-[#381932] text-[#FFF3E6]' : 'text-[#381932] dark:text-[#381932] hover:bg-[#FFF3E6] dark:hover:bg-[#381932]')}
                onClick={() => setPreview(false)}
              >
                <Pencil size={12} /> Edit
              </button>
              <button
                type="button"
                className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer', preview ? 'bg-[#381932] text-[#FFF3E6]' : 'text-[#381932] dark:text-[#381932] hover:bg-[#FFF3E6] dark:hover:bg-[#381932]')}
                onClick={() => setPreview(true)}
              >
                <Eye size={12} /> Preview
              </button>
            </div>
          </div>

          {preview ? (
            <div
              className="min-h-[380px] rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6]/50 dark:bg-[#381932]/40 p-4 text-xs font-medium text-[#381932] dark:text-[#381932] leading-relaxed prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <textarea
              className="min-h-[380px] w-full rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-3.5 font-mono text-xs font-semibold text-[#381932] dark:text-[#FFF3E6] outline-none"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write HTML content here..."
              rows={18}
            />
          )}

          <div className="flex items-start gap-2 rounded-xl bg-[#FFF3E6] dark:bg-[#381932]/40 p-3 text-xs font-semibold text-[#381932] dark:text-[#381932] border border-[#381932] dark:border-[#381932]/50">
            <Lightbulb size={16} className="mt-0.5 shrink-0 text-[#381932] dark:text-[#381932]" />
            <span>Tip: You can use HTML formatting tags like <code>&lt;h2&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;ul&gt;</code>, <code>&lt;li&gt;</code>, and <code>&lt;strong&gt;</code> to structure page content.</span>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#381932] dark:border-[#381932] pt-4">
            <button 
              type="button" 
              className="rounded-xl border border-[#381932] dark:border-[#381932] px-4 py-2.5 text-xs font-bold text-[#381932] dark:text-[#381932] cursor-pointer" 
              onClick={() => void fetchPage(activeKey)}
            >
              <RotateCcw size={13} className="mr-1 inline" /> Reset
            </button>
            <button 
              type="button" 
              className="rounded-xl bg-[#381932] text-[#FFF3E6] px-4 py-2.5 text-xs font-bold shadow-md shadow-[#381932]/20 disabled:opacity-60 cursor-pointer" 
              onClick={save} 
              disabled={saving}
            >
              <Save size={13} className="mr-1 inline" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
