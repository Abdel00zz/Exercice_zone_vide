import React from 'react';
import { ArrowLeft, Printer, Cog } from 'lucide-react';

interface WorksheetHeaderProps {
  worksheetName: string;
  onBack: () => void;
  onOpenSettings: () => void;
}

const WorksheetHeader: React.FC<WorksheetHeaderProps> = ({ worksheetName, onBack, onOpenSettings }) => {
  
  const handlePrint = () => {
    window.print();
  };

  return (
  <header className="bg-white/80 backdrop-blur-lg shadow-sm p-4 sticky top-0 z-10 no-print print:hidden print-hidden">
      <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 font-bold py-2 px-3 rounded-lg transition duration-300 ease-in-out"
            aria-label="Retour au dashboard"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold font-display text-gray-800 truncate" title={worksheetName}>
            {worksheetName}
          </h1>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onOpenSettings}
            className="p-2 text-gray-600 hover:text-indigo-600 rounded-full hover:bg-indigo-100 transition"
            aria-label="Ouvrir les paramètres"
            title="Paramètres"
          >
            <Cog className="h-6 w-6" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 text-gray-600 hover:text-indigo-600 rounded-full hover:bg-indigo-100 transition"
            aria-label="Imprimer la fiche"
            title="Imprimer"
          >
            <Printer className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default WorksheetHeader;