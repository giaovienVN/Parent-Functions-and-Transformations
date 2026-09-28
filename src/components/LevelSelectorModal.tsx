import React from 'react';
import { LevelData } from '../types';
import { X, CheckCircle, Trophy, Sparkles } from 'lucide-react';
import { sounds } from '../sound';

interface LevelSelectorModalProps {
  levels: LevelData[];
  currentLevelId: number;
  completedLevels: number[];
  isOpen: boolean;
  onClose: () => void;
  onSelectLevel: (levelId: number) => void;
}

export const LevelSelectorModal: React.FC<LevelSelectorModalProps> = ({
  levels,
  currentLevelId,
  completedLevels,
  isOpen,
  onClose,
  onSelectLevel,
}) => {
  if (!isOpen) return null;

  const phases = [
    {
      phase: 1,
      title: 'Giai đoạn 1: Độ dốc & Đối xứng',
      desc: 'Làm quen với hệ số góc a, tung độ gốc b và tính đối xứng',
    },
    {
      phase: 2,
      title: 'Giai đoạn 2: Tạo hình đáng yêu',
      desc: 'Ghép 2-3 đường thẳng để vẽ tai mèo, ngọn núi tuyết, cánh nơ',
    },
    {
      phase: 3,
      title: 'Giai đoạn 3: Thử thách hệ số cao',
      desc: 'Cây thông, cánh buồm, sao băng, túp lều & vương miện',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FAF7F2] w-full max-w-2xl rounded-3xl border border-stone-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-heading">
                Danh sách 15 Màn Chơi
              </h2>
              <p className="text-xs text-stone-500">
                Đã hoàn thành {completedLevels.length} / 15 màn thử thách
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level List grouped by Phase */}
        <div className="p-6 overflow-y-auto space-y-6">
          {phases.map((group) => {
            const groupLevels = levels.filter((lvl) => lvl.phase === group.phase);
            return (
              <div key={group.phase} className="space-y-2.5">
                <div className="border-b border-stone-200 pb-1.5">
                  <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{group.title}</span>
                  </h3>
                  <p className="text-xs text-stone-500">{group.desc}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {groupLevels.map((lvl) => {
                    const isCompleted = completedLevels.includes(lvl.id);
                    const isCurrent = lvl.id === currentLevelId;

                    return (
                      <button
                        key={lvl.id}
                        onClick={() => {
                          sounds.playClick();
                          onSelectLevel(lvl.id);
                          onClose();
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all duration-200 relative flex items-start gap-3 ${
                          isCurrent
                            ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200 shadow-sm'
                            : isCompleted
                            ? 'bg-emerald-50/70 border-emerald-300 hover:bg-emerald-100/70'
                            : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-xs'
                        }`}
                      >
                        <span className="text-2xl select-none">{lvl.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wide">
                              Màn {lvl.id}
                            </span>
                            {isCompleted && (
                              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          <div className="text-xs font-bold text-stone-900 truncate">
                            {lvl.title}
                          </div>
                          <div className="text-[10px] text-stone-500 truncate mt-0.5">
                            {lvl.subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
