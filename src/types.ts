export type BlockId = string;

export interface PortfolioBlock {
  id: BlockId;
  title: string;
  subtitle: string;
  image: string;
  isActive: boolean;
  colorTheme: string; // e.g., 'teal', 'violet', 'emerald', 'amber'
  badge?: string;
  customConfig?: Record<string, unknown>;
  isCourse?: boolean;
}

export interface QuoteRequest {
  services: string[];
  name: string;
  email: string;
  budget: string;
  message: string;
}

export interface DirectMessage {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  timestamp: string;
}

export interface CustomLesson {
  id: string;
  title: string;
  type: 'video' | 'svg' | 'practice';
  contentUrl: string; // File base64 or URL
}

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export interface CustomModule {
  id: string;
  titleRu: string;
  titleEn: string;
  type?: 'theory' | 'practice' | 'test';
  mediaType?: 'video' | 'svg' | 'image' | 'text';
  mediaData?: string;
  mediaText?: string;
  askCuratorEnabled?: boolean;
  lessons: CustomLesson[];
  testQuestions?: TestQuestion[];
}

export interface PracticalSubmission {
  id: string;
  studentId: string;
  studentName: string;
  courseTitle: string;
  moduleTitle: string;
  link?: string;
  comment?: string;
  testScore?: number;
  testTotal?: number;
  type?: 'practice' | 'test';
  timestamp: string;
}
