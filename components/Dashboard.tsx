import React, { useRef, useState, useMemo } from 'react';
import type { Worksheet, WorksheetContent } from '../types';
import { FileUp, Trash2, Pencil, Search, Code } from 'lucide-react';
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
    
    // États pour la modale JSON
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
                    throw new Error('Le fichier ne peut pas être lu.');
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
            throw new Error('Le JSON est invalide. Il doit contenir une clé "chapter" (texte) et une clé "exercises" (tableau).');
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

    // Gestion du clic pour ouvrir l'éditeur JSON
    const handleOpenCreateJson = () => {
        setJsonMode('create');
        setEditingWorksheet(null);
        setIsJsonModalOpen(true);
    };

    // Gestion du double-clic pour éditer une fiche existante
    const handleEditJson = (worksheet: Worksheet) => {
        setJsonMode('edit');
        setEditingWorksheet(worksheet);
        setIsJsonModalOpen(true);
    };

    // Gestion de la sauvegarde depuis la modale
    const handleJsonSave = (content: WorksheetContent) => {
        if (jsonMode === 'create') {
            processImport(content);
        } else if (jsonMode === 'edit' && editingWorksheet) {
            onUpdateWorksheet(editingWorksheet.id, content);
            // On met aussi à jour le nom si le chapitre a changé, pour cohérence
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
        <div className="container mx-auto px-4 py-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="w-full md:w-auto">
                    <h1 className="text-4xl font-bold font-display text-slate-800">Mes Fiches d'Exercices</h1>
                    <p className="text-gray-500 mt-2">Gérez, modifiez et créez vos fiches ici.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0 min-w-[200px]">
                        <Search className="h-5 w-5 text-gray-400 absolute top-1/2 left-3 transform -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Rechercher une fiche..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-64 pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                            aria-label="Rechercher une fiche par nom"
                        />
                    </div>
                    
                    <button
                        onClick={handleOpenCreateJson}
                        className="flex items-center bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-lg transition duration-300 ease-in-out shrink-0 shadow-sm"
                    >
                        <Code className="h-5 w-5 mr-2" />
                        <span>Éditeur JSON</span>
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
                        className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg cursor-pointer transition duration-300 ease-in-out shrink-0 shadow-sm"
                    >
                        <FileUp className="h-5 w-5 mr-2" />
                        <span>Charger un fichier</span>
                    </label>
                </div>
            </header>
            
            {filteredWorksheets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWorksheets.map((ws) => {
                        const classNameLabel = ws.content?.settings?.className?.trim() || '—';

                        return (
                            <div 
                                key={ws.id} 
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md hover:border-indigo-300 transition-all duration-300"
                                onDoubleClick={() => handleEditJson(ws)}
                                title="Double-cliquez pour éditer le JSON source"
                            >
                               <div>
                                {renamingId === ws.id ? (
                                    <form onSubmit={handleSaveRename}>
                                        <input 
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            onBlur={handleSaveRename}
                                            autoFocus
                                            className="text-xl font-bold font-display text-slate-800 w-full border-b-2 border-indigo-500 focus:outline-none"
                                        />
                                    </form>
                                ) : (
                                    <h2 
                                        className="text-xl font-bold font-display text-slate-800 cursor-pointer truncate"
                                        onClick={() => onSelectWorksheet(ws.id)}
                                    >
                                        {ws.name}
                                    </h2>
                                )}
                                <p className="text-sm text-gray-500 mt-2">
                                    Créé le: {new Date(ws.createdAt).toLocaleDateString('fr-FR')}
                                </p>
                                <p className="text-sm text-gray-700 mt-1 font-medium">
                                    Classe : <span className="text-gray-900">{classNameLabel}</span>
                                </p>
                               </div>
                               <div className="mt-6 flex justify-end items-center space-x-2">
                                   <button onClick={() => handleRename(ws)} className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-indigo-100 transition" aria-label="Renommer">
                                       <Pencil className="h-5 w-5" />
                                   </button>
                                   <button onClick={() => onDeleteWorksheet(ws.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 transition" aria-label="Supprimer">
                                       <Trash2 className="h-5 w-5" />
                                   </button>
                                   <button
                                       onClick={() => onSelectWorksheet(ws.id)}
                                       className="bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-800 transition text-sm"
                                   >
                                       Ouvrir
                                   </button>
                               </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-24 border-2 border-dashed border-gray-300 rounded-xl">
                    {searchQuery ? (
                        <>
                            <h2 className="text-2xl font-semibold text-gray-500">Aucune fiche ne correspond à votre recherche</h2>
                            <p className="text-gray-400 mt-2">Essayez avec d'autres mots-clés.</p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-semibold text-gray-500">Aucune fiche trouvée.</h2>
                            <p className="text-gray-400 mt-2">Importez votre premier fichier JSON pour commencer.</p>
                        </>
                    )}
                </div>
            )}

            <JSONEditorModal 
                isOpen={isJsonModalOpen}
                onClose={() => setIsJsonModalOpen(false)}
                onImport={handleJsonSave}
                initialValue={jsonMode === 'edit' && editingWorksheet ? editingWorksheet.content : undefined}
                confirmLabel={jsonMode === 'create' ? "Enregistrer" : "Appliquer la modification"}
            />
        </div>
    );
};

export default Dashboard;