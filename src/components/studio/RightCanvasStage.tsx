'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArtElement, EmotionKey, PrincipleKey, StudioMode } from '@/lib/types';
import { EMOTIONS, PRINCIPLES } from '@/lib/constants/emotions';
import { drawBackground, drawElement, drawSelectionBox } from '@/lib/engine/canvasRenderer';
import { findTopHitElement, HandleType } from '@/lib/engine/hitTest';
import { Download, Share2, Undo2, Redo2, Trash2, Eraser, Sparkles, Eye } from 'lucide-react';
import Link from 'next/link';

interface Props {
  elements: ArtElement[];
  selectedId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElementDirect: (id: string, updated: Partial<ArtElement>, pushHistory?: boolean) => void;
  onDeleteSelected: () => void;
  onClearAll: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  selectedEmotion: EmotionKey;
  activePrinciples: PrincipleKey[];
  mode: StudioMode;
  onOpenDownload: () => void;
  onOpenGallery: () => void;
}

export const RightCanvasStage: React.FC<Props> = ({
  elements,
  selectedId,
  onSelectElement,
  onUpdateElementDirect,
  onDeleteSelected,
  onClearAll,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  selectedEmotion,
  activePrinciples,
  mode,
  onOpenDownload,
  onOpenGallery,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Drag & Transform State
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    elementId: string;
    handle: HandleType;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialWidth: number;
    initialHeight: number;
    initialRotation: number;
  } | null>(null);

  const currEmotion = EMOTIONS.find((e) => e.key === selectedEmotion);

  // 캔버스 실시간 렌더링
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 캔버스 배경 (고급 종이 질감)
    drawBackground(ctx, width, height, '#FCFCFB');

    // 조형 요소 정렬 렌더링 (zIndex 기준)
    const sorted = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    for (const el of sorted) {
      drawElement(ctx, el, width, height);
    }

    // 선택된 요소의 바운딩 박스 & 변형 핸들 오버레이
    if (selectedId) {
      const selected = elements.find((el) => el.id === selectedId);
      if (selected) {
        drawSelectionBox(ctx, selected, width, height);
      }
    }
  }, [elements, selectedId]);

  // 반응형 캔버스 크기 리사이즈 핸들러
  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      // 정방형 캔버스 규격 계산 (컨테이너 여백 확보)
      const containerW = container.clientWidth - 32;
      const containerH = container.clientHeight - 32;
      const size = Math.min(containerW, containerH, 800);

      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      renderCanvas();
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [renderCanvas]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // 마우스/터치 다운 (클릭 선택 및 핸들 포착)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const dpr = window.devicePixelRatio || 1;
    const currentLogicalW = canvas.width / dpr;
    const currentLogicalH = canvas.height / dpr;

    const hit = findTopHitElement(clickX, clickY, elements, selectedId, currentLogicalW, currentLogicalH);

    if (hit.elementId) {
      onSelectElement(hit.elementId);
      const target = elements.find((el) => el.id === hit.elementId);
      if (target) {
        setDragState({
          isDragging: true,
          elementId: target.id,
          handle: hit.handle,
          startX: clickX,
          startY: clickY,
          initialX: target.x,
          initialY: target.y,
          initialWidth: target.width,
          initialHeight: target.height,
          initialRotation: target.rotation
        });
      }
    } else {
      // 빈 캔버스 클릭 시 선택 해제
      onSelectElement(null);
    }
  };

  // 마우스/터치 이동 (이동, 스케일, 회전 실시간 계산)
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragState || !dragState.isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currX = e.clientX - rect.left;
    const currY = e.clientY - rect.top;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    const deltaX = currX - dragState.startX;
    const deltaY = currY - dragState.startY;

    if (dragState.handle === 'move') {
      // 상대 백분율(-50 ~ 50) 좌표 계산
      const newX = dragState.initialX + (deltaX / w) * 100;
      const newY = dragState.initialY + (deltaY / h) * 100;
      onUpdateElementDirect(dragState.elementId, { x: newX, y: newY }, false);
    } else if (dragState.handle === 'rotate') {
      // 회전 각도 계산
      const target = elements.find((el) => el.id === dragState.elementId);
      if (!target) return;
      const cx = w / 2 + (target.x / 100) * w;
      const cy = h / 2 + (target.y / 100) * h;
      const angleRad = Math.atan2(currY - cy, currX - cx);
      const angleDeg = (angleRad * 180) / Math.PI + 90; // 상단 줄기 기준
      onUpdateElementDirect(dragState.elementId, { rotation: (angleDeg + 360) % 360 }, false);
    } else if (dragState.handle) {
      // 4개 모서리 크기 조절
      const scaleDelta = (deltaX + deltaY) / 4;
      const newWidth = Math.max(5, dragState.initialWidth + scaleDelta);
      const ratio = dragState.initialHeight / (dragState.initialWidth || 1);
      const newHeight = Math.max(2, newWidth * ratio);
      onUpdateElementDirect(dragState.elementId, { width: newWidth, height: newHeight }, false);
    }
  };

  // 마우스/터치 업 (변형 완료 및 히스토리 푸시)
  const handlePointerUp = () => {
    if (dragState && dragState.isDragging) {
      const target = elements.find((el) => el.id === dragState.elementId);
      if (target) {
        onUpdateElementDirect(target.id, {}, true); // 히스토리에 확정 기록
      }
    }
    setDragState(null);
  };

  return (
    <div className="h-full flex flex-col bg-slate-100/80 overflow-hidden">
      {/* 1. 상단 액션 툴바 */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          {/* 실행 취소 / 다시 실행 */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="실행 취소 (Undo)"
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white text-gray-700 transition"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="다시 실행 (Redo)"
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white text-gray-700 transition"
          >
            <Redo2 size={16} />
          </button>

          <div className="h-4 w-px bg-gray-200 mx-1" />

          {/* 선택 삭제 */}
          <button
            onClick={onDeleteSelected}
            disabled={!selectedId}
            title="선택된 요소 삭제"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 disabled:opacity-40 text-xs font-medium text-gray-600 hover:text-red-600 transition"
          >
            <Trash2 size={14} />
            <span>선택 삭제</span>
          </button>

          {/* 전체 비우기 */}
          <button
            onClick={onClearAll}
            title="캔버스 비우기"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs font-medium text-gray-600 transition"
          >
            <Eraser size={14} />
            <span>초기화</span>
          </button>
        </div>

        {/* 현재 상태 정보 뱃지 */}
        <div className="flex items-center gap-2 text-xs">
          {currEmotion && (
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200 font-semibold">
              <span>{currEmotion.emoji}</span>
              <span>{currEmotion.koreanName}</span>
            </div>
          )}
          {activePrinciples.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full border border-purple-200 font-medium text-[11px]">
              <span>원리:</span>
              <span>{activePrinciples.length}개 적용</span>
            </div>
          )}
          <span className="text-gray-400 font-mono text-[11px]">
            요소: {elements.length}개
          </span>
        </div>
      </div>

      {/* 2. 중앙 캔버스 무대 (중앙 정렬 뷰포트) */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 relative overflow-hidden"
      >
        <div className="relative shadow-xl rounded-xl overflow-hidden bg-white ring-1 ring-black/5">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="touch-none cursor-crosshair block"
          />

          {/* 캔버스 힌트 툴팁 */}
          {elements.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-white/80 pointer-events-none">
              <span className="text-3xl mb-2">🎨</span>
              <p className="text-sm font-bold text-gray-700">빈 캔버스입니다</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                왼쪽 도구창에서 [자동 생성]을 누르거나, [조형 요소(점·선·면)]를 클릭하여 나만의 감정 추상화를 시작해 보세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. 하단 액션바: 다운로드 & 갤러리 공유 */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <Link
            href="/gallery"
            className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-blue-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition"
          >
            <Eye size={15} />
            <span>우리 반 미술관</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* 작품 다운로드 (PNG) */}
          <button
            onClick={onOpenDownload}
            disabled={elements.length === 0}
            className="flex items-center gap-1.5 text-xs font-bold bg-gray-900 hover:bg-black text-white px-3.5 py-2 rounded-xl shadow-sm hover:shadow transition disabled:opacity-40"
          >
            <Download size={15} />
            <span>작품 다운로드 (PNG)</span>
          </button>

          {/* 갤러리 공유 */}
          <button
            onClick={onOpenGallery}
            disabled={elements.length === 0}
            className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl shadow-sm hover:shadow transition disabled:opacity-40"
          >
            <Share2 size={15} />
            <span>우리 반 전시관 등록</span>
          </button>
        </div>
      </div>
    </div>
  );
};
