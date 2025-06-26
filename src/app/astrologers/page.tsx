"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
    FiSearch,
    FiPlus,
    FiUser,
    FiCalendar,
    FiEdit,
    FiEye,
    FiMail,
    FiPhone,
    FiX,
    FiMoreVertical,
    FiUserCheck,
    FiUserX,
    FiSettings,
    FiStar,
    FiClock,
    FiDollarSign,
    FiShield
} from 'react-icons/fi';
import { useLoading } from '@/context/loadingContext';
import { Astrologer } from '@/types/astrologer';
import { getAstrologerList } from '@/utils/astrologer';

// Custom Dropdown Component
interface DropdownMenuProps {
    children: React.ReactNode;
    trigger: React.ReactNode;
}

function DropdownMenu({ children, trigger }: DropdownMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
                {trigger}
            </button>
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-8 z-20 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1">
                        {children}
                    </div>
                </>
            )}
        </div>
    );
}

interface DropdownMenuItemProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    icon?: React.ReactNode;
}

function DropdownMenuItem({ children, onClick, className = "", icon }: DropdownMenuItemProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${className}`}
        >
            {icon && <span className="w-4 h-4">{icon}</span>}
            {children}
        </button>
    );
}

function AstrologersContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
    const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
    const [limit, setLimit] = useState(parseInt(searchParams.get("limit") || "10"));
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const [activeFilter, setActiveFilter] = useState<"true" | "false" | "all">(
        (searchParams.get("is_active") as "true" | "false" | "all") || "all"
    );
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        pages: 0
    });
    const { setLoading } = useLoading();
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);

        return () => {
            clearTimeout(timer);
        };
    }, [query]);

    const fetchAstrologers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAstrologerList(page, limit, debouncedQuery, activeFilter);
            setAstrologers(response.astrolgers);
            setPagination(response.pagination);
        } catch (error) {
            toast.error('Failed to fetch astrologers');
        } finally {
            setLoading(false);
        }
    }, [page, limit, debouncedQuery, activeFilter, setLoading]);

    useEffect(() => {
        fetchAstrologers();
    }, [fetchAstrologers]);

    // Update URL when search query, page, limit, or filter changes
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (debouncedQuery) {
            params.set("q", debouncedQuery);
        } else {
            params.delete("q");
        }

        params.set("page", page.toString());
        params.set("limit", limit.toString());

        if (activeFilter !== "all") {
            params.set("is_active", activeFilter);
        } else {
            params.delete("is_active");
        }

        const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        window.history.replaceState({}, '', newUrl);
    }, [debouncedQuery, page, limit, activeFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
    };

    const openViewModal = (astrologer: Astrologer) => {
        setSelectedAstrologer(astrologer);
        setShowViewModal(true);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const calculateAge = (dateOfBirth: string): number => {
        const dob = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        return age;
    };

    const handleActionClick = (action: string, astrologer: Astrologer) => {
        switch (action) {
            case 'view':
                openViewModal(astrologer);
                break;
            case 'edit-basic':
                router.push(`/astrologers/edit/${astrologer.id}?tab=basic`);
                break;
            case 'edit-services':
                router.push(`/astrologers/edit/${astrologer.id}?tab=services`);
                break;
            case 'edit-schedule':
                router.push(`/astrologers/edit/${astrologer.id}?tab=schedule`);
                break;
            case 'edit-ratings':
                router.push(`/astrologers/edit/${astrologer.id}?tab=ratings`);
                break;
            case 'toggle-status':
                // TODO: Implement toggle status API call
                toast.success(`Toggle status for ${astrologer.full_name}`);
                break;
            case 'onboard':
                // TODO: Implement onboard functionality
                toast.success(`Onboard ${astrologer.full_name}`);
                break;
            default:
                break;
        }
    };

    return (
        <div className="mx-auto">
            <div className="bg-white p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <FiUser className="mr-2 text-indigo-600" />
                        Astrologer Management
                        <span className="ml-3 text-sm font-medium bg-indigo-100 text-indigo-700 py-1 px-2 rounded-full">
                            {pagination.total} Total
                        </span>
                    </h1>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <form onSubmit={handleSearch} className="relative flex-grow md:flex-grow-0">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FiSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search astrologers..."
                                className="py-2 pl-10 pr-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full md:w-64 shadow-sm"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                >
                                    <FiX className="text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </form>

                        <select
                            value={activeFilter}
                            onChange={(e) => {
                                setActiveFilter(e.target.value as "true" | "false" | "all");
                                setPage(1);
                            }}
                            className="border border-gray-300 rounded-lg bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>

                        <Link
                            href="/astrologers/create"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-sm whitespace-nowrap"
                        >
                            <FiPlus className="text-lg" /> Add Astrologer
                        </Link>
                    </div>
                </div>

                {astrologers.length === 0 && debouncedQuery && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-center">
                        <p className="text-yellow-700">No astrologers found matching "{debouncedQuery}". Try a different search term.</p>
                    </div>
                )}

                {query !== debouncedQuery && (
                    <div className="mb-4 flex items-center justify-center">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm">
                            <div className="mr-2 h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                            Searching...
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Astrologer
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Professional Info
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {astrologers.map((astrologer) => (
                                <tr key={astrologer.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
                                                <img
                                                    src={astrologer.profile_image || "/user-dummy-img.png"}
                                                    alt={astrologer.full_name}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "/user-dummy-img.png";
                                                    }}
                                                    className="h-10 w-10 object-cover"
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{astrologer.full_name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {astrologer.gender} ({calculateAge(astrologer.date_of_birth)} year old)
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 flex items-center">
                                            <FiMail className="mr-1 text-gray-400" />
                                            <span className="truncate max-w-[150px]">
                                                {astrologer.email.replace(/(.{2}).+(@.+)/, "$1***$2")}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500 flex items-center mt-1">
                                            <FiPhone className="mr-1 text-gray-400" />
                                            {astrologer.phone_number.replace(/(\d{2})\d+(\d{2})/, "$1****$2")}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 flex items-center">
                                            <FiClock className="mr-1 text-gray-400" />
                                            <span>{astrologer.experience_years} years exp.</span>
                                        </div>
                                        <div className="text-sm text-gray-500 flex items-center mt-1">
                                            <FiStar className="mr-1 text-gray-400" />
                                            <span>{astrologer.astrologer_ratings?.average_rating || 'N/A'} ({astrologer.astrologer_ratings?.total_reviews || 0} reviews)</span>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            Languages: {astrologer.languages.slice(0, 2).join(', ')}
                                            {astrologer.languages.length > 2 && ` +${astrologer.languages.length - 2}`}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${astrologer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {astrologer.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                            {astrologer.is_verified && (
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    <FiShield className="mr-1" size={10} /> Verified
                                                </span>
                                            )}
                                            {astrologer.is_google_verified && (
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                                    <FiShield className="mr-1" size={10} /> Google Verified
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openViewModal(astrologer)}
                                                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <FiEye className="mr-1" /> View
                                            </button>

                                            <DropdownMenu
                                                trigger={<FiMoreVertical className="w-4 h-4 text-gray-500" />}
                                            >
                                                <DropdownMenuItem
                                                    onClick={() => handleActionClick('edit-basic', astrologer)}
                                                    icon={<FiEdit />}
                                                >
                                                    Edit Basic Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleActionClick('edit-services', astrologer)}
                                                    icon={<FiSettings />}
                                                >
                                                    Edit Services Data
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleActionClick('edit-ratings', astrologer)}
                                                    icon={<FiStar />}
                                                >
                                                    Edit Ratings
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleActionClick('edit-schedule', astrologer)}
                                                    icon={<FiCalendar />}
                                                >
                                                    Edit Schedule
                                                </DropdownMenuItem>
                                                <hr className="my-1" />
                                                <DropdownMenuItem
                                                    onClick={() => handleActionClick('toggle-status', astrologer)}
                                                    icon={astrologer.is_active ? <FiUserX /> : <FiUserCheck />}
                                                    className={astrologer.is_active ? 'text-red-600' : 'text-green-600'}
                                                >
                                                    {astrologer.is_active ? 'Deactivate' : 'Reactivate'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleActionClick('onboard', astrologer)}
                                                    icon={<FiDollarSign />}
                                                    className="text-blue-600"
                                                >
                                                    On Board
                                                </DropdownMenuItem>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <div className="flex items-center mb-4 sm:mb-0">
                        <span className="text-sm text-gray-700 mr-4">
                            Showing <span className="font-medium">{astrologers.length > 0 ? (page - 1) * limit + 1 : 0}</span> to{" "}
                            <span className="font-medium">{Math.min(page * limit, pagination.total)}</span> of{" "}
                            <span className="font-medium">{pagination.total}</span> astrologers
                        </span>
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                            className="border border-gray-300 rounded-md text-sm py-1 px-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm"
                        >
                            <option value="10">10 per page</option>
                            <option value="20">20 per page</option>
                            <option value="50">50 per page</option>
                            <option value="100">100 per page</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className={`px-3 py-1 rounded-md ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'} text-sm font-medium`}
                        >
                            Previous
                        </button>

                        <div className="hidden sm:flex space-x-1">
                            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                let pageNum;
                                if (pagination.pages <= 5) {
                                    pageNum = i + 1;
                                } else if (page <= 3) {
                                    pageNum = i + 1;
                                } else if (page >= pagination.pages - 2) {
                                    pageNum = pagination.pages - 4 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => setPage(pageNum)}
                                        className={`px-3 py-1 rounded-md text-sm font-medium ${page === pageNum
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                            disabled={page === pagination.pages || pagination.pages === 0}
                            className={`px-3 py-1 rounded-md ${page === pagination.pages || pagination.pages === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'} text-sm font-medium`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* View Astrologer Modal */}
            {showViewModal && selectedAstrologer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center transition-colors z-10"
                            onClick={() => setShowViewModal(false)}
                            aria-label="Close"
                        >
                            <FiX />
                        </button>

                        <div className="p-6">
                            <div className="flex flex-col items-center mb-6 pt-2">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center mb-4 border-4 border-indigo-100">
                                    <img
                                        src={selectedAstrologer.profile_image || "/user-dummy-img.png"}
                                        alt={selectedAstrologer.full_name}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "/user-dummy-img.png";
                                        }}
                                        className="object-cover w-24 h-24"
                                    />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">{selectedAstrologer.full_name}</h2>
                                <div className="flex gap-2 mt-2">
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${selectedAstrologer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {selectedAstrologer.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    {selectedAstrologer.is_verified && (
                                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                                            Verified
                                        </span>
                                    )}
                                    {selectedAstrologer.is_google_verified && (
                                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                                            Google Verified
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h3>
                                    <div className="space-y-3">
                                        <div className="bg-white p-3 rounded-lg shadow-sm">
                                            <p className="text-xs text-gray-500">Gender</p>
                                            <p className="font-medium">{selectedAstrologer.gender}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg shadow-sm">
                                            <p className="text-xs text-gray-500">Experience</p>
                                            <p className="font-medium">{selectedAstrologer.experience_years} years</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg shadow-sm">
                                            <p className="text-xs text-gray-500">Languages</p>
                                            <p className="font-medium">{selectedAstrologer.languages.join(', ')}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Information</h3>
                                    <div className="space-y-3">
                                        <div className="bg-white p-3 rounded-lg shadow-sm flex items-start">
                                            <FiMail className="text-indigo-500 mt-1 mr-2" />
                                            <div>
                                                <p className="text-xs text-gray-500">Email</p>
                                                <p className="font-medium break-all">{selectedAstrologer.email}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg shadow-sm flex items-start">
                                            <FiPhone className="text-indigo-500 mt-1 mr-2" />
                                            <div>
                                                <p className="text-xs text-gray-500">Phone</p>
                                                <p className="font-medium">{selectedAstrologer.phone_number}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Professional Details</h3>
                                    <div className="space-y-3">
                                        <div className="bg-white p-3 rounded-lg shadow-sm">
                                            <p className="text-xs text-gray-500">Rating</p>
                                            <p className="font-medium">
                                                {selectedAstrologer.astrologer_ratings?.average_rating || 'N/A'}
                                                ({selectedAstrologer.astrologer_ratings?.total_reviews || 0} reviews)
                                            </p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg shadow-sm">
                                            <p className="text-xs text-gray-500">Bio</p>
                                            <p className="font-medium text-sm">{selectedAstrologer.bio}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">System Information</h3>
                                    <div className="space-y-3">
                                        <div className="bg-white p-3 rounded-lg shadow-sm">
                                            <p className="text-xs text-gray-500">Astrologer ID</p>
                                            <p className="font-medium font-mono text-sm">{selectedAstrologer.id}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg shadow-sm">
                                            <p className="text-xs text-gray-500">Joined</p>
                                            <p className="font-medium">{formatDate(selectedAstrologer.created_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        handleActionClick('edit-basic', selectedAstrologer);
                                    }}
                                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium shadow-sm"
                                >
                                    <FiEdit /> Edit Astrologer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Astrologers() {
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
            <AstrologersContent />
        </Suspense>
    );
} 