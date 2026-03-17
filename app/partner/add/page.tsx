'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePartnersStore } from '../../../src/store/partnersStore';
import { useAuthStore } from '../../../src/store/authStore';
import { calculateCycleStatus } from '../../../src/lib/cycleEngine';
import { Button } from '../../../src/components/ui';
import { Colors } from '../../../src/utils/theme';

const AVATAR_COLORS = ['#E84C8B', '#8B5CF6', '#0D9488', '#D97706', '#D85A30', '#3B82F6'];

export default function AddPartnerScreen() {
  const router = useRouter();
  const { createPartner, partners } = usePartnersStore();
  const { user } = useAuthStore();
  const isDemo = user?.id === 'demo-user-1';

  const [name, setName]               = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [lastPeriod, setLastPeriod]   = useState('');
  const [birthday, setBirthday]       = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  async function handleSubmit() {
    if (!name.trim()) return setError('Give her a name');
    setLoading(true);
    setError('');
    try {
      await createPartner({
        name: name.trim(),
        avatarColor,
        avgCycleLength: cycleLength,
        avgPeriodLength: periodLength,
        lastPeriodStart: lastPeriod || undefined,
        birthday: birthday || undefined,
      });
      router.replace('/home');
    } catch {
      if (isDemo) {
        // In demo mode: API is down, push partner locally with computed cycle status
        usePartnersStore.setState(state => {
          const partner = {
            id: `demo-${Date.now()}`,
            name: name.trim(),
            avatarColor,
            avgCycleLength: cycleLength,
            avgPeriodLength: periodLength,
            lastPeriodStart: lastPeriod || null,
            birthday: birthday || null,
            notes: null,
            cycleStatus: lastPeriod
              ? calculateCycleStatus(lastPeriod, cycleLength, periodLength)
              : null,
          };
          return {
            partners: [...state.partners, partner],
            activePartnerId: partner.id,
          };
        });
        router.replace('/home');
      } else {
        setError('Failed to save — check your connection');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen pb-16" style={{ backgroundColor: Colors.bg }}>
      <div className="px-5 pt-14 pb-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-2xl" style={{ color: Colors.text }}>←</button>
        <h1 className="text-xl font-bold" style={{ color: Colors.text }}>Add partner</h1>
      </div>

      <div className="px-5 flex flex-col gap-5 max-w-lg mx-auto">
        {error && (
          <div className="px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
        )}

        {/* Name */}
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: Colors.textMid }}>Her name</label>
          <input
            className="w-full px-4 py-3 rounded-xl border text-base outline-none"
            style={{ borderColor: Colors.border, color: Colors.text, backgroundColor: Colors.white }}
            placeholder="e.g. Sophia"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>

        {/* Avatar color */}
        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: Colors.textMid }}>Profile colour</label>
          <div className="flex gap-3">
            {AVATAR_COLORS.map(color => (
              <button
                key={color}
                onClick={() => setAvatarColor(color)}
                className="w-9 h-9 rounded-full transition-transform"
                style={{
                  backgroundColor: color,
                  outline: avatarColor === color ? `3px solid ${color}` : 'none',
                  outlineOffset: 2,
                  transform: avatarColor === color ? 'scale(1.15)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Cycle length */}
        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: Colors.textMid }}>
            Average cycle length <span style={{ color: Colors.textMid }}>({cycleLength} days)</span>
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCycleLength(l => Math.max(21, l - 1))}
              className="w-10 h-10 rounded-full text-xl font-medium flex items-center justify-center"
              style={{ backgroundColor: Colors.grayLight, color: Colors.text }}
            >−</button>
            <span className="text-2xl font-bold w-10 text-center" style={{ color: Colors.text }}>{cycleLength}</span>
            <button
              onClick={() => setCycleLength(l => Math.min(40, l + 1))}
              className="w-10 h-10 rounded-full text-xl font-medium flex items-center justify-center"
              style={{ backgroundColor: Colors.grayLight, color: Colors.text }}
            >+</button>
          </div>
        </div>

        {/* Period length */}
        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: Colors.textMid }}>
            Average period length <span style={{ color: Colors.textMid }}>({periodLength} days)</span>
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPeriodLength(l => Math.max(2, l - 1))}
              className="w-10 h-10 rounded-full text-xl font-medium flex items-center justify-center"
              style={{ backgroundColor: Colors.grayLight, color: Colors.text }}
            >−</button>
            <span className="text-2xl font-bold w-10 text-center" style={{ color: Colors.text }}>{periodLength}</span>
            <button
              onClick={() => setPeriodLength(l => Math.min(10, l + 1))}
              className="w-10 h-10 rounded-full text-xl font-medium flex items-center justify-center"
              style={{ backgroundColor: Colors.grayLight, color: Colors.text }}
            >+</button>
          </div>
        </div>

        {/* Last period date */}
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: Colors.textMid }}>
            Last period start date <span className="font-normal">(optional)</span>
          </label>
          <input
            type="date"
            className="w-full px-4 py-3 rounded-xl border text-base outline-none"
            style={{ borderColor: Colors.border, color: Colors.text, backgroundColor: Colors.white }}
            value={lastPeriod}
            onChange={e => setLastPeriod(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Birthday */}
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: Colors.textMid }}>
            Her birthday <span className="font-normal">(optional — unlocks birthday reminders & bonus points)</span>
          </label>
          <input
            type="date"
            className="w-full px-4 py-3 rounded-xl border text-base outline-none"
            style={{ borderColor: Colors.border, color: Colors.text, backgroundColor: Colors.white }}
            value={birthday}
            onChange={e => setBirthday(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <Button
          label="Save partner"
          onClick={handleSubmit}
          loading={loading}
          size="lg"
          className="w-full mt-2"
        />
      </div>
    </main>
  );
}
