import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { calculateCycleStatus } from '../lib/cycleEngine';

export interface CycleStatus {
  currentPhase: 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATION' | 'LUTEAL';
  currentDay: number;
  daysUntilPeriod: number;
  daysUntilOvulation: number;
  cycleProgress: number;
  periodStartPredicted: string;
  ovulationWindowStart: string;
  ovulationWindowEnd: string;
  moodAlert: {
    level: 'low' | 'medium' | 'high';
    title: string;
    message: string;
    emoji: string;
  };
  giftRecommendations: Array<{
    category: string;
    reason: string;
    urgency: 'now' | 'soon' | 'anytime';
  }>;
  funFact: string;
  adviceForToday: string;
}

export interface Partner {
  id: string;
  name: string;
  avatarColor: string;
  avgCycleLength: number;
  avgPeriodLength: number;
  lastPeriodStart: string | null;
  birthday: string | null;
  notes: string | null;
  cycleStatus: CycleStatus | null;
}

// Map a Supabase row to a Partner object
function rowToPartner(row: Record<string, unknown>): Partner {
  const lastPeriodStart = (row.last_period_start as string | null) ?? null;
  return {
    id: row.id as string,
    name: row.name as string,
    avatarColor: (row.avatar_color as string) ?? '#D85A30',
    avgCycleLength: (row.avg_cycle_length as number) ?? 28,
    avgPeriodLength: (row.avg_period_length as number) ?? 5,
    lastPeriodStart,
    birthday: (row.birthday as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    cycleStatus: lastPeriodStart
      ? calculateCycleStatus(lastPeriodStart, (row.avg_cycle_length as number) ?? 28, (row.avg_period_length as number) ?? 5)
      : null,
  };
}

interface PartnersState {
  partners: Partner[];
  activePartnerId: string | null;
  isLoading: boolean;
  activePartner: Partner | null;
  loadPartners: () => Promise<void>;
  setActivePartner: (id: string) => void;
  createPartner: (data: {
    name: string;
    avatarColor?: string;
    avgCycleLength?: number;
    avgPeriodLength?: number;
    lastPeriodStart?: string;
    birthday?: string;
  }) => Promise<Partner>;
  updatePartner: (id: string, data: Partial<{
    name: string;
    avatarColor: string;
    avgCycleLength: number;
    avgPeriodLength: number;
    lastPeriodStart: string;
    birthday: string;
    notes: string;
  }>) => Promise<void>;
  deletePartner: (id: string) => Promise<void>;
  logPeriod: (partnerId: string, date: string) => Promise<void>;
  refreshPartner: (id: string) => Promise<void>;
}

export const usePartnersStore = create<PartnersState>((set, get) => ({
  partners: [],
  activePartnerId: null,
  isLoading: false,

  get activePartner() {
    const { partners, activePartnerId } = get();
    return partners.find(p => p.id === activePartnerId) ?? partners[0] ?? null;
  },

  loadPartners: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      const partners = (data ?? []).map(rowToPartner);
      set({
        partners,
        isLoading: false,
        activePartnerId: get().activePartnerId ?? partners[0]?.id ?? null,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  setActivePartner: (id) => set({ activePartnerId: id }),

  createPartner: async (data) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data: row, error } = await supabase
      .from('partners')
      .insert({
        user_id: session.user.id,
        name: data.name,
        avatar_color: data.avatarColor ?? '#D85A30',
        avg_cycle_length: data.avgCycleLength ?? 28,
        avg_period_length: data.avgPeriodLength ?? 5,
        last_period_start: data.lastPeriodStart ?? null,
        birthday: data.birthday ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    const partner = rowToPartner(row);
    set(state => ({
      partners: [...state.partners, partner],
      activePartnerId: state.activePartnerId ?? partner.id,
    }));
    return partner;
  },

  updatePartner: async (id, data) => {
    const updates: Record<string, unknown> = {};
    if (data.name !== undefined)            updates.name = data.name;
    if (data.avatarColor !== undefined)     updates.avatar_color = data.avatarColor;
    if (data.avgCycleLength !== undefined)  updates.avg_cycle_length = data.avgCycleLength;
    if (data.avgPeriodLength !== undefined) updates.avg_period_length = data.avgPeriodLength;
    if (data.lastPeriodStart !== undefined) updates.last_period_start = data.lastPeriodStart;
    if (data.birthday !== undefined)        updates.birthday = data.birthday;
    if (data.notes !== undefined)           updates.notes = data.notes;

    const { data: row, error } = await supabase
      .from('partners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    const updated = rowToPartner(row);
    set(state => ({
      partners: state.partners.map(p => p.id === id ? updated : p),
    }));
  },

  deletePartner: async (id) => {
    const { error } = await supabase.from('partners').delete().eq('id', id);
    if (error) throw error;
    set(state => {
      const remaining = state.partners.filter(p => p.id !== id);
      return {
        partners: remaining,
        activePartnerId: state.activePartnerId === id ? (remaining[0]?.id ?? null) : state.activePartnerId,
      };
    });
  },

  logPeriod: async (partnerId, date) => {
    const { error } = await supabase
      .from('cycles')
      .insert({ partner_id: partnerId, start_date: date });
    if (error) throw error;

    // Update last_period_start on the partner
    await supabase
      .from('partners')
      .update({ last_period_start: date })
      .eq('id', partnerId);

    await get().refreshPartner(partnerId);
  },

  refreshPartner: async (id) => {
    const { data: row, error } = await supabase
      .from('partners')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return;
    const partner = rowToPartner(row);
    set(state => ({
      partners: state.partners.map(p => p.id === id ? partner : p),
    }));
  },
}));
