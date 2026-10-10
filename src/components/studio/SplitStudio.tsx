'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArtElement, EmotionKey, PrincipleKey, StudioMode } from '@/lib/types';
import { LeftToolPanel } from './LeftToolPanel';
import { RightCanvasStage } from './RightCanvasStage';
import { DownloadModal } from '../modal/DownloadModal';
import { GalleryModal } from '../modal/GalleryModal';
import { ConceptGuideModal } from '../modal/ConceptGuideModal';
import { generateArtByEmotion } from '@/lib/engine/autoGenerator';
import { applyPrinciple } from '@/lib/engine/principleTransformer';
import { POINT_TEMPLATES, LINE_TEMPLATES, SHAPE_TEMPLATES } from '@/lib/constants/elements';

function uid(): string {
  return 'el_' + Math.random().toString(36).substring(2, 9);
}

export const SplitStudio: React.FC = () => {
  // 모드 및 감정 상태
  const [mode, setMode] = useState<StudioMode>('auto');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionKey>('joy');
  const [activePrinciples, setActivePrinciples] = useState<PrincipleKey[]>([]);
  const [currentColor, setCurrentColor] = useState<string>('#E53E3E');

  // 조형 요소 및 히스토리 상태 (Undo / Redo)
  const [elements, setElements] = useState<ArtElement[]>([]);
  const [history, setHistory] = useState<ArtElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 모달 상태
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // 히스토리에 현재 상태 푸시
  const pushHistory = useCallback((newElements: ArtElement[]) => {
    setHistory((prev) => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      return [...upToCurrent, newElements];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // 초기 자동 모드 기쁨(Joy) 기본 생성
  useEffect(() => {
    const initial = generateArtByEmotion('joy');
    setElements(initial);
    setHistory([initial]);
    setHistoryIndex(0);
  }, []);

  // 모드 변경 처리
  const handleModeChange = (newMode: StudioMode) => {
    setMode(newMode);
    if (newMode === 'freeform') {
      const empty: ArtElement[] = [];
      setElements(empty);
      pushHistory(empty);
      setSelectedId(null);
    } else if (newMode === 'auto') {
      const generated = generateArtByEmotion(selectedEmotion);
      setElements(generated);
      pushHistory(generated);
      setSelectedId(null);
    }
  };

  // 감정 선택 처리
  const handleEmotionSelect = (emotion: EmotionKey) => {
    setSelectedEmotion(emotion);
    if (mode === 'auto') {
      const generated = generateArtByEmotion(emotion);
      setElements(generated);
      pushHistory(generated);
      setSelectedId(null);
    }
  };

  // 조형 요소 수동 추가
  const handleAddElement = (type: 'point' | 'line' | 'shape', subType: string) => {
    let defaultW = 20;
    let defaultH = 20;

    if (type === 'point') {
      const t = POINT_TEMPLATES.find((item) => item.subType === subType);
      if (t) {
        defaultW = t.defaultWidth;
        defaultH = t.defaultHeight;
      }
    } else if (type === 'line') {
      const t = LINE_TEMPLATES.find((item) => item.subType === subType);
      if (t) {
        defaultW = t.defaultWidth;
        defaultH = t.defaultHeight;
      }
    } else if (type === 'shape') {
      const t = SHAPE_TEMPLATES.find((item) => item.subType === subType);
      if (t) {
        defaultW = t.defaultWidth;
        defaultH = t.defaultHeight;
      }
    }

    const nextZ = elements.length > 0 ? Math.max(...elements.map((e) => e.zIndex || 0)) + 1 : 1;
    const randOffset = () => (Math.random() - 0.5) * 15;

    const newElement: ArtElement = {
      id: uid(),
      type,
      subType,
      x: randOffset(),
      y: randOffset(),
      width: defaultW,
      height: defaultH,
      rotation: Math.floor(Math.random() * 36) * 10,
      color: currentColor,
      opacity: 0.85,
      strokeWidth: type === 'line' ? 4 : 2,
      frequency: subType === 'dashed' ? 8 : (['smooth_curve', 'wave', 'zigzag', 'spiral', 'motion'].includes(subType) ? 4 : undefined),
      amplitude: 1,
      sides: subType === 'polygon' ? 5 : undefined,
      distortion: 0,
      fill: true,
      zIndex: nextZ
    };

    const nextElements = [...elements, newElement];
    setElements(nextElements);
    pushHistory(nextElements);
    setSelectedId(newElement.id);
  };

  // 자유 드로잉 획 추가
  const handleAddDrawnStroke = (strokeElement: ArtElement) => {
    const nextElements = [...elements, strokeElement];
    setElements(nextElements);
    pushHistory(nextElements);
  };

  // 조형 원리 적용
  const handleApplyPrinciple = (principle: PrincipleKey) => {
    setActivePrinciples((prev) => {
      if (prev.includes(principle)) {
        return prev.filter((p) => p !== principle);
      } else {
        return [...prev, principle];
      }
    });

    const transformed = applyPrinciple(elements, principle);
    setElements(transformed);
    pushHistory(transformed);
  };

  // 선택된 요소 속성 업데이트
  const handleUpdateElement = (updated: Partial<ArtElement>) => {
    if (!selectedId) return;
    const nextElements = elements.map((el) => {
      if (el.id === selectedId) {
        return { ...el, ...updated };
      }
      return el;
    });
    setElements(nextElements);
    pushHistory(nextElements);
  };

  // 캔버스 드래그 중 실시간 업데이트
  const handleUpdateElementDirect = (id: string, updated: Partial<ArtElement>, shouldPushHistory?: boolean) => {
    const nextElements = elements.map((el) => {
      if (el.id === id) {
        return { ...el, ...updated };
      }
      return el;
    });
    setElements(nextElements);
    if (shouldPushHistory) {
      pushHistory(nextElements);
    }
  };

  // 선택된 요소 삭제
  const handleDeleteElement = (id: string) => {
    const nextElements = elements.filter((el) => el.id !== id);
    setElements(nextElements);
    pushHistory(nextElements);
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  // 요소 복제
  const handleDuplicateElement = (id: string) => {
    const target = elements.find((el) => el.id === id);
    if (!target) return;
    const nextZ = Math.max(...elements.map((e) => e.zIndex || 0)) + 1;
    const duplicated: ArtElement = {
      ...target,
      id: uid(),
      x: target.x + 5,
      y: target.y + 5,
      zIndex: nextZ
    };
    const nextElements = [...elements, duplicated];
    setElements(nextElements);
    pushHistory(nextElements);
    setSelectedId(duplicated.id);
  };

  // 레이어 순서 앞/뒤
  const handleBringForward = (id: string) => {
    const nextElements = elements.map((el) => {
      if (el.id === id) {
        return { ...el, zIndex: (el.zIndex || 0) + 1 };
      }
      return el;
    });
    setElements(nextElements);
    pushHistory(nextElements);
  };

  const handleSendBackward = (id: string) => {
    const nextElements = elements.map((el) => {
      if (el.id === id) {
        return { ...el, zIndex: Math.max(0, (el.zIndex || 0) - 1) };
      }
      return el;
    });
    setElements(nextElements);
    pushHistory(nextElements);
  };

  // 전체 초기화
  const handleClearAll = () => {
    if (window.confirm('캔버스를 모두 비우시겠습니까?')) {
      const empty: ArtElement[] = [];
      setElements(empty);
      pushHistory(empty);
      setSelectedId(null);
      setActivePrinciples([]);
    }
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setElements(history[nextIndex]);
      setSelectedId(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setElements(history[nextIndex]);
      setSelectedId(null);
    }
  };

  const selectedElement = elements.find((el) => el.id === selectedId) || null;

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row overflow-hidden bg-white">
      {/* 1. 좌측 도구 패널 (50% 분할) */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full">
        <LeftToolPanel
          mode={mode}
          onModeChange={handleModeChange}
          selectedEmotion={selectedEmotion}
          onEmotionSelect={handleEmotionSelect}
          onAddElement={handleAddElement}
          onApplyPrinciple={handleApplyPrinciple}
          activePrinciples={activePrinciples}
          currentColor={currentColor}
          onColorChange={setCurrentColor}
          selectedElement={selectedElement}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onBringForward={handleBringForward}
          onSendBackward={handleSendBackward}
          onDeselect={() => setSelectedId(null)}
          onOpenGuide={() => setIsGuideOpen(true)}
        />
      </div>

      {/* 2. 우측 캔버스 무대 (50% 분할) */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full">
        <RightCanvasStage
          elements={elements}
          selectedId={selectedId}
          onSelectElement={setSelectedId}
          onUpdateElementDirect={handleUpdateElementDirect}
          onAddDrawnStroke={handleAddDrawnStroke}
          onDeleteSelected={() => selectedId && handleDeleteElement(selectedId)}
          onClearAll={handleClearAll}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          selectedEmotion={selectedEmotion}
          activePrinciples={activePrinciples}
          mode={mode}
          currentColor={currentColor}
          onOpenDownload={() => setIsDownloadOpen(true)}
          onOpenGallery={() => setIsGalleryOpen(true)}
        />
      </div>

      {/* 다운로드 모달 */}
      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        elements={elements}
        selectedEmotion={selectedEmotion}
        activePrinciples={activePrinciples}
        mode={mode}
      />

      {/* 갤러리 공유 모달 */}
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        elements={elements}
        selectedEmotion={selectedEmotion}
        activePrinciples={activePrinciples}
        mode={mode}
      />

      {/* 조형 학습 가이드 모달 */}
      <ConceptGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};
