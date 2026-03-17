'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePartnersStore } from '../../../src/store/partnersStore';
import { useAuthStore } from '../../../src/store/authStore';
import { calculateCycleStatus } from '../../../src/lib/cycleEngine';
import { Button } from '../../../src/components/ui';
import { Colors } from '../../../src/utils/theme';

const AVATAR_COLORS = ['#E84C8B', '#8B5CF6', '#0D9488', '#D97706', '#D85A30', '#3B82F6'];

export default function EditPartnerScreen() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { partners, updatePartner, deletePartner, logPeriod } = usePartnersStore();
  const { user } = useAuthStore();
  const isDemo = user?.id === 'demo-user-1';

  const partner = partners.find(p => p.id === id);

  const [name, setName]               = useState(partner?.name ?? '');
  const [avatarColor, setAvatarColor] = useState(partner?.avatarColor ?? AVATAR_COLORS[0]);
  const [cycleLength, setCycleLength] = useState(partner?.avgCycleLength ?? 28);
  const [periodLength, setPeriodLength] = useState(partner?.avgPeriodLength ?? 5);
  const [lastPeriod, setLastPeriod]   = useState(partner?.lastPeriodStart ?? '');
  const [birthday, setBirthday]       = useState(partner?.birthday ?? '');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [periodLogged, setPeriodLogged] = useState(false);

  useEffect(() => {
    if (partner) {
      setName(partner.name);
      setAvatarColor(partner.avatarColor);
      setCycleLength(partner.avgCycleLength);
      setPeriodLength(partner.avgPeriodLength);
      setLastPeriod(partner.lastPeriodStart ?? '');
      setBirthday(partner.birthday ?? '');
    }
  }, [partner?.id]);

  async function handleSave() {
    if (!name.trim()) return setError('Name is required');
    setLoading(true);
    setError('');
    try {
      if (!isDemo) {
        await updatePartner(id, {
          name: name.trim(),
          avatarColor,
          avgCycleLength: cycleLength,
          avgPeriodLength: periodLength,
          lastPeriodStart: lastPeriod || undefined,
          birthday: birthday || undefined,
        });
      } else {
        // Demo: update store directly with recomputed cycle status
        usePartnersStore.setState(state => ({
          partners: state.partners.map(p => {
            if (p.id !== id) return p;
            const newLastPeriod = lastPeriod || null;
            return {
              ...p,
              name: name.trim(),
              avatarColor,
              avgCycleLength: cycleLength,
              avgPeriodLength: periodLength,
              lastPeriodStart: newLastPeriod,
              cycleStatus: newLastPeriod
                ? calculateCycleStatus(newLastPeriod, cycleLength, periodLength)
                : p.cycleStatus,
            };
          }),
        }));
      }
      router.back();
    } catch {
      setError('Failed to save — check your connection');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogPeriod() {
    const today = new Date().toISOString().split('T')[0];
    try {
      if (!isDemo) await logPeriod(id, today);
      else {
        usePartnersStore.setState(state => ({
          partners: state.partners.map(p => {
            if (p.id !== id) return p;
            return {
              ...p,
              lastPeriodStart: today,
              cycleStatus: calculateCycleStatus(today, p.avgCycleLength, p.avgPeriodLength),
            };
          }),
        }));
      }
      setPeriodLogged(true);
      setLastPeriod(today);
    } catch {
      setError('Could not log period — check your connection');
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove ${partner?.name}? This can't be undone.`)) return;
    try {
      if (!isDemo) await deletePartner(id);
      else usePartnersStore.setState(state => ({
        partners: state.partners.filter(p => p.id !== id),
        activePartnerId: state.partners.filter(p => p.id !== id)[0]?.id ?? null,
      }));
      router.replace('/home');
    } catch {
      setError('Failed to delete');
    }
  }

  if (!partner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: Colors.bg }}>
        <span className="text-4xl">🤷</span>
        <p className="text-sm" style={{ color: Colors.textMid }}>Partner not found</p>
        <Button label="Go home" onClick={() => router.replace('/home')} variant="ghost" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-16" style={{ backgroundColor: Colors.bg }}>
      <div className="px-5 pt-14 pb-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-2xl" style={{ color: Colors.text }}>←</button>
        <h1 className="text-xl font-bold" style={{ color: Colors.text }}>{partner.name}</h1>
      </div>

      <div className="px-5 flex flex-col gap-5 max-w-lg mx-auto">
        {error && (
          <div className="px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
        )}

        {/* Log period today */}
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{ backgroundColor: Colors.coralLight, border: `1px solid ${Colors.coralMid}` }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: Colors.coral }}>Period tracker</p>
            <p className="text-xs mt-0.5" style={{ color: Colors.textMid }}>
              {periodLogged ? '✓ Logged today' : lastPeriod ? `Last: ${lastPeriod}` : 'No period logged yet'}
            </p>
          </div>
          <Button
            label={periodLogged ? 'Logged ✓' : 'Log today'}
            onClick={handleLogPeriod}
            variant="secondary"
            size="sm"
            disabled={periodLogged}
          />
        </div>

        {/* Name */}
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: Colors.textMid }}>Name</label>
          <input
            className="w-full px-4 py-3 rounded-xl border text-base outline-none"
            style={{ borderColor: Colors.border, color: Colors.text, backgroundColor: Colors.white }}
            value={name}
            onChange={e => setName(e.target.value)}
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
            Average cycle length ({cycleLength} days)
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
            Average period length ({periodLength} days)
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
            Last period start date
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
            Birthday <span className="font-normal">(optional — unlocks birthday reminders & bonus points)</span>
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

        <Button label="Save changes" onClick={handleSave} loading={loading} size="lg" className="w-full mt-2" />

        <div className="h-px my-1" style={{ backgroundColor: Colors.border }} />

        <Button
          label={`Remove ${partner.name}`}
          onClick={handleDelete}
          variant="danger"
          size="md"
          className="w-full"
        />
      </div>
    </main>
  );
}
