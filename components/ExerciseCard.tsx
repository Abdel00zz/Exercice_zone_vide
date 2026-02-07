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
    <div 
      className={`question-list ${level > 0 ? 'question-list-sub' : 'question-list-main'}`}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: level > 0 ? '0.5rem' : '1rem',
        paddingLeft: level > 0 ? '1.2rem' : '0',
      }}
    >
      {questions.map((q, index) => {
        const currentPath = [...path, index];
        return (
          <div key={index} className="question-block">
            {/* 
                MÉCANISME D'ALIGNEMENT INTELLIGENT 
                Utilisation de Grid pour un alignement robuste badge/texte.
                Le margin-top du badge est calibré pour s'aligner sur la ligne de base du texte MathJax.
            */}
            <div 
              className={`question-row question-row-level-${level}`}
              style={{ 
                display: 'grid',
                gridTemplateColumns: 'min-content 1fr',
                gap: '0.75rem',
                alignItems: 'start', // Important : alignement au début pour gérer le texte multilingue
              }}
            >
              {/* Badge */}
              <span 
                className={`question-number-badge question-badge-level-${level}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontFamily: '"Fira Sans", sans-serif',
                  lineHeight: 1, // Line-height strict pour éviter les décalages internes
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact' as any,
                  // Styles spécifiques au niveau
                  ...(level === 0
                    ? {
                        width: '1.6em',
                        height: '1.6em',
                        fontSize: '0.85rem',
                        borderRadius: '6px',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        border: '1px solid #bfdbfe',
                        marginTop: '0.1em', // Calibrage fin pour niveau 0
                      }
                    : {
                        width: '1.4em',
                        height: '1.4em',
                        fontSize: '0.8rem',
                        borderRadius: '50%',
                        backgroundColor: '#334155',
                        color: '#ffffff',
                        border: 'none',
                        marginTop: '0.2em', // Calibrage fin pour niveau 1 (lettres) - légèrement plus bas pour s'aligner visuellement
                      }
                  ),
                }}
              >
                {getNumbering(index, level)}
              </span>

              {/* Contenu de la question */}
              <div 
                className="question-content"
                style={{ 
                  minWidth: 0, 
                  margin: 0, 
                  padding: 0,
                  paddingTop: '0.1em' // Micro-ajustement pour le texte
                }}
              >
                <div className="question-text-wrapper" style={{ margin: 0, padding: 0 }}>
                  <MathText text={q.text} />
                </div>
              </div>
            </div>
            
            {q.subquestions && q.subquestions.length > 0 ? (
              <div className="subquestions-container" style={{ marginTop: '0.5rem' }}>
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
    <div className="exercise-card bg-white text-black p-6 md:p-8 rounded-xl shadow-sm mb-8 print:shadow-none print:rounded-none print:bg-transparent print:text-black print:p-0 print:mb-4 border border-slate-100 print:border-none">
      <h2 className="exercise-title text-xl font-bold font-display text-slate-800 print:text-black flex items-center gap-5 mb-6 print:mb-3">
        <span 
          className="exercise-badge font-bold font-sans uppercase tracking-wider shadow-sm"
          style={{
            backgroundColor: '#0f172a', // Slate 900
            color: '#ffffff',
            fontSize: '0.7rem', // Texte légèrement plus petit
            padding: '0.25rem 0.5rem', // Padding réduit (serré)
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            letterSpacing: '0.08em',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact' as any,
            lineHeight: 1,
          }}
        >
          Exercice {exerciseNumber}
        </span>
        <span className="leading-tight pt-0.5">{exercise.title}</span>
      </h2>
      
      {exercise.statement && (
        <div className="exercise-statement prose prose-lg max-w-none text-black print:text-black mb-6 pl-1">
            <p className="text-black print:text-black leading-relaxed"><MathText text={exercise.statement} /></p>
        </div>
      )}

      {(exercise.statementAnswerHeight !== undefined || (exercise.questions && exercise.questions.length === 0)) && (
         <AnswerSpace 
            height={exercise.statementAnswerHeight || answerSpaceMinHeight}
            onHeightChange={(newHeight) => onExerciseUpdate(exercise.id, { statementAnswerHeight: newHeight })}
          />
      )}

      {exercise.questions && exercise.questions.length > 0 && (
        <div className="mt-6 exercise-questions-wrapper print:mt-4">
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