import { ArtElement } from '../types';
import { toCanvasCoords } from './canvasRenderer';

export type HandleType = 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'rotate' | null;

export function hitTestElement(
  clickX: number,
  clickY: number,
  element: ArtElement,
  canvasWidth: number,
  canvasHeight: number
): { hit: boolean; handle: HandleType } {
  const { px, py, w, h } = toCanvasCoords(element, canvasWidth, canvasHeight);
  const pad = 12;
  const strokeExtra = element.strokeWidth || 0;
  const effectiveW = Math.max(element.type === 'point' ? 24 : 14, w);
  const effectiveH = Math.max(element.type === 'point' ? 24 : 14, Math.max(h, strokeExtra));
  const boxW = effectiveW + pad * 2;
  const boxH = effectiveH + pad * 2;

  // Translate click to element's local space (reverse translation and rotation)
  const rad = (-element.rotation * Math.PI) / 180;
  const dx = clickX - px;
  const dy = clickY - py;
  const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
  const localY = dx * Math.sin(rad) + dy * Math.cos(rad);

  // Check Rotate Handle (top stem)
  const stemLen = 22;
  const rotHandleY = -boxH / 2 - stemLen;
  const rotDist = Math.hypot(localX - 0, localY - rotHandleY);
  if (rotDist <= 12) {
    return { hit: true, handle: 'rotate' };
  }

  // Check 4 Corner Handles
  const handleRadius = 10;
  const corners: { handle: HandleType; x: number; y: number }[] = [
    { handle: 'nw', x: -boxW / 2, y: -boxH / 2 },
    { handle: 'ne', x: boxW / 2, y: -boxH / 2 },
    { handle: 'se', x: boxW / 2, y: boxH / 2 },
    { handle: 'sw', x: -boxW / 2, y: boxH / 2 }
  ];

  for (const corner of corners) {
    if (Math.hypot(localX - corner.x, localY - corner.y) <= handleRadius) {
      return { hit: true, handle: corner.handle };
    }
  }

  // Check Body (Move)
  if (
    localX >= -boxW / 2 &&
    localX <= boxW / 2 &&
    localY >= -boxH / 2 &&
    localY <= boxH / 2
  ) {
    return { hit: true, handle: 'move' };
  }

  return { hit: false, handle: null };
}

export function findTopHitElement(
  clickX: number,
  clickY: number,
  elements: ArtElement[],
  selectedId: string | null,
  canvasWidth: number,
  canvasHeight: number
): { elementId: string | null; handle: HandleType } {
  // If an element is already selected, test its handles first
  if (selectedId) {
    const selected = elements.find((el) => el.id === selectedId);
    if (selected) {
      const res = hitTestElement(clickX, clickY, selected, canvasWidth, canvasHeight);
      if (res.hit && res.handle && res.handle !== 'move') {
        return { elementId: selected.id, handle: res.handle };
      }
    }
  }

  // Sort by zIndex descending (highest on top)
  const sorted = [...elements].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
  const hits: { el: ArtElement; handle: HandleType }[] = [];

  for (const el of sorted) {
    const res = hitTestElement(clickX, clickY, el, canvasWidth, canvasHeight);
    if (res.hit) {
      hits.push({ el, handle: res.handle || 'move' });
    }
  }

  if (hits.length === 0) {
    return { elementId: null, handle: null };
  }

  // 이미 선택된 요소 위를 다시 클릭한 경우, 겹쳐 있는 뒤쪽 요소를 순환 선택(Through-Click)
  if (selectedId && hits.length > 1) {
    const currentIndex = hits.findIndex((h) => h.el.id === selectedId);
    if (currentIndex !== -1) {
      const nextHit = hits[(currentIndex + 1) % hits.length];
      return { elementId: nextHit.el.id, handle: nextHit.handle };
    }
  }

  return { elementId: hits[0].el.id, handle: hits[0].handle };
}

export function findElementsByBox(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  elements: ArtElement[],
  canvasWidth: number,
  canvasHeight: number
): string[] {
  const minX = Math.min(startX, endX);
  const maxX = Math.max(startX, endX);
  const minY = Math.min(startY, endY);
  const maxY = Math.max(startY, endY);

  const matchedIds: string[] = [];

  for (const el of elements) {
    const { px, py, w, h } = toCanvasCoords(el, canvasWidth, canvasHeight);
    const halfW = Math.max(6, w / 2);
    const halfH = Math.max(6, h / 2);

    const elMinX = px - halfW;
    const elMaxX = px + halfW;
    const elMinY = py - halfH;
    const elMaxY = py + halfH;

    const overlaps =
      elMinX <= maxX &&
      elMaxX >= minX &&
      elMinY <= maxY &&
      elMaxY >= minY;

    if (overlaps) {
      matchedIds.push(el.id);
    }
  }

  return matchedIds;
}

