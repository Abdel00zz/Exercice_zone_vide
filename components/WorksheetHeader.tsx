import React from 'react';
import { ArrowLeft, Printer, Sliders } from 'lucide-react';
import { Button } from './ui/button';
import { printWorksheet } from '../lib/print';

interface WorksheetHeaderProps {
  worksheetName: string;
  onBack: () => void;
  onOpenSettings: () => void;
}

const WorksheetHeader: React.FC<WorksheetHeaderProps> = ({ worksheetName, onBack, onOpenSettings }) => {
  
  const handlePrint = () => {
    void printWorksheet(worksheetName);
  };

  return (
    <header className="bg-white border-b border-[#e0e0e0] px-6 py-4 sticky top-0 z-20 no-print print:hidden">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="shrink-0 text-[#525252] hover:text-[#0f62fe]"
            aria-label="Retour au dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-px h-6 bg-[#e0e0e0] shrink-0 mx-1" />
          <h1 className="text-base md:text-lg font-semibold font-display text-[#161616] truncate" title={worksheetName}>
            {worksheetName}
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={onOpenSettings}
            variant="outline"
            className="text-[#393939] hover:text-[#0f62fe] hover:border-[#0f62fe]"
            aria-label="Paramètres"
            title="Paramètres de la fiche"
          >
            <Sliders className="h-4 w-4" />
            <span className="hidden sm:inline">Paramètres</span>
          </Button>
          <Button
            onClick={handlePrint}
            aria-label="Imprimer la fiche"
            title="Imprimer (Ctrl+P)"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Imprimer</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default WorksheetHeader;