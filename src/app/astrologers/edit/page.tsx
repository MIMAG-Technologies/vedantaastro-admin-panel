"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
    FiUser,
    FiCalendar,
    FiSettings,
    FiStar,
    FiArrowLeft,
    FiSave,
    FiPlus,
    FiX
} from "react-icons/fi";
import { useLoading } from "@/context/loadingContext";
import {
    DetaileAstrologer,
    AstrolgerBasicDetailsArgs,
    AstrologerScheduleArgs,
    AstrologerRatingArgs,
    AstrologerServiceArgs,
    ServiceList
} from "@/types/astrologer";
import { Language } from "@/types/filters";
import {
    getAstrologerDetail,
    updateAstrologerBasicDetails,
    updateAstrologerSchedule,
    updateAstrologerRating,
    updateAstrologerService,
    getServiceList
} from "@/utils/astrologer";
import { getLanguageFilter } from "@/utils/filter";

function AstrologerEditContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const astrologerId = searchParams.get("id") || "";
    const initialTab = searchParams.get("tab") as "basic" | "schedule" | "ratings" | "services" || "basic";

    const { setLoading } = useLoading();
    const [astrologerData, setAstrologerData] = useState<DetaileAstrologer | null>(null);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [serviceList, setServiceList] = useState<ServiceList>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [selectedService, setSelectedService] = useState<number | null>(null);

    // Form states
    const [basicData, setBasicData] = useState<AstrolgerBasicDetailsArgs>({
        full_name: '',
        bio: '',
        experience_years: 0,
        gender: 'Male',
        date_of_birth: '',
        languages: []
    });

    const [scheduleData, setScheduleData] = useState<AstrologerScheduleArgs>([]);

    const [ratingData, setRatingData] = useState<AstrologerRatingArgs>({
        total_reviews: 0,
        average_rating: 0
    });

    const [servicesData, setServicesData] = useState<AstrologerServiceArgs[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [astrologer, languageData, services] = await Promise.all([
                    getAstrologerDetail(Number(astrologerId)),
                    getLanguageFilter(),
                    getServiceList()
                ]);

                if (!astrologer) {
                    toast.error("Astrologer not found");
                    router.push("/astrologers");
                    return;
                }

                setAstrologerData(astrologer);
                setLanguages(languageData);
                setServiceList(services);

                // Initialize form data
                setBasicData({
                    full_name: astrologer.full_name,
                    bio: astrologer.bio,
                    experience_years: astrologer.experience_years,
                    gender: astrologer.gender,
                    date_of_birth: astrologer.date_of_birth ? astrologer.date_of_birth.split('T')[0] : '',
                    languages: astrologer.languages
                });

                setScheduleData(astrologer.astrologer_schedules.map(schedule => ({
                    day_of_week: schedule.day_of_week,
                    start_time: schedule.start_time,
                    end_time: schedule.end_time,
                    is_working_day: schedule.is_working_day
                })));

                setRatingData({
                    total_reviews: astrologer.astrologer_ratings.total_reviews,
                    average_rating: parseFloat(astrologer.astrologer_ratings.average_rating)
                });

                setServicesData(astrologer.astrologer_services.map(service => ({
                    id: service.id,
                    service_id: service.service_id,
                    modes: service.modes.map(mode => ({
                        mode: mode.mode,
                        price: parseFloat(mode.price),
                        is_active: mode.is_active
                    }))
                })));

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

    const handleBasicSubmit = async () => {
        setLoading(true);
        try {
            const response = await updateAstrologerBasicDetails(Number(astrologerId), basicData);
            if (response.success) {
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Failed to update basic details");
        } finally {
            setLoading(false);
        }
    };

    const handleScheduleSubmit = async () => {
        setLoading(true);
        try {
            const response = await updateAstrologerSchedule(Number(astrologerId), scheduleData);
            if (response.success) {
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Failed to update schedule");
        } finally {
            setLoading(false);
        }
    };

    const handleRatingSubmit = async () => {
        setLoading(true);
        try {
            const response = await updateAstrologerRating(Number(astrologerId), ratingData);
            if (response.success) {
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Failed to update rating");
        } finally {
            setLoading(false);
        }
    };

    const handleServiceSubmit = async (serviceData: AstrologerServiceArgs) => {
        setLoading(true);
        try {
            const response = await updateAstrologerService(Number(astrologerId), serviceData);
            if (response.success) {
                toast.success(response.message);
                // Refresh astrologer data
                const updatedAstrologer = await getAstrologerDetail(Number(astrologerId));
                if (updatedAstrologer) {
                    setServicesData(updatedAstrologer.astrologer_services.map(service => ({
                        id: service.id,
                        service_id: service.service_id,
                        modes: service.modes.map(mode => ({
                            mode: mode.mode,
                            price: parseFloat(mode.price),
                            is_active: mode.is_active
                        }))
                    })));
                }
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Failed to update service");
        } finally {
            setLoading(false);
        }
    };

    // Language management
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

    // Service management
    const addService = () => {
        if (selectedService && !servicesData.some(s => s.service_id === selectedService)) {
            const newService: AstrologerServiceArgs = {
                service_id: selectedService,
                modes: [
                    { mode: 'call', price: 0, is_active: false },
                    { mode: 'chat', price: 0, is_active: false },
                    { mode: 'video', price: 0, is_active: false },
                    { mode: 'offline', price: 0, is_active: false }
                ]
            };
            setServicesData(prev => [...prev, newService]);
            setSelectedService(null);
        }
    };

    const removeService = (serviceId: number) => {
        setServicesData(prev => prev.filter(s => s.service_id !== serviceId));
    };

    const updateServiceMode = (serviceIndex: number, modeIndex: number, field: string, value: any) => {
        setServicesData(prev => {
            const updated = [...prev];
            updated[serviceIndex].modes[modeIndex] = {
                ...updated[serviceIndex].modes[modeIndex],
                [field]: field === 'price' ? parseFloat(value) || 0 : value
            };
            return updated;
        });
    };

    const handleScheduleChange = (day: string, field: string, value: string | boolean) => {
        setScheduleData(prev => {
            return prev.map(schedule => {
                if (schedule.day_of_week === day) {
                    if (field === 'is_working_day') {
                        if (value === false) {
                            return {
                                ...schedule,
                                is_working_day: false,
                                start_time: '00:00:00',
                                end_time: '00:00:00'
                            };
                        } else {
                            return {
                                ...schedule,
                                is_working_day: true,
                                start_time: '09:00:00',
                                end_time: '17:00:00'
                            };
                        }
                    } else {
                        return {
                            ...schedule,
                            [field]: value
                        };
                    }
                }
                return schedule;
            });
        });
    };

    const tabs = [
        { id: 'basic', label: 'Basic Details', icon: <FiUser /> },
        { id: 'schedule', label: 'Schedule', icon: <FiCalendar /> },
        { id: 'ratings', label: 'Ratings', icon: <FiStar /> },
        { id: 'services', label: 'Services', icon: <FiSettings /> }
    ];

    if (!astrologerData) return null;

    return (
        <div className="mx-auto p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/astrologers')}
                        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Edit Astrologer</h1>
                        <p className="text-gray-600">{astrologerData.full_name}</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === tab.id
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-md p-6">
                {activeTab === 'basic' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Basic Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                                <input
                                    type="text"
                                    value={basicData.full_name}
                                    onChange={(e) => setBasicData(prev => ({ ...prev, full_name: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender*</label>
                                <select
                                    value={basicData.gender}
                                    onChange={(e) => setBasicData(prev => ({ ...prev, gender: e.target.value as any }))}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    value={basicData.date_of_birth}
                                    onChange={(e) => setBasicData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)*</label>
                                <input
                                    type="number"
                                    value={basicData.experience_years}
                                    onChange={(e) => setBasicData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                                    min="0"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio*</label>
                            <textarea
                                value={basicData.bio}
                                onChange={(e) => setBasicData(prev => ({ ...prev, bio: e.target.value }))}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                            />
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Languages*</label>
                            <div className="flex space-x-2 mb-2">
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center"
                                >
                                    <FiPlus className="mr-1" /> Add
                                </button>
                            </div>

                            {basicData.languages.length > 0 && (
                                <div className="mt-3">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Languages:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {basicData.languages.map((lang) => (
                                            <div
                                                key={lang}
                                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                                            >
                                                {lang}
                                                <button
                                                    type="button"
                                                    onClick={() => removeLanguage(lang)}
                                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                                >
                                                    <FiX size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleBasicSubmit}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                <FiSave /> Save Basic Details
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'schedule' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Weekly Schedule</h2>
                        <div className="space-y-4">
                            {scheduleData.map((schedule) => (
                                <div key={schedule.day_of_week} className="border p-4 rounded-md hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium">{schedule.day_of_week}</h3>
                                        <div className="flex items-center">
                                            <label className="mr-2">Working Day</label>
                                            <input
                                                type="checkbox"
                                                checked={schedule.is_working_day}
                                                onChange={(e) => handleScheduleChange(schedule.day_of_week, 'is_working_day', e.target.checked)}
                                                className="form-checkbox h-5 w-5 text-blue-600"
                                            />
                                        </div>
                                    </div>

                                    {schedule.is_working_day && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                                <input
                                                    type="time"
                                                    value={schedule.start_time.substring(0, 5)}
                                                    onChange={(e) => handleScheduleChange(schedule.day_of_week, 'start_time', `${e.target.value}:00`)}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                                <input
                                                    type="time"
                                                    value={schedule.end_time.substring(0, 5)}
                                                    onChange={(e) => handleScheduleChange(schedule.day_of_week, 'end_time', `${e.target.value}:00`)}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleScheduleSubmit}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                <FiSave /> Save Schedule
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'ratings' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Ratings Management</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Reviews</label>
                                <input
                                    type="number"
                                    value={ratingData.total_reviews}
                                    onChange={(e) => setRatingData(prev => ({ ...prev, total_reviews: parseInt(e.target.value) || 0 }))}
                                    min="0"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Average Rating</label>
                                <input
                                    type="number"
                                    value={ratingData.average_rating}
                                    onChange={(e) => setRatingData(prev => ({ ...prev, average_rating: parseFloat(e.target.value) || 0 }))}
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleRatingSubmit}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                <FiSave /> Save Ratings
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'services' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Services Management</h2>

                        <div className="flex space-x-2 mb-4">
                            <select
                                value={selectedService || ''}
                                onChange={(e) => setSelectedService(parseInt(e.target.value))}
                                className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select a service</option>
                                {serviceList.map((service) => (
                                    <option
                                        key={service.id}
                                        value={service.id}
                                        disabled={servicesData.some(s => s.service_id === service.id)}
                                    >
                                        {service.title}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={addService}
                                disabled={!selectedService}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center"
                            >
                                <FiPlus className="mr-1" /> Add Service
                            </button>
                        </div>

                        {servicesData.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-md">
                                <p className="text-gray-500">No services configured</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {servicesData.map((service, serviceIndex) => {
                                    const serviceDetails = serviceList.find(s => s.id === service.service_id);
                                    return (
                                        <div key={service.service_id} className="border p-4 rounded-md hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="font-medium">{serviceDetails?.title}</h4>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleServiceSubmit(service)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        <FiSave className="mr-1 inline" /> Save
                                                    </button>
                                                    <button
                                                        onClick={() => removeService(service.service_id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <FiX size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {service.modes.map((mode, modeIndex) => (
                                                    <div key={mode.mode} className="border p-3 rounded hover:border-blue-300 transition-colors">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={mode.is_active}
                                                                    onChange={(e) => updateServiceMode(serviceIndex, modeIndex, 'is_active', e.target.checked)}
                                                                    className="mr-2"
                                                                />
                                                                <label className="capitalize">{mode.mode}</label>
                                                            </div>
                                                        </div>

                                                        {mode.is_active && (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                                                <input
                                                                    type="number"
                                                                    value={mode.price}
                                                                    onChange={(e) => updateServiceMode(serviceIndex, modeIndex, 'price', e.target.value)}
                                                                    min="0"
                                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AstrologerEdit() {
    return (
        <Suspense fallback={
            <div className="container mx-auto p-6 max-w-7xl">
                <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex items-center justify-center h-64">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-gray-200 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-48 mb-2.5"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                </div>
            </div>
        }>
            <AstrologerEditContent />
        </Suspense>
    );
} 