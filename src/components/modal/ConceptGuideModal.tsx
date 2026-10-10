'use client';

import React from 'react';
import { X, BookOpen, Sparkles, Sliders, CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ConceptGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[88vh]">
        {/* 헤더 */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-600" size={20} />
            <h2 className="text-sm font-extrabold text-gray-900">
              미술 수업 학습 가이드: 조형 요소와 원리, 그리고 추상화
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-200 text-gray-500 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* 바디 */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-700 leading-relaxed">
          {/* 1. 추상화란 무엇인가? */}
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 space-y-2">
            <h3 className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
              <Sparkles size={16} />
              <span>추상화(Abstraction)란 무엇인가?</span>
            </h3>
            <p>
              추상화는 눈에 보이는 대상을 그대로 사실적으로 묘사하는 것이 아니라, 대상의 불필요한 세부 묘사를 지우고 <strong>본질적인 특징이나 내면의 감정, 순수한 조형 요소(점, 선, 면, 색)</strong>만으로 화면을 새롭게 재구성하는 미술 표현 방식입니다.
            </p>
            <p className="text-blue-800 font-medium">
              * 몬드리안은 나무를 점차 수직·수평선과 삼원색으로 단순화했고, 피카소는 황소의 형태를 해체하여 몇 개의 강렬한 윤곽선으로 본질을 추출했습니다.
            </p>
          </div>

          {/* 2. 조형 요소 (Visual Elements) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-1.5 flex items-center gap-1.5">
              <span>📍 조형 요소 (Visual Elements)</span>
              <span className="text-[11px] font-normal text-gray-500">- 미술을 이루는 가장 기본 재료</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900">1. 점 (Point)</span>
                <p className="text-gray-600">위치만을 가지는 가장 작은 단위로, 시선의 집중점(초점)을 만들거나 무리를 지어 질감과 에너지를 형성합니다.</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900">2. 선 (Line)</span>
                <p className="text-gray-600">점이 연속되어 이동한 자취로, 방향성·속도감·긴장감(직선/지그재그) 또는 유연함과 감성(곡선/파선)을 나타냅니다.</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900">3. 면 (Shape / Plane)</span>
                <p className="text-gray-600">선이 만나 둘러싼 평면 영역으로, 기하학적 면(원·삼각·사각)과 유기적인 생명체 형태(블롭)로 공간을 채웁니다.</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900">4. 색채 (Color)</span>
                <p className="text-gray-600">빛과 감정을 가장 직관적으로 전달하는 요소로, 명도·채도·보색 대비를 통해 따뜻함, 차가움, 긴장과 평온을 전달합니다.</p>
              </div>
            </div>
          </div>

          {/* 3. 조형 원리 (Principles of Design) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-1.5 flex items-center gap-1.5">
              <Sliders size={15} />
              <span>⚖️ 조형 원리 (Principles of Design)</span>
              <span className="text-[11px] font-normal text-gray-500">- 조형 요소를 아름답게 엮는 구성 법칙</span>
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 border rounded-lg bg-white">
                <span className="font-bold text-gray-800">통일과 변화 (Unity & Variety)</span>
                <p className="text-gray-500 text-[11px] mt-0.5">화면 전체의 질서감(통일)과 지루함을 깨뜨리는 다채로움(변화)의 공존</p>
              </div>
              <div className="p-2.5 border rounded-lg bg-white">
                <span className="font-bold text-gray-800">균형 (Balance)</span>
                <p className="text-gray-500 text-[11px] mt-0.5">대칭 균형(정적인 안정감)과 비대칭 균형(시각적 무게 분산으로 생동감)</p>
              </div>
              <div className="p-2.5 border rounded-lg bg-white">
                <span className="font-bold text-gray-800">율동 / 리듬 (Rhythm)</span>
                <p className="text-gray-500 text-[11px] mt-0.5">일정한 파동이나 점이(Gradation) 규칙을 통해 눈길이 움직이는 박자감</p>
              </div>
              <div className="p-2.5 border rounded-lg bg-white">
                <span className="font-bold text-gray-800">강조와 대비 (Emphasis & Contrast)</span>
                <p className="text-gray-500 text-[11px] mt-0.5">주인공 요소를 부각(초점)하거나 보색·형태 충돌을 통한 강렬한 인상</p>
              </div>
            </div>
          </div>

          {/* 4. 창작 팁 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-1">
              <CheckCircle size={15} className="text-green-600" />
              <span>학생 실습 꿀팁</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 text-[11px]">
              <li>[자동 생성]으로 감정에 어울리는 기초 구도를 잡은 후, 캔버스의 요소를 직접 클릭해 위치와 색상을 수정해 보세요.</li>
              <li>화면이 밋밋하다면 [조형 원리]에서 <strong>&apos;리듬&apos;</strong>이나 <strong>&apos;강조&apos;</strong>를 눌러 역동성을 부여해 보세요.</li>
              <li>완성된 작품은 고해상도 PNG로 다운로드하고, [우리 반 전시관]에 작가의 의도를 함께 남겨 공유하세요!</li>
            </ul>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition"
          >
            확인하고 실습하기
          </button>
        </div>
      </div>
    </div>
  );
};
