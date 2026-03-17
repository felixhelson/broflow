'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePartnersStore } from '../../../src/store/partnersStore';
import { supabase } from '../../../src/lib/supabase';
import { useAuthStore } from '../../../src/store/authStore';
import { mockGifts } from '../../../src/lib/mockData';
import { Colors, CATEGORY_EMOJI } from '../../../src/utils/theme';
import { Button, Badge, Card } from '../../../src/components/ui';

export default function GiftDetailScreen() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { partners, activePartnerId } = usePartnersStore();
  const activePartner = partners.find(p => p.id === activePartnerId) ?? partners[0] ?? null;
  const { user } = useAuthStore();
  const isDemo = user?.id === 'demo-user-1';

  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [ordered, setOrdered]       = useState(false);
  const [error, setError]           = useState('');
  const [usePoints, setUsePoints]   = useState(false);
  const [isMonthly, setIsMonthly]   = useState(false);

  const [line1, setLine1]       = useState('');
  const [city, setCity]         = useState('');
  const [state, setState]       = useState('');
  const [postcode, setPostcode] = useState('');

  useEffect(() => {
    // Try mock data first (instant)
    const mock = mockGifts.find(g => g.id === id);
    if (mock) { setProduct(mock as Record<string, unknown>); return; }
    // Otherwise fetch from Supabase gifts table
    supabase.from('gifts').select('*').eq('id', id).single()
      .then(({ data }) => { if (data) setProduct(data as Record<string, unknown>); });
  }, [id]);

  async function handleOrder() {
    if (!line1 || !city || !postcode) {
      return setError('Add delivery address — we need it to send this.');
    }
    setLoading(true);
    setError('');

    // Demo mode — skip payment, show success immediately
    if (isDemo) {
      setOrdered(true);
      setLoading(false);
      return;
    }

    // Live mode — create Stripe Checkout session and redirect
    const pointsBalance = user?.pointsBalance ?? 0;
    const maxRedeemable = Math.min(pointsBalance, Math.floor(((product?.priceInCents as number) - 100) / 100) * 100);
    const pointsToRedeem = !isMonthly && usePoints && maxRedeemable >= 100 ? maxRedeemable : 0;

    const endpoint = isMonthly ? '/api/subscribe' : '/api/checkout';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: id,
          productName: product?.name,
          priceInCents: product?.priceInCents,
          partnerId: activePartner?.id,
          userId: user?.id,
          pointsToRedeem,
          deliveryAddress: { line1, city, state, postcode, country: 'AU' },
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? 'Could not start checkout — try again.');
      }
    } catch {
      setError('Something went wrong — check your connection.');
    } finally {
      setLoading(false);
    }
  }

  if (ordered) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-8 text-center"
        style={{ backgroundColor: Colors.bg }}
      >
        <span className="text-7xl mb-6">🎉</span>
        <h2 className="text-3xl font-bold mb-3" style={{ color: Colors.text }}>Order placed!</h2>
        <p className="text-sm leading-relaxed mb-10" style={{ color: Colors.textMid }}>
          {product?.name as string} is on its way to {activePartner?.name}.
          <br /><br />
          💝 A donation has been made to the Period Dignity Project.
        </p>
        <Button label="Back to home" onClick={() => router.replace('/home')} size="lg" className="w-full max-w-xs" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: Colors.bg }}>
        <span className="text-sm" style={{ color: Colors.textMid }}>Loading…</span>
      </div>
    );
  }

  const priceInCents   = product.priceInCents as number;
  const price          = priceInCents / 100;
  const charity        = price * 0.15;
  const pointsBalance  = user?.pointsBalance ?? 0;
  const maxRedeemable  = Math.min(pointsBalance, Math.floor((priceInCents - 100) / 100) * 100);
  const discountCents  = usePoints && maxRedeemable >= 100 ? maxRedeemable : 0;
  const effectivePrice = (priceInCents - discountCents) / 100;

  return (
    <div className="min-h-screen" style={{ backgroundColor: Colors.bg }}>
      <div className="w-8 h-1 rounded-full mx-auto mt-3 mb-6" style={{ backgroundColor: Colors.border }} />

      <div className="px-5 pb-16 flex flex-col gap-4 max-w-lg mx-auto">
        {/* Product header */}
        <div className="flex items-center gap-4">
          <span className="text-5xl">
            {(CATEGORY_EMOJI as Record<string, string>)[product.category as string] ?? '🎁' as React.ReactNode}
          </span>
          <div className="flex-1">
            <p className="text-xl font-semibold" style={{ color: Colors.text }}>{product.name as string}</p>
            <p className="text-sm mt-0.5" style={{ color: Colors.textMid }}>
              {((product.business as Record<string, string>)?.name ?? (product.sponsor as Record<string, string>)?.name) as string}
            </p>
          </div>
          {Boolean(product.sponsor) && (
            <Badge label="Partner" color={Colors.amberLight} textColor={Colors.amber} />
          )}
        </div>

        {Boolean(product.description) && (
          <p className="text-sm leading-relaxed" style={{ color: Colors.textMid }}>{product.description as string}</p>
        )}

        {/* Price breakdown */}
        <Card>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm" style={{ color: Colors.textMid }}>Subtotal</span>
            <span className="text-sm font-medium" style={{ color: Colors.text }}>${price.toFixed(2)}</span>
          </div>
          <div
            className="flex justify-between items-center rounded-lg px-2 py-2 mb-2"
            style={{ backgroundColor: Colors.tealLight }}
          >
            <span className="text-xs" style={{ color: Colors.teal }}>💝 Charity donation (15%)</span>
            <span className="text-xs font-medium" style={{ color: Colors.teal }}>${charity.toFixed(2)}</span>
          </div>
          <div className="h-px my-2" style={{ backgroundColor: Colors.border }} />
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold" style={{ color: Colors.text }}>Total charged</span>
            <span className="text-sm font-semibold" style={{ color: Colors.coral }}>${price.toFixed(2)}</span>
          </div>
          <p className="text-xs mt-2 leading-relaxed" style={{ color: Colors.textMid }}>
            ${charity.toFixed(2)} goes to the Period Dignity Project to provide tampons for homeless women.
          </p>
        </Card>

        {/* One-time vs monthly toggle */}
        <div
          className="flex rounded-xl overflow-hidden border"
          style={{ borderColor: Colors.border }}
        >
          {(['one-time', 'monthly'] as const).map(type => (
            <button
              key={type}
              onClick={() => { setIsMonthly(type === 'monthly'); if (type === 'monthly') setUsePoints(false); }}
              className="flex-1 py-3 text-sm font-semibold transition-colors"
              style={{
                backgroundColor: (type === 'monthly') === isMonthly ? Colors.coral : Colors.white,
                color: (type === 'monthly') === isMonthly ? Colors.white : Colors.textMid,
              }}
            >
              {type === 'one-time' ? 'One-time' : '📦 Monthly delivery'}
            </button>
          ))}
        </div>
        {isMonthly && (
          <div className="rounded-xl px-4 py-3" style={{ backgroundColor: Colors.coralLight, border: `1px solid ${Colors.coralMid}` }}>
            <p className="text-xs leading-relaxed" style={{ color: Colors.coral }}>
              She gets a fresh {product.name as string} every month. Cancel any time from your profile. 15% goes to charity every order.
            </p>
          </div>
        )}

        {/* Points redemption */}
        {!isDemo && maxRedeemable >= 100 && (
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: Colors.coralLight, border: `1px solid ${Colors.coralMid}` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: Colors.coral }}>
                  Use {maxRedeemable} points
                </p>
                <p className="text-xs mt-0.5" style={{ color: Colors.textMid }}>
                  Save ${(maxRedeemable / 100).toFixed(2)} on this order
                </p>
              </div>
              <button
                onClick={() => setUsePoints(v => !v)}
                className="w-12 h-6 rounded-full transition-colors flex-shrink-0 relative"
                style={{ backgroundColor: usePoints ? Colors.coral : Colors.border }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                  style={{ transform: usePoints ? 'translateX(26px)' : 'translateX(2px)' }}
                />
              </button>
            </div>
            {usePoints && (
              <p className="text-xs mt-2 font-medium" style={{ color: Colors.coral }}>
                ✓ ${(maxRedeemable / 100).toFixed(2)} discount applied at checkout
              </p>
            )}
          </div>
        )}

        {/* Free gift unlock */}
        {!isDemo && (user?.pointsBalance ?? 0) >= 500 && (
          <div
            className="rounded-xl p-4 flex items-center gap-3"
            style={{ backgroundColor: '#FEF9C3', border: '1px solid #FDE047' }}
          >
            <span className="text-2xl">🎁</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#92400E' }}>Free gift available!</p>
              <p className="text-xs mt-0.5" style={{ color: '#78350F' }}>
                You have {user?.pointsBalance} points — enough to unlock a free reward. Visit the Gifts tab to redeem.
              </p>
            </div>
          </div>
        )}

        {/* Delivery address */}
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: Colors.text }}>Delivery address</p>
          {activePartner && (
            <p className="text-xs mb-3" style={{ color: Colors.textMid }}>Sending to {activePartner.name}</p>
          )}

          {error && (
            <div className="mb-3 px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <input
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: Colors.border, color: Colors.text, backgroundColor: Colors.white }}
              placeholder="Street address"
              value={line1}
              onChange={e => setLine1(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                className="flex-[2] px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ borderColor: Colors.border, color: Colors.text, backgroundColor: Colors.white }}
                placeholder="City"
                value={city}
                onChange={e => setCity(e.target.value)}
              />
              <input
                className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ borderColor: Colors.border, color: Colors.text, backgroundColor: Colors.white }}
                placeholder="State"
                value={state}
                onChange={e => setState(e.target.value)}
              />
              <input
                className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ borderColor: Colors.border, color: Colors.text, backgroundColor: Colors.white }}
                placeholder="Postcode"
                value={postcode}
                onChange={e => setPostcode(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Button
          label={isMonthly ? `Subscribe — $${price.toFixed(2)}/month` : `Order for $${effectivePrice.toFixed(2)}`}
          onClick={handleOrder}
          loading={loading}
          size="lg"
          className="w-full mt-2"
        />

        <button
          onClick={() => router.back()}
          className="text-sm py-2 text-center"
          style={{ color: Colors.textMid }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
