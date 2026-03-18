'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../src/lib/supabase';
import { Colors } from '../../../src/utils/theme';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'broflow-admin';

interface Application {
  id: string;
  business_name: string;
  category: string;
  website_url: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  notification_method: string;
  message: string | null;
  status: string;
  created_at: string;
}

interface Sponsor {
  id: string;
  name: string;
  type: string;
  active: boolean;
  notification_email: string | null;
  notification_phone: string | null;
  notification_method: string;
  website_url: string | null;
  created_at: string;
}

export default function AdminSponsorsPage() {
  const [authed, setAuthed]             = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [sponsors, setSponsors]         = useState<Sponsor[]>([]);
  const [tab, setTab]                   = useState<'applications' | 'sponsors'>('applications');
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  async function load() {
    setLoading(true);
    const [{ data: apps }, { data: sps }] = await Promise.all([
      supabase.from('sponsor_applications').select('*').order('created_at', { ascending: false }),
      supabase.from('sponsors').select('*').order('created_at', { ascending: false }),
    ]);
    setApplications(apps ?? []);
    setSponsors(sps ?? []);
    setLoading(false);
  }

  async function updateAppStatus(id: string, status: string) {
    await supabase.from('sponsor_applications').update({ status }).eq('id', id);
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }

  async function toggleSponsorActive(id: string, active: boolean) {
    await supabase.from('sponsors').update({ active: !active }).eq('id', id);
    setSponsors(prev => prev.map(s => s.id === id ? { ...s, active: !active } : s));
  }

  const statusColor = (status: string) => {
    if (status === 'approved') return { bg: '#DCFCE7', text: '#16A34A' };
    if (status === 'rejected') return { bg: '#FEE2E2', text: '#DC2626' };
    return { bg: Colors.amberLight, text: Colors.amber };
  };

  if (!authed) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 max-w-sm mx-auto" style={{ backgroundColor: Colors.bg }}>
        <h2 className="text-2xl font-bold mb-1" style={{ color: Colors.text }}>Admin access</h2>
        <p className="text-sm mb-6" style={{ color: Colors.textMid }}>Enter the admin password to continue.</p>
        <input
          type="password"
          className="w-full px-4 py-3 rounded-xl border text-base outline-none mb-3"
          style={{ borderColor: passwordError ? '#DC2626' : Colors.border, color: Colors.text, backgroundColor: Colors.white }}
          placeholder="Password"
          value={passwordInput}
          onChange={e => { setPasswordInput(e.target.value); setPasswordError(false); }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (passwordInput === ADMIN_PASSWORD) setAuthed(true);
              else setPasswordError(true);
            }
          }}
        />
        {passwordError && <p className="text-xs text-red-600 mb-3">Incorrect password</p>}
        <button
          onClick={() => {
            if (passwordInput === ADMIN_PASSWORD) setAuthed(true);
            else setPasswordError(true);
          }}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: Colors.coral }}
        >
          Enter
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-16" style={{ backgroundColor: Colors.bg }}>
      <div className="px-5 pt-14 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: Colors.text }}>Sponsor Admin</h1>
          <p className="text-sm" style={{ color: Colors.textMid }}>Manage sponsor applications and active sponsors</p>
        </div>
        <a
          href="/admin/orders"
          className="text-sm font-semibold px-3 py-1.5 rounded-full"
          style={{ backgroundColor: Colors.coralLight, color: Colors.coral }}
        >
          📦 Orders
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 mb-4">
        {(['applications', 'sponsors'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: tab === t ? Colors.coral : Colors.grayLight,
              color: tab === t ? Colors.white : Colors.textMid,
            }}
          >
            {t === 'applications' ? `Applications (${applications.filter(a => a.status === 'pending').length})` : `Sponsors (${sponsors.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="text-sm" style={{ color: Colors.textMid }}>Loading…</span>
        </div>
      ) : tab === 'applications' ? (
        <div className="px-5 flex flex-col gap-3 max-w-2xl mx-auto">
          {applications.length === 0 ? (
            <p className="text-sm text-center py-10" style={{ color: Colors.textMid }}>No applications yet</p>
          ) : applications.map(app => (
            <div key={app.id} className="rounded-xl p-4" style={{ backgroundColor: Colors.white, border: `1px solid ${Colors.border}` }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-base font-semibold" style={{ color: Colors.text }}>{app.business_name}</p>
                  <p className="text-xs mt-0.5" style={{ color: Colors.textMid }}>{app.category} · {app.contact_name} · {app.contact_email}</p>
                  {app.contact_phone && <p className="text-xs" style={{ color: Colors.textMid }}>{app.contact_phone} ({app.notification_method})</p>}
                  {app.website_url && <a href={app.website_url} target="_blank" rel="noreferrer" className="text-xs underline" style={{ color: Colors.coral }}>{app.website_url}</a>}
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: statusColor(app.status).bg, color: statusColor(app.status).text }}>
                  {app.status}
                </span>
              </div>
              {app.message && <p className="text-xs mb-3 leading-relaxed" style={{ color: Colors.textMid }}>"{app.message}"</p>}
              <p className="text-xs mb-3" style={{ color: Colors.textMid }}>{new Date(app.created_at).toLocaleDateString('en-AU')}</p>
              {app.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateAppStatus(app.id, 'approved')}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold text-white"
                    style={{ backgroundColor: '#16A34A' }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateAppStatus(app.id, 'rejected')}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="px-5 flex flex-col gap-3 max-w-2xl mx-auto">
          {sponsors.length === 0 ? (
            <p className="text-sm text-center py-10" style={{ color: Colors.textMid }}>No sponsors yet</p>
          ) : sponsors.map(sp => (
            <div key={sp.id} className="rounded-xl p-4" style={{ backgroundColor: Colors.white, border: `1px solid ${Colors.border}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold" style={{ color: Colors.text }}>{sp.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: Colors.textMid }}>
                    {sp.type} · {sp.notification_method}
                    {sp.notification_email ? ` · ${sp.notification_email}` : ''}
                    {sp.notification_phone ? ` · ${sp.notification_phone}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => toggleSponsorActive(sp.id, sp.active)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: sp.active ? '#DCFCE7' : '#FEE2E2',
                    color: sp.active ? '#16A34A' : '#DC2626',
                  }}
                >
                  {sp.active ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
