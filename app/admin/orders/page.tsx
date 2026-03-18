'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../src/lib/supabase';
import { Colors } from '../../../src/utils/theme';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'broflow-admin';

interface Order {
  id: string;
  product_name: string;
  amount_cents: number;
  status: string;
  is_recurring: boolean;
  created_at: string;
  delivery_address: {
    line1: string;
    city: string;
    state: string;
    postcode: string;
  } | null;
  profiles: { first_name: string; email: string } | null;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  completed:  { bg: '#DCFCE7', text: '#16A34A' },
  fulfilled:  { bg: '#DBEAFE', text: '#1D4ED8' },
  pending:    { bg: '#FEF9C3', text: '#92400E' },
  cancelled:  { bg: '#FEE2E2', text: '#DC2626' },
};

export default function AdminOrdersPage() {
  const [authed, setAuthed]             = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [orders, setOrders]             = useState<Order[]>([]);
  const [loading, setLoading]           = useState(true);
  const [updatingId, setUpdatingId]     = useState<string | null>(null);
  const [filter, setFilter]             = useState<'all' | 'pending' | 'completed' | 'fulfilled'>('all');

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*, profiles(first_name, email)')
      .order('created_at', { ascending: false })
      .limit(100);
    setOrders((data ?? []) as Order[]);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setUpdatingId(null);
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const statusColor = (status: string) => STATUS_COLORS[status] ?? { bg: Colors.grayLight, text: Colors.textMid };

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
          onClick={() => { if (passwordInput === ADMIN_PASSWORD) setAuthed(true); else setPasswordError(true); }}
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
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-2xl font-bold mb-1" style={{ color: Colors.text }}>Orders</h1>
        <p className="text-sm" style={{ color: Colors.textMid }}>{orders.length} total · {orders.filter(o => o.status === 'completed').length} to fulfill</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 px-5 mb-4 overflow-x-auto">
        {(['all', 'completed', 'fulfilled', 'pending'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
            style={{
              backgroundColor: filter === f ? Colors.coral : Colors.grayLight,
              color: filter === f ? Colors.white : Colors.textMid,
            }}
          >
            {f === 'all' ? `All (${orders.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${orders.filter(o => o.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="text-sm" style={{ color: Colors.textMid }}>Loading…</span>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-center py-10" style={{ color: Colors.textMid }}>No orders yet</p>
      ) : (
        <div className="px-5 flex flex-col gap-3 max-w-2xl mx-auto">
          {filtered.map(order => {
            const addr = order.delivery_address;
            const sc = statusColor(order.status);
            return (
              <div
                key={order.id}
                className="rounded-xl p-4"
                style={{ backgroundColor: Colors.white, border: `1px solid ${Colors.border}` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-base font-semibold" style={{ color: Colors.text }}>
                      {order.is_recurring ? '📦 ' : '🎁 '}{order.product_name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: Colors.textMid }}>
                      ${(order.amount_cents / 100).toFixed(2)} · {new Date(order.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {order.is_recurring && (
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: Colors.coralLight, color: Colors.coral }}>
                        Monthly
                      </span>
                    )}
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 capitalize"
                    style={{ backgroundColor: sc.bg, color: sc.text }}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Customer */}
                {order.profiles && (
                  <div className="mb-3 px-3 py-2 rounded-lg" style={{ backgroundColor: Colors.grayLight }}>
                    <p className="text-xs font-semibold" style={{ color: Colors.text }}>
                      👤 {order.profiles.first_name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: Colors.textMid }}>{order.profiles.email}</p>
                  </div>
                )}

                {/* Delivery address */}
                {addr && (
                  <div className="mb-3 px-3 py-2 rounded-lg" style={{ backgroundColor: Colors.grayLight }}>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: Colors.text }}>📦 Ship to</p>
                    <p className="text-xs" style={{ color: Colors.textMid }}>
                      {addr.line1}, {addr.city} {addr.state} {addr.postcode}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {order.status === 'completed' && (
                  <button
                    onClick={() => updateStatus(order.id, 'fulfilled')}
                    disabled={updatingId === order.id}
                    className="w-full py-2 rounded-lg text-sm font-semibold text-white"
                    style={{ backgroundColor: '#1D4ED8' }}
                  >
                    {updatingId === order.id ? 'Updating…' : 'Mark as fulfilled'}
                  </button>
                )}
                {order.status === 'fulfilled' && (
                  <p className="text-xs text-center" style={{ color: '#16A34A' }}>✓ Fulfilled</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
