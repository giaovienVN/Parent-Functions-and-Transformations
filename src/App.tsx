import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LEVELS } from './levelsData';
import { LineConfig } from './types';
import { calculateLineAccuracy, LINE_THEMES } from './mathUtils';
import { sounds } from './sound';
import { generateSingleFileHtml } from './exportHtml';
import { GraphCanvas } from './components/GraphCanvas';
import { LineControlPanel } from './components/LineControlPanel';
import { VictoryModal } from './components/VictoryModal';
import { LevelSelectorModal } from './components/LevelSelectorModal';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Download,
  HelpCircle,
  Eye,
  EyeOff,
  Wand2,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export default function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const currentLevel = LEVELS[currentLevelIndex] || LEVELS[0];

  // Player line configurations for current level
  const [playerLines, setPlayerLines] = useState<LineConfig[]>(() =>
    JSON.parse(JSON.stringify(currentLevel.initialLines))
  );

  const [activeLineIndex, setActiveLineIndex] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showTargets, setShowTargets] = useState<boolean>(true);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState<boolean>(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sounds.isMuted);

  // Completed levels saved in localStorage
  const [completedLevels, setCompletedLevels] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('linecraft_completed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Calculate accuracies for all lines in current level
  const accuracies = useMemo(() => {
    return playerLines.map((pLine, idx) => {
      const tLine = currentLevel.targetLines[idx];
      if (!tLine) {
        return {
          slopeError: 0,
          interceptError: 0,
          domainError: 0,
          accuracy: 100,
          isMatched: true,
        };
      }
      return calculateLineAccuracy(pLine, tLine);
    });
  }, [playerLines, currentLevel.targetLines]);

  // Overall match percentage
  const totalAccuracy = useMemo(() => {
    if (accuracies.length === 0) return 0;
    const sum = accuracies.reduce((acc, curr) => acc + curr.accuracy, 0);
    return Math.round(sum / accuracies.length);
  }, [accuracies]);

  // Check if ALL lines satisfy the condition: error < 5% <=> accuracy >= 95%
  const allLinesMatched = useMemo(() => {
    return accuracies.length > 0 && accuracies.every((acc) => acc.isMatched);
  }, [accuracies]);

  // When all lines match, trigger victory celebration!
  useEffect(() => {
    if (allLinesMatched) {
      sounds.playVictory();
      setIsVictoryModalOpen(true);
      if (!completedLevels.includes(currentLevel.id)) {
        const nextCompleted = [...completedLevels, currentLevel.id];
        setCompletedLevels(nextCompleted);
        try {
          localStorage.setItem('linecraft_completed', JSON.stringify(nextCompleted));
        } catch {}
      }
    }
  }, [allLinesMatched, currentLevel.id]);

  // Switch level handler
  const handleSelectLevel = useCallback(
    (levelId: number) => {
      const idx = LEVELS.findIndex((l) => l.id === levelId);
      if (idx !== -1) {
        setCurrentLevelIndex(idx);
        setActiveLineIndex(0);
        setShowHint(false);
        setIsVictoryModalOpen(false);
        setPlayerLines(JSON.parse(JSON.stringify(LEVELS[idx].initialLines)));
      }
    },
    []
  );

  // Reset current level
  const handleResetLevel = () => {
    sounds.playClick();
    setPlayerLines(JSON.parse(JSON.stringify(currentLevel.initialLines)));
    setIsVictoryModalOpen(false);
  };

  // Auto-solve / Reveal answer for learners who need help
  const handleAutoSolve = () => {
    sounds.playClick();
    const solved = currentLevel.targetLines.map((t) => ({
      a: t.a,
      b: t.b,
      xMin: t.xMin,
      xMax: t.xMax,
    }));
    setPlayerLines(solved);
  };

  // Update a single line
  const handleUpdateLine = (index: number, newConfig: Partial<LineConfig>) => {
    setPlayerLines((prev) => {
      const next = [...prev];
      const prevLine = next[index];
      const updated = { ...prevLine, ...newConfig };
      next[index] = updated;

      // Check if this line just hit >= 95%
      const target = currentLevel.targetLines[index];
      if (target) {
        const prevAcc = calculateLineAccuracy(prevLine, target);
        const newAcc = calculateLineAccuracy(updated, target);
        if (!prevAcc.isMatched && newAcc.isMatched) {
          sounds.playLineMatch();
        }
      }

      return next;
    });
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMute = sounds.toggleMute();
    setIsMuted(nextMute);
  };

  // Download Standalone Single-File HTML
  const handleDownloadSingleFile = () => {
    sounds.playClick();
    const htmlContent = generateSingleFileHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'line-craft-linear-quest.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Next level handler
  const handleNextLevel = () => {
    if (currentLevelIndex < LEVELS.length - 1) {
      handleSelectLevel(LEVELS[currentLevelIndex + 1].id);
    }
  };

  // Mascot dynamic advice
  const mascotAdvice = useMemo(() => {
    if (allLinesMatched) {
      return {
        icon: '🌟',
        text: 'Tuyệt đỉnh! Tất cả đoạn thẳng đã khớp hoàn hảo với sai số < 5%!',
      };
    }
    if (totalAccuracy >= 85) {
      return {
        icon: '😺',
        text: 'Rất gần rồi! Hãy tinh chỉnh nhẹ hệ số góc a hoặc tung độ gốc b để khớp 100% nhé!',
      };
    }
    if (totalAccuracy >= 60) {
      return {
        icon: '🐣',
        text: 'Hướng đi rất đúng! Hãy dùng nút +/- để căn chỉnh miền [x_min, x_max] cho vừa vặn.',
      };
    }
    return {
      icon: '🦉',
      text: 'Mẹo: Nhìn giao điểm của đường với trục Oy để tìm tung độ gốc b trước!',
    };
  }, [allLinesMatched, totalAccuracy]);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-800 flex flex-col selection:bg-rose-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-stone-200/90 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Game Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
              📐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-stone-900 font-heading tracking-tight leading-none">
                  Line Craft
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold uppercase tracking-wide">
                  Linear Graph Quest
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                Khám phá đồ thị hàm số tuyến tính <span className="font-mono font-semibold">y = ax + b</span>
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Level Selector Button */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsLevelModalOpen(true);
              }}
              className="py-1.5 px-3 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-rose-500" />
              <span>Màn {currentLevel.id} / 15</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleMute}
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              className="w-9 h-9 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-stone-700" />}
            </button>

            {/* Reset Current Level */}
            <button
              onClick={handleResetLevel}
              title="Làm lại màn này"
              className="w-9 h-9 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Download Standalone Single-File HTML */}
            <button
              onClick={handleDownloadSingleFile}
              title="Tải về file HTML 1 file duy nhất để chơi offline"
              className="hidden md:inline-flex py-1.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs transition-colors items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>Tải file HTML</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Play Area */}
      <main className="max-w-6xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col">
        {/* Mobile Download Notice */}
        <div className="md:hidden mb-3 flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-stone-200 text-xs">
          <span className="text-stone-600 font-medium">Chơi được offline không cần cài đặt:</span>
          <button
            onClick={handleDownloadSingleFile}
            className="font-bold text-rose-600 flex items-center gap-1 underline"
          >
            <Download className="w-3.5 h-3.5" />
            Tải HTML
          </button>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Graph Studio (5 cols on large desktop, 6 on mid) */}
          <section className="lg:col-span-6 xl:col-span-6 flex flex-col gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/90 shadow-xs relative">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Khung Đồ Thị Trực Quan
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle Targets Visibility */}
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setShowTargets(!showTargets);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {showTargets ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Mẫu nét đứt</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                        <span>Ẩn mẫu</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Main Interactive Canvas */}
              <GraphCanvas
                playerLines={playerLines}
                targetLines={currentLevel.targetLines}
                accuracies={accuracies}
                activeLineIndex={activeLineIndex}
                onSelectLine={setActiveLineIndex}
                showTargets={showTargets}
                isVictory={allLinesMatched}
              />

              {/* Canvas Footer Legend */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-stone-500 font-medium">
                    <span className="w-4 h-0 border-t-2 border-dashed border-stone-400 inline-block" />
                    Hình mẫu mờ
                  </span>
                  {playerLines.map((_, idx) => {
                    const lTheme = LINE_THEMES[idx % LINE_THEMES.length];
                    return (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 font-bold cursor-pointer"
                        style={{ color: lTheme.color }}
                        onClick={() => setActiveLineIndex(idx)}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: lTheme.color }}
                        />
                        Đoạn {idx + 1}
                      </span>
                    );
                  })}
                </div>

                <div className="text-[11px] text-stone-400 font-mono">
                  Gốc O(0, 0)
                </div>
              </div>
            </div>

            {/* Cute Mascot Advice Card */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3 shadow-2xs">
              <span className="text-3xl select-none shrink-0">{mascotAdvice.icon}</span>
              <p className="text-xs sm:text-sm text-stone-700 font-medium leading-relaxed">
                {mascotAdvice.text}
              </p>
            </div>
          </section>

          {/* RIGHT COLUMN: Control Station (6 cols) */}
          <section className="lg:col-span-6 xl:col-span-6 flex flex-col gap-4">
            {/* Level Info Card */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/90 shadow-xs">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-extrabold text-[10px] tracking-wider uppercase border border-rose-200">
                      {currentLevel.phaseName}
                    </span>
                    <span className="text-xs font-bold text-stone-400">
                      Màn {currentLevel.id} / 15
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-heading flex items-center gap-2">
                    <span>{currentLevel.title}</span>
                    <span className="text-2xl">{currentLevel.emoji}</span>
                  </h2>
                  <p className="text-xs text-stone-500 font-semibold mt-0.5">
                    {currentLevel.subtitle}
                  </p>
                </div>

                {/* Hint Button */}
                <button
                  onClick={() => {
                    sounds.playHint();
                    setShowHint(!showHint);
                  }}
                  className={`py-1.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    showHint
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span>{showHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                {currentLevel.description}
              </p>

              {/* Collapsible Geometric Hint Card */}
              {showHint && (
                <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 space-y-1.5 animate-fadeIn">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Gợi ý hình học:</span>
                  </div>
                  <p className="leading-relaxed pl-5 font-medium">{currentLevel.hint}</p>
                </div>
              )}

              {/* Total Match Progress Bar */}
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-stone-700 flex items-center gap-1.5">
                    <span>Tổng độ khớp hình vẽ:</span>
                    {allLinesMatched && (
                      <span className="text-emerald-600 inline-flex items-center gap-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành!
                      </span>
                    )}
                  </span>
                  <span
                    className={`font-mono font-black text-sm ${
                      allLinesMatched ? 'text-emerald-600' : 'text-stone-800'
                    }`}
                  >
                    {totalAccuracy}%
                  </span>
                </div>

                <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      allLinesMatched
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                        : totalAccuracy > 70
                        ? 'bg-gradient-to-r from-amber-400 to-rose-400'
                        : 'bg-rose-400'
                    }`}
                    style={{ width: `${totalAccuracy}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Sliders & Math Equation Station */}
            <LineControlPanel
              playerLines={playerLines}
              targetLines={currentLevel.targetLines}
              accuracies={accuracies}
              activeLineIndex={activeLineIndex}
              onSelectLine={setActiveLineIndex}
              onUpdateLine={handleUpdateLine}
            />

            {/* Bottom Auxiliary Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  sounds.playClick();
                  if (allLinesMatched) {
                    setIsVictoryModalOpen(true);
                  } else {
                    // Provide friendly audio feedback
                    sounds.playLineMatch();
                  }
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Kiểm tra ({totalAccuracy}%)</span>
              </button>

              <button
                onClick={handleAutoSolve}
                title="Tự động căn chỉnh về đáp án mẫu (Học tập)"
                className="py-3 px-3.5 rounded-2xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-600 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Wand2 className="w-4 h-4 text-purple-600" />
                <span className="hidden sm:inline">Đáp án mẫu</span>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Victory Celebration Modal */}
      {isVictoryModalOpen && (
        <VictoryModal
          level={currentLevel}
          playerLines={playerLines}
          hasNextLevel={currentLevelIndex < LEVELS.length - 1}
          onNextLevel={handleNextLevel}
          onReplay={handleResetLevel}
          onOpenSelector={() => {
            setIsVictoryModalOpen(false);
            setIsLevelModalOpen(true);
          }}
        />
      )}

      {/* 15 Level Selector Drawer/Modal */}
      <LevelSelectorModal
        levels={LEVELS}
        currentLevelId={currentLevel.id}
        completedLevels={completedLevels}
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        onSelectLevel={handleSelectLevel}
      />
    </div>
  );
}
