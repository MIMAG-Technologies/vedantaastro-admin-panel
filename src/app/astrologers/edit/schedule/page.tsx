"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { FiArrowLeft, FiSave, FiCalendar, FiClock, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { useLoading } from "@/context/loadingContext";
import {
    DetaileAstrologer,
    AstrologerScheduleArgs
} from "@/types/astrologer";
import {
    getAstrologerDetail,
    updateAstrologerSchedule
} from "@/utils/astrologer";

// Helper function to extract time from ISO datetime string
const extractTimeFromISO = (isoString: string): string => {
    if (!isoString) return '00:00:00';
    // Extract time part from ISO string like "1970-01-01T09:00:00.000Z"
    const date = new Date(isoString);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

// Note: API receives ISO format but expects simple time format (HH:MM:SS) for updates

function ScheduleEditContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const astrologerId = searchParams.get("id") || "";

    const { setLoading } = useLoading();
    const [astrologerData, setAstrologerData] = useState<DetaileAstrologer | null>(null);
    const [scheduleData, setScheduleData] = useState<AstrologerScheduleArgs>([]);

    const daysOfWeek = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday',
        'Friday', 'Saturday', 'Sunday'
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const astrologer = await getAstrologerDetail(Number(astrologerId));

                if (!astrologer) {
                    toast.error("Astrologer not found");
                    router.push("/astrologers");
                    return;
                }

                setAstrologerData(astrologer);

                setScheduleData(astrologer.astrologer_schedules.map(schedule => ({
                    day_of_week: schedule.day_of_week,
                    start_time: extractTimeFromISO(schedule.start_time),
                    end_time: extractTimeFromISO(schedule.end_time),
                    is_working_day: schedule.is_working_day
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate working days have proper times
        const hasInvalidTimes = scheduleData.some(schedule => {
            if (schedule.is_working_day) {
                return !schedule.start_time || !schedule.end_time ||
                    schedule.start_time >= schedule.end_time;
            }
            return false;
        });

        if (hasInvalidTimes) {
            toast.error("Please set valid start and end times for working days");
            return;
        }

        setLoading(true);
        try {
            // Send time strings in simple format (09:00:00) to API
            const response = await updateAstrologerSchedule(Number(astrologerId), scheduleData);
            if (response.success) {
                toast.success(response.message);
                // Redirect back to astrologers list
                router.push('/astrologers');
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Failed to update schedule");
        } finally {
            setLoading(false);
        }
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

    const toggleAllDays = (isWorking: boolean) => {
        setScheduleData(prev => prev.map(schedule => ({
            ...schedule,
            is_working_day: isWorking,
            start_time: isWorking ? '09:00:00' : '00:00:00',
            end_time: isWorking ? '17:00:00' : '00:00:00'
        })));
    };

    const copyToAllWorkingDays = (sourceDay: string) => {
        const sourceSchedule = scheduleData.find(s => s.day_of_week === sourceDay);
        if (!sourceSchedule || !sourceSchedule.is_working_day) return;

        setScheduleData(prev => prev.map(schedule => {
            if (schedule.is_working_day && schedule.day_of_week !== sourceDay) {
                return {
                    ...schedule,
                    start_time: sourceSchedule.start_time,
                    end_time: sourceSchedule.end_time
                };
            }
            return schedule;
        }));
        toast.success(`Copied ${sourceDay} schedule to all working days`);
    };

    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5);
    };

    const getWorkingDaysCount = () => {
        return scheduleData.filter(s => s.is_working_day).length;
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
                        <h1 className="text-3xl font-bold text-gray-800">Edit Schedule</h1>
                        <p className="text-gray-600 mt-1">{astrologerData.full_name}</p>
                    </div>
                </div>
            </div>

            {/* Schedule Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiCalendar className="w-6 h-6 text-blue-500" />
                    Schedule Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-800 mb-2">
                            {getWorkingDaysCount()}
                        </div>
                        <div className="text-gray-600">Working Days</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-800 mb-2">
                            {7 - getWorkingDaysCount()}
                        </div>
                        <div className="text-gray-600">Off Days</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-800 mb-2">
                            {getWorkingDaysCount() * 8}h
                        </div>
                        <div className="text-gray-600">Weekly Hours (avg)</div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl shadow-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
                        <button
                            type="button"
                            onClick={() => toggleAllDays(true)}
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                            <FiToggleRight /> Enable All Days
                        </button>
                        <button
                            type="button"
                            onClick={() => toggleAllDays(false)}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
                        >
                            <FiToggleLeft /> Disable All Days
                        </button>
                    </div>

                    {/* Weekly Schedule */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                            Weekly Schedule
                        </h2>

                        <div className="space-y-6">
                            {scheduleData.map((schedule) => (
                                <div
                                    key={schedule.day_of_week}
                                    className={`border rounded-xl p-6 transition-all duration-200 ${schedule.is_working_day
                                        ? 'border-green-200 bg-green-50 shadow-md'
                                        : 'border-gray-200 bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                            <FiClock className={`w-5 h-5 ${schedule.is_working_day ? 'text-green-500' : 'text-gray-400'}`} />
                                            {schedule.day_of_week}
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            {schedule.is_working_day && (
                                                <button
                                                    type="button"
                                                    onClick={() => copyToAllWorkingDays(schedule.day_of_week)}
                                                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                                                >
                                                    Copy to all working days
                                                </button>
                                            )}
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <span className="text-sm font-medium text-gray-700">Working Day</span>
                                                <input
                                                    type="checkbox"
                                                    checked={schedule.is_working_day}
                                                    onChange={(e) => handleScheduleChange(schedule.day_of_week, 'is_working_day', e.target.checked)}
                                                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {schedule.is_working_day && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Start Time
                                                </label>
                                                <input
                                                    type="time"
                                                    value={formatTime(schedule.start_time)}
                                                    onChange={(e) => handleScheduleChange(
                                                        schedule.day_of_week,
                                                        'start_time',
                                                        `${e.target.value}:00`
                                                    )}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    End Time
                                                </label>
                                                <input
                                                    type="time"
                                                    value={formatTime(schedule.end_time)}
                                                    onChange={(e) => handleScheduleChange(
                                                        schedule.day_of_week,
                                                        'end_time',
                                                        `${e.target.value}:00`
                                                    )}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {!schedule.is_working_day && (
                                        <div className="text-center py-4">
                                            <span className="text-gray-500 italic">Day Off</span>
                                        </div>
                                    )}
                                </div>
                            ))}
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
                                Save Schedule
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ScheduleEdit() {
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
            <ScheduleEditContent />
        </Suspense>
    );
}