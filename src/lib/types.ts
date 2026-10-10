export type StudioMode = 'auto' | 'guided' | 'freeform';

export type ElementType = 'point' | 'line' | 'shape';

export type PointSubType = 'single' | 'cluster' | 'spray' | 'heavy' | 'diamond';
export type LineSubType = 'straight' | 'smooth_curve' | 'wave' | 'zigzag' | 'spiral' | 'dashed' | 'motion';
export type ShapeSubType = 'circle' | 'ellipse' | 'triangle' | 'rect' | 'star' | 'blob' | 'fragment' | 'polygon';

export interface ArtElement {
  id: string;
  type: ElementType;
  subType: string;
  x: number; // percentage (-50 to 50 relative to canvas center)
  y: number; // percentage (-50 to 50)
  width: number; // percentage relative to canvas dimension
  height: number;
  rotation: number; // 0 to 360 degrees
  color: string;
  opacity: number; // 0.1 to 1.0
  strokeWidth?: number;
  fill?: boolean;
  zIndex: number;
  // Specific geometry points or seeds
  points?: { x: number; y: number }[];
}

export type EmotionKey =
  // 긍정/생명력
  | 'joy'
  | 'ecstasy'
  | 'flutter'
  | 'passion'
  | 'hope'
  // 평온/안정
  | 'serenity'
  | 'rest'
  | 'calm'
  | 'cozy'
  // 슬픔/내면
  | 'sorrow'
  | 'void'
  | 'solitude'
  | 'longing'
  // 긴장/격정
  | 'rage'
  | 'anxiety'
  | 'chaos';

export type PrincipleKey =
  | 'balance_sym'
  | 'balance_asym'
  | 'rhythm'
  | 'emphasis'
  | 'contrast'
  | 'unity'
  | 'variety'
  | 'movement';

export interface EmotionInfo {
  key: EmotionKey;
  koreanName: string;
  englishName: string;
  emoji: string;
  category: '활기/긍정' | '평온/안정' | '슬픔/내면' | '긴장/격정';
  colorPalette: string[];
  description: string;
}

export interface PrincipleInfo {
  key: PrincipleKey;
  koreanName: string;
  englishName: string;
  icon: string;
  description: string;
}

export interface ArtworkRecord {
  id: string;
  student_id: string;
  student_name: string;
  title: string;
  emotion: string;
  mode: string;
  principles: string[];
  elements_summary?: string;
  description?: string;
  image_data: string;
  created_at: string;
}
