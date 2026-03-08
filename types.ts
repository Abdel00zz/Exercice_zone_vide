export interface ImageConfig {
  id: string;
  src: string; // Base64 or URL
  width?: number; // in pixels or percentage
  height?: number; // in pixels or percentage
  placement?: 'left' | 'center' | 'right';
  caption?: string;
}

export interface QuestionPart {
  text: string;
  subquestions?: QuestionPart[];
  answerHeight?: number;
  image?: ImageConfig;
}

export interface Exercise {
  id: string;
  title: string;
  statement: string;
  questions: QuestionPart[];
  statementAnswerHeight?: number;
  image?: ImageConfig;
}

export interface WorksheetContent {
  chapter: string;
  exercises: Exercise[];
  version?: string;
  settings?: {
    answerSpaceMinHeight?: number;
    className?: string;
    schoolYear?: string;
    logoDataUrl?: string;
  };
}

export interface Worksheet {
  id: string;
  name: string;
  createdAt: string;
  content: WorksheetContent;
}