import React, { useState, useRef, useEffect } from 'react';
import type { Worksheet, WorksheetContent } from '../types';
import { GripVertical, Trash2, X, UploadCloud, ImageOff } from 'lucide-react';

const CLASS_OPTIONS = [
	'Tronc Commun Scientifique',
	"1ère Bac Sciences Expérimentales",
	"1ère Bac Sciences Mathématiques",
	"2ème Bac Sciences Expérimentales",
	"2ème Bac Sciences Mathématiques",
];

const ACCEPTED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];
const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024; // 2 Mo

const computeDefaultSchoolYear = (): string => {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth(); // 0-11
	const startYear = month >= 7 ? year : year - 1;
	return `${startYear}-${startYear + 1}`;
};

interface SettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	worksheet: Worksheet;
	onSave: (updatedContent: WorksheetContent) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, worksheet, onSave }) => {
	const [editableContent, setEditableContent] = useState<WorksheetContent>(JSON.parse(JSON.stringify(worksheet.content)));
	const [logoError, setLogoError] = useState<string | null>(null);
	const [isLogoDragOver, setIsLogoDragOver] = useState(false);
	const draggedItem = useRef<number | null>(null);
	const draggedOverItem = useRef<number | null>(null);
	const logoInputRef = useRef<HTMLInputElement>(null);

		useEffect(() => {
			if (!isOpen) {
				return;
			}
			const cloned: WorksheetContent = JSON.parse(JSON.stringify(worksheet.content));
			const defaultYear = computeDefaultSchoolYear();
			const settings = { ...(cloned.settings ?? {}) };
			if (!settings.schoolYear) {
				settings.schoolYear = defaultYear;
			}
			cloned.settings = settings;
			setEditableContent(cloned);
			setLogoError(null);
			setIsLogoDragOver(false);
		}, [worksheet, isOpen]);

	if (!isOpen) {
		return null;
	}

	const handleClassChange = (value: string) => {
		setEditableContent(prev => ({
			...prev,
			settings: {
				...prev.settings,
				className: value || undefined,
			},
		}));
	};

		const handleSchoolYearChange = (value: string) => {
			const normalized = value.trim();
			const resolvedValue = normalized === '' ? computeDefaultSchoolYear() : value;
			setEditableContent(prev => ({
				...prev,
				settings: {
					...prev.settings,
					schoolYear: resolvedValue,
				},
			}));
	};

	const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newHeight = parseInt(e.target.value, 10);
		setEditableContent(prev => ({
			...prev,
			settings: { ...prev.settings, answerSpaceMinHeight: newHeight },
		}));
	};

	const handleDeleteExercise = (index: number) => {
		if (window.confirm("Êtes-vous sûr de vouloir supprimer cet exercice ? Cette action est irréversible.")) {
			const newExercises = [...editableContent.exercises];
			newExercises.splice(index, 1);
			setEditableContent(prev => ({ ...prev, exercises: newExercises }));
		}
	};

	const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
		draggedItem.current = index;
		e.dataTransfer.effectAllowed = 'move';
	};

	const handleDragEnter = (_e: React.DragEvent<HTMLDivElement>, index: number) => {
		draggedOverItem.current = index;
	};

	const handleDragEnd = () => {
		draggedItem.current = null;
		draggedOverItem.current = null;
	};

	const handleDrop = () => {
		if (draggedItem.current !== null && draggedOverItem.current !== null && draggedItem.current !== draggedOverItem.current) {
			const newExercises = [...editableContent.exercises];
			const item = newExercises.splice(draggedItem.current, 1)[0];
			newExercises.splice(draggedOverItem.current, 0, item);
			setEditableContent(prev => ({ ...prev, exercises: newExercises }));
		}
		handleDragEnd();
	};

	const handleLogoFile = (file: File) => {
		if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
			setLogoError('Formats acceptés : PNG, JPG ou SVG.');
			return;
		}
		if (file.size > MAX_LOGO_SIZE_BYTES) {
			setLogoError('Le fichier dépasse la taille maximale de 2 Mo.');
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result;
			if (typeof result === 'string') {
				setEditableContent(prev => ({
					...prev,
					settings: {
						...prev.settings,
						logoDataUrl: result,
					},
				}));
				setLogoError(null);
			} else {
				setLogoError('Impossible de lire ce fichier.');
			}
		};
		reader.onerror = () => {
			setLogoError('Erreur lors de la lecture du fichier.');
		};
		reader.readAsDataURL(file);
	};

	const handleLogoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleLogoFile(file);
		}
		e.target.value = '';
	};

	const handleLogoDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsLogoDragOver(false);
		const file = e.dataTransfer.files && e.dataTransfer.files[0];
		if (file) {
			handleLogoFile(file);
		}
	};

	const handleLogoDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		if (!isLogoDragOver) {
			setIsLogoDragOver(true);
		}
	};

	const handleLogoDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		if (isLogoDragOver) {
			setIsLogoDragOver(false);
		}
	};

	const handleRemoveLogo = () => {
		setEditableContent(prev => ({
			...prev,
			settings: {
				...prev.settings,
				logoDataUrl: undefined,
			},
		}));
		setLogoError(null);
	};

	const handleSave = () => {
		const cleanedSettings = editableContent.settings ? { ...editableContent.settings } : {};
		if (!cleanedSettings.className) delete cleanedSettings.className;
		if (!cleanedSettings.schoolYear) delete cleanedSettings.schoolYear;
		if (!cleanedSettings.logoDataUrl) delete cleanedSettings.logoDataUrl;
		if (cleanedSettings.answerSpaceMinHeight === undefined) delete cleanedSettings.answerSpaceMinHeight;

		const finalSettings = Object.keys(cleanedSettings).length > 0 ? cleanedSettings : undefined;

		const contentToSave: WorksheetContent = {
			...editableContent,
			settings: finalSettings,
		};

		onSave(contentToSave);
	};

	const currentSettings = editableContent.settings ?? {};
	const selectedClass = currentSettings.className ?? '';
		const selectedSchoolYear = currentSettings.schoolYear ?? computeDefaultSchoolYear();
	const logoPreview = currentSettings.logoDataUrl;

	return (
		<div
			className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex justify-center items-center p-4"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
		>
			<div
				className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col"
				onClick={e => e.stopPropagation()}
			>
				<header className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
					<h2 className="text-lg font-bold font-display text-slate-800">Parametres</h2>
					<button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-100 transition" aria-label="Fermer">
						<X className="h-5 w-5 text-slate-500" />
					</button>
				</header>

			<main className="p-6 overflow-y-auto text-gray-900">
					<input
						ref={logoInputRef}
						type="file"
						accept={ACCEPTED_LOGO_TYPES.join(',')}
						className="hidden"
						onChange={handleLogoInputChange}
					/>
					<div className="space-y-10">
						<section className="space-y-4">
											<div>
												<h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
												<p className="text-sm text-gray-900">Ces informations s'afficheront automatiquement en haut de votre fiche imprimée.</p>
							</div>
							<div className="grid gap-6 md:grid-cols-2">
								<div>
									  <label htmlFor="class-select" className="block text-sm font-medium text-gray-900 mb-2">Classe</label>
									<select
										id="class-select"
										value={selectedClass}
										onChange={(e) => handleClassChange(e.target.value)}
										className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
									>
										<option value="">— Sélectionner —</option>
										{CLASS_OPTIONS.map(option => (
											<option key={option} value={option}>{option}</option>
										))}
									</select>
								</div>
								<div>
									  <label htmlFor="school-year" className="block text-sm font-medium text-gray-900 mb-2">Année scolaire</label>
									<input
										id="school-year"
										type="text"
										placeholder="2025-2026"
										value={selectedSchoolYear}
										onChange={(e) => handleSchoolYearChange(e.target.value)}
										className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
									/>
								</div>
							</div>
						</section>

						<section className="space-y-4">
							<div>
								<h3 className="text-lg font-semibold text-gray-900">Identité visuelle</h3>
								<p className="text-sm text-gray-900">Déposez un logo (PNG, JPG ou SVG) ou cliquez pour le sélectionner. Taille maximale : 2 Mo.</p>
							</div>
							<div
								className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${isLogoDragOver ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50'}`}
								onClick={() => logoInputRef.current?.click()}
								onDrop={handleLogoDrop}
								onDragOver={handleLogoDragOver}
								onDragLeave={handleLogoDragLeave}
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										logoInputRef.current?.click();
									}
								}}
								aria-label="Zone de dépôt pour le logo"
							>
								<UploadCloud className="h-8 w-8" />
								<div>
									<p className="text-sm font-semibold">Glissez-déposez votre logo ici</p>
									  <p className="text-xs text-gray-900">ou cliquez pour parcourir vos fichiers</p>
								</div>
								{logoPreview && (
									<div className="mt-4 w-full max-w-xs rounded-md border border-gray-200 bg-white p-3">
										<img src={logoPreview} alt="Logo téléchargé" className="mx-auto max-h-32 w-full object-contain" />
									</div>
								)}
							</div>
							{logoError && <p className="text-sm text-red-600">{logoError}</p>}
							{logoPreview && (
								<button
									type="button"
									onClick={handleRemoveLogo}
									className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition"
								>
									<ImageOff className="h-4 w-4" />
									Retirer le logo
								</button>
							)}
						</section>

						<section className="space-y-4">
											<div>
												<h3 className="text-lg font-semibold text-gray-900">Zones de réponse</h3>
												<p className="text-sm text-gray-900">Définissez la hauteur par défaut des zones de réponse. Vous pourrez ensuite ajuster chaque question individuellement.</p>
							</div>
							<div className="flex items-center gap-4">
								<input
									id="answer-height"
									type="range"
									min="50"
									max="750"
									step="10"
									value={editableContent.settings?.answerSpaceMinHeight || 120}
									onChange={handleHeightChange}
									className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
								/>
								<label htmlFor="answer-height" className="font-sans font-semibold text-slate-600 w-16 text-center">
									{editableContent.settings?.answerSpaceMinHeight || 120}px
								</label>
							</div>
						</section>

						<section className="space-y-4">
											<div>
												<h3 className="text-lg font-semibold text-gray-900">Organisation des exercices</h3>
												<p className="text-sm text-gray-900">Glissez-déposez pour réordonner vos exercices ou supprimez ceux qui ne sont plus nécessaires.</p>
							</div>
							<div className="space-y-2">
								{editableContent.exercises.map((ex, index) => (
									<div
										key={ex.id || index}
										className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
										draggable
										onDragStart={(e) => handleDragStart(e, index)}
										onDragEnter={(e) => handleDragEnter(e, index)}
										onDragOver={(e) => e.preventDefault()}
										onDrop={handleDrop}
										onDragEnd={handleDragEnd}
									>
										<div className="flex items-center gap-3">
											<GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
											<span className="font-medium text-gray-800 truncate">{index + 1}. {ex.title}</span>
										</div>
										<button
											onClick={() => handleDeleteExercise(index)}
											  className="p-2 text-gray-800 hover:text-red-600 rounded-full hover:bg-red-100 transition"
											aria-label="Supprimer l'exercice"
										>
											<Trash2 className="h-5 w-5" />
										</button>
									</div>
								))}
							</div>
						</section>
					</div>
				</main>

			<footer className="flex justify-end items-center gap-2.5 px-6 py-4 border-t border-slate-200 bg-slate-50/50 rounded-b-xl">
					<button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 font-medium transition">
						Annuler
					</button>
					<button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-slate-900 rounded-lg hover:bg-slate-800 font-medium transition">
						Enregistrer
					</button>
				</footer>
			</div>
		</div>
	);
};

export default SettingsModal;

