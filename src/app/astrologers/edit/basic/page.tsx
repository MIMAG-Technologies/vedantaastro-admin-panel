"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { FiArrowLeft, FiSave, FiPlus, FiX } from "react-icons/fi";
import { useLoading } from "@/context/loadingContext";
import {
    DetaileAstrologer,
    AstrolgerBasicDetailsArgs
} from "@/types/astrologer";
import { Language } from "@/types/filters";
import {
    getAstrologerDetail,
    updateAstrologerBasicDetails
} from "@/utils/astrologer";
import { getLanguageFilter } from "@/utils/filter";

function BasicDetailsEditContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const astrologerId = searchParams.get("id") || "";

    const { setLoading } = useLoading();
    const [astrologerData, setAstrologerData] = useState<DetaileAstrologer | null>(null);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');

    const [basicData, setBasicData] = useState<AstrolgerBasicDetailsArgs>({
        full_name: '',
        bio: '',
        experience_years: 0,
        gender: 'Male',
        date_of_birth: '',
        languages: []
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [astrologer, languageData] = await Promise.all([
                    getAstrologerDetail(Number(astrologerId)),
                    getLanguageFilter()
                ]);

                if (!astrologer) {
                    toast.error("Astrologer not found");
                    router.push("/astrologers");
                    return;
                }

                setAstrologerData(astrologer);
                setLanguages(languageData);

                setBasicData({
                    full_name: astrologer.full_name,
                    bio: astrologer.bio,
                    experience_years: astrologer.experience_years,
                    gender: astrologer.gender,
                    date_of_birth: astrologer.date_of_birth ? astrologer.date_of_birth.split('T')[0] : '',
                    languages: astrologer.languages
                });

            } catch (error) {
                toast.error("Failed to fetch astrologer data");
                router.push("/astrologers");
            } finally {
                setLoading(false);
            }
        };

        if (astrologerId) {
            fetchData();
        }
    }, [astrologerId, setLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!basicData.full_name.trim()) {
            toast.error("Full name is required");
            return;
        }

        if (!basicData.bio.trim()) {
            toast.error("Bio is required");
            return;
        }

        if (basicData.languages.length === 0) {
            toast.error("At least one language is required");
            return;
        }

        setLoading(true);
        try {
            // Convert date to ISO format for API
            const apiData: AstrolgerBasicDetailsArgs = {
                ...basicData,
                date_of_birth: basicData.date_of_birth ? `${basicData.date_of_birth}T00:00:00.000Z` : ''
            };

            const response = await updateAstrologerBasicDetails(Number(astrologerId), apiData);
            if (response.success) {
                toast.success(response.message);
                // Redirect back to astrologers list
                router.push('/astrologers');
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Failed to update basic details");
        } finally {
            setLoading(false);
        }
    };

    const addLanguage = () => {
        if (selectedLanguage && !basicData.languages.includes(selectedLanguage)) {
            setBasicData(prev => ({
                ...prev,
                languages: [...prev.languages, selectedLanguage]
            }));
            setSelectedLanguage('');
        }
    };

    const removeLanguage = (language: string) => {
        setBasicData(prev => ({
            ...prev,
            languages: prev.languages.filter(lang => lang !== language)
        }));
    };

    if (!astrologerData) return null;

    return (
        <div className="mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/astrologers')}
                        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Edit Basic Details</h1>
                        <p className="text-gray-600 mt-1">{astrologerData.full_name}</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl shadow-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            Personal Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={basicData.full_name}
                                    onChange={(e) => setBasicData(prev => ({ ...prev, full_name: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gender <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={basicData.gender}
                                    onChange={(e) => setBasicData(prev => ({ ...prev, gender: e.target.value as any }))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={basicData.date_of_birth}
                                    onChange={(e) => setBasicData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Experience (Years) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={basicData.experience_years}
                                    onChange={(e) => setBasicData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                                    min="0"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Years of experience"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            Biography
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bio <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={basicData.bio}
                                onChange={(e) => setBasicData(prev => ({ ...prev, bio: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                rows={6}
                                placeholder="Enter astrologer's biography and qualifications..."
                            />
                        </div>
                    </div>

                    {/* Languages Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            Languages
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Languages <span className="text-red-500">*</span>
                            </label>

                            <div className="flex space-x-3 mb-4">
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="">Select a language</option>
                                    {languages.map((lang) => (
                                        <option
                                            key={lang.id}
                                            value={lang.language_name}
                                            disabled={basicData.languages.includes(lang.language_name)}
                                        >
                                            {lang.language_name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={addLanguage}
                                    disabled={!selectedLanguage}
                                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                                >
                                    <FiPlus size={16} /> Add
                                </button>
                            </div>

                            {basicData.languages.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Languages:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {basicData.languages.map((lang) => (
                                            <div
                                                key={lang}
                                                className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-blue-200 transition-colors"
                                            >
                                                <span>{lang}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeLanguage(lang)}
                                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                                >
                                                    <FiX size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6 border-t border-gray-200">
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => router.push('/astrologers')}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <FiSave size={16} />
                                Save Basic Details
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function BasicDetailsEdit() {
    return (
        <Suspense fallback={
            <div className="mx-auto p-6">
                <div className="bg-white rounded-xl shadow-lg p-8 flex items-center justify-center h-64">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-gray-200 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-48 mb-2.5"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                </div>
            </div>
        }>
            <BasicDetailsEditContent />
        </Suspense>
    );
}