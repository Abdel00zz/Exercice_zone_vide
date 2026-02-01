import React from 'react';
import type { Exercise, QuestionPart } from '../types';
import MathText from './MathText';
import AnswerSpace from './AnswerSpace';

interface ExerciseCardProps {
  exercise: Exercise;
  exerciseNumber: number;
  answerSpaceMinHeight?: number;
  onQuestionUpdate: (exerciseId: string, questionPath: (string | number)[], newProps: Partial<QuestionPart>) => void;
  onExerciseUpdate: (exerciseId: string, newProps: Partial<Exercise>) => void;
}

const getNumbering = (index: number, level: number): string => {
  switch (level) {
    case 0:
      return `${index + 1}`;
    case 1:
      return `${String.fromCharCode(97 + index)}`;
    default:
      return '-';
  }
};

interface QuestionListProps {
  questions: QuestionPart[];
  level: number;
  answerSpaceMinHeight?: number;
  onQuestionUpdate: (exerciseId: string, questionPath: (string | number)[], newProps: Partial<QuestionPart>) => void;
  exerciseId: string;
  path: (string | number)[];
}

const QuestionList: React.FC<QuestionListProps> = ({ questions, level = 0, answerSpaceMinHeight, onQuestionUpdate, exerciseId, path }) => {
  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${level > 0 ? 'pl-8' : ''}`}>
      {questions.map((q, index) => {
        const currentPath = [...path, index];
        return (
          <div key={index} className="question-block">
            <div className="flex items-start gap-4">
              <div className={`question-number-badge flex-shrink-0 w-6 h-6 flex items-center justify-center font-bold font-sans rounded text-xs print:border print:border-black print:bg-white print:text-black mt-1 ${level === 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-700 text-white'}`}>
                {getNumbering(index, level)}
              </div>
              <div className="prose prose-lg max-w-none text-black print:text-black flex-1">
                <p className="!my-0 text-black print:text-black"><MathText text={q.text} /></p>
              </div>
            </div>
            
            {q.subquestions && q.subquestions.length > 0 ? (
              <div className="mt-4">
                <QuestionList 
                  questions={q.subquestions} 
                  level={level + 1} 
                  answerSpaceMinHeight={answerSpaceMinHeight}
                  onQuestionUpdate={onQuestionUpdate}
                  exerciseId={exerciseId}
                  path={[...currentPath, 'subquestions']}
                />
              </div>
            ) : (
               <AnswerSpace 
                 height={q.answerHeight || answerSpaceMinHeight}
                 onHeightChange={(newHeight) => onQuestionUpdate(exerciseId, currentPath, { answerHeight: newHeight })}
               />
            )}
          </div>
        )
      })}
    </div>
  );
};


const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, exerciseNumber, answerSpaceMinHeight, onQuestionUpdate, onExerciseUpdate }) => {
  return (
    <div className="exercise-card bg-white text-black p-6 md:p-8 rounded-xl shadow-sm mb-8 print:shadow-none print:rounded-none print:bg-transparent print:text-black print:p-0">
      <h2 className="text-xl font-bold font-display text-slate-800 print:text-black flex items-center gap-4 mb-6">
        <span className="exercise-badge bg-black text-white text-sm font-bold font-sans uppercase px-3 py-1.5 rounded tracking-wider">
          Exercice {exerciseNumber}
        </span>
        <span className="print:ml-2">{exercise.title}</span>
      </h2>
      
      {exercise.statement && (
        <div className="exercise-statement prose prose-lg max-w-none text-black print:text-black mb-6">
            <p className="text-black print:text-black"><MathText text={exercise.statement} /></p>
        </div>
      )}

      {/* Zone de réponse globale sous l'énoncé */}
      {(exercise.statementAnswerHeight !== undefined || (exercise.questions && exercise.questions.length === 0)) && (
         <AnswerSpace 
            height={exercise.statementAnswerHeight || answerSpaceMinHeight}
            onHeightChange={(newHeight) => onExerciseUpdate(exercise.id, { statementAnswerHeight: newHeight })}
          />
      )}

      {exercise.questions && exercise.questions.length > 0 && (
        <div className="mt-6 exercise-questions-wrapper">
          <QuestionList 
            questions={exercise.questions} 
            level={0} 
            answerSpaceMinHeight={answerSpaceMinHeight}
            onQuestionUpdate={onQuestionUpdate}
            exerciseId={exercise.id}
            path={['questions']}
          />
        </div>
      )}
    </div>
  );
};

export default ExerciseCard;