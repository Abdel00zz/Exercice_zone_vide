import React, { useRef, useState, useMemo } from 'react';
import type { Worksheet, WorksheetContent } from '../types';
import { FileUp, Trash2, Pencil, Search, Code, Calendar, ChevronRight, FileText, Plus } from 'lucide-react';
import JSONEditorModal from './JSONEditorModal';

interface DashboardProps {
    worksheets: Worksheet[];
    onSelectWorksheet: (id: string) => void;
    onAddWorksheet: (worksheet: Worksheet) => void;
    onDeleteWorksheet: (id: string) => void;
    onRenameWorksheet: (id: string, newName: string) => void;
    onUpdateWorksheet: (id: string, content: WorksheetContent) => void;
    setImportError: (error: string | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    worksheets,
    onSelectWorksheet,
    onAddWorksheet,
    onDeleteWorksheet,
    onRenameWorksheet,
    onUpdateWorksheet,
    setImportError
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
    const [jsonMode, setJsonMode] = useState<'create' | 'edit'>('create');
    const [editingWorksheet, setEditingWorksheet] = useState<Worksheet | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImportError(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error('Le fichier ne peut pas etre lu.');
                }
                const jsonData = JSON.parse(text) as WorksheetContent;
                processImport(jsonData, file.name);
            } catch (error) {
                console.error("Erreur d'importation JSON:", error);
                setImportError(error instanceof Error ? error.message : 'Fichier JSON invalide.');
            }
        };
        reader.onerror = () => {
            setImportError('Erreur de lecture du fichier.');
        }
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const processImport = (jsonData: WorksheetContent, fallbackName: string = 'Nouvelle Fiche') => {
        if (!jsonData.chapter || typeof jsonData.chapter !== 'string' || !jsonData.exercises || !Array.isArray(jsonData.exercises)) {
            throw new Error('Le JSON est invalide. Il doit contenir une cle "chapter" (texte) et une cle "exercises" (tableau).');
        }
        
        const newWorksheet: Worksheet = {
            id: `ws_${Date.now()}`,
            name: jsonData.chapter || fallbackName.replace('.json', '') || 'Nouvelle Fiche',
            createdAt: new Date().toISOString(),
            content: jsonData,
        };
        onAddWorksheet(newWorksheet);
    };

    const handleRename = (worksheet: Worksheet) => {
        setRenamingId(worksheet.id);
        setNewName(worksheet.name);
    }

    const handleSaveRename = (e: React.FormEvent) => {
        e.preventDefault();
        if (renamingId && newName.trim()) {
            onRenameWorksheet(renamingId, newName.trim());
            setRenamingId(null);
            setNewName('');
        }
    }

    const handleOpenCreateJson = () => {
        setJsonMode('create');
        setEditingWorksheet(null);
        setIsJsonModalOpen(true);
    };

    const handleEditJson = (worksheet: Worksheet) => {
        setJsonMode('edit');
        setEditingWorksheet(worksheet);
        setIsJsonModalOpen(true);
    };

    const handleJsonSave = (content: WorksheetContent) => {
        if (jsonMode === 'create') {
            processImport(content);
        } else if (jsonMode === 'edit' && editingWorksheet) {
            onUpdateWorksheet(editingWorksheet.id, content);
            if (content.chapter && content.chapter !== editingWorksheet.name) {
                onRenameWorksheet(editingWorksheet.id, content.chapter);
            }
        }
    };

    const filteredWorksheets = useMemo(() => {
        if (!searchQuery) {
            return worksheets;
        }
        return worksheets.filter(ws => 
            ws.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [worksheets, searchQuery]);

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
            <div className="max-w-5xl mx-auto px-5 py-10 md:px-8">

            {/* ── Header ── */}
            <header className="mb-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-900 tracking-tight">Mes Fiches</h1>
                        <p className="text-slate-400 mt-1 text-sm">{worksheets.length} fiche{worksheets.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-grow sm:flex-grow-0">
                            <Search className="h-4 w-4 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-52 pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition placeholder:text-slate-400 outline-none"
                                aria-label="Rechercher une fiche par nom"
                            />
                        </div>
                        
                        <button
                            onClick={handleOpenCreateJson}
                            className="p-2 border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:border-slate-300 rounded-lg transition shrink-0"
                            title="Editeur JSON"
                            aria-label="Editeur JSON"
                        >
                            <Code className="h-4 w-4" />
                        </button>

                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileChange}
                            className="hidden"
                            ref={fileInputRef}
                            id="json-importer"
                        />
                        <label
                            htmlFor="json-importer"
                            className="flex items-center bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-3.5 rounded-lg cursor-pointer transition shrink-0 text-sm gap-1.5"
                        >
                            <FileUp className="h-4 w-4" />
                            <span>Importer</span>
                        </label>
                    </div>
                </div>
            </header>
            
            {/* ── Cards grid ── */}
            {filteredWorksheets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredWorksheets.map((ws) => {
                        const classNameLabel = ws.content?.settings?.className?.trim() || '';
                        const exerciseCount = ws.content?.exercises?.length || 0;

                        return (
                            <div 
                                key={ws.id} 
                                className="group bg-white rounded-lg border border-slate-200 hover:border-slate-300 flex flex-col transition-all duration-150 hover:shadow-md cursor-pointer"
                                onClick={() => onSelectWorksheet(ws.id)}
                                onDoubleClick={(e) => { e.stopPropagation(); handleEditJson(ws); }}
                                title="Cliquez pour ouvrir"
                            >
                               <div className="p-4 flex-1 flex flex-col">
                                   {/* Title + actions row */}
                                   <div className="flex items-start justify-between gap-2 mb-3">
                                       {renamingId === ws.id ? (
                                           <form onSubmit={handleSaveRename} onClick={(e) => e.stopPropagation()} className="flex-1">
                                               <input 
                                                   type="text"
                                                   value={newName}
                                                   onChange={(e) => setNewName(e.target.value)}
                                                   onBlur={handleSaveRename}
                                                   autoFocus
                                                   className="text-sm font-bold font-display text-slate-800 w-full border-b-2 border-slate-900 focus:outline-none bg-transparent pb-0.5"
                                               />
                                           </form>
                                       ) : (
                                           <h2 className="text-sm font-bold font-display text-slate-900 leading-snug line-clamp-2 flex-1">
                                               {ws.name}
                                           </h2>
                                       )}

                                       {/* Hover actions */}
                                       <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => e.stopPropagation()}>
                                           <button 
                                               onClick={() => handleRename(ws)} 
                                               className="p-1 text-slate-400 hover:text-slate-700 rounded transition" 
                                               aria-label="Renommer"
                                           >
                                               <Pencil className="h-3.5 w-3.5" />
                                           </button>
                                           <button 
                                               onClick={() => handleEditJson(ws)} 
                                               className="p-1 text-slate-400 hover:text-slate-700 rounded transition" 
                                               aria-label="Editer JSON"
                                           >
                                               <Code className="h-3.5 w-3.5" />
                                           </button>
                                           <button 
                                               onClick={() => onDeleteWorksheet(ws.id)} 
                                               className="p-1 text-slate-400 hover:text-red-600 rounded transition" 
                                               aria-label="Supprimer"
                                           >
                                               <Trash2 className="h-3.5 w-3.5" />
                                           </button>
                                       </div>
                                   </div>

                                   {/* Meta info */}
                                   <div className="mt-auto pt-2 flex items-center justify-between text-xs text-slate-400">
                                       <div className="flex items-center gap-3">
                                           <span className="flex items-center gap-1">
                                               <FileText className="h-3 w-3" />
                                               {exerciseCount} ex.
                                           </span>
                                           {classNameLabel && (
                                               <span className="truncate max-w-[120px]">{classNameLabel}</span>
                                           )}
                                       </div>
                                       <div className="flex items-center gap-1.5">
                                           <span className="flex items-center gap-1">
                                               <Calendar className="h-3 w-3" />
                                               {new Date(ws.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                           </span>
                                           <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                       </div>
                                   </div>
                               </div>
                            </div>
                        );
                    })}

                    {/* "New" card */}
                    <div 
                        onClick={handleOpenCreateJson}
                        className="group rounded-lg border-2 border-dashed border-slate-200 hover:border-slate-300 flex items-center justify-center cursor-pointer transition-all min-h-[100px] bg-white/50 hover:bg-white"
                    >
                        <div className="flex flex-col items-center gap-1.5 text-slate-400 group-hover:text-slate-600 transition-colors">
                            <Plus className="h-5 w-5" />
                            <span className="text-xs font-medium">Nouvelle fiche</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                    {searchQuery ? (
                        <>
                            <Search className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                            <h2 className="text-lg font-semibold text-slate-500">Aucun resultat</h2>
                            <p className="text-slate-400 mt-1 text-sm">Essayez avec d'autres mots-cles.</p>
                        </>
                    ) : (
                        <>
                            <FileText className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                            <h2 className="text-lg font-semibold text-slate-500">Aucune fiche</h2>
                            <p className="text-slate-400 mt-1 text-sm">Importez un fichier JSON pour commencer.</p>
                        </>
                    )}
                </div>
            )}

            <JSONEditorModal 
                isOpen={isJsonModalOpen}
                onClose={() => setIsJsonModalOpen(false)}
                onImport={handleJsonSave}
                initialValue={jsonMode === 'edit' && editingWorksheet ? editingWorksheet.content : undefined}
                confirmLabel={jsonMode === 'create' ? "Enregistrer" : "Appliquer"}
            />
            </div>
        </div>
    );
};

export default Dashboard;
