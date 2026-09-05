import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Save, RotateCcw, Phone, Mail, MapPin, Link2, Sparkles } from 'lucide-react';
import { getApiUrl, authFetch } from '../../lib/api';
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from '../../hooks/useSiteSettings';

const getSiteSettingsApi = () => getApiUrl('/api/site-content/site-settings');
const API = { toString: getSiteSettingsApi, valueOf: getSiteSettingsApi, [Symbol.toPrimitive]: getSiteSettingsApi } as unknown as string;

const FIELDS: { key: keyof SiteSettings; label: string; icon: React.ElementType; group: 'Contact & Socials' | 'Homepage Hero' }[] = [
  { key: 'phone1', label: 'Primary Phone', icon: Phone, group: 'Contact & Socials' },
  { key: 'phone2', label: 'Secondary Phone', icon: Phone, group: 'Contact & Socials' },
  { key: 'whatsappNumber', label: 'WhatsApp Number (digits only, e.g. 917022058460)', icon: Phone, group: 'Contact & Socials' },
  { key: 'email', label: 'Support Email', icon: Mail, group: 'Contact & Socials' },
  { key: 'address', label: 'Studio Address', icon: MapPin, group: 'Contact & Socials' },
  { key: 'instagramUrl', label: 'Instagram URL', icon: Link2, group: 'Contact & Socials' },
  { key: 'facebookUrl', label: 'Facebook URL', icon: Link2, group: 'Contact & Socials' },
  { key: 'footerTagline', label: 'Footer Tagline', icon: Sparkles, group: 'Contact & Socials' },
  { key: 'heroEyebrow', label: 'Hero Eyebrow Text', icon: Sparkles, group: 'Homepage Hero' },
  { key: 'heroHeadlineLine1', label: 'Hero Headline (line 1)', icon: Sparkles, group: 'Homepage Hero' },
  { key: 'heroHeadlineLine2', label: 'Hero Headline (line 2, before the script word)', icon: Sparkles, group: 'Homepage Hero' },
  { key: 'heroHeadlineScript', label: 'Hero Script Word', icon: Sparkles, group: 'Homepage Hero' },
  { key: 'heroSubtext', label: 'Hero Subtext', icon: Sparkles, group: 'Homepage Hero' },
];

export const SiteSettingsView = () => {
  const [values, setValues] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await authFetch(API);
      const data = await res.json();
      if (data?.content) setValues({ ...DEFAULT_SITE_SETTINGS, ...JSON.parse(data.content) });
    } catch {
      toast.error('Failed to load site settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      await authFetch(API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Site Settings', content: JSON.stringify(values) }),
      });
      toast.success('Site settings saved! Changes go live immediately.');
    } catch {
      toast.error('Failed to save site settings');
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof SiteSettings, value: string) => setValues((prev) => ({ ...prev, [key]: value }));

  const groups = Array.from(new Set(FIELDS.map((f) => f.group)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-[#381932] dark:text-[#FFF3E6]">Site Settings</h2>
          <p className="text-xs font-semibold text-[#381932] dark:text-[#381932] mt-0.5">
            Contact details, socials, and homepage hero copy shown across the site.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs font-bold text-[#381932]">Loading site settings...</div>
      ) : (
        <>
          {groups.map((group) => (
            <div key={group} className="rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#381932] dark:text-[#FFF3E6]">{group}</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {FIELDS.filter((f) => f.group === group).map((field) => (
                  <label key={field.key} className="flex flex-col gap-1.5 text-xs font-semibold text-[#381932] dark:text-[#381932] sm:col-span-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide text-[#381932] dark:text-[#381932]">
                      <field.icon size={12} /> {field.label}
                    </span>
                    <input
                      value={values[field.key]}
                      onChange={(e) => update(field.key, e.target.value)}
                      className="rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3.5 py-2.5 text-xs font-bold text-[#381932] dark:text-[#FFF3E6] outline-none"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-end gap-3 border-t border-[#381932] dark:border-[#381932] pt-4">
            <button
              type="button"
              className="rounded-xl border border-[#381932] dark:border-[#381932] px-4 py-2.5 text-xs font-bold text-[#381932] dark:text-[#381932] cursor-pointer"
              onClick={() => void load()}
            >
              <RotateCcw size={13} className="mr-1 inline" /> Reset
            </button>
            <button
              type="button"
              className="rounded-xl bg-[#381932] text-[#FFF3E6] px-4 py-2.5 text-xs font-bold shadow-md shadow-[#381932]/20 disabled:opacity-60 cursor-pointer"
              onClick={() => void save()}
              disabled={saving}
            >
              <Save size={13} className="mr-1 inline" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SiteSettingsView;
