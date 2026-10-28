export type VowelCategory = 'a' | 'e' | 'i' | 'o' | 'u';

export interface PictureOption {
  id: string;
  word: string;
  emoji: string;
  label: string;
  svgHint?: string;
}

export interface CVCWord {
  id: string;
  word: string;
  onset: string;
  vowel: VowelCategory;
  rime: string;
  onsetIPA: string;
  vowelIPA: string;
  rimeIPA: string;
  fullIPA: string;
  audioPronunciationText: string;
  onsetAudioHint: string;
  vowelAudioHint: string;
  rimeAudioHint: string;
  clueText: string;
  meaning: string;
  sentence: string;
  correctPicture: PictureOption;
  distractors: PictureOption[];
}

export interface CircusTent {
  id: VowelCategory;
  name: string;
  vowel: VowelCategory;
  ipa: string;
  subTitle: string;
  themeTitle: string;
  imagePath: string;
  tentColor: string;
  stripeColor: string;
  accentBg: string;
  accentBorder: string;
  description: string;
  mouthGuide: string;
  words: CVCWord[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  totalQuestions: number;
  timeSeconds: number;
  date: string;
  stars: number;
  rankBadge?: string;
}

export interface LearnerProgress {
  starsByWord: Record<string, number>; // wordId -> stars (0-3)
  completedWords: string[];
  tickets: number;
  unlockedTrophies: string[];
}

