import { EmotionInfo } from '../types';
import { EMOTION_PALETTES } from './colors';

export const EMOTIONS: EmotionInfo[] = [
  // 1. 활기 / 긍정
  {
    key: 'joy',
    koreanName: '기쁨',
    englishName: 'Joy',
    emoji: '✨',
    category: '활기/긍정',
    colorPalette: EMOTION_PALETTES.joy,
    description: '밝고 경쾌한 리듬, 위로 솟아오르는 곡선과 생기 넘치는 점들의 군집'
  },
  {
    key: 'ecstasy',
    koreanName: '환희',
    englishName: 'Ecstasy',
    emoji: '🌟',
    category: '활기/긍정',
    colorPalette: EMOTION_PALETTES.ecstasy,
    description: '중심에서 사방으로 뻗어 나가는 강렬한 방사형 빛과 폭발적인 색채'
  },
  {
    key: 'flutter',
    koreanName: '설렘',
    englishName: 'Flutter',
    emoji: '🌸',
    category: '활기/긍정',
    colorPalette: EMOTION_PALETTES.flutter,
    description: '꽃잎처럼 흩날리는 부드러운 유기적 면과 따뜻하고 화사한 파스텔 톤'
  },
  {
    key: 'passion',
    koreanName: '열정',
    englishName: 'Passion',
    emoji: '🔥',
    category: '활기/긍정',
    colorPalette: EMOTION_PALETTES.passion,
    description: '불꽃처럼 치솟는 날카로운 삼각형과 강렬한 원색의 역동적인 조화'
  },
  {
    key: 'hope',
    koreanName: '희망',
    englishName: 'Hope',
    emoji: '🌱',
    category: '활기/긍정',
    colorPalette: EMOTION_PALETTES.hope,
    description: '어둠을 뚫고 솟아나는 새싹처럼 상향하는 직선과 맑은 연두·청록'
  },

  // 2. 평온 / 안정
  {
    key: 'serenity',
    koreanName: '평온',
    englishName: 'Serenity',
    emoji: '🍃',
    category: '평온/안정',
    colorPalette: EMOTION_PALETTES.serenity,
    description: '잔잔한 수면처럼 완만하게 흐르는 수평선과 마음을 가라앉히는 청록'
  },
  {
    key: 'rest',
    koreanName: '안식',
    englishName: 'Rest',
    emoji: '☁️',
    category: '평온/안정',
    colorPalette: EMOTION_PALETTES.rest,
    description: '구름처럼 둥글고 포근하게 겹쳐지는 유기적 면과 편안한 크림·녹색'
  },
  {
    key: 'calm',
    koreanName: '고요',
    englishName: 'Calm',
    emoji: '🌊',
    category: '평온/안정',
    colorPalette: EMOTION_PALETTES.calm,
    description: '깊은 바다 속 침묵처럼 무게감 있게 정돈된 수평 구도와 딥 블루'
  },
  {
    key: 'cozy',
    koreanName: '포근함',
    englishName: 'Cozy',
    emoji: '☕',
    category: '평온/안정',
    colorPalette: EMOTION_PALETTES.cozy,
    description: '따뜻한 모닥불과 흙의 온기처럼 감싸 안는 둥근 원과 부드러운 갈색·주황'
  },

  // 3. 슬픔 / 내면
  {
    key: 'sorrow',
    koreanName: '슬픔',
    englishName: 'Sorrow',
    emoji: '💧',
    category: '슬픔/내면',
    colorPalette: EMOTION_PALETTES.sorrow,
    description: '눈물처럼 아래로 길게 떨어지는 수직선과 묵직하게 가라앉는 푸른빛'
  },
  {
    key: 'void',
    koreanName: '공허',
    englishName: 'Void',
    emoji: '🌫️',
    category: '슬픔/내면',
    colorPalette: EMOTION_PALETTES.void,
    description: '넓은 여백 속 외롭게 흩어진 몇 개의 희미한 점과 모노톤의 대비'
  },
  {
    key: 'solitude',
    koreanName: '외로움',
    englishName: 'Solitude',
    emoji: '🌌',
    category: '슬픔/내면',
    colorPalette: EMOTION_PALETTES.solitude,
    description: '광활한 어둠 속 홀로 놓인 작고 짙은 하나의 원과 쓸쓸한 보랏빛'
  },
  {
    key: 'longing',
    koreanName: '그리움',
    englishName: 'Longing',
    emoji: '🌙',
    category: '슬픔/내면',
    colorPalette: EMOTION_PALETTES.longing,
    description: '먼 곳을 향해 아련하게 이어지다 끊어지는 점선과 몽환적인 자주·보라'
  },

  // 4. 긴장 / 격정
  {
    key: 'rage',
    koreanName: '분노',
    englishName: 'Rage',
    emoji: '⚡',
    category: '긴장/격정',
    colorPalette: EMOTION_PALETTES.rage,
    description: '날카롭게 부딪치는 지그재그 선과 격렬하게 충돌하는 붉은색과 검정'
  },
  {
    key: 'anxiety',
    koreanName: '불안',
    englishName: 'Anxiety',
    emoji: '🌀',
    category: '긴장/격정',
    colorPalette: EMOTION_PALETTES.anxiety,
    description: '불규칙하게 떨리는 파선, 예측할 수 없이 뒤엉킨 선들과 차가운 긴장감'
  },
  {
    key: 'chaos',
    koreanName: '혼란',
    englishName: 'Chaos',
    emoji: '💥',
    category: '긴장/격정',
    colorPalette: EMOTION_PALETTES.chaos,
    description: '서로 다른 방향으로 엇갈리는 수많은 파편들과 통제되지 않은 강렬한 원색들'
  }
];

export const PRINCIPLES: import('../types').PrincipleInfo[] = [
  {
    key: 'balance_sym',
    koreanName: '대칭 균형',
    englishName: 'Symmetrical Balance',
    icon: '⚖️',
    description: '중앙 축을 기준으로 좌우/상하 대칭을 이루어 정적인 안정감을 부여합니다.'
  },
  {
    key: 'balance_asym',
    koreanName: '비대칭 균형',
    englishName: 'Asymmetrical Balance',
    icon: '🎯',
    description: '형태와 색채의 시각적 무게를 조율하여 역동적이면서도 균형 잡힌 구도를 만듭니다.'
  },
  {
    key: 'rhythm',
    koreanName: '리듬 / 율동',
    englishName: 'Rhythm & Movement',
    icon: '🌊',
    description: '유사한 형태를 일정한 파동이나 점이(Gradation) 규칙으로 배열하여 리듬감을 형성합니다.'
  },
  {
    key: 'emphasis',
    koreanName: '강조 / 초점',
    englishName: 'Emphasis & Focal Point',
    icon: '🔍',
    description: '황금비 위치의 핵심 요소를 크게 확대하고 대비를 주어 시선을 집중시킵니다.'
  },
  {
    key: 'contrast',
    koreanName: '대비',
    englishName: 'Contrast',
    icon: '🌓',
    description: '보색, 직선과 곡선, 크기의 극적인 차이를 주어 강렬한 시각적 효과를 만듭니다.'
  },
  {
    key: 'unity',
    koreanName: '통일',
    englishName: 'Unity',
    icon: '🔗',
    description: '색조(Tone)와 형태적 특성을 조화롭게 정돈하여 화면 전체에 일체감을 줍니다.'
  },
  {
    key: 'variety',
    koreanName: '변화',
    englishName: 'Variety',
    icon: '🎨',
    description: '크기, 회전, 투명도에 다채로운 변주를 주어 단조로움을 탈피합니다.'
  },
  {
    key: 'movement',
    koreanName: '동세',
    englishName: 'Dynamic Movement',
    icon: '💨',
    description: '대각선 방향의 흐름과 속도감을 부여하여 생동감 넘치는 운동감을 표현합니다.'
  }
];
