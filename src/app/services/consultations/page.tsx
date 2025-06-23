"use client";
import { useLoading } from "@/context/loadingContext";
import { Service } from "@/types/services";
import { deleteService, getAllServices, getServiceImgURL, UpdateServiceThumbnail } from "@/utils/services";
import { useEffect, useState, Suspense } from "react";
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiX, FiUpload, FiEdit2, FiRefreshCw } from "react-icons/fi";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

function ConsultationsServicesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [services, setServices] = useState<Service[]>([]);
    const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const { setLoading } = useLoading();
    const [showThumbnailModal, setShowThumbnailModal] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [refreshTimestamp, setRefreshTimestamp] = useState(Date.now());
    const limit = 8; // Number of services per page

    // Check for refresh parameter
    useEffect(() => {
        const refresh = searchParams.get("refresh");
        if (refresh) {
            setRefreshTimestamp(parseInt(refresh));
        }
    }, [searchParams]);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 200);

        return () => {
            clearTimeout(timer);
        };
    }, [query]);

    useEffect(() => {
        const fetchServices = async () => {
            const response = await getAllServices(page, debouncedQuery, "ONE_ON_ONE", "");
            if (response.success) {
                setServices(response.services);
                setTotal(response.pagination.total);
                setTotalPages(response.pagination.pages);
            }
            setLoading(false);
        };
        setLoading(true);
        fetchServices();
    }, [page, debouncedQuery, refreshTimestamp, setLoading]);

    // Update URL when search query or page changes
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (debouncedQuery) {
            params.set("q", debouncedQuery);
        } else {
            params.delete("q");
        }

        params.set("page", page.toString());

        // Remove refresh parameter if it exists
        if (params.has("refresh")) {
            params.delete("refresh");
        }

        const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        window.history.replaceState({}, '', newUrl);
    }, [debouncedQuery, page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to first page on new search
    };

    const openThumbnailModal = (service: Service) => {
        setSelectedService(service);
        setThumbnailPreview(null);
        setThumbnailFile(null);
        setShowThumbnailModal(true);
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleThumbnailUpdate = async () => {
        if (!selectedService || !thumbnailFile) return;

        setLoading(true);
        const response = await UpdateServiceThumbnail(selectedService.id.toString(), thumbnailFile);

        if (response.success) {
            toast.success("Thumbnail updated successfully");

            // Clean up object URL
            if (thumbnailPreview) {
                URL.revokeObjectURL(thumbnailPreview);
            }

            // Force a refresh of the services list
            setRefreshTimestamp(Date.now());
            setShowThumbnailModal(false);
        } else {
            toast.error(response.message || "Failed to update thumbnail");
        }
        setLoading(false);
    };

    const handleDeleteService = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this service?")) {
            setIsDeleting(id.toString());
            setLoading(true);
            const response = await deleteService(id.toString());

            if (response.success) {
                toast.success("Service deleted successfully");
                // Remove the service from the list
                setServices(services.filter(service => service.id !== id));
                if (services.length === 1 && page > 1) {
                    setPage(page - 1);
                }
            } else {
                toast.error(response.message || "Failed to delete service");
            }
            setIsDeleting(null);
            setLoading(false);
        }
    };

    const refreshServices = () => {
        setRefreshTimestamp(Date.now());
    };

    return (
        <div className="container mx-auto p-6">
            <div className="bg-white mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Consultation Services
                            <span className="ml-3 text-sm font-medium bg-indigo-100 text-indigo-700 py-1 px-2 rounded-full">
                                {total} Total
                            </span>
                        </h1>
                        <button
                            onClick={refreshServices}
                            className="ml-3 p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                            title="Refresh services"
                        >
                            <FiRefreshCw />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <form onSubmit={handleSearch} className="relative flex-grow md:flex-grow-0">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FiSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search services..."
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
                        <Link
                            href="/services/create?type=ONE_ON_ONE"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-sm whitespace-nowrap"
                        >
                            <FiPlus className="text-lg" /> Add Service
                        </Link>
                    </div>
                </div>

                {services.length === 0 && debouncedQuery && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-center">
                        <p className="text-yellow-700">No services found matching "{debouncedQuery}". Try a different search term.</p>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {services.map((service) => (
                        <div key={service.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
                            <div className="relative h-48 bg-gray-100">
                                <img
                                    src={service.thumbnail_img ? getServiceImgURL(service.thumbnail_img) : "/thumbnail.png"}
                                    alt={service.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/thumbnail.png";
                                    }}
                                />
                                <button
                                    onClick={() => openThumbnailModal(service)}
                                    className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition"
                                    title="Update thumbnail"
                                >
                                    <FiEdit2 className="text-gray-700" />
                                </button>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-1">{service.title}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                                        One-on-One
                                    </span>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/services/create?mode=edit&id=${service.id}&type=ONE_ON_ONE`}
                                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md transition"
                                            title="Edit service"
                                        >
                                            <FiEdit />
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteService(service.id)}
                                            disabled={isDeleting === service.id.toString()}
                                            className={`p-2 text-red-600 hover:bg-red-50 rounded-md transition ${isDeleting === service.id.toString() ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            title="Delete service"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {services.length === 0 && !debouncedQuery && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No consultation services yet</h3>
                            <p className="text-gray-500 mb-4">Create your first consultation service to get started</p>
                            <Link
                                href="/services/create?type=ONE_ON_ONE"
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-sm"
                            >
                                <FiPlus /> Create Service
                            </Link>
                        </div>
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 0 && (
                    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-white py-3">
                        <div className="flex items-center mb-4 sm:mb-0">
                            <span className="text-sm text-gray-700">
                                Showing <span className="font-medium">{services.length > 0 ? (page - 1) * limit + 1 : 0}</span> to{" "}
                                <span className="font-medium">{Math.min(page * limit, total)}</span> of{" "}
                                <span className="font-medium">{total}</span> services
                            </span>
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
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Logic to show pages around current page
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (page <= 3) {
                                        pageNum = i + 1;
                                    } else if (page >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
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
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages || totalPages === 0}
                                className={`px-3 py-1 rounded-md ${page === totalPages || totalPages === 0
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'} text-sm font-medium`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Thumbnail Update Modal */}
            {showThumbnailModal && selectedService && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fadeIn">
                        <div className="bg-indigo-600 text-white p-4 rounded-t-xl flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Update Thumbnail</h2>
                            <button
                                onClick={() => {
                                    if (thumbnailPreview) {
                                        URL.revokeObjectURL(thumbnailPreview);
                                    }
                                    setShowThumbnailModal(false);
                                }}
                                className="text-white hover:bg-indigo-700 rounded-full p-1.5 transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <div className="h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
                                    {thumbnailPreview ? (
                                        <img
                                            src={thumbnailPreview}
                                            alt="Thumbnail preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : selectedService.thumbnail_img ? (
                                        <img
                                            src={getServiceImgURL(selectedService.thumbnail_img)}
                                            alt={selectedService.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "/thumbnail.png";
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-gray-400">No image selected</span>
                                        </div>
                                    )}
                                </div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    Select new thumbnail image
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label
                                        htmlFor="thumbnail-upload"
                                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FiUpload className="w-8 h-8 mb-3 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">PNG, JPG or WEBP (Max 2MB)</p>
                                        </div>
                                        <input
                                            id="thumbnail-upload"
                                            type="file"
                                            accept="image/png, image/jpeg, image/webp"
                                            className="hidden"
                                            onChange={handleThumbnailChange}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        if (thumbnailPreview) {
                                            URL.revokeObjectURL(thumbnailPreview);
                                        }
                                        setShowThumbnailModal(false);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleThumbnailUpdate}
                                    disabled={!thumbnailFile}
                                    className={`px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition ${!thumbnailFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Update Thumbnail
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ConsultationsServices() {
    return (
        <Suspense fallback={
            <div className="container mx-auto p-6">
                <div className="bg-white mb-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                        <div className="flex justify-between mb-8">
                            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-10 bg-gray-200 rounded w-1/6"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <div className="h-48 bg-gray-200"></div>
                                    <div className="p-4">
                                        <div className="h-5 bg-gray-200 rounded mb-3"></div>
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                        <div className="flex justify-between">
                                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        }>
            <ConsultationsServicesContent />
        </Suspense>
    );
} 