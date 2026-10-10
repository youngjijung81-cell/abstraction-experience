'use client';

import React, { useEffect, useState } from 'react';
import { ArtworkRecord } from '@/lib/types';
import { EMOTIONS } from '@/lib/constants/emotions';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Filter, Calendar, User, Eye, Download } from 'lucide-react';

export default function GalleryPage() {
  const [artworks, setArtworks] = useState<ArtworkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkRecord | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/artworks');
        const data = await res.json();
        if (data.artworks) {
          setArtworks(data.artworks);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = selectedFilter === 'all'
    ? artworks
    : artworks.filter((a) => a.emotion === selectedFilter);

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col">
      {/* 1. 상단 네비게이션 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft size={16} />
              <span>창작 스튜디오</span>
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                <span>🏛️</span>
                <span>우리 반 온라인 미술관</span>
              </h1>
              <p className="text-[11px] text-gray-500">
                감정을 조형 요소와 원리로 시각화한 학생들의 추상화 전시관
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <Sparkles size={14} />
            <span>나도 작품 만들기</span>
          </Link>
        </div>
      </header>

      {/* 2. 감정별 필터 바 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-400 font-medium flex items-center gap-1 mr-1 shrink-0">
            <Filter size={13} />
            <span>감정 필터:</span>
          </span>
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-full font-bold transition shrink-0 ${
              selectedFilter === 'all'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            전체 작품 ({artworks.length})
          </button>
          {EMOTIONS.map((em) => (
            <button
              key={em.key}
              onClick={() => setSelectedFilter(em.koreanName)}
              className={`px-3 py-1.5 rounded-full font-semibold transition shrink-0 flex items-center gap-1 ${
                selectedFilter === em.koreanName
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{em.emoji}</span>
              <span>{em.koreanName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. 갤러리 메인 그리드 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500">작품들을 불러오는 중입니다...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-2xl border border-dashed border-gray-300 p-8 max-w-md mx-auto">
            <span className="text-4xl block mb-2">🎨</span>
            <h3 className="text-sm font-bold text-gray-800">아직 전시된 작품이 없습니다</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
              지금 스튜디오에서 감정 추상화를 창작하고 첫 번째 전시 작품의 주인공이 되어보세요!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Sparkles size={14} />
              <span>첫 작품 전시하기</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((art) => (
              <div
                key={art.id}
                onClick={() => setSelectedArtwork(art)}
                className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-all overflow-hidden cursor-pointer group flex flex-col"
              >
                {/* 캔버스 이미지 미리보기 */}
                <div className="relative aspect-square bg-slate-100 overflow-hidden border-b border-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={art.image_data}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>{art.emotion}</span>
                  </div>
                </div>

                {/* 정보 영역 */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition truncate">
                      {art.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                      <User size={13} className="text-gray-400" />
                      <span className="font-medium">
                        {art.student_id ? `[${art.student_id}] ` : ''}{art.student_name}
                      </span>
                    </div>
                  </div>

                  {/* 작가 의도 프리뷰 */}
                  {art.description && (
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg">
                      {art.description}
                    </p>
                  )}

                  {/* 조형 원리 태그 */}
                  {art.principles && art.principles.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {art.principles.map((pr, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200"
                        >
                          {pr}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 4. 상세보기 모달 */}
      {selectedArtwork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-sm font-bold text-gray-900">{selectedArtwork.title}</h2>
                <p className="text-xs text-gray-500">
                  {selectedArtwork.student_id ? `[${selectedArtwork.student_id}] ` : ''}
                  {selectedArtwork.student_name} 작가
                </p>
              </div>
              <button
                onClick={() => setSelectedArtwork(null)}
                className="p-1 rounded-lg hover:bg-gray-200 text-gray-500 text-xs font-bold px-2 py-1"
              >
                닫기
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="aspect-square max-w-md mx-auto rounded-xl overflow-hidden border shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedArtwork.image_data}
                  alt={selectedArtwork.title}
                  className="w-full h-full object-contain bg-white"
                />
              </div>

              {selectedArtwork.description && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-200 space-y-1">
                  <h4 className="text-xs font-bold text-gray-800">작가 노트 (Artist Note)</h4>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {selectedArtwork.description}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <span>감정: {selectedArtwork.emotion}</span>
                <span>모드: {selectedArtwork.mode}</span>
              </div>
            </div>

            <div className="p-3 border-t bg-gray-50 flex justify-end gap-2">
              <a
                href={selectedArtwork.image_data}
                download={`${selectedArtwork.title}.png`}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Download size={14} />
                <span>이미지 다운로드</span>
              </a>
              <button
                onClick={() => setSelectedArtwork(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-semibold transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
