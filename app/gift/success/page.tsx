'use client';
import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Colors } from '../../../src/utils/theme';
import { Button } from '../../../src/components/ui';

function SuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const productName = params.get('product') ?? 'Your gift';
  const isRecurring = params.get('recurring') === '1';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8 text-center"
      style={{ backgroundColor: Colors.bg }}
    >
      <span className="text-7xl mb-6">{isRecurring ? '📦' : '🎉'}</span>
      <h2 className="text-3xl font-bold mb-3" style={{ color: Colors.text }}>
        {isRecurring ? 'Subscription started!' : 'Order placed!'}
      </h2>
      <p className="text-sm leading-relaxed mb-10" style={{ color: Colors.textMid }}>
        <span className="font-medium" style={{ color: Colors.text }}>{productName}</span>
        {isRecurring ? ' will arrive every month.' : ' is on its way.'}
        <br /><br />
        {isRecurring
          ? '📦 You can cancel anytime from your profile. 💝 10% of every delivery goes to White Ribbon Australia.'
          : '💝 A donation has been made to White Ribbon Australia on this order.'
        }
      </p>
      <Button
        label="Back to home"
        onClick={() => router.replace('/home')}
        size="lg"
        className="w-full max-w-xs"
      />
    </div>
  );
}

export default function GiftSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: Colors.bg }}>
          <span className="text-sm" style={{ color: Colors.textMid }}>Loading…</span>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
