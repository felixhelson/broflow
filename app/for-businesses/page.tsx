'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Colors } from '../../src/utils/theme';
import { Button } from '../../src/components/ui';

const CATEGORIES = ['CHOCOLATE', 'FLOWERS', 'WELLNESS', 'FOOD', 'CANDLES', 'SKINCARE', 'TEA', 'OTHER'];
const NOTIFICATION_METHODS = [
  { value: 'email', label: '📧 Email' },
  { value: 'sms', label: '📱 SMS' },
  { value: 'whatsapp', label: '💬 WhatsApp' },
];

export default function ForBusinessesPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const [businessName, setBusinessName]           = useState('');
  const [category, setCategory]                   = useState('');
  const [websiteUrl, setWebsiteUrl]               = useState('');
  const [contactName, setContactName]             = useState('');
  const [contactEmail, setContactEmail]           = useState('');
  const [contactPhone, setContactPhone]           = useState('');
  const [notificationMethod, setNotificationMethod] = useState('email');
  const [message, setMessage]                     = useState('');

  async function handleSubmit() {
    if (!businessName || !category || !contactName || !contactEmail) {
      return setError('Please fill in all required fields.');
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/sponsor-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName, category, websiteUrl,
          contactName, contactEmail, contactPhone,
          notificationMethod, message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error ?? 'Something went wrong — try again.');
      }
    } catch {
      setError('Something went wrong — check your connection.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto" style={{ backgroundColor: Colors.bg }}>
        <span className="text-6xl mb-4">🎉</span>
        <h2 className="text-2xl font-bold mb-2" style={{ color: Colors.text }}>Application received!</h2>
        <p className="text-sm leading-relaxed" style={{ color: Colors.textMid }}>
          Thanks for applying to list your business on Broflow. We'll be in touch within 2 business days.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-16" style={{ backgroundColor: Colors.bg }}>
      {/* Header */}
      <div className="px-6 pt-14 pb-8 max-w-lg mx-auto">
        <Image src="/logo.png" alt="Broflow" width={40} height={40} className="rounded-lg mb-4" />
        <h1 className="text-3xl font-bold mb-2" style={{ color: Colors.text }}>
          List your business on <span style={{ color: Colors.coral }}>Broflow</span>
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: Colors.textMid }}>
          Reach men who are actively looking to buy thoughtful gifts for their partners. We match your products to the right moment in her cycle.
        </p>
      </div>

      {/* Why Broflow */}
      <div className="mx-6 mb-8 rounded-2xl p-5 max-w-lg mx-auto" style={{ backgroundColor: Colors.coralLight, border: `1px solid ${Colors.coralMid}` }}>
        {[
          { emoji: '🎯', text: 'Your products shown to buyers at the exact right moment' },
          { emoji: '📦', text: 'One-time and monthly recurring orders' },
          { emoji: '💝', text: '15% of every order donated to homeless women' },
          { emoji: '🔔', text: 'Instant order notifications via email, SMS or WhatsApp' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
            <span className="text-xl">{item.emoji}</span>
            <span className="text-sm font-medium" style={{ color: Colors.coral }}>{item.text}</span>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="px-6 flex flex-col gap-4 max-w-lg mx-auto">
        <h2 className="text-lg font-bold" style={{ color: Colors.text }}>Apply to be listed</h2>

        {error && (
          <div className="px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
        )}

        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: Colors.textMid }}>Business name *</label>
          <input
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ borderColor: Colors.border, color: Colors.text, backgroundColor: Colors.white }}
            placeholder="e.g. Pana Chocolate"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: Colors.textMid }}>Category *</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: category === cat ? Colors.coral : Colors.grayLight,
                  color: category === cat ? Colors.white : Colors.textMid,
                }}
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: Colors.textMid }}>Website URL</label>
          <input
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ borderColor: Colors.border, color: Colors.text, backgroundColor: Colors.white }}
            placeholder="https://yourbusiness.com.au"
            value={websiteUrl}
            onChange={e => setWebsiteUrl(e.target.value)}
          />
        </div>

        <div className="h-px" style={{ backgroundColor: Colors.border }} />

        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: Colors.textMid }}>Your name *</label>
          <input
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ borderColor: Colors.border, color: Colors.text, backgroundColor: Colors.white }}
            placeholder="Jane Smith"
            value={contactName}
            onChange={e => setContactName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: Colors.textMid }}>Email address *</label>
          <input
            type="email"
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ borderColor: Colors.border, color: Colors.text, backgroundColor: Colors.white }}
            placeholder="jane@yourbusiness.com.au"
            value={contactEmail}
            onChange={e => setContactEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: Colors.textMid }}>Phone number</label>
          <input
            type="tel"
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ borderColor: Colors.border, color: Colors.text, backgroundColor: Colors.white }}
            placeholder="+61 4xx xxx xxx"
            value={contactPhone}
            onChange={e => setContactPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: Colors.textMid }}>How would you like to receive orders?</label>
          <div className="flex gap-2">
            {NOTIFICATION_METHODS.map(method => (
              <button
                key={method.value}
                onClick={() => setNotificationMethod(method.value)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  backgroundColor: notificationMethod === method.value ? Colors.coral : Colors.grayLight,
                  color: notificationMethod === method.value ? Colors.white : Colors.textMid,
                }}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: Colors.textMid }}>Anything else you'd like us to know?</label>
          <textarea
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
            style={{ borderColor: Colors.border, color: Colors.text, backgroundColor: Colors.white }}
            placeholder="Tell us about your products, delivery areas, or any questions..."
            rows={4}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>

        <Button
          label="Submit application"
          onClick={handleSubmit}
          loading={loading}
          size="lg"
          className="w-full mt-2"
        />

        <p className="text-xs text-center pb-4" style={{ color: Colors.textMid }}>
          We review all applications within 2 business days.
        </p>
      </div>
    </main>
  );
}
