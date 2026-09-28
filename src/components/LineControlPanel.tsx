import React from 'react';
import { LineConfig, TargetLine, LineAccuracy } from '../types';
import { LINE_THEMES, formatEquation } from '../mathUtils';
import { CheckCircle2, ChevronRight, Sliders, Sparkles } from 'lucide-react';
import { sounds } from '../sound';

interface LineControlPanelProps {
  playerLines: LineConfig[];
  targetLines: TargetLine[];
  accuracies: LineAccuracy[];
  activeLineIndex: number;
  onSelectLine: (index: number) => void;
  onUpdateLine: (index: number, newConfig: Partial<LineConfig>) => void;
}

export const LineControlPanel: React.FC<LineControlPanelProps> = ({
  playerLines,
  targetLines,
  accuracies,
  activeLineIndex,
  onSelectLine,
  onUpdateLine,
}) => {
  const currentLine = playerLines[activeLineIndex] || playerLines[0];
  const currentTarget = targetLines[activeLineIndex] || targetLines[0];
  const currentAcc = accuracies[activeLineIndex] || {
    slopeError: 0,
    interceptError: 0,
    domainError: 0,
    accuracy: 0,
    isMatched: false,
  };
  const theme = LINE_THEMES[activeLineIndex % LINE_THEMES.length];

  const { eqText, aText, bText } = formatEquation(currentLine.a, currentLine.b);
  const targetEq = formatEquation(currentTarget.a, currentTarget.b);

  const handleSliderChange = (param: keyof LineConfig, value: number) => {
    // Sound effect
    sounds.playTick(value);

    if (param === 'xMin') {
      const clampedMin = Math.min(value, currentLine.xMax - 0.5);
      onUpdateLine(activeLineIndex, { xMin: clampedMin });
    } else if (param === 'xMax') {
      const clampedMax = Math.max(value, currentLine.xMin + 0.5);
      onUpdateLine(activeLineIndex, { xMax: clampedMax });
    } else {
      onUpdateLine(activeLineIndex, { [param]: Math.round(value * 10) / 10 });
    }
  };

  const handleStepA = (delta: number) => {
    sounds.playClick();
    const newA = Math.round((currentLine.a + delta) * 10) / 10;
    const clamped = Math.max(-5, Math.min(5, newA));
    onUpdateLine(activeLineIndex, { a: clamped });
  };

  const handleStepB = (delta: number) => {
    sounds.playClick();
    const newB = Math.round((currentLine.b + delta) * 10) / 10;
    const clamped = Math.max(-10, Math.min(10, newB));
    onUpdateLine(activeLineIndex, { b: clamped });
  };

  const handleStepDomain = (type: 'min' | 'max', delta: number) => {
    sounds.playClick();
    if (type === 'min') {
      const newMin = Math.round((currentLine.xMin + delta) * 10) / 10;
      if (newMin < currentLine.xMax) {
        onUpdateLine(activeLineIndex, { xMin: Math.max(-10, newMin) });
      }
    } else {
      const newMax = Math.round((currentLine.xMax + delta) * 10) / 10;
      if (newMax > currentLine.xMin) {
        onUpdateLine(activeLineIndex, { xMax: Math.min(10, newMax) });
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Line Tabs (Selector for 2-3 lines) */}
      <div className="flex items-center gap-2 p-1.5 bg-stone-100 rounded-2xl border border-stone-200/80">
        {playerLines.map((line, idx) => {
          const lTheme = LINE_THEMES[idx % LINE_THEMES.length];
          const acc = accuracies[idx];
          const isActive = idx === activeLineIndex;

          return (
            <button
              key={idx}
              onClick={() => {
                sounds.playClick();
                onSelectLine(idx);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-between gap-1.5 ${
                isActive
                  ? 'bg-white shadow-sm border border-stone-200/80 text-stone-900 scale-[1.02]'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: lTheme.color }}
                />
                <span className="truncate">{targetLines[idx]?.label?.split(' ')[0] || `Đoạn ${idx + 1}`}</span>
              </div>

              {acc?.isMatched ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-600 text-xs font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>100%</span>
                </span>
              ) : (
                <span className="text-[11px] font-mono text-stone-500 font-medium">
                  {acc ? `${acc.accuracy}%` : '0%'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Active Line Display & Equation Card */}
      <div
        className="p-4 rounded-2xl border transition-colors duration-200 relative overflow-hidden"
        style={{
          backgroundColor: theme.bgLight,
          borderColor: theme.borderLight,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-0.5 text-xs font-bold rounded-full text-white"
              style={{ backgroundColor: theme.color }}
            >
              Đoạn {activeLineIndex + 1}
            </span>
            <span className="text-xs font-bold text-stone-600 truncate">
              {currentTarget?.label}
            </span>
          </div>

          {currentAcc.isMatched ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-0.5 rounded-full animate-bounce">
              <Sparkles className="w-3.5 h-3.5" /> Khớp hoàn hảo!
            </span>
          ) : (
            <span className="text-xs font-mono font-bold text-stone-600">
              Độ khớp: {currentAcc.accuracy}%
            </span>
          )}
        </div>

        {/* Big Math Equation Box */}
        <div className="bg-white/95 backdrop-blur-xs p-3.5 rounded-xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-baseline gap-1 font-mono-math text-base sm:text-lg">
            <span className="font-bold text-stone-500">y =</span>
            {/* Slope A highlight */}
            <span
              className="px-1.5 py-0.5 rounded font-black text-white"
              style={{ backgroundColor: theme.color }}
            >
              {currentLine.a}
            </span>
            <span className="font-bold text-stone-700">· x</span>
            <span className="font-bold text-stone-500">+</span>
            {/* Intercept B highlight */}
            <span className="px-1.5 py-0.5 rounded font-black bg-stone-800 text-amber-300">
              {currentLine.b}
            </span>
          </div>

          {/* Domain Box */}
          <div className="flex items-center gap-1.5 text-xs font-mono bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-200">
            <span className="text-stone-500 font-semibold">Miền xác định:</span>
            <span className="font-bold text-stone-800">
              x ∈ [{currentLine.xMin}, {currentLine.xMax}]
            </span>
          </div>
        </div>

        {/* Accuracy Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium mb-1">
            <span>Mục tiêu khớp &gt; 95% (sai số &lt; 5%)</span>
            <span className="font-mono font-bold">{currentAcc.accuracy}%</span>
          </div>
          <div className="w-full h-2.5 bg-stone-200/80 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                currentAcc.isMatched
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                  : 'bg-gradient-to-r from-rose-400 to-amber-400'
              }`}
              style={{ width: `${currentAcc.accuracy}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Slider Controls Station */}
      <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        {/* Slider 1: Slope a */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-rose-100 text-rose-700 font-bold font-mono text-xs flex items-center justify-center">
                a
              </span>
              <label className="text-xs sm:text-sm font-bold text-stone-800">
                Hệ số góc (Slope / Độ dốc)
              </label>
            </div>
            <span className="font-mono font-bold text-sm sm:text-base text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
              a = {currentLine.a}
            </span>
          </div>

          {/* Slider input */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-stone-400 font-semibold">-5</span>
            <input
              type="range"
              min={-5}
              max={5}
              step={0.1}
              value={currentLine.a}
              onChange={(e) => handleSliderChange('a', parseFloat(e.target.value))}
              className="flex-1 cursor-pointer"
              style={{ color: theme.color }}
            />
            <span className="text-[11px] font-mono text-stone-400 font-semibold">+5</span>
          </div>

          {/* Step buttons */}
          <div className="flex items-center justify-between gap-1 pt-0.5">
            <button
              onClick={() => handleStepA(-0.5)}
              className="px-2 py-1 text-xs font-mono font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
            >
              -0.5
            </button>
            <button
              onClick={() => handleStepA(-0.1)}
              className="px-2 py-1 text-xs font-mono font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
            >
              -0.1
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                onUpdateLine(activeLineIndex, { a: 0 });
              }}
              className="px-2 py-1 text-xs font-mono font-semibold bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg transition-colors"
            >
              a = 0
            </button>
            <button
              onClick={() => handleStepA(0.1)}
              className="px-2 py-1 text-xs font-mono font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
            >
              +0.1
            </button>
            <button
              onClick={() => handleStepA(0.5)}
              className="px-2 py-1 text-xs font-mono font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
            >
              +0.5
            </button>
          </div>
        </div>

        <hr className="border-stone-100" />

        {/* Slider 2: Intercept b */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 font-bold font-mono text-xs flex items-center justify-center">
                b
              </span>
              <label className="text-xs sm:text-sm font-bold text-stone-800">
                Tung độ gốc (Y-intercept)
              </label>
            </div>
            <span className="font-mono font-bold text-sm sm:text-base text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
              b = {currentLine.b}
            </span>
          </div>

          {/* Slider input */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-stone-400 font-semibold">-10</span>
            <input
              type="range"
              min={-10}
              max={10}
              step={0.5}
              value={currentLine.b}
              onChange={(e) => handleSliderChange('b', parseFloat(e.target.value))}
              className="flex-1 cursor-pointer"
              style={{ color: '#D97706' }}
            />
            <span className="text-[11px] font-mono text-stone-400 font-semibold">+10</span>
          </div>

          {/* Step buttons */}
          <div className="flex items-center justify-between gap-1 pt-0.5">
            <button
              onClick={() => handleStepB(-1)}
              className="px-2 py-1 text-xs font-mono font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
            >
              -1.0
            </button>
            <button
              onClick={() => handleStepB(-0.5)}
              className="px-2 py-1 text-xs font-mono font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
            >
              -0.5
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                onUpdateLine(activeLineIndex, { b: 0 });
              }}
              className="px-2 py-1 text-xs font-mono font-semibold bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg transition-colors"
            >
              b = 0
            </button>
            <button
              onClick={() => handleStepB(0.5)}
              className="px-2 py-1 text-xs font-mono font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
            >
              +0.5
            </button>
            <button
              onClick={() => handleStepB(1)}
              className="px-2 py-1 text-xs font-mono font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
            >
              +1.0
            </button>
          </div>
        </div>

        <hr className="border-stone-100" />

        {/* Slider 3: Domain x_min and x_max */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-bold text-stone-800">
              Miền xác định (Cắt đoạn thẳng x ∈ [x_min, x_max])
            </label>
            <span className="text-xs font-mono text-stone-500 font-bold">
              [{currentLine.xMin} → {currentLine.xMax}]
            </span>
          </div>

          {/* xMin Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-600">Điểm đầu x_min:</span>
              <span className="font-mono font-bold text-teal-700">{currentLine.xMin}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStepDomain('min', -0.5)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 hover:bg-stone-200 font-mono font-bold text-xs"
              >
                -
              </button>
              <input
                type="range"
                min={-10}
                max={currentLine.xMax - 0.5}
                step={0.5}
                value={currentLine.xMin}
                onChange={(e) => handleSliderChange('xMin', parseFloat(e.target.value))}
                className="flex-1 cursor-pointer"
                style={{ color: '#0D9488' }}
              />
              <button
                onClick={() => handleStepDomain('min', 0.5)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 hover:bg-stone-200 font-mono font-bold text-xs"
              >
                +
              </button>
            </div>
          </div>

          {/* xMax Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-600">Điểm cuối x_max:</span>
              <span className="font-mono font-bold text-teal-700">{currentLine.xMax}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStepDomain('max', -0.5)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 hover:bg-stone-200 font-mono font-bold text-xs"
              >
                -
              </button>
              <input
                type="range"
                min={currentLine.xMin + 0.5}
                max={10}
                step={0.5}
                value={currentLine.xMax}
                onChange={(e) => handleSliderChange('xMax', parseFloat(e.target.value))}
                className="flex-1 cursor-pointer"
                style={{ color: '#0D9488' }}
              />
              <button
                onClick={() => handleStepDomain('max', 0.5)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 hover:bg-stone-200 font-mono font-bold text-xs"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
