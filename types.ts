export interface QuestionPart {
  text: string;
  subquestions?: QuestionPart[];
  answerHeight?: number;
}

export interface Exercise {
  id: string;
  title: string;
  statement: string;
  questions: QuestionPart[];
  statementAnswerHeight?: number;
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