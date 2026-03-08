import React, { useState } from 'react';
import type { Exercise, QuestionPart, ImageConfig } from '../types';
import MathText from './MathText';
import AnswerSpace from './AnswerSpace';
import ImageModal from './ImageModal';
import { Image as ImageIcon } from 'lucide-react';

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
      return `${String.fromCharCode(97 + index)}.`;
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
  const [activeImageModal, setActiveImageModal] = useState<number | null>(null);

  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div 
      className={`question-list ${level > 0 ? 'question-list-sub' : 'question-list-main'}`}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: level > 0 ? '0.75rem' : '1.5rem',
        paddingLeft: level > 0 ? '1rem' : '0',
      }}
    >
      {questions.map((q, index) => {
        const currentPath = [...path, index];
        return (
          <div key={index} className="question-block group/question relative">
            {/* 
                MÉCANISME D'ALIGNEMENT INTELLIGENT 
            */}
            <div 
              className={`question-row question-row-level-${level}`}
              style={{ 
                display: 'grid',
                gridTemplateColumns: 'min-content 1fr',
                gap: '1rem',
                alignItems: 'start',
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
                  fontFamily: '"IBM Plex Serif", serif',
                  lineHeight: 1,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact' as any,
                  // Styles spécifiques au niveau
                  ...(level === 0
                    ? {
                        width: '2.2rem',
                        height: '2.2rem',
                        fontSize: '1.1rem',
                        borderRadius: '2px',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        border: '1.5px solid #000000',
                        marginTop: '-0.2rem', // Alignement optique avec le texte
                        boxShadow: 'none'
                      }
                    : {
                        width: 'auto',
                        height: 'auto',
                        fontSize: '1.1rem',
                        borderRadius: '0',
                        backgroundColor: 'transparent',
                        color: '#000000',
                        border: 'none',
                        marginTop: '0.1rem',
                        fontStyle: 'normal',
                        fontWeight: 600,
                        paddingRight: '0.5rem'
                      }
                  ),
                }}
              >
                {getNumbering(index, level)}
              </span>

              {/* Contenu de la question */}
              <div 
                className="question-content relative"
                style={{ 
                  minWidth: 0, 
                  margin: 0, 
                  padding: 0,
                  paddingTop: '0.15em' 
                }}
              >
                <div className="question-text-wrapper pr-8" style={{ margin: 0, padding: 0 }}>
                  <MathText text={q.text} />
                </div>
                
                {/* Bouton d'ajout d'image (visible au survol) */}
                <button
                  onClick={() => setActiveImageModal(index)}
                  className="absolute top-0 right-0 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded opacity-0 group-hover/question:opacity-100 transition-opacity no-print"
                  title="Ajouter/Modifier une image"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Rendu de l'image si la question a des sous-questions (pas de zone de réponse) */}
            {q.subquestions && q.subquestions.length > 0 && q.image && q.image.src && (
              <div className={`mt-3 mb-2 flex ${
                q.image.placement === 'center' ? 'justify-center' : 
                q.image.placement === 'right' ? 'justify-end' : 'justify-start'
              }`}>
                <div className="flex flex-col items-center gap-1">
                  <img 
                    src={q.image.src} 
                    alt={q.image.caption || "Image de la question"} 
                    style={{ 
                      width: q.image.width ? `${q.image.width}px` : 'auto',
                      height: q.image.height ? `${q.image.height}px` : 'auto',
                      maxWidth: '100%',
                      objectFit: 'contain'
                    }}
                    className="print:max-w-full"
                  />
                  {q.image.caption && (
                    <span className="text-xs text-slate-600 font-medium italic print:text-black mt-1">
                      {q.image.caption}
                    </span>
                  )}
                </div>
              </div>
            )}

            {q.subquestions && q.subquestions.length > 0 ? (
              <div className="subquestions-container" style={{ marginTop: '0.75rem' }}>
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
                 image={q.image}
               />
            )}

            <ImageModal
              isOpen={activeImageModal === index}
              onClose={() => setActiveImageModal(null)}
              initialImage={q.image}
              onSave={(imageConfig) => {
                onQuestionUpdate(exerciseId, currentPath, { image: imageConfig });
                setActiveImageModal(null);
              }}
            />
          </div>
        )
      })}
    </div>
  );
};


const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, exerciseNumber, answerSpaceMinHeight, onQuestionUpdate, onExerciseUpdate }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  return (
    <div className="exercise-card bg-white text-black p-6 md:p-10 rounded-xl shadow-sm mb-10 print:shadow-none print:rounded-none print:bg-transparent print:text-black print:p-0 print:mb-6 border border-slate-100 print:border-none relative group/exercise">
      <h2 className="exercise-title text-xl font-bold font-display text-slate-900 print:text-black flex flex-col items-start gap-3 mb-8 print:mb-5 pt-2">
        <span 
          className="exercise-badge font-bold uppercase tracking-widest shadow-none"
          style={{
            backgroundColor: '#ffffff',
            color: '#000000',
            fontSize: '0.8rem',
            padding: '0.4rem 0.8rem',
            borderRadius: '2px',
            border: '1.5px solid #000000',
            display: 'inline-flex',
            alignItems: 'center',
            fontFamily: '"IBM Plex Sans", sans-serif',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact' as any,
            lineHeight: 1,
          }}
        >
          Exercice {exerciseNumber}
        </span>
        <span className="leading-tight text-2xl md:text-3xl mt-1">{exercise.title}</span>
      </h2>
      
      {/* Bouton d'ajout d'image pour l'énoncé (visible au survol) */}
      <button
        onClick={() => setIsImageModalOpen(true)}
        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded opacity-0 group-hover/exercise:opacity-100 transition-opacity no-print"
        title="Ajouter/Modifier une image pour l'énoncé"
      >
        <ImageIcon className="w-5 h-5" />
      </button>

      {exercise.statement && (
        <div className="exercise-statement prose prose-lg max-w-none text-black print:text-black mb-8 pl-1">
            <p className="text-black print:text-black leading-relaxed"><MathText text={exercise.statement} /></p>
        </div>
      )}

      {/* Rendu de l'image si l'exercice a des questions (pas de zone de réponse globale) */}
      {exercise.questions && exercise.questions.length > 0 && exercise.image && exercise.image.src && (
        <div className={`mt-3 mb-6 flex ${
          exercise.image.placement === 'center' ? 'justify-center' : 
          exercise.image.placement === 'right' ? 'justify-end' : 'justify-start'
        }`}>
          <div className="flex flex-col items-center gap-1">
            <img 
              src={exercise.image.src} 
              alt={exercise.image.caption || "Image de l'exercice"} 
              style={{ 
                width: exercise.image.width ? `${exercise.image.width}px` : 'auto',
                height: exercise.image.height ? `${exercise.image.height}px` : 'auto',
                maxWidth: '100%',
                objectFit: 'contain'
              }}
              className="print:max-w-full"
            />
            {exercise.image.caption && (
              <span className="text-xs text-slate-600 font-medium italic print:text-black mt-1">
                {exercise.image.caption}
              </span>
            )}
          </div>
        </div>
      )}

      {(exercise.statementAnswerHeight !== undefined || (exercise.questions && exercise.questions.length === 0)) && (
         <AnswerSpace 
            height={exercise.statementAnswerHeight || answerSpaceMinHeight}
            onHeightChange={(newHeight) => onExerciseUpdate(exercise.id, { statementAnswerHeight: newHeight })}
            image={exercise.image}
          />
      )}

      {exercise.questions && exercise.questions.length > 0 && (
        <div className="mt-8 exercise-questions-wrapper print:mt-6">
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

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        initialImage={exercise.image}
        onSave={(imageConfig) => {
          onExerciseUpdate(exercise.id, { image: imageConfig });
          setIsImageModalOpen(false);
        }}
      />
    </div>
  );
};

export default ExerciseCard;