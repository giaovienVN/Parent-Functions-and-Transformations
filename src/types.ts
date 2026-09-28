export interface LineConfig {
  a: number;       // Slope
  b: number;       // Y-intercept
  xMin: number;    // Domain min
  xMax: number;    // Domain max
}

export interface TargetLine extends LineConfig {
  label: string;
  nameVi?: string;
}

export interface LevelData {
  id: number;
  phase: number;
  phaseName: string;
  title: string;
  subtitle: string;
  emoji: string;
  description: string;
  hint: string;
  targetLines: TargetLine[];
  initialLines: LineConfig[];
}

export interface LineAccuracy {
  slopeError: number;
  interceptError: number;
  domainError: number;
  accuracy: number; // 0 to 100
  isMatched: boolean; // accuracy >= 95%
}
