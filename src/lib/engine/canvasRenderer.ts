import { ArtElement } from '../types';

export function toCanvasCoords(el: ArtElement, canvasWidth: number, canvasHeight: number) {
  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2;
  const px = cx + (el.x / 100) * canvasWidth;
  const py = cy + (el.y / 100) * canvasHeight;
  const w = (el.width / 100) * canvasWidth;
  const h = (el.height / 100) * canvasHeight;
  return { px, py, w, h };
}

export function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, bgColor: string = '#FBFBFA') {
  ctx.save();
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // 미세한 미술용 캔버스 한지/캔버스 질감 도트 효과
  ctx.fillStyle = 'rgba(0, 0, 0, 0.015)';
  const step = 8;
  for (let x = 0; x < width; x += step) {
    for (let y = 0; y < height; y += step) {
      if ((x + y) % (step * 2) === 0) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  ctx.restore();
}

export function drawElement(
  ctx: CanvasRenderingContext2D,
  element: ArtElement,
  canvasWidth: number,
  canvasHeight: number
) {
  const { px, py, w, h } = toCanvasCoords(element, canvasWidth, canvasHeight);

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate((element.rotation * Math.PI) / 180);
  ctx.globalAlpha = Math.max(0.05, Math.min(1, element.opacity));
  ctx.fillStyle = element.color;
  ctx.strokeStyle = element.color;
  ctx.lineWidth = element.strokeWidth || 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const halfW = w / 2;
  const halfH = h / 2;

  switch (element.type) {
    case 'point':
      drawPoint(ctx, element.subType, halfW, halfH);
      break;
    case 'line':
      drawLine(ctx, element.subType, halfW, halfH);
      break;
    case 'shape':
      drawShape(ctx, element.subType, halfW, halfH, element.fill ?? true);
      break;
  }

  ctx.restore();
}

function drawPoint(ctx: CanvasRenderingContext2D, subType: string, halfW: number, halfH: number) {
  const r = Math.max(2, Math.min(halfW, halfH));
  switch (subType) {
    case 'single':
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'heavy':
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'diamond':
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.4);
      ctx.lineTo(r * 1.4, 0);
      ctx.lineTo(0, r * 1.4);
      ctx.lineTo(-r * 1.4, 0);
      ctx.closePath();
      ctx.fill();
      break;
    case 'cluster':
      // 7개의 점 무리
      const offsets = [
        [0, 0],
        [-r * 0.7, -r * 0.6],
        [r * 0.8, -r * 0.4],
        [r * 0.6, r * 0.7],
        [-r * 0.5, r * 0.8],
        [-r * 0.9, 0.2],
        [0.3, -r * 0.9]
      ];
      offsets.forEach(([ox, oy], idx) => {
        ctx.beginPath();
        ctx.arc(ox, oy, r * (idx === 0 ? 0.6 : 0.4), 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    case 'spray':
      // 14개의 미세한 흩뿌림 점
      for (let i = 0; i < 14; i++) {
        const angle = (i * 2.39996) + 0.5;
        const dist = (i / 14) * r * 1.6;
        const sx = Math.cos(angle) * dist;
        const sy = Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(1, r * 0.22 * ((i % 3) + 1)), 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    default:
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
  }
}

function drawLine(ctx: CanvasRenderingContext2D, subType: string, halfW: number, halfH: number) {
  switch (subType) {
    case 'straight':
      ctx.beginPath();
      ctx.moveTo(-halfW, 0);
      ctx.lineTo(halfW, 0);
      ctx.stroke();
      break;
    case 'dashed':
      ctx.save();
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(-halfW, 0);
      ctx.lineTo(halfW, 0);
      ctx.stroke();
      ctx.restore();
      break;
    case 'smooth_curve':
      ctx.beginPath();
      ctx.moveTo(-halfW, halfH);
      ctx.bezierCurveTo(-halfW * 0.5, -halfH * 1.5, halfW * 0.5, halfH * 1.5, halfW, -halfH);
      ctx.stroke();
      break;
    case 'wave':
      ctx.beginPath();
      ctx.moveTo(-halfW, 0);
      const segments = 4;
      const segW = (halfW * 2) / segments;
      for (let i = 0; i < segments; i++) {
        const x1 = -halfW + i * segW;
        const x2 = x1 + segW;
        const sign = i % 2 === 0 ? 1 : -1;
        ctx.quadraticCurveTo(x1 + segW / 2, sign * halfH, x2, 0);
      }
      ctx.stroke();
      break;
    case 'zigzag':
      ctx.beginPath();
      ctx.moveTo(-halfW, 0);
      const zSteps = 5;
      const zStepW = (halfW * 2) / zSteps;
      for (let i = 0; i < zSteps; i++) {
        const x = -halfW + (i + 0.5) * zStepW;
        const sign = i % 2 === 0 ? -1 : 1;
        ctx.lineTo(x, sign * halfH);
      }
      ctx.lineTo(halfW, 0);
      ctx.stroke();
      break;
    case 'spiral':
      ctx.beginPath();
      const maxR = Math.min(halfW, halfH);
      for (let t = 0; t < Math.PI * 6; t += 0.1) {
        const currR = (t / (Math.PI * 6)) * maxR;
        const sx = Math.cos(t) * currR;
        const sy = Math.sin(t) * currR;
        if (t === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      break;
    case 'motion':
      ctx.beginPath();
      const numLines = 3;
      const lineGap = halfH / numLines;
      for (let i = -1; i <= 1; i++) {
        const yOffset = i * lineGap * 1.5;
        const len = halfW * (1 - Math.abs(i) * 0.2);
        ctx.moveTo(-len, yOffset);
        ctx.lineTo(len, yOffset);
      }
      ctx.stroke();
      break;
    default:
      ctx.beginPath();
      ctx.moveTo(-halfW, 0);
      ctx.lineTo(halfW, 0);
      ctx.stroke();
  }
}

function drawShape(ctx: CanvasRenderingContext2D, subType: string, halfW: number, halfH: number, fill: boolean) {
  ctx.beginPath();
  switch (subType) {
    case 'circle':
      const r = Math.min(halfW, halfH);
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      break;
    case 'ellipse':
      ctx.ellipse(0, 0, halfW, halfH, 0, 0, Math.PI * 2);
      break;
    case 'triangle':
      ctx.moveTo(0, -halfH);
      ctx.lineTo(halfW, halfH);
      ctx.lineTo(-halfW, halfH);
      ctx.closePath();
      break;
    case 'rect':
      ctx.rect(-halfW, -halfH, halfW * 2, halfH * 2);
      break;
    case 'star':
      const spikes = 5;
      const outerR = Math.min(halfW, halfH);
      const innerR = outerR * 0.45;
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
    case 'blob':
      // 유기적 부드러운 형태
      ctx.moveTo(0, -halfH);
      ctx.bezierCurveTo(halfW * 1.2, -halfH * 0.8, halfW * 0.9, halfH * 0.9, 0, halfH);
      ctx.bezierCurveTo(-halfW * 0.8, halfH * 1.1, -halfW * 1.1, -halfH * 0.5, 0, -halfH);
      ctx.closePath();
      break;
    case 'fragment':
      ctx.moveTo(-halfW * 0.8, -halfH);
      ctx.lineTo(halfW, -halfH * 0.2);
      ctx.lineTo(halfW * 0.6, halfH);
      ctx.lineTo(-halfW, halfH * 0.7);
      ctx.closePath();
      break;
    case 'polygon':
      const sides = 6;
      const polyR = Math.min(halfW, halfH);
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        const x = Math.cos(angle) * polyR;
        const y = Math.sin(angle) * polyR;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
    default:
      ctx.rect(-halfW, -halfH, halfW * 2, halfH * 2);
  }

  if (fill) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
}

export function drawSelectionBox(
  ctx: CanvasRenderingContext2D,
  element: ArtElement,
  canvasWidth: number,
  canvasHeight: number
) {
  const { px, py, w, h } = toCanvasCoords(element, canvasWidth, canvasHeight);
  const pad = 12;
  const boxW = w + pad * 2;
  const boxH = h + pad * 2;

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate((element.rotation * Math.PI) / 180);

  // 선택 바운딩 박스 테두리 (파란색 점선)
  ctx.strokeStyle = '#3182CE';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([5, 4]);
  ctx.strokeRect(-boxW / 2, -boxH / 2, boxW, boxH);

  // 4개 모서리 크기 조절 핸들
  ctx.setLineDash([]);
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#2B6CB0';
  ctx.lineWidth = 2;
  const handleSize = 9;
  const corners = [
    [-boxW / 2, -boxH / 2],
    [boxW / 2, -boxH / 2],
    [boxW / 2, boxH / 2],
    [-boxW / 2, boxH / 2]
  ];
  corners.forEach(([cx, cy]) => {
    ctx.fillRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
    ctx.strokeRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
  });

  // 상단 회전 핸들 (줄기 + 원)
  const stemLen = 22;
  ctx.beginPath();
  ctx.moveTo(0, -boxH / 2);
  ctx.lineTo(0, -boxH / 2 - stemLen);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, -boxH / 2 - stemLen, 5.5, 0, Math.PI * 2);
  ctx.fillStyle = '#3182CE';
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}
