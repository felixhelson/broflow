/**
 * Broflow Cycle Engine — client-side port
 * Computes cycle status from a partner's last period date without the backend.
 */

import type { CycleStatus } from '../store/partnersStore';

type CyclePhase = 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATION' | 'LUTEAL';

const FUN_FACTS: Record<CyclePhase, string[]> = {
  MENSTRUAL: [
    'During menstruation, prostaglandins cause cramps — similar to mild labor contractions. Heat and anti-inflammatories genuinely help.',
    'The uterine lining shed during a period is only about 35–50ml of blood on average — much less than it looks.',
    'Iron levels drop during menstruation, which can cause fatigue. Iron-rich snacks like dark chocolate actually help.',
  ],
  FOLLICULAR: [
    'Estrogen rises during the follicular phase, boosting energy, mood, and even creativity — her best ideas might come now.',
    'The follicular phase is the best time for new plans, hard conversations, and adventures — she\'s naturally at her most resilient.',
    'Taste sensitivity actually increases during the follicular phase. A nice dinner out hits different right now.',
  ],
  OVULATION: [
    'During ovulation, many women report a natural boost in confidence and sociability — it\'s evolutionary biology at work.',
    'The ovulation window is only 12–24 hours for the egg itself, but sperm can survive 3–5 days — making the window effectively wider.',
    'Research shows women tend to dress slightly more attractively and speak more confidently during ovulation. It\'s subconscious.',
  ],
  LUTEAL: [
    'Progesterone rises in the luteal phase, causing the brain to demand more glucose — chocolate and carb cravings are literally physiological.',
    'During the late luteal phase, serotonin dips — the same mechanism as seasonal depression. Kindness costs you nothing.',
    'PMS symptoms affect up to 75% of women in some form. If she seems extra sensitive, it\'s not personal — it\'s hormonal.',
  ],
};

const DAILY_ADVICE: Record<CyclePhase, string[]> = {
  MENSTRUAL: [
    'Skip plans tonight if she asks. No guilt, no pressure.',
    'A hot water bottle + her favourite show > any date right now.',
    "Don't ask what's wrong if she's quiet. Just be there.",
  ],
  FOLLICULAR: [
    "She's at peak energy — suggest that thing you've both been putting off.",
    'Good week to plan something adventurous together.',
    "She'll appreciate spontaneity right now. Try something new.",
  ],
  OVULATION: [
    "Date night? Yes. She's naturally at her most confident and social.",
    "Great time for a deeper conversation you've been avoiding.",
    "Compliment her — she'll be more receptive and it'll mean more.",
  ],
  LUTEAL: [
    "Don't start arguments this week. Save it for the follicular phase.",
    'Order her favourite food without being asked.',
    'Ask less, do more. Actions over words right now.',
  ],
};

function getMoodAlert(phase: CyclePhase, daysUntilPeriod: number): CycleStatus['moodAlert'] {
  if (phase === 'MENSTRUAL') {
    return { level: 'high', title: 'Period active', emoji: '🔴',
      message: 'She may have cramps, fatigue, and low energy. Comfort > everything right now. Hot water bottle, snacks, and zero expectations.' };
  }
  if (phase === 'LUTEAL' && daysUntilPeriod <= 5) {
    return { level: 'high', title: 'PMS zone — final stretch', emoji: '⚡',
      message: 'The last 5 days before her period are the toughest. Bloating, mood swings, and fatigue peak here. This is the zone where a small gift lands huge.' };
  }
  if (phase === 'LUTEAL') {
    return { level: 'medium', title: 'Luteal phase', emoji: '🌤',
      message: 'Progesterone is rising and she may feel slower or more emotional than usual. Be patient and extra present.' };
  }
  if (phase === 'OVULATION') {
    return { level: 'low', title: 'Ovulation window', emoji: '✨',
      message: "Energy and mood are naturally high. Great time for date night, big plans, or any conversation you've been putting off." };
  }
  return { level: 'low', title: 'Follicular phase', emoji: '🌱',
    message: "Post-period energy rebound — she's likely feeling fresh and positive. Ride this wave together." };
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function calculateCycleStatus(
  lastPeriodStart: string,
  avgCycleLength = 28,
  avgPeriodLength = 5,
): CycleStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(lastPeriodStart);
  start.setHours(0, 0, 0, 0);

  const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / 86400000);
  const currentDay = (daysSinceStart % avgCycleLength) + 1;
  const cyclesElapsed = Math.floor(daysSinceStart / avgCycleLength);

  const nextPeriodStart = new Date(start);
  nextPeriodStart.setDate(nextPeriodStart.getDate() + (cyclesElapsed + 1) * avgCycleLength);
  const daysUntilPeriod = Math.floor((nextPeriodStart.getTime() - today.getTime()) / 86400000);

  const ovulationDay = avgCycleLength - 14;
  const currentCycleStart = new Date(start);
  currentCycleStart.setDate(currentCycleStart.getDate() + cyclesElapsed * avgCycleLength);

  const ovulationWindowStart = new Date(currentCycleStart);
  ovulationWindowStart.setDate(ovulationWindowStart.getDate() + ovulationDay - 2);
  const ovulationWindowEnd = new Date(currentCycleStart);
  ovulationWindowEnd.setDate(ovulationWindowEnd.getDate() + ovulationDay + 1);

  const daysUntilOvulation = Math.floor((ovulationWindowStart.getTime() - today.getTime()) / 86400000);

  let currentPhase: CyclePhase;
  if (currentDay <= avgPeriodLength) currentPhase = 'MENSTRUAL';
  else if (currentDay <= ovulationDay - 2) currentPhase = 'FOLLICULAR';
  else if (currentDay <= ovulationDay + 1) currentPhase = 'OVULATION';
  else currentPhase = 'LUTEAL';

  return {
    currentPhase,
    currentDay,
    daysUntilPeriod,
    daysUntilOvulation,
    cycleProgress: Math.min(Math.round((currentDay / avgCycleLength) * 100), 100),
    periodStartPredicted: nextPeriodStart.toISOString().split('T')[0],
    ovulationWindowStart: ovulationWindowStart.toISOString().split('T')[0],
    ovulationWindowEnd: ovulationWindowEnd.toISOString().split('T')[0],
    moodAlert: getMoodAlert(currentPhase, daysUntilPeriod),
    giftRecommendations: [
      { category: 'CHOCOLATE', reason: 'Phase-matched recommendation', urgency: 'now' },
    ],
    funFact: pick(FUN_FACTS[currentPhase]),
    adviceForToday: pick(DAILY_ADVICE[currentPhase]),
  };
}
