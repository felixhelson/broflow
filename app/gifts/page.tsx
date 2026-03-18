'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePartnersStore } from '../../src/store/partnersStore';
import { useAuthStore } from '../../src/store/authStore';
import { mockGifts, mockRewardGifts } from '../../src/lib/mockData';
import { supabase } from '../../src/lib/supabase';
import { Colors, CATEGORY_EMOJI, PHASE_LABELS } from '../../src/utils/theme';
import { EmptyState } from '../../src/components/ui';
import { BottomNav } from '../../src/components/BottomNav';

const CATEGORIES = ['All', 'CHOCOLATE', 'FLOWERS', 'WELLNESS', 'FOOD', 'CANDLES', 'SKINCARE', 'TEA'];

export default function GiftsScreen() {
  const router = useRouter();
  const { partners, activePartnerId } = usePartnersStore();
  const activePartner = partners.find(p => p.id === activePartnerId) ?? partners[0] ?? null;
  const { user } = useAuthStore();
  const isDemo = user?.id === 'demo-user-1';

  const [allGifts, setAllGifts]         = useState<Record<string, unknown>[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading]           = useState(true);
  const [redeemingId, setRedeemingId]   = useState<string | null>(null);
  const [redeemedId, setRedeemedId]     = useState<string | null>(null);
  const [redeemError, setRedeemError]   = useState('');

  const pointsBalance = user?.pointsBalance ?? 0;
  const canRedeem = !isDemo && pointsBalance >= 500;
  const showRewards = isDemo || pointsBalance > 0 || canRedeem;

  useEffect(() => {
    // Always show mock gifts immediately — replace if real API responds
    setAllGifts(mockGifts as Record<string, unknown>[]);
    setLoading(false);
    if (!isDemo) {
      supabase.from('gifts').select('*').eq('active', true)
        .then(({ data }) => {
          if (data && data.length > 0) setAllGifts(data as Record<string, unknown>[]);
        });
    }
  }, [activePartner?.id]);

  async function handleRedeem(gift: Record<string, unknown>) {
    setRedeemingId(gift.id as string);
    setRedeemError('');
    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          giftId: gift.id,
          giftName: gift.name,
          partnerId: activePartner?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRedeemedId(gift.id as string);
      } else {
        setRedeemError(data.error ?? 'Could not redeem — try again.');
      }
    } catch {
      setRedeemError('Something went wrong.');
    } finally {
      setRedeemingId(null);
    }
  }

  const gifts = activeCategory === 'All'
    ? allGifts
    : allGifts.filter(g => g.category === activeCategory);

  const cs = activePartner?.cycleStatus;

  return (
    <main className="min-h-screen pb-24" style={{ backgroundColor: Colors.bg }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => router.back()} className="text-2xl" style={{ color: Colors.text }}>←</button>
          <h1 className="text-xl font-bold" style={{ color: Colors.text }}>Gifts</h1>
        </div>
        {activePartner && (
          <p className="text-sm ml-9" style={{ color: Colors.textMid }}>
            {cs ? `${PHASE_LABELS[cs.currentPhase]} phase · matched for ${activePartner.name}` : `For ${activePartner.name}`}
          </p>
        )}
      </div>

      {/* Phase context banner */}
      {cs && (
        <div className="mx-5 mb-4 mt-2 rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ backgroundColor: Colors.coralLight, border: `1px solid ${Colors.coralMid}` }}>
          <span className="text-2xl">{cs.moodAlert.emoji}</span>
          <div>
            <p className="text-xs font-semibold" style={{ color: Colors.coral }}>
              {cs.moodAlert.title} · Day {cs.currentDay}
            </p>
            <p className="text-xs leading-relaxed mt-0.5" style={{ color: Colors.textMid }}>
              {cs.giftRecommendations[0]?.reason ?? 'Phase-matched picks below'}
            </p>
          </div>
        </div>
      )}

      {/* Rewards section */}
      {showRewards && (
        <div className="px-5 mb-4">
          <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
            <div className="px-4 pt-4 pb-3 flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-base">🎁 Free gift — {isDemo ? 500 : pointsBalance} pts</p>
                <p className="text-purple-200 text-xs mt-0.5">
                  {isDemo ? 'Demo: see how rewards work' : 'Choose one free gift to redeem'}
                </p>
              </div>
              <span className="text-2xl">🏆</span>
            </div>
            {redeemError && (
              <div className="mx-4 mb-3 px-3 py-2 rounded-lg bg-red-100 text-red-700 text-xs">{redeemError}</div>
            )}
            <div className="flex gap-3 overflow-x-auto px-4 pb-4">
              {mockRewardGifts.map(gift => (
                <div
                  key={gift.id}
                  className="flex-shrink-0 w-40 rounded-xl p-3 flex flex-col"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                >
                  <span className="text-3xl block mb-2">
                    {(CATEGORY_EMOJI as Record<string, string>)[gift.category] ?? '🎁'}
                  </span>
                  <p className="text-xs font-semibold text-white leading-tight mb-0.5 line-clamp-2">{gift.name}</p>
                  <p className="text-xs text-purple-200 mb-3">{gift.business.name}</p>
                  {redeemedId === gift.id ? (
                    <div className="mt-auto py-2 rounded-lg text-xs font-semibold text-center text-white bg-green-500">
                      ✓ Redeemed!
                    </div>
                  ) : (
                    <button
                      onClick={() => isDemo ? setRedeemError('Sign up to redeem rewards') : handleRedeem(gift as Record<string, unknown>)}
                      disabled={redeemingId === gift.id || !!redeemedId}
                      className="mt-auto py-2 rounded-lg text-xs font-semibold text-center transition-opacity disabled:opacity-50"
                      style={{ backgroundColor: 'white', color: '#7C3AED' }}
                    >
                      {redeemingId === gift.id ? 'Redeeming…' : 'Redeem free'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-3 mb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeCategory === cat ? Colors.coral : Colors.grayLight,
              color: activeCategory === cat ? Colors.white : Colors.textMid,
            }}
          >
            {cat === 'All' ? 'All' : `${(CATEGORY_EMOJI as Record<string, string>)[cat] ?? ''} ${cat.charAt(0) + cat.slice(1).toLowerCase()}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="text-sm" style={{ color: Colors.textMid }}>Loading…</span>
        </div>
      ) : gifts.length === 0 ? (
        <EmptyState
          emoji="🎁"
          title="No gifts in this category"
          subtitle={activeCategory === 'All' ? 'Connect to the backend to see phase-matched recommendations.' : `No ${activeCategory.toLowerCase()} gifts available right now.`}
          action={activeCategory !== 'All' ? 'Show all' : undefined}
          onAction={activeCategory !== 'All' ? () => setActiveCategory('All') : undefined}
        />
      ) : (
        <div className="px-5 grid grid-cols-2 gap-3 max-w-lg mx-auto">
          {gifts.map(item => (
            <button
              key={item.id as string}
              onClick={() => router.push(`/gift/${item.id}`)}
              className="rounded-xl text-left border shadow-sm flex flex-col hover:opacity-90 transition-opacity overflow-hidden"
              style={{ backgroundColor: Colors.white, borderColor: Colors.border }}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl as string}
                  alt={item.name as string}
                  className="w-full h-32 object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-32 flex items-center justify-center" style={{ backgroundColor: Colors.grayLight }}>
                  <span className="text-4xl">{(CATEGORY_EMOJI as Record<string, string>)[item.category as string] ?? '🎁'}</span>
                </div>
              )}
              <div className="p-3 flex flex-col flex-1">
                <p className="text-sm font-semibold leading-tight mb-1 line-clamp-2" style={{ color: Colors.text }}>
                  {item.name as string}
                </p>
                <p className="text-xs mb-2 truncate" style={{ color: Colors.textMid }}>
                  {((item.business as Record<string, string>)?.name ?? (item.sponsor as Record<string, string>)?.name) as string}
                </p>
                <p className="text-sm font-semibold mt-auto" style={{ color: Colors.coral }}>
                  ${((item.priceInCents as number) / 100).toFixed(0)}
                </p>
                <div
                  className="w-full mt-2 py-2 rounded-lg text-xs font-medium text-center text-white"
                  style={{ backgroundColor: Colors.coral }}
                >
                  Order now
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      {/* For businesses CTA */}
      <div className="mx-5 mt-6 mb-4 rounded-2xl p-5" style={{ backgroundColor: '#1A1A18' }}>
        <p className="text-white font-bold text-base mb-1">🏪 List your business on Broflow</p>
        <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Reach men who are actively looking to buy thoughtful gifts. Get orders directly to your inbox.
        </p>
        <button
          onClick={() => router.push('/for-businesses')}
          className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: Colors.coral, color: Colors.white }}
        >
          Apply now →
        </button>
      </div>
      <BottomNav />
    </main>
  );
}
