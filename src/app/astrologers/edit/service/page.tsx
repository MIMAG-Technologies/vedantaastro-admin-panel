"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { FiArrowLeft, FiSave, FiPlus, FiX, FiSettings, FiDollarSign, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { useLoading } from "@/context/loadingContext";
import {
    DetaileAstrologer,
    AstrologerServiceArgs,
    ServiceList
} from "@/types/astrologer";
import {
    getAstrologerDetail,
    updateAstrologerService,
    getServiceList
} from "@/utils/astrologer";

function ServiceEditContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const astrologerId = searchParams.get("id") || "";

    const { setLoading } = useLoading();
    const [astrologerData, setAstrologerData] = useState<DetaileAstrologer | null>(null);
    const [serviceList, setServiceList] = useState<ServiceList>([]);
    const [selectedService, setSelectedService] = useState<number | null>(null);
    const [servicesData, setServicesData] = useState<AstrologerServiceArgs[]>([]);

    const modes = [
        { key: 'call', label: 'Phone Call', icon: '📞' },
        { key: 'chat', label: 'Text Chat', icon: '💬' },
        { key: 'video', label: 'Video Call', icon: '📹' },
        { key: 'offline', label: 'In-Person', icon: '👥' }
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [astrologer, services] = await Promise.all([
                    getAstrologerDetail(Number(astrologerId)),
                    getServiceList()
                ]);

                if (!astrologer) {
                    toast.error("Astrologer not found");
                    router.push("/astrologers");
                    return;
                }

                setAstrologerData(astrologer);
                setServiceList(services);

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

    const handleServiceSubmit = async (serviceData: AstrologerServiceArgs) => {
        // Validate that at least one mode is active with a price
        const hasActiveMode = serviceData.modes.some(mode => mode.is_active && mode.price > 0);

        if (!hasActiveMode) {
            toast.error("Please activate at least one mode with a valid price");
            return;
        }

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
            toast.success("Service added! Configure prices and activate modes.");
        }
    };

    const removeService = (serviceId: number) => {
        setServicesData(prev => prev.filter(s => s.service_id !== serviceId));
        toast.success("Service removed");
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

    const toggleAllModes = (serviceIndex: number, isActive: boolean) => {
        setServicesData(prev => {
            const updated = [...prev];
            updated[serviceIndex].modes = updated[serviceIndex].modes.map(mode => ({
                ...mode,
                is_active: isActive,
                price: isActive && mode.price === 0 ? 100 : mode.price
            }));
            return updated;
        });
    };

    const getActiveModesCount = (service: AstrologerServiceArgs) => {
        return service.modes.filter(mode => mode.is_active).length;
    };

    const getTotalServiceRevenue = (service: AstrologerServiceArgs) => {
        return service.modes.filter(mode => mode.is_active).reduce((sum, mode) => sum + mode.price, 0);
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
                        <h1 className="text-3xl font-bold text-gray-800">Edit Services</h1>
                        <p className="text-gray-600 mt-1">{astrologerData.full_name}</p>
                    </div>
                </div>
            </div>

            {/* Services Overview */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiSettings className="w-6 h-6 text-purple-500" />
                    Services Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-800 mb-2">
                            {servicesData.length}
                        </div>
                        <div className="text-gray-600">Total Services</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-800 mb-2">
                            {servicesData.reduce((sum, service) => sum + getActiveModesCount(service), 0)}
                        </div>
                        <div className="text-gray-600">Active Modes</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-800 mb-2">
                            ₹{servicesData.reduce((sum, service) => sum + getTotalServiceRevenue(service), 0)}
                        </div>
                        <div className="text-gray-600">Total Revenue Potential</div>
                    </div>
                </div>
            </div>

            {/* Add New Service */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Service</h2>
                <div className="flex space-x-3">
                    <select
                        value={selectedService || ''}
                        onChange={(e) => setSelectedService(parseInt(e.target.value))}
                        className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                        <option value="">Select a service to add</option>
                        {serviceList.map((service) => (
                            <option
                                key={service.id}
                                value={service.id}
                                disabled={servicesData.some(s => s.service_id === service.id)}
                            >
                                {service.title} {servicesData.some(s => s.service_id === service.id) ? '(Already added)' : ''}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={addService}
                        disabled={!selectedService}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                        <FiPlus size={16} /> Add Service
                    </button>
                </div>
            </div>

            {/* Services List */}
            <div className="space-y-8">
                {servicesData.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <FiSettings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Services Configured</h3>
                        <p className="text-gray-500">Add your first service to get started</p>
                    </div>
                ) : (
                    servicesData.map((service, serviceIndex) => {
                        const serviceDetails = serviceList.find(s => s.id === service.service_id);
                        return (
                            <div key={service.service_id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                {/* Service Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-2xl font-bold">{serviceDetails?.title}</h3>
                                            {/* <p className="text-blue-100 mt-1">{serviceDetails?.description}</p> */}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-sm text-blue-100">Active Modes</div>
                                                <div className="text-2xl font-bold">{getActiveModesCount(service)}</div>
                                            </div>
                                            <button
                                                onClick={() => removeService(service.service_id)}
                                                className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                                                title="Remove Service"
                                            >
                                                <FiX size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Service Content */}
                                <div className="p-6">
                                    {/* Quick Actions */}
                                    <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => toggleAllModes(serviceIndex, true)}
                                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                                        >
                                            <FiToggleRight size={16} /> Enable All Modes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleAllModes(serviceIndex, false)}
                                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
                                        >
                                            <FiToggleLeft size={16} /> Disable All Modes
                                        </button>
                                        <button
                                            onClick={() => handleServiceSubmit(service)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                                        >
                                            <FiSave size={16} /> Save Changes
                                        </button>
                                    </div>

                                    {/* Modes Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {service.modes.map((mode, modeIndex) => {
                                            const modeInfo = modes.find(m => m.key === mode.mode);
                                            return (
                                                <div
                                                    key={mode.mode}
                                                    className={`border-2 rounded-xl p-6 transition-all duration-200 ${mode.is_active
                                                        ? 'border-green-300 bg-green-50 shadow-md'
                                                        : 'border-gray-200 bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl">{modeInfo?.icon}</span>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-800">{modeInfo?.label}</h4>
                                                                <p className="text-sm text-gray-600 capitalize">{mode.mode} consultation</p>
                                                            </div>
                                                        </div>
                                                        <label className="flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={mode.is_active}
                                                                onChange={(e) => updateServiceMode(serviceIndex, modeIndex, 'is_active', e.target.checked)}
                                                                className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-500"
                                                            />
                                                        </label>
                                                    </div>

                                                    {mode.is_active && (
                                                        <div className="space-y-3">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Price per session <FiDollarSign className="inline w-4 h-4" />
                                                                </label>
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                                                    <input
                                                                        type="number"
                                                                        value={mode.price}
                                                                        onChange={(e) => updateServiceMode(serviceIndex, modeIndex, 'price', e.target.value)}
                                                                        min="0"
                                                                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                                        placeholder="0"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                                <div className="text-sm text-blue-800">
                                                                    <strong>Price: ₹{mode.price}</strong> per {mode.mode} session
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {!mode.is_active && (
                                                        <div className="text-center py-4">
                                                            <span className="text-gray-500 italic">Mode Disabled</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Bottom Navigation */}
            <div className="mt-12 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => router.push('/astrologers')}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Back to Astrologers
                    </button>

                    {servicesData.length > 0 && (
                        <div className="text-sm text-gray-600">
                            {servicesData.length} service{servicesData.length !== 1 ? 's' : ''} configured
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ServiceEdit() {
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
            <ServiceEditContent />
        </Suspense>
    );
}