'use client';

import React from 'react';
import { ArtElement } from '@/lib/types';
import { ART_COLORS } from '@/lib/constants/colors';
import { Trash2, Copy, ArrowUp, ArrowDown, RotateCw, Sparkles } from 'lucide-react';

interface Props {
  element: ArtElement | null;
  onUpdate: (updated: Partial<ArtElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onDeselect: () => void;
}

export const SelectedElementEditor: React.FC<Props> = ({
  element,
  onUpdate,
  onDelete,
  onDuplicate,
  onBringForward,
  onSendBackward,
  onDeselect,
}) => {
  if (!element) return null;

  const typeLabels: Record<string, string> = {
    point: '점 (Point)',
    line: '선 (Line)',
    shape: '면 (Shape)'
  };

  return (
    <div className="bg-white border-2 border-blue-400 rounded-xl p-3.5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-xs font-bold text-gray-800">
            선택된 {typeLabels[element.type] || '요소'} ({element.subType})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDuplicate(element.id)}
            title="복제하기"
            className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => onBringForward(element.id)}
            title="앞으로 가져오기"
            className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
          >
            <ArrowUp size={14} />
          </button>
          <button
            onClick={() => onSendBackward(element.id)}
            title="뒤로 보내기"
            className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
          >
            <ArrowDown size={14} />
          </button>
          <button
            onClick={() => onDelete(element.id)}
            title="삭제"
            className="p-1 hover:bg-red-50 rounded text-gray-600 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={onDeselect}
            className="text-[11px] text-gray-400 hover:text-gray-700 ml-1 underline"
          >
            선택해제
          </button>
        </div>
      </div>

      {/* 색상 빠른 변경 (팔레트) */}
      <div>
        <label className="text-[11px] font-semibold text-gray-600 block mb-1">
          색상 변경 (원클릭)
        </label>
        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto p-1 bg-gray-50 rounded-lg border border-gray-200">
          {ART_COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => onUpdate({ color: c.hex })}
              title={c.name}
              style={{ backgroundColor: c.hex }}
              className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${
                element.color === c.hex ? 'ring-2 ring-blue-500 scale-110' : 'border-gray-300'
              }`}
            />
          ))}
          <input
            type="color"
            value={element.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-5 h-5 rounded cursor-pointer border border-gray-300 p-0"
            title="직접 색상 선택"
          />
        </div>
      </div>

      {/* 슬라이더 제어: 크기, 회전, 투명도 */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="flex justify-between text-[11px] text-gray-500 mb-0.5">
            <span>크기</span>
            <span>{Math.round(element.width)}%</span>
          </div>
          <input
            type="range"
            min="4"
            max="80"
            value={element.width}
            onChange={(e) => {
              const val = Number(e.target.value);
              const ratio = element.height / (element.width || 1);
              onUpdate({ width: val, height: Math.max(2, val * ratio) });
            }}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-gray-500 mb-0.5">
            <span>회전</span>
            <span>{Math.round(element.rotation)}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={element.rotation}
            onChange={(e) => onUpdate({ rotation: Number(e.target.value) })}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-gray-500 mb-0.5">
            <span>투명도</span>
            <span>{Math.round(element.opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={element.opacity}
            onChange={(e) => onUpdate({ opacity: Number(e.target.value) })}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      {element.type === 'shape' && (
        <div className="flex items-center gap-2 pt-1 border-t text-xs">
          <label className="flex items-center gap-1.5 text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={element.fill ?? true}
              onChange={(e) => onUpdate({ fill: e.target.checked })}
              className="rounded text-blue-600"
            />
            <span>면 채우기 (해제 시 외곽선만 표현)</span>
          </label>
        </div>
      )}
    </div>
  );
};
