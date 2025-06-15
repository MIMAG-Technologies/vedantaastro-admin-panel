"use client";
import { useLoading } from "@/context/loadingContext";
import { Language } from "@/types/filters";
import { createLanguageFilter, deleteLanguageFilter, getLanguageFilter, updateLanguageFilter } from "@/utils/filter";
import { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import { toast } from "react-hot-toast";

export default function Languages() {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newLanguageName, setNewLanguageName] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
    const { setLoading } = useLoading();

    const fetchLanguages = async () => {
        setLoading(true);
        const fetchedLanguages = await getLanguageFilter();
        setLanguages(fetchedLanguages);
        setLoading(false);
    };

    useEffect(() => {
        fetchLanguages();
    }, []);

    const handleCreateLanguage = async () => {
        if (!newLanguageName.trim()) {
            toast.error("Language name cannot be empty");
            return;
        }

        setLoading(true);
        const success = await createLanguageFilter({
            id: 0, // ID will be assigned by the server
            language_name: newLanguageName.trim()
        });

        if (success) {
            toast.success("Language created successfully");
            setNewLanguageName("");
            setIsCreateModalOpen(false);
            fetchLanguages();
        } else {
            toast.error("Failed to create language");
        }
        setLoading(false);
    };

    const handleUpdateLanguage = async () => {
        if (!selectedLanguage || !newLanguageName.trim()) {
            toast.error("Language name cannot be empty");
            return;
        }

        setLoading(true);
        const success = await updateLanguageFilter(
            selectedLanguage.id,
            { ...selectedLanguage, language_name: newLanguageName.trim() }
        );

        if (success) {
            toast.success("Language updated successfully");
            setNewLanguageName("");
            setIsUpdateModalOpen(false);
            setSelectedLanguage(null);
            fetchLanguages();
        } else {
            toast.error("Failed to update language");
        }
        setLoading(false);
    };

    const handleDeleteLanguage = async () => {
        if (!selectedLanguage) return;

        setLoading(true);
        const success = await deleteLanguageFilter(selectedLanguage.id);

        if (success) {
            toast.success("Language deleted successfully");
            setIsDeleteModalOpen(false);
            setSelectedLanguage(null);
            fetchLanguages();
        } else {
            toast.error("Failed to delete language");
        }
        setLoading(false);
    };

    const openUpdateModal = (language: Language) => {
        setSelectedLanguage(language);
        setNewLanguageName(language.language_name);
        setIsUpdateModalOpen(true);
    };

    const openDeleteModal = (language: Language) => {
        setSelectedLanguage(language);
        setIsDeleteModalOpen(true);
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Language Management</h1>
                <button
                    onClick={() => {
                        setNewLanguageName("");
                        setIsCreateModalOpen(true);
                    }}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                >
                    <FiPlus /> Add Language
                </button>
            </div>

            <div className="bg-white shadow-md rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Language Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {languages.length > 0 ? (
                            languages.map((language) => (
                                <tr key={language.id}>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {language.language_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => openUpdateModal(language)}
                                                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md"
                                                title="Edit"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <FiEdit size={18} />
                                                    <span>Edit</span>
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(language)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                                                title="Delete"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <FiTrash2 size={18} />
                                                    <span>Delete</span>
                                                </span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No languages found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">Add New Language</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Language Name
                            </label>
                            <input
                                type="text"
                                value={newLanguageName}
                                onChange={(e) => setNewLanguageName(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Enter language name"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateLanguage}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Modal */}
            {isUpdateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">Update Language</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Language Name
                            </label>
                            <input
                                type="text"
                                value={newLanguageName}
                                onChange={(e) => setNewLanguageName(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Enter language name"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsUpdateModalOpen(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateLanguage}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
                        <p className="mb-6">
                            Are you sure you want to delete the language "{selectedLanguage?.language_name}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteLanguage}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}