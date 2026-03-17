'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePartnersStore } from '../../src/store/partnersStore';
import { useAuthStore } from '../../src/store/authStore';
import { mockGifts } from '../../src/lib/mockData';
import { supabase } from '../../src/lib/supabase';
import { Colors, PHASE_LABELS, CATEGORY_EMOJI } from '../../src/utils/theme';
import { Card, Button, Badge, PhaseBar, SectionHeader, EmptyState } from '../../src/components/ui';
import { BottomNav } from '../../src/components/BottomNav';

function daysUntilBirthday(birthday: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bday = new Date(birthday);
  const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.floor((next.getTime() - today.getTime()) / 86400000);
}

export default function HomeScreen() {
  const router = useRouter();
  const { partners, activePartnerId, setActivePartner, loadPartners } = usePartnersStore();
  const activePartner = partners.find(p => p.id === activePartnerId) ?? partners[0] ?? null;
  const { user } = useAuthStore();
  const isDemo = user?.id === 'demo-user-1';
  const [gifts, setGifts]           = useState<unknown[]>([]);
  const [charityStats, setCharity]  = useState<{ totalDonatedInCents: number; estimatedPacksProvided: number } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setGifts(mockGifts);
    } else {
      load();
    }
  }, []);

  useEffect(() => {
    if (activePartner && !isDemo) loadGifts();
  }, [activePartner?.id]);

  async function load() {
    await loadPartners();
  }

  async function loadGifts() {
    try {
      const { data: dbGifts } = await supabase.from('gifts').select('*').eq('active', true).limit(10);
      setGifts(dbGifts && dbGifts.length > 0 ? dbGifts : mockGifts);

      const { data: orders } = await supabase
        .from('orders')
        .select('charity_amount_cents')
        .eq('status', 'completed');
      if (orders && orders.length > 0) {
        const total = orders.reduce((sum, o) => sum + (o.charity_amount_cents ?? 0), 0);
        setCharity({ totalDonatedInCents: total, estimatedPacksProvided: Math.floor(total / 500) });
      }
    } catch { /* silent */ }
  }

  const onRefresh = useCallback(async () => {
    if (isDemo) return;
    setRefreshing(true);
    await load();
    await loadGifts();
    setRefreshing(false);
  }, [isDemo]);

  const cs = activePartner?.cycleStatus;

  if (partners.length === 0) {
    return (
      <div className="min-h-screen pb-24" style={{ backgroundColor: Colors.bg }}>
        <div className="px-5 pt-14 pb-4">
          <Image src="/logo.png" alt="Broflow" width={36} height={36} className="rounded-lg" />
        </div>
        <EmptyState
          emoji="💝"
          title="Add your first partner"
          subtitle="Set up a profile to start tracking her cycle and showing up at the right time."
          action="Add partner profile"
          onAction={() => router.push('/partner/add')}
        />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto pb-24" style={{ backgroundColor: Colors.bg }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center justify-between mb-4">
          <Image src="/logo.png" alt="Broflow" width={36} height={36} className="rounded-lg" />
          <button
            onClick={onRefresh}
            className="text-sm font-medium px-3 py-1.5 rounded-full"
            style={{ backgroundColor: Colors.grayLight, color: Colors.textMid }}
          >
            {refreshing ? '↻ Refreshing…' : '↻ Refresh'}
          </button>
        </div>

        {/* Partner chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {partners.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePartner(p.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-colors"
              style={{
                backgroundColor: activePartner?.id === p.id ? Colors.coral : Colors.grayLight,
                color: activePartner?.id === p.id ? Colors.white : Colors.textMid,
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: activePartner?.id === p.id ? 'rgba(255,255,255,0.7)' : p.avatarColor }}
              />
              {p.name}
            </button>
          ))}
          <button
            onClick={() => router.push('/partner/add')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-light border-2 border-dashed flex-shrink-0"
            style={{ backgroundColor: Colors.coralLight, borderColor: Colors.coralMid, color: Colors.coral }}
          >
            +
          </button>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-4 pb-8">
        {cs ? (
          <>
            {/* Hero cycle card */}
            <div
              className="rounded-2xl p-5"
              style={{
                backgroundColor: Colors.coral,
                boxShadow: '0 8px 24px rgba(216,90,48,0.3)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  {PHASE_LABELS[cs.currentPhase]} · Day {cs.currentDay}
                </div>
                <button
                  onClick={() => router.push(`/partner/${activePartner?.id}`)}
                  className="text-xs"
                  style={{ color: 'rgba(255,255,255,0.75)' }}
                >
                  Edit ›
                </button>
              </div>

              <p className="text-3xl font-bold text-white mb-1">{activePartner?.name}</p>
              <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {cs.daysUntilPeriod === 0
                  ? 'Period starts today'
                  : cs.daysUntilPeriod < 0
                    ? `Period is ${Math.abs(cs.daysUntilPeriod)} days late`
                    : `Period in ${cs.daysUntilPeriod} day${cs.daysUntilPeriod === 1 ? '' : 's'}`
                }{cs.daysUntilPeriod <= 3 ? ' 💛' : ''}
              </p>

              <div className="flex gap-3 mb-5">
                {[
                  { num: cs.daysUntilPeriod, label: 'Days to period' },
                  { num: activePartner?.avgCycleLength, label: 'Avg cycle' },
                  { num: `${cs.cycleProgress}%`, label: 'Complete' },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-xl p-3 text-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                  >
                    <p className="text-2xl font-bold text-white">{s.num}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <PhaseBar progress={cs.cycleProgress} phase={cs.currentPhase} />
              <div className="flex justify-between mt-1.5">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>Day 1 (Period)</span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>Day {activePartner?.avgCycleLength}</span>
              </div>
            </div>

            {/* Mood alert */}
            <Card
              style={{
                borderLeftWidth: 3,
                borderLeftColor: cs.moodAlert.level === 'high' ? Colors.pink : cs.moodAlert.level === 'medium' ? Colors.amber : Colors.teal,
              }}
            >
              <div className="flex gap-3 items-start">
                <span className="text-2xl mt-0.5">{cs.moodAlert.emoji}</span>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: Colors.pink }}>{cs.moodAlert.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: Colors.textMid }}>{cs.moodAlert.message}</p>
                </div>
              </div>
            </Card>

            {/* Gift recommendations */}
            {gifts.length > 0 && (
              <div>
                <SectionHeader
                  title="Order to her door"
                  action="See all"
                  onAction={() => router.push('/gifts')}
                />
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
                  {(gifts as Record<string, unknown>[]).map((item) => (
                    <button
                      key={item.id as string}
                      onClick={() => router.push(`/gift/${item.id}`)}
                      className="flex-shrink-0 w-36 rounded-xl p-3 text-left border shadow-sm"
                      style={{ backgroundColor: Colors.white, borderColor: Colors.border }}
                    >
                      <span className="text-3xl block mb-2">
                        {(CATEGORY_EMOJI as Record<string, string>)[item.category as string] ?? '🎁'}
                      </span>
                      <p className="text-xs font-semibold leading-tight mb-0.5 line-clamp-2" style={{ color: Colors.text }}>
                        {item.name as string}
                      </p>
                      <p className="text-xs mb-1 truncate" style={{ color: Colors.textMid }}>
                        {((item.business as Record<string, string>)?.name ?? (item.sponsor as Record<string, string>)?.name) as string}
                      </p>
                      <p className="text-sm font-medium mb-1.5" style={{ color: Colors.coral }}>
                        ${((item.priceInCents as number) / 100).toFixed(0)}
                      </p>
                      {Boolean(item.sponsor) && (
                        <Badge label="Partner" color={Colors.amberLight} textColor={Colors.amber} className="mb-2" />
                      )}
                      <div
                        className="w-full py-1.5 rounded-lg text-xs font-medium text-center text-white"
                        style={{ backgroundColor: Colors.coral }}
                      >
                        Order now
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Birthday reminder */}
            {activePartner?.birthday && (() => {
              const days = daysUntilBirthday(activePartner.birthday);
              if (days > 14) return null;
              return (
                <div
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{ backgroundColor: '#FDF4FF', border: '1px solid #E9D5FF' }}
                >
                  <span className="text-2xl">🎂</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: '#7C3AED' }}>
                      {days === 0 ? `It's ${activePartner.name}'s birthday today!` : `${activePartner.name}'s birthday in ${days} day${days === 1 ? '' : 's'}`}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                      {days <= 3 ? 'Order something special today — and earn double points 🎁' : 'Plan ahead — double points on birthday month orders'}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/gifts')}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full text-white flex-shrink-0"
                    style={{ backgroundColor: '#7C3AED' }}
                  >
                    Gift her
                  </button>
                </div>
              );
            })()}

            {/* Today's advice */}
            <Card style={{ backgroundColor: Colors.tealLight, borderColor: Colors.teal }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: Colors.teal }}>
                For you today
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#085041' }}>{cs.adviceForToday}</p>
            </Card>

            {/* Fun fact */}
            <Card style={{ backgroundColor: Colors.amberLight, borderColor: Colors.amber }}>
              <p className="text-sm font-semibold mb-1" style={{ color: Colors.amber }}>💡 Did you know?</p>
              <p className="text-sm leading-relaxed" style={{ color: '#633806' }}>{cs.funFact}</p>
            </Card>
          </>
        ) : (
          <Card>
            <p className="text-sm leading-relaxed" style={{ color: Colors.textMid }}>
              Add her last period date to see her cycle status.
            </p>
            <Button
              label="Add period date"
              onClick={() => router.push(`/partner/${activePartner?.id}`)}
              variant="secondary"
              size="sm"
              className="mt-4"
            />
          </Card>
        )}

        {/* Charity banner */}
        <div className="rounded-xl p-5 flex items-center gap-4" style={{ backgroundColor: '#1A1A18' }}>
          <span className="text-4xl font-bold flex-shrink-0" style={{ color: Colors.coralMid }}>15%</span>
          <div>
            <p className="text-sm font-semibold text-white mb-0.5">Every purchase gives back</p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {charityStats
                ? `$${(charityStats.totalDonatedInCents / 100).toFixed(0)} donated · ${charityStats.estimatedPacksProvided} tampon packs provided`
                : 'Every order donates 15% to homeless women'
              }
            </p>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
