import { LineConfig, TargetLine, LineAccuracy } from './types';

export const LINE_THEMES = [
  {
    id: 0,
    name: 'Đoạn 1 (Hồng Pastel)',
    color: '#E11D48',      // rose-600
    displayColor: '#F43F5E', // rose-500
    bgLight: '#FFF1F2',    // rose-50
    borderLight: '#FECDD3',// rose-200
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    accentClass: 'text-rose-600',
    sliderTrack: 'accent-rose-500',
  },
  {
    id: 1,
    name: 'Đoạn 2 (Xanh Ngọc)',
    color: '#0D9488',      // teal-600
    displayColor: '#14B8A6', // teal-500
    bgLight: '#F0FDFA',    // teal-50
    borderLight: '#CCFBF1',// teal-100
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    accentClass: 'text-teal-600',
    sliderTrack: 'accent-teal-500',
  },
  {
    id: 2,
    name: 'Đoạn 3 (Cam Hổ Phách)',
    color: '#D97706',      // amber-600
    displayColor: '#F59E0B', // amber-500
    bgLight: '#FFFBEB',    // amber-50
    borderLight: '#FEF3C7',// amber-100
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    accentClass: 'text-amber-600',
    sliderTrack: 'accent-amber-500',
  },
];

export function calculateLineAccuracy(player: LineConfig, target: TargetLine): LineAccuracy {
  const slopeError = Math.abs(player.a - target.a);
  const interceptError = Math.abs(player.b - target.b);
  const domainMinError = Math.abs(player.xMin - target.xMin);
  const domainMaxError = Math.abs(player.xMax - target.xMax);
  const domainError = (domainMinError + domainMaxError) / 2;

  // Normalized penalty calculation
  // Perfect match when values are identical or within tiny threshold
  const normSlope = Math.min(1, slopeError / 3.0);
  const normIntercept = Math.min(1, interceptError / 4.0);
  const normMin = Math.min(1, domainMinError / 3.0);
  const normMax = Math.min(1, domainMaxError / 3.0);

  // Weighted total raw error
  const rawError = normSlope * 0.35 + normIntercept * 0.3 + normMin * 0.175 + normMax * 0.175;
  
  // Calculate accuracy percentage
  let accuracy = Math.round((1 - rawError) * 100);
  if (slopeError <= 0.05 && interceptError <= 0.15 && domainMinError <= 0.25 && domainMaxError <= 0.25) {
    accuracy = 100;
  }
  accuracy = Math.max(0, Math.min(100, accuracy));

  // The condition given in the prompt: error < 5% <=> accuracy >= 95%
  const isMatched = accuracy >= 95;

  return {
    slopeError,
    interceptError,
    domainError,
    accuracy,
    isMatched,
  };
}

export function formatEquation(a: number, b: number): { eqText: string; aText: string; bText: string } {
  // Round to 1 decimal place to prevent floating-point artifacts
  const cleanA = Math.round(a * 10) / 10;
  const cleanB = Math.round(b * 10) / 10;

  let aText = `${cleanA}`;
  if (cleanA === 1) aText = '';
  if (cleanA === -1) aText = '-';

  let bText = '';
  if (cleanB > 0) {
    bText = `+ ${cleanB}`;
  } else if (cleanB < 0) {
    bText = `- ${Math.abs(cleanB)}`;
  }

  let eqText = '';
  if (cleanA === 0) {
    eqText = `y = ${cleanB}`;
  } else if (cleanB === 0) {
    eqText = `y = ${cleanA === 1 ? 'x' : cleanA === -1 ? '-x' : `${cleanA}x`}`;
  } else {
    eqText = `y = ${cleanA === 1 ? 'x' : cleanA === -1 ? '-x' : `${cleanA}x`} ${cleanB > 0 ? '+' : '-'} ${Math.abs(cleanB)}`;
  }

  return { eqText, aText, bText };
}
