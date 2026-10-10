'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArtElement, EmotionKey, PrincipleKey, StudioMode, BrushStyle } from '@/lib/types';
import { EMOTIONS } from '@/lib/constants/emotions';
import { drawBackground, drawElement, drawSelectionBox } from '@/lib/engine/canvasRenderer';
import { findTopHitElement, HandleType } from '@/lib/engine/hitTest';
import { Download, Share2, Undo2, Redo2, Trash2, Eraser, Eye, MousePointer, PenTool, Sparkles } from 'lucide-react';
import Link from 'next/link';

function uid(): string {
  return 'el_' + Math.random().toString(36).substring(2, 9);
}

interface Props {
  elements: ArtElement[];
  selectedId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElementDirect: (id: string, updated: Partial<ArtElement>, pushHistory?: boolean) => void;
  onAddDrawnStroke: (element: ArtElement) => void;
  onDeleteSelected: () => void;
  onClearAll: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  selectedEmotion: EmotionKey;
  activePrinciples: PrincipleKey[];
  mode: StudioMode;
  currentColor: string;
  onOpenDownload: () => void;
  onOpenGallery: () => void;
}

export const RightCanvasStage: React.FC<Props> = ({
  elements,
  selectedId,
  onSelectElement,
  onUpdateElementDirect,
  onAddDrawnStroke,
  onDeleteSelected,
  onClearAll,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  selectedEmotion,
  activePrinciples,
  currentColor,
  onOpenDownload,
  onOpenGallery,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 캔버스 도구 모드: 'select' (선택/변형) vs 'draw' (자유 드로잉 펜)
  const [activeTool, setActiveTool] = useState<'select' | 'draw'>('select');
  const [brushStyle, setBrushStyle] = useState<BrushStyle>('pen');
  const [brushWidth, setBrushWidth] = useState<number>(5);

  // 자유 드로잉 실시간 좌표 배열
  const [activeStroke, setActiveStroke] = useState<{ x: number; y: number }[] | null>(null);

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

    // 1. 캔버스 배경 (고급 종이 질감)
    drawBackground(ctx, width, height, '#FCFCFB');

    // 2. 조형 요소 정렬 렌더링 (zIndex 기준)
    const sorted = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    for (const el of sorted) {
      drawElement(ctx, el, width, height);
    }

    // 3. 현재 실시간 드로잉 중인 획 표시
    if (activeStroke && activeStroke.length > 0) {
      ctx.save();
      ctx.strokeStyle = currentColor;
      ctx.fillStyle = currentColor;
      ctx.lineWidth = brushWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (brushStyle === 'glow') {
        ctx.shadowColor = currentColor;
        ctx.shadowBlur = 12;
      } else if (brushStyle === 'marker') {
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = brushWidth * 1.6;
        ctx.lineCap = 'square';
      }

      const toPx = (pt: { x: number; y: number }) => ({
        x: width / 2 + (pt.x / 100) * width,
        y: height / 2 + (pt.y / 100) * height
      });

      if (activeStroke.length === 1) {
        const p = toPx(activeStroke[0]);
        ctx.beginPath();
        ctx.arc(p.x, p.y, brushWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        const start = toPx(activeStroke[0]);
        ctx.moveTo(start.x, start.y);
        for (let i = 1; i < activeStroke.length; i++) {
          const p = toPx(activeStroke[i]);
          ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // 4. 선택된 요소의 바운딩 박스 & 변형 핸들 오버레이 (선택 모드일 때만)
    if (activeTool === 'select' && selectedId) {
      const selected = elements.find((el) => el.id === selectedId);
      if (selected) {
        drawSelectionBox(ctx, selected, width, height);
      }
    }
  }, [elements, selectedId, activeTool, activeStroke, currentColor, brushWidth, brushStyle]);

  // 반응형 캔버스 크기 리사이즈 핸들러
  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

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

  // 마우스/터치 다운
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const dpr = window.devicePixelRatio || 1;
    const currentLogicalW = canvas.width / dpr;
    const currentLogicalH = canvas.height / dpr;

    if (activeTool === 'draw') {
      // 자유 드로잉 시작 (상대 좌표 백분율 계산)
      const pctX = ((clickX - currentLogicalW / 2) / currentLogicalW) * 100;
      const pctY = ((clickY - currentLogicalH / 2) / currentLogicalH) * 100;
      setActiveStroke([{ x: pctX, y: pctY }]);
      return;
    }

    // 선택 모드
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
      onSelectElement(null);
    }
  };

  // 마우스/터치 이동
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currX = e.clientX - rect.left;
    const currY = e.clientY - rect.top;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    if (activeTool === 'draw' && activeStroke) {
      const pctX = ((currX - w / 2) / w) * 100;
      const pctY = ((currY - h / 2) / h) * 100;
      setActiveStroke((prev) => (prev ? [...prev, { x: pctX, y: pctY }] : [{ x: pctX, y: pctY }]));
      return;
    }

    if (!dragState || !dragState.isDragging) return;

    const deltaX = currX - dragState.startX;
    const deltaY = currY - dragState.startY;

    if (dragState.handle === 'move') {
      const newX = dragState.initialX + (deltaX / w) * 100;
      const newY = dragState.initialY + (deltaY / h) * 100;
      onUpdateElementDirect(dragState.elementId, { x: newX, y: newY }, false);
    } else if (dragState.handle === 'rotate') {
      const target = elements.find((el) => el.id === dragState.elementId);
      if (!target) return;
      const cx = w / 2 + (target.x / 100) * w;
      const cy = h / 2 + (target.y / 100) * h;
      const angleRad = Math.atan2(currY - cy, currX - cx);
      const angleDeg = (angleRad * 180) / Math.PI + 90;
      onUpdateElementDirect(dragState.elementId, { rotation: (angleDeg + 360) % 360 }, false);
    } else if (dragState.handle) {
      const scaleDelta = (deltaX + deltaY) / 4;
      const newWidth = Math.max(5, dragState.initialWidth + scaleDelta);
      const ratio = dragState.initialHeight / (dragState.initialWidth || 1);
      const newHeight = Math.max(2, newWidth * ratio);
      onUpdateElementDirect(dragState.elementId, { width: newWidth, height: newHeight }, false);
    }
  };

  // 마우스/터치 업
  const handlePointerUp = () => {
    if (activeTool === 'draw' && activeStroke && activeStroke.length > 0) {
      // 드로잉 완료 -> 영구 조형 요소(ArtElement)로 등록
      const nextZ = elements.length > 0 ? Math.max(...elements.map((e) => e.zIndex || 0)) + 1 : 1;
      const newStrokeElement: ArtElement = {
        id: uid(),
        type: 'line',
        subType: 'freehand',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: 0,
        color: currentColor,
        opacity: 0.9,
        strokeWidth: brushWidth,
        brushStyle,
        zIndex: nextZ,
        points: activeStroke
      };
      onAddDrawnStroke(newStrokeElement);
      setActiveStroke(null);
      return;
    }

    if (dragState && dragState.isDragging) {
      const target = elements.find((el) => el.id === dragState.elementId);
      if (target) {
        onUpdateElementDirect(target.id, {}, true);
      }
    }
    setDragState(null);
  };

  return (
    <div className="h-full flex flex-col bg-slate-100/80 overflow-hidden">
      {/* 1. 상단 액션 툴바 */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 flex flex-wrap items-center justify-between shadow-2xs gap-2">
        <div className="flex items-center gap-1.5">
          {/* 도구 전환: 선택 vs 자유 드로잉 */}
          <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            <button
              onClick={() => setActiveTool('select')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition ${
                activeTool === 'select'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MousePointer size={13} />
              <span>선택·변형</span>
            </button>
            <button
              onClick={() => {
                setActiveTool('draw');
                onSelectElement(null);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition ${
                activeTool === 'draw'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <PenTool size={13} />
              <span>자유 드로잉</span>
            </button>
          </div>

          {/* 자유 드로잉 전용 펜 옵션 바 */}
          {activeTool === 'draw' && (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-gray-200 text-xs">
              <select
                value={brushStyle}
                onChange={(e) => setBrushStyle(e.target.value as BrushStyle)}
                className="px-2 py-1 bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-700"
              >
                <option value="pen">일반 펜 (Pen)</option>
                <option value="brush">미술 붓 (Brush)</option>
                <option value="marker">형광 마커 (Marker)</option>
                <option value="glow">네온 발광 (Glow)</option>
              </select>

              <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                <span className="text-[10px] text-gray-500 font-bold">굵기</span>
                <input
                  type="range"
                  min="2"
                  max="28"
                  value={brushWidth}
                  onChange={(e) => setBrushWidth(Number(e.target.value))}
                  className="w-16 h-1.5 bg-gray-200 rounded appearance-none accent-blue-600 cursor-pointer"
                />
                <span className="text-[10px] font-mono text-gray-600">{brushWidth}px</span>
              </div>
            </div>
          )}

          <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />

          {/* 실행 취소 / 다시 실행 */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="실행 취소 (Undo)"
            className="p-1 rounded-md border border-gray-200 hover:bg-gray-100 disabled:opacity-40 text-gray-700 transition"
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="다시 실행 (Redo)"
            className="p-1 rounded-md border border-gray-200 hover:bg-gray-100 disabled:opacity-40 text-gray-700 transition"
          >
            <Redo2 size={15} />
          </button>

          {/* 선택 삭제 */}
          {activeTool === 'select' && (
            <button
              onClick={onDeleteSelected}
              disabled={!selectedId}
              title="선택된 요소 삭제"
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 hover:bg-red-50 hover:border-red-200 disabled:opacity-40 text-xs font-medium text-gray-600 hover:text-red-600 transition"
            >
              <Trash2 size={13} />
              <span>삭제</span>
            </button>
          )}

          {/* 전체 비우기 */}
          <button
            onClick={onClearAll}
            title="캔버스 비우기"
            className="flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-100 text-xs font-medium text-gray-600 transition"
          >
            <Eraser size={13} />
            <span>초기화</span>
          </button>
        </div>

        {/* 현재 상태 정보 뱃지 */}
        <div className="flex items-center gap-2 text-xs">
          {currEmotion && (
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-semibold text-[11px]">
              <span>{currEmotion.emoji}</span>
              <span>{currEmotion.koreanName}</span>
            </div>
          )}
          <span className="text-gray-400 font-mono text-[11px]">
            요소: {elements.length}개
          </span>
        </div>
      </div>

      {/* 2. 중앙 캔버스 무대 */}
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
            className={`touch-none block ${activeTool === 'draw' ? 'cursor-crosshair' : 'cursor-default'}`}
          />

          {elements.length === 0 && !activeStroke && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-white/80 pointer-events-none">
              <span className="text-3xl mb-2">🎨</span>
              <p className="text-sm font-bold text-gray-700">빈 캔버스입니다</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                상단의 <strong>[자유 드로잉]</strong> 펜으로 마음껏 그리거나, 왼쪽 도구창에서 [조형 요소]를 추가해 보세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. 하단 액션바 */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <Link
          href="/gallery"
          className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-blue-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition"
        >
          <Eye size={15} />
          <span>우리 반 미술관</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDownload}
            disabled={elements.length === 0}
            className="flex items-center gap-1.5 text-xs font-bold bg-gray-900 hover:bg-black text-white px-3.5 py-2 rounded-xl shadow-sm hover:shadow transition disabled:opacity-40"
          >
            <Download size={15} />
            <span>작품 다운로드 (PNG)</span>
          </button>

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
