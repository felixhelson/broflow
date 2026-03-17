export const Colors = {
  coral:      '#D85A30',
  coralLight: '#FEF0EB',
  coralMid:   '#F0825A',

  bg:      '#FAFAF8',
  white:   '#FFFFFF',
  text:    '#1A1A18',
  textMid: '#6B6B68',

  grayLight: '#F4F4F0',
  border:    '#E8E8E4',

  pink:       '#E84C8B',
  amber:      '#D97706',
  amberLight: '#FEF3C7',

  teal:      '#0D9488',
  tealLight: '#CCFBF1',

  phase: {
    MENSTRUAL:  '#E84C8B',
    FOLLICULAR: '#8B5CF6',
    OVULATION:  '#10B981',
    LUTEAL:     '#F59E0B',
  },
};

export const PHASE_LABELS: Record<string, string> = {
  MENSTRUAL:  'Menstrual',
  FOLLICULAR: 'Follicular',
  OVULATION:  'Ovulation',
  LUTEAL:     'Luteal',
};

export const PHASE_EMOJI: Record<string, string> = {
  MENSTRUAL:  '🌑',
  FOLLICULAR: '🌱',
  OVULATION:  '✨',
  LUTEAL:     '🌕',
};

export const CATEGORY_EMOJI: Record<string, string> = {
  CHOCOLATE: '🍫',
  FLOWERS:   '🌸',
  WELLNESS:  '🛁',
  FOOD:      '🍱',
  CANDLES:   '🕯️',
  SKINCARE:  '✨',
  TEA:       '🍵',
};
