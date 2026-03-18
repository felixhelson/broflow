'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../src/store/authStore';
import { usePartnersStore } from '../../src/store/partnersStore';
import { supabase } from '../../src/lib/supabase';
import { Colors, PHASE_LABELS } from '../../src/utils/theme';
import { BottomNav } from '../../src/components/BottomNav';

interface Subscription {
  id: string;
  product_name: string;
  amount_cents: number;
  status: string;
  created_at: string;
}

interface Order {
  id: string;
  product_name: string;
  amount_cents: number;
  status: string;
  is_recurring: boolean;
  created_at: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { partners, activePartnerId } = usePartnersStore();
  const isDemo = user?.id === 'demo-user-1';
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [cancellingId, setCancellingId]   = useState<string | null>(null);
  const [orders, setOrders]               = useState<Order[]>([]);

  useEffect(() => {
    if (isDemo || !user) return;
    supabase
      .from('subscriptions')
      .select('id, product_name, amount_cents, status, created_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => setSubscriptions(data ?? []));
    supabase
      .from('orders')
      .select('id, product_name, amount_cents, status, is_recurring, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => setOrders(data ?? []));
  }, [user?.id, isDemo]);

  async function handleCancel(subId: string) {
    if (!confirm('Cancel this monthly subscription? You\'ll keep getting deliveries until the end of the billing period.')) return;
    setCancellingId(subId);
    try {
      await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subId, userId: user?.id }),
      });
      setSubscriptions(subs => subs.filter(s => s.id !== subId));
    } finally {
      setCancellingId(null);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: Colors.bg }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-2xl font-bold" style={{ color: Colors.coral }}>
          Bro<span style={{ color: Colors.text }}>flow</span>
        </h1>
        <p className="text-sm mt-0.5" style={{ color: Colors.textMid }}>Your profile</p>
      </div>

      <div className="px-5 flex flex-col gap-4 max-w-lg mx-auto">

        {/* User card */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: Colors.white, border: `1px solid ${Colors.border}` }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
              style={{ backgroundColor: Colors.coral }}
            >
              {user?.firstName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-base font-semibold" style={{ color: Colors.text }}>
                {user?.firstName ?? 'Demo User'}
              </p>
              <p className="text-sm mt-0.5" style={{ color: Colors.textMid }}>
                {user?.email ?? 'demo@broflow.app'}
              </p>
              {isDemo && (
                <span
                  className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: Colors.amberLight, color: Colors.amber }}
                >
                  Demo mode
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Points balance */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2 px-1" style={{ color: Colors.textMid }}>
            Rewards
          </p>
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: Colors.white, border: `1px solid ${Colors.border}` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-2xl font-bold" style={{ color: Colors.coral }}>
                  {user?.pointsBalance ?? 0} pts
                </p>
                <p className="text-xs mt-0.5" style={{ color: Colors.textMid }}>
                  {user?.pointsBalance && user.pointsBalance >= 500
                    ? '🎁 You have enough for a free gift!'
                    : `${100 - ((user?.pointsBalance ?? 0) % 100)} pts until your next $1 discount`}
                </p>
              </div>
              {user?.pointsBalance && user.pointsBalance >= 500 ? (
                <span
                  className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}
                >
                  Free gift ready
                </span>
              ) : null}
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: Colors.grayLight }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(((user?.pointsBalance ?? 0) % 500) / 500 * 100, 100)}%`,
                  backgroundColor: Colors.coral,
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs" style={{ color: Colors.textMid }}>0</span>
              <span className="text-xs" style={{ color: Colors.textMid }}>500 pts = free gift</span>
            </div>
            <div
              className="mt-3 rounded-lg px-3 py-2"
              style={{ backgroundColor: Colors.coralLight }}
            >
              <p className="text-xs" style={{ color: Colors.coral }}>
                💡 Earn 1pt per $1 · Double points on birthday month & PMS orders
              </p>
            </div>
          </div>
        </div>

        {/* Active subscriptions */}
        {subscriptions.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2 px-1" style={{ color: Colors.textMid }}>
              Monthly deliveries
            </p>
            <div className="flex flex-col gap-2">
              {subscriptions.map(sub => (
                <div
                  key={sub.id}
                  className="rounded-xl p-4 flex items-center justify-between"
                  style={{ backgroundColor: Colors.white, border: `1px solid ${Colors.border}` }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: Colors.text }}>📦 {sub.product_name}</p>
                    <p className="text-xs mt-0.5" style={{ color: Colors.textMid }}>
                      ${(sub.amount_cents / 100).toFixed(2)}/month · Active
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancel(sub.id)}
                    disabled={cancellingId === sub.id}
                    className="text-xs font-medium px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                  >
                    {cancellingId === sub.id ? 'Cancelling…' : 'Cancel'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order history */}
        {orders.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2 px-1" style={{ color: Colors.textMid }}>
              Order history
            </p>
            <div
              className="rounded-xl divide-y overflow-hidden"
              style={{ backgroundColor: Colors.white, border: `1px solid ${Colors.border}` }}
            >
              {orders.map(order => (
                <div key={order.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-medium truncate" style={{ color: Colors.text }}>
                      {order.is_recurring ? '📦 ' : '🎁 '}{order.product_name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: Colors.textMid }}>
                      {new Date(order.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {order.is_recurring ? ' · Monthly' : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold" style={{ color: Colors.text }}>
                      {order.amount_cents === 0 ? 'Free' : `$${(order.amount_cents / 100).toFixed(2)}`}
                    </p>
                    <p
                      className="text-xs mt-0.5 capitalize"
                      style={{ color: order.status === 'completed' ? Colors.teal : Colors.textMid }}
                    >
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Partners section */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2 px-1" style={{ color: Colors.textMid }}>
            Partners
          </p>
          <div className="flex flex-col gap-2">
            {partners.length === 0 ? (
              <div
                className="rounded-xl p-4 text-center"
                style={{ backgroundColor: Colors.white, border: `1px solid ${Colors.border}` }}
              >
                <p className="text-sm" style={{ color: Colors.textMid }}>No partners added yet</p>
              </div>
            ) : (
              partners.map(p => {
                const cs = p.cycleStatus;
                const isActive = p.id === activePartnerId;
                return (
                  <button
                    key={p.id}
                    onClick={() => router.push(`/partner/${p.id}`)}
                    className="rounded-xl p-4 flex items-center gap-3 text-left w-full transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: Colors.white,
                      border: `1px solid ${isActive ? Colors.coral : Colors.border}`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: p.avatarColor }}
                    >
                      {p.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: Colors.text }}>{p.name}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: Colors.textMid }}>
                        {cs
                          ? `${PHASE_LABELS[cs.currentPhase]} · Day ${cs.currentDay} · Period in ${cs.daysUntilPeriod}d`
                          : 'No cycle data — tap to add'}
                      </p>
                    </div>
                    <span className="text-sm" style={{ color: Colors.textMid }}>›</span>
                  </button>
                );
              })
            )}

            {/* Add partner */}
            <button
              onClick={() => router.push('/partner/add')}
              className="rounded-xl p-4 flex items-center gap-3 border-2 border-dashed w-full transition-opacity hover:opacity-70"
              style={{ borderColor: Colors.coralMid, backgroundColor: Colors.coralLight }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-light flex-shrink-0"
                style={{ backgroundColor: 'rgba(216,90,48,0.15)', color: Colors.coral }}
              >
                +
              </div>
              <p className="text-sm font-medium" style={{ color: Colors.coral }}>Add partner</p>
            </button>
          </div>
        </div>

        {/* App info */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2 px-1" style={{ color: Colors.textMid }}>
            About
          </p>
          <div
            className="rounded-xl divide-y"
            style={{ backgroundColor: Colors.white, border: `1px solid ${Colors.border}` }}
          >
            {[
              { label: '💝 Charity', value: '15% of every order goes to the Period Dignity Project' },
              { label: '🔒 Privacy', value: 'Cycle data is stored securely and never shared' },
              { label: '📱 Version', value: '1.0.0 (web)' },
            ].map(item => (
              <div key={item.label} className="px-4 py-3">
                <p className="text-sm font-medium mb-0.5" style={{ color: Colors.text }}>{item.label}</p>
                <p className="text-xs leading-relaxed" style={{ color: Colors.textMid }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-center mt-2 transition-opacity hover:opacity-80"
          style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
        >
          {isDemo ? 'Exit demo' : 'Log out'}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
