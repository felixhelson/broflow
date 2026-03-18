'use client';
import React, { useState } from 'react';
import { usePartnersStore } from '../../src/store/partnersStore';
import { Colors, PHASE_LABELS } from '../../src/utils/theme';
import { BottomNav } from '../../src/components/BottomNav';
import { EmptyState } from '../../src/components/ui';

type Phase = 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATION' | 'LUTEAL';

const PHASE_COLORS: Record<Phase, { bg: string; text: string; dot: string }> = {
  MENSTRUAL:  { bg: '#FFE4E4', text: '#C0392B', dot: '#E74C3C' },
  FOLLICULAR: { bg: '#E4F5EC', text: '#1A6B3A', dot: '#27AE60' },
  OVULATION:  { bg: '#EDE4FF', text: '#6C3483', dot: '#9B59B6' },
  LUTEAL:     { bg: '#FFF4E4', text: '#935116', dot: '#E67E22' },
};

const LEGEND: { phase: Phase; label: string }[] = [
  { phase: 'MENSTRUAL',  label: 'Period' },
  { phase: 'FOLLICULAR', label: 'Follicular' },
  { phase: 'OVULATION',  label: 'Ovulation' },
  { phase: 'LUTEAL',     label: 'Luteal' },
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getDayPhase(date: Date, lastPeriodStart: string, cycleLength: number, periodLength: number): Phase | null {
  const start = new Date(lastPeriodStart);
  start.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const daysSince = Math.floor((d.getTime() - start.getTime()) / 86400000);
  if (daysSince < 0) return null;
  const dayInCycle = (daysSince % cycleLength) + 1;
  const ovDay = cycleLength - 14;
  if (dayInCycle <= periodLength) return 'MENSTRUAL';
  if (dayInCycle <= ovDay - 2)    return 'FOLLICULAR';
  if (dayInCycle <= ovDay + 1)    return 'OVULATION';
  return 'LUTEAL';
}

function isPeriodStart(date: Date, lastPeriodStart: string, cycleLength: number): boolean {
  const start = new Date(lastPeriodStart);
  start.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const daysSince = Math.floor((d.getTime() - start.getTime()) / 86400000);
  if (daysSince < 0) return false;
  return daysSince % cycleLength === 0;
}

export default function CalendarScreen() {
  const { partners, activePartnerId } = usePartnersStore();
  const activePartner = partners.find(p => p.id === activePartnerId) ?? partners[0] ?? null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  // Build calendar grid (Monday-first)
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Monday = 0
  const totalDays = lastDay.getDate();
  const cells: (Date | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => new Date(year, month, i + 1)),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const cs = activePartner?.cycleStatus;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: Colors.bg }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-2xl font-bold" style={{ color: Colors.coral }}>
          Bro<span style={{ color: Colors.text }}>flow</span>
        </h1>
        {activePartner && (
          <p className="text-sm mt-0.5" style={{ color: Colors.textMid }}>
            {activePartner.name}'s cycle calendar
          </p>
        )}
      </div>

      {!activePartner ? (
        <EmptyState
          emoji="📅"
          title="No partner yet"
          subtitle="Add a partner to see her cycle calendar."
        />
      ) : !activePartner.lastPeriodStart ? (
        <EmptyState
          emoji="📅"
          title="No cycle data"
          subtitle="Log her last period date in her profile to unlock the calendar."
        />
      ) : (
        <div className="px-5 flex flex-col gap-4 max-w-lg mx-auto">

          {/* Current phase summary */}
          {cs && (
            <div
              className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{
                backgroundColor: PHASE_COLORS[cs.currentPhase].bg,
                border: `1px solid ${PHASE_COLORS[cs.currentPhase].dot}30`,
              }}
            >
              <span className="text-2xl">{cs.moodAlert.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: PHASE_COLORS[cs.currentPhase].text }}>
                  {PHASE_LABELS[cs.currentPhase]} · Day {cs.currentDay}
                </p>
                <p className="text-xs mt-0.5" style={{ color: Colors.textMid }}>
                  Period in {cs.daysUntilPeriod} days · Next: {cs.periodStartPredicted}
                </p>
              </div>
            </div>
          )}

          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-medium"
              style={{ backgroundColor: Colors.grayLight, color: Colors.text }}
            >‹</button>
            <p className="text-base font-semibold" style={{ color: Colors.text }}>
              {MONTHS[month]} {year}
            </p>
            <button
              onClick={nextMonth}
              className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-medium"
              style={{ backgroundColor: Colors.grayLight, color: Colors.text }}
            >›</button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 gap-1">
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="text-center text-xs font-medium py-1" style={{ color: Colors.textMid }}>
                {d}
              </div>
            ))}

            {/* Calendar cells */}
            {cells.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} />;

              const phase = activePartner.lastPeriodStart
                ? getDayPhase(date, activePartner.lastPeriodStart, activePartner.avgCycleLength, activePartner.avgPeriodLength)
                : null;
              const isToday = date.getTime() === today.getTime();
              const isPStart = activePartner.lastPeriodStart
                ? isPeriodStart(date, activePartner.lastPeriodStart, activePartner.avgCycleLength)
                : false;
              const colors = phase ? PHASE_COLORS[phase] : null;

              return (
                <div
                  key={date.toISOString()}
                  className="aspect-square rounded-lg flex flex-col items-center justify-center relative"
                  style={{
                    backgroundColor: isToday ? Colors.coral : colors ? colors.bg : Colors.white,
                    border: isToday ? 'none' : `1px solid ${Colors.border}`,
                  }}
                >
                  <span
                    className="text-sm font-semibold"
                    style={{ color: isToday ? '#fff' : colors ? colors.text : Colors.textMid }}
                  >
                    {date.getDate()}
                  </span>
                  {isPStart && !isToday && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PHASE_COLORS.MENSTRUAL.dot }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-x-2 gap-y-1.5 pt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: Colors.coral }} />
              <span className="text-xs" style={{ color: Colors.textMid }}>Today</span>
            </div>
            {LEGEND.map(({ phase, label }) => (
              <div key={phase} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PHASE_COLORS[phase].dot }} />
                <span className="text-xs" style={{ color: Colors.textMid }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Upcoming dates */}
          {cs && (
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: Colors.white, border: `1px solid ${Colors.border}` }}
            >
              <p className="text-sm font-semibold mb-3" style={{ color: Colors.text }}>Upcoming</p>
              <div className="flex flex-col gap-2">
                {[
                  { emoji: '🔴', label: 'Period starts', date: cs.periodStartPredicted },
                  { emoji: '✨', label: 'Ovulation window', date: `${cs.ovulationWindowStart} – ${cs.ovulationWindowEnd}` },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.emoji}</span>
                      <span className="text-sm" style={{ color: Colors.textMid }}>{item.label}</span>
                    </div>
                    <span className="text-sm font-medium" style={{ color: Colors.text }}>{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
