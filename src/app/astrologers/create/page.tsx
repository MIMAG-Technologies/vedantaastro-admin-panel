"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createAstrologer, getServiceList } from '@/utils/astrologer';
import { getLanguageFilter } from '@/utils/filter';
import { toast } from 'react-hot-toast';
import { AstrologerCreateArgs, ServiceList } from '@/types/astrologer';
import { Language } from '@/types/filters';
import { FiChevronRight, FiChevronLeft, FiCheck, FiPlus, FiX } from 'react-icons/fi';

export default function CreateAstrologer() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [serviceList, setServiceList] = useState<ServiceList>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [selectedService, setSelectedService] = useState<number | null>(null);

    const [formData, setFormData] = useState<AstrologerCreateArgs>({
        astrologer: {
            full_name: '',
            email: '',
            phone_number: '',
            gender: 'Male',
            bio: '',
            experience_years: 0,
            languages: [],
            is_verified: true,
            is_active: false,
        },
        schedules: [
            { day_of_week: 'Monday', start_time: '09:00:00', end_time: '17:00:00', is_working_day: true },
            { day_of_week: 'Tuesday', start_time: '09:00:00', end_time: '17:00:00', is_working_day: true },
            { day_of_week: 'Wednesday', start_time: '09:00:00', end_time: '17:00:00', is_working_day: true },
            { day_of_week: 'Thursday', start_time: '09:00:00', end_time: '17:00:00', is_working_day: true },
            { day_of_week: 'Friday', start_time: '09:00:00', end_time: '17:00:00', is_working_day: true },
            { day_of_week: 'Saturday', start_time: '00:00:00', end_time: '00:00:00', is_working_day: false },
            { day_of_week: 'Sunday', start_time: '00:00:00', end_time: '00:00:00', is_working_day: false },
        ],
        services: [],
    });

    const [verificationChecks, setVerificationChecks] = useState({
        identityVerified: false,
        qualificationsVerified: false,
        backgroundChecked: false,
        termsAccepted: false
    });

    useEffect(() => {
        const fetchData = async () => {
            const languageData = await getLanguageFilter();
            const services = await getServiceList();

            setLanguages(languageData);
            setServiceList(services);
        };

        fetchData();
    }, []);

    const handleBasicDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            astrologer: {
                ...prev.astrologer,
                [name]: value
            }
        }));
    };

    const handleProfessionalDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'experience_years') {
            setFormData(prev => ({
                ...prev,
                astrologer: {
                    ...prev.astrologer,
                    [name]: parseInt(value) || 0
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                astrologer: {
                    ...prev.astrologer,
                    [name]: value
                }
            }));
        }
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const language = e.target.value;
        setSelectedLanguage(language);
    };

    const addLanguage = () => {
        if (selectedLanguage && !formData.astrologer.languages.includes(selectedLanguage)) {
            setFormData(prev => ({
                ...prev,
                astrologer: {
                    ...prev.astrologer,
                    languages: [...prev.astrologer.languages, selectedLanguage]
                }
            }));
            setSelectedLanguage('');
        }
    };

    const removeLanguage = (language: string) => {
        setFormData(prev => ({
            ...prev,
            astrologer: {
                ...prev.astrologer,
                languages: prev.astrologer.languages.filter(lang => lang !== language)
            }
        }));
    };

    const handleScheduleChange = (day: string, field: string, value: string | boolean) => {
        setFormData(prev => {
            const updatedSchedules = prev.schedules.map(schedule => {
                if (schedule.day_of_week === day) {
                    if (field === 'is_working_day') {
                        // If toggling to not working, reset times
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

            return {
                ...prev,
                schedules: updatedSchedules
            };
        });
    };

    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const serviceId = parseInt(e.target.value);
        setSelectedService(serviceId);
    };

    const addService = () => {
        if (selectedService && !formData.services.some(s => s.service_id === selectedService) && formData.services.length < 10) {
            setFormData(prev => ({
                ...prev,
                services: [
                    ...prev.services,
                    {
                        service_id: selectedService,
                        modes: [
                            { mode: 'call', price: 0, is_active: false },
                            { mode: 'chat', price: 0, is_active: false },
                            { mode: 'video', price: 0, is_active: false },
                            { mode: 'offline', price: 0, is_active: false }
                        ]
                    }
                ]
            }));
            setSelectedService(null);
        }
    };

    const removeService = (serviceId: number) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.filter(s => s.service_id !== serviceId)
        }));
    };

    const handleModeChange = (serviceId: number, mode: string, field: string, value: any) => {
        setFormData(prev => {
            const updatedServices = prev.services.map(service => {
                if (service.service_id === serviceId) {
                    const updatedModes = service.modes.map(m => {
                        if (m.mode === mode) {
                            return {
                                ...m,
                                [field]: field === 'price' ? (parseInt(value) || 0) : value
                            };
                        }
                        return m;
                    });

                    return {
                        ...service,
                        modes: updatedModes
                    };
                }
                return service;
            });

            return {
                ...prev,
                services: updatedServices
            };
        });
    };

    const handleVerificationChange = (check: string) => {
        setVerificationChecks(prev => ({
            ...prev,
            [check]: !prev[check as keyof typeof prev]
        }));
    };

    const validateCurrentStep = () => {
        switch (currentStep) {
            case 1: // Basic Details
                if (!formData.astrologer.full_name || !formData.astrologer.email || !formData.astrologer.phone_number) {
                    toast.error('Please fill all required fields');
                    return false;
                }
                break;
            case 2: // Professional Details
                if (!formData.astrologer.bio || formData.astrologer.languages.length === 0) {
                    toast.error('Please fill all required fields');
                    return false;
                }
                break;
            case 3: // Schedules
                // All days are already initialized, no validation needed
                break;
            case 4: // Services
                if (formData.services.length === 0) {
                    toast.error('Please select at least one service');
                    return false;
                }

                // Check if at least one mode is active for each service
                const invalidServices = formData.services.filter(
                    service => !service.modes.some(mode => mode.is_active)
                );

                if (invalidServices.length > 0) {
                    toast.error('Each service must have at least one active mode');
                    return false;
                }
                break;
            case 5: // Verification
                if (!Object.values(verificationChecks).every(check => check)) {
                    toast.error('Please complete all verification checks');
                    return false;
                }
                break;
        }
        return true;
    };

    const nextStep = () => {
        if (validateCurrentStep()) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        if (!validateCurrentStep()) return;

        setIsLoading(true);
        try {
            const response = await createAstrologer(formData);
            if (response.success) {
                toast.success(response.message);
                router.push('/astrologers');
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error('Failed to create astrologer');
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepIndicator = () => {
        const steps = [
            'Basic Details',
            'Professional Details',
            'Weekly Schedule',
            'Services',
            'Verification'
        ];

        return (
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep > index + 1 ? 'bg-green-500 text-white' :
                                currentStep === index + 1 ? 'bg-blue-500 text-white' :
                                    'bg-gray-200 text-gray-500'
                                }`}>
                                {currentStep > index + 1 ? <FiCheck className="w-5 h-5" /> : index + 1}
                            </div>
                            <span className="text-xs mt-2">{step}</span>
                        </div>
                    ))}
                </div>
                <div className="relative mt-2">
                    <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full"></div>
                    <div
                        className="absolute top-0 left-0 h-1 bg-blue-500 transition-all duration-300"
                        style={{ width: `${(currentStep - 1) * 25}%` }}
                    ></div>
                </div>
            </div>
        );
    };

    return (
        <div className=" mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Create New Astrologer</h1>

            {renderStepIndicator()}

            <div className="bg-white rounded-lg shadow-md p-6">
                {currentStep === 1 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Basic Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.astrologer.full_name}
                                    onChange={handleBasicDetailsChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.astrologer.email}
                                    onChange={handleBasicDetailsChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.astrologer.phone_number}
                                    onChange={handleBasicDetailsChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender*</label>
                                <select
                                    name="gender"
                                    value={formData.astrologer.gender}
                                    onChange={handleBasicDetailsChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Professional Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio*</label>
                                <textarea
                                    name="bio"
                                    value={formData.astrologer.bio}
                                    onChange={handleProfessionalDetailsChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)*</label>
                                <input
                                    type="number"
                                    name="experience_years"
                                    value={formData.astrologer.experience_years}
                                    onChange={handleProfessionalDetailsChange}
                                    min="0"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Languages*</label>
                                <div className="flex space-x-2 mb-2">
                                    <select
                                        value={selectedLanguage}
                                        onChange={handleLanguageChange}
                                        className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select a language</option>
                                        {languages.map((lang) => (
                                            <option
                                                key={lang.id}
                                                value={lang.language_name}
                                                disabled={formData.astrologer.languages.includes(lang.language_name)}
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

                                {formData.astrologer.languages.length > 0 && (
                                    <div className="mt-3">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Languages:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.astrologer.languages.map((lang) => (
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
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Weekly Schedule</h2>
                        <div className="space-y-4">
                            {formData.schedules.map((schedule) => (
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
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                                <input
                                                    type="time"
                                                    value={schedule.end_time.substring(0, 5)}
                                                    onChange={(e) => handleScheduleChange(schedule.day_of_week, 'end_time', `${e.target.value}:00`)}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Services</h2>
                        <p className="text-sm text-gray-500 mb-4">Select up to 10 services that the astrologer can provide</p>

                        <div className="space-y-6">
                            <div className="flex space-x-2 mb-4">
                                <select
                                    value={selectedService || ''}
                                    onChange={handleServiceChange}
                                    className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={formData.services.length >= 10}
                                >
                                    <option value="">Select a service</option>
                                    {serviceList.map((service) => (
                                        <option
                                            key={service.id}
                                            value={service.id}
                                            disabled={formData.services.some(s => s.service_id === service.id)}
                                        >
                                            {service.title}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={addService}
                                    disabled={!selectedService || formData.services.length >= 10}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center"
                                >
                                    <FiPlus className="mr-1" /> Add
                                </button>
                            </div>

                            {formData.services.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-md">
                                    <p className="text-gray-500">Please select at least one service</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {formData.services.map((service) => {
                                        const serviceDetails = serviceList.find(s => s.id === service.service_id);
                                        return (
                                            <div key={service.service_id} className="border p-4 rounded-md hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h4 className="font-medium">{serviceDetails?.title}</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeService(service.service_id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <FiX size={18} />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {service.modes.map((mode) => (
                                                        <div key={mode.mode} className="border p-3 rounded hover:border-blue-300 transition-colors">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`mode-${service.service_id}-${mode.mode}`}
                                                                        checked={mode.is_active}
                                                                        onChange={(e) => handleModeChange(service.service_id, mode.mode, 'is_active', e.target.checked)}
                                                                        className="mr-2"
                                                                    />
                                                                    <label htmlFor={`mode-${service.service_id}-${mode.mode}`} className="capitalize">{mode.mode}</label>
                                                                </div>
                                                            </div>

                                                            {mode.is_active && (
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={mode.price}
                                                                        onChange={(e) => handleModeChange(service.service_id, mode.mode, 'price', e.target.value)}
                                                                        min="0"
                                                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        required
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
                    </div>
                )}

                {currentStep === 5 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Verification</h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                <p className="text-yellow-700 mb-2">
                                    Please ensure that you have verified the following before adding this astrologer to the platform:
                                </p>

                                <div className="space-y-2">
                                    <div className="flex items-start">
                                        <input
                                            type="checkbox"
                                            id="identity"
                                            checked={verificationChecks.identityVerified}
                                            onChange={() => handleVerificationChange('identityVerified')}
                                            className="mt-1 mr-2"
                                        />
                                        <label htmlFor="identity">I have verified the identity documents of the astrologer</label>
                                    </div>

                                    <div className="flex items-start">
                                        <input
                                            type="checkbox"
                                            id="qualifications"
                                            checked={verificationChecks.qualificationsVerified}
                                            onChange={() => handleVerificationChange('qualificationsVerified')}
                                            className="mt-1 mr-2"
                                        />
                                        <label htmlFor="qualifications">I have verified the professional qualifications and experience</label>
                                    </div>

                                    <div className="flex items-start">
                                        <input
                                            type="checkbox"
                                            id="background"
                                            checked={verificationChecks.backgroundChecked}
                                            onChange={() => handleVerificationChange('backgroundChecked')}
                                            className="mt-1 mr-2"
                                        />
                                        <label htmlFor="background">I have completed necessary background checks</label>
                                    </div>

                                    <div className="flex items-start">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            checked={verificationChecks.termsAccepted}
                                            onChange={() => handleVerificationChange('termsAccepted')}
                                            className="mt-1 mr-2"
                                        />
                                        <label htmlFor="terms">The astrologer has agreed to the platform's terms and conditions</label>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                                <p className="text-blue-700">
                                    <strong>Note:</strong> The astrologer will be verified but set as inactive initially.
                                    You can activate their account from the astrologer management page after final review.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 flex justify-between">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md flex items-center hover:bg-gray-300 transition-colors"
                        >
                            <FiChevronLeft className="mr-1" /> Previous
                        </button>
                    )}

                    {currentStep < 5 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="ml-auto px-4 py-2 bg-blue-500 text-white rounded-md flex items-center hover:bg-blue-600 transition-colors"
                        >
                            Next <FiChevronRight className="ml-1" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="ml-auto px-4 py-2 bg-green-500 text-white rounded-md flex items-center hover:bg-green-600 transition-colors disabled:bg-green-300"
                        >
                            {isLoading ? 'Submitting...' : 'Create Astrologer'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
