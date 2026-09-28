import React from 'react';
import { LevelData, LineConfig } from '../types';
import { formatEquation, LINE_THEMES } from '../mathUtils';
import { Sparkles, Trophy, ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';
import { sounds } from '../sound';

interface VictoryModalProps {
  level: LevelData;
  playerLines: LineConfig[];
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenSelector: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  playerLines,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onOpenSelector,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FAF7F2] w-full max-w-md rounded-3xl border-2 border-amber-300 shadow-2xl p-6 sm:p-7 text-center relative overflow-hidden animate-scaleUp">
        {/* Glow decoration */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-rose-200/40 rounded-full blur-2xl pointer-events-none" />

        {/* Emoji celebration icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-100 border-2 border-amber-300 shadow-inner text-4xl mb-4 animate-bounce">
          {level.id === 15 ? '👑' : level.emoji}
        </div>

        {/* Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
          <CheckCircle2 className="w-3.5 h-3.5" /> Sai số &lt; 5% • Khớp hoàn hảo!
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-heading">
          {level.id === 15
            ? '🎉 Đỉnh Cao Toàn Năng! 🎉'
            : `Tuyệt Vời! Hoàn Thành Màn ${level.id}`}
        </h2>

        <p className="text-xs sm:text-sm text-stone-600 mt-1 mb-5">
          {level.id === 15
            ? 'Bạn đã xuất sắc chinh phục tất cả 15 màn chơi và trở thành Bậc Thầy Đồ Thị Hàm Số Tuyến Tính!'
            : `Bạn đã điều chỉnh chuẩn xác tất cả các đoạn thẳng cho hình "${level.title}".`}
        </p>

        {/* Equations Summary Card */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-2 mb-6 text-left">
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Phương trình đã lập</span>
            <span className="text-emerald-600 font-bold">100% Khớp</span>
          </div>

          {playerLines.map((line, idx) => {
            const theme = LINE_THEMES[idx % LINE_THEMES.length];
            const { eqText } = formatEquation(line.a, line.b);
            return (
              <div
                key={idx}
                className="flex items-center justify-between text-xs p-2 rounded-xl border"
                style={{
                  backgroundColor: theme.bgLight,
                  borderColor: theme.borderLight,
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: theme.color }}
                  />
                  <span className="font-mono-math font-bold text-stone-800 text-xs sm:text-sm">
                    {eqText}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-stone-500 font-semibold">
                  x ∈ [{line.xMin}, {line.xMax}]
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {hasNextLevel ? (
            <button
              onClick={() => {
                sounds.playClick();
                onNextLevel();
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-98 cursor-pointer"
            >
              <span>Màn tiếp theo (Màn {level.id + 1})</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenSelector();
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-98 cursor-pointer"
            >
              <Trophy className="w-5 h-5" />
              <span>Xem Bảng Thành Tích 15 Màn</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                onReplay();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Chơi lại màn này</span>
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                onOpenSelector();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Chọn màn khác</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
