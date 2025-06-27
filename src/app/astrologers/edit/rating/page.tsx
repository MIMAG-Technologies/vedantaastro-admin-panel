"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { FiArrowLeft, FiSave, FiStar } from "react-icons/fi";
import { useLoading } from "@/context/loadingContext";
import {
    DetaileAstrologer,
    AstrologerRatingArgs
} from "@/types/astrologer";
import {
    getAstrologerDetail,
    updateAstrologerRating
} from "@/utils/astrologer";

function RatingEditContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const astrologerId = searchParams.get("id") || "";

    const { setLoading } = useLoading();
    const [astrologerData, setAstrologerData] = useState<DetaileAstrologer | null>(null);

    const [ratingData, setRatingData] = useState<AstrologerRatingArgs>({
        total_reviews: 0,
        average_rating: 0
    });

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

                setRatingData({
                    total_reviews: astrologer.astrologer_ratings.total_reviews,
                    average_rating: parseFloat(astrologer.astrologer_ratings.average_rating)
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

        if (ratingData.total_reviews < 0) {
            toast.error("Total reviews cannot be negative");
            return;
        }

        if (ratingData.average_rating < 0 || ratingData.average_rating > 5) {
            toast.error("Average rating must be between 0 and 5");
            return;
        }

        setLoading(true);
        try {
            const response = await updateAstrologerRating(Number(astrologerId), ratingData);
            if (response.success) {
                toast.success(response.message);
                // Redirect back to astrologers list
                router.push('/astrologers');
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Failed to update rating");
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current opacity-50" />);
            } else {
                stars.push(<FiStar key={i} className="w-5 h-5 text-gray-300" />);
            }
        }
        return stars;
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
                        <h1 className="text-3xl font-bold text-gray-800">Edit Ratings</h1>
                        <p className="text-gray-600 mt-1">{astrologerData.full_name}</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl shadow-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Current Rating Display */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FiStar className="w-6 h-6 text-yellow-500" />
                            Current Rating Overview
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-800 mb-2">
                                    {ratingData.total_reviews}
                                </div>
                                <div className="text-gray-600">Total Reviews</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <div className="text-3xl font-bold text-gray-800">
                                        {ratingData.average_rating.toFixed(1)}
                                    </div>
                                    <div className="flex gap-1">
                                        {renderStars(ratingData.average_rating)}
                                    </div>
                                </div>
                                <div className="text-gray-600">Average Rating</div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Rating Form */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                            Edit Rating Data
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Total Reviews <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={ratingData.total_reviews}
                                    onChange={(e) => setRatingData(prev => ({
                                        ...prev,
                                        total_reviews: parseInt(e.target.value) || 0
                                    }))}
                                    min="0"
                                    className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Number of total reviews"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Total number of reviews received by the astrologer
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Average Rating <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={ratingData.average_rating}
                                        onChange={(e) => setRatingData(prev => ({
                                            ...prev,
                                            average_rating: parseFloat(e.target.value) || 0
                                        }))}
                                        min="0"
                                        max="5"
                                        step="0.1"
                                        className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="0.0"
                                    />
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex gap-1">
                                        {renderStars(ratingData.average_rating)}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    Average rating on a scale of 0-5 stars
                                </p>
                            </div>
                        </div>

                        {/* Rating Preview */}
                        <div className="mt-8 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">Preview</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-1">
                                    {renderStars(ratingData.average_rating)}
                                </div>
                                <span className="text-lg font-semibold text-gray-800">
                                    {ratingData.average_rating.toFixed(1)}
                                </span>
                                <span className="text-gray-600">
                                    ({ratingData.total_reviews} {ratingData.total_reviews === 1 ? 'review' : 'reviews'})
                                </span>
                            </div>
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
                                Save Ratings
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function RatingEdit() {
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
            <RatingEditContent />
        </Suspense>
    );
}