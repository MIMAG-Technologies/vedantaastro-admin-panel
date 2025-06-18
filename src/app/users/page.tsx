"use client";
import { useLoading } from "@/context/loadingContext";
import { User } from "@/types/user";
import { GetAllUsers } from "@/utils/user";
import { useEffect, useState, Suspense } from "react";
import { FiSearch, FiPlus, FiUser, FiCalendar, FiEdit, FiEye, FiMail, FiPhone, FiFilter, FiX } from "react-icons/fi";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function UsersContent() {
    const searchParams = useSearchParams();
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
    const [limit, setLimit] = useState(parseInt(searchParams.get("limit") || "10"));
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const { setLoading } = useLoading();
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await GetAllUsers(page, limit, query);
            if (response.success) {
                setUsers(response.users);
                setTotal(response.total);
                setTotalPages(Math.ceil(response.total / limit));
            }
            setLoading(false);
        };
        setLoading(true);
        fetchUsers();
    }, [page, limit, query, setLoading]);

    // Update URL when search query, page or limit changes
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (query) {
            params.set("q", query);
        } else {
            params.delete("q");
        }

        params.set("page", page.toString());
        params.set("limit", limit.toString());

        const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        window.history.replaceState({}, '', newUrl);
    }, [query, page, limit]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to first page on new search
    };

    const openViewModal = (user: User) => {
        setSelectedUser(user);
        setShowViewModal(true);
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

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="mx-auto">
            <div className="bg-white p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <FiUser className="mr-2 text-indigo-600" />
                        User Management
                        <span className="ml-3 text-sm font-medium bg-indigo-100 text-indigo-700 py-1 px-2 rounded-full">
                            {total} Total
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
                                placeholder="Search users..."
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
                            href="/users/create"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-sm whitespace-nowrap"
                        >
                            <FiPlus className="text-lg" /> Add User
                        </Link>
                    </div>
                </div>

                {users.length === 0 && query && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-center">
                        <p className="text-yellow-700">No users found matching "{query}". Try a different search term.</p>
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Demographics
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.firebase_uid} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
                                                    <img
                                                        src={user.profile_image || "/user-dummy-img.png"}
                                                        alt={user.full_name}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = "/user-dummy-img.png";
                                                        }}
                                                        className="h-10 w-10 object-cover"
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[150px]">{user.firebase_uid}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 flex items-center">
                                                <FiMail className="mr-1 text-gray-400" />
                                                <span className="truncate max-w-[150px]">
                                                    {user.email.replace(/(.{2}).+(@.+)/, "$1***$2")}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500 flex items-center mt-1">
                                                <FiPhone className="mr-1 text-gray-400" />
                                                {user.phone_number.replace(/(\d{2})\d+(\d{2})/, "$1****$2")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 flex items-center">
                                                <FiCalendar className="mr-1 text-gray-400" />
                                                <span>{calculateAge(user.date_of_birth)} years</span>
                                            </div>
                                            <div className="text-sm text-gray-500 flex items-center mt-1">
                                                <FiUser className="mr-1 text-gray-400" />
                                                <span>{user.gender}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openViewModal(user)}
                                                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    <FiEye className="mr-1" /> View
                                                </button>
                                                <Link
                                                    href={`/users/create?mode=edit&id=${user.firebase_uid}`}
                                                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    <FiEdit className="mr-1" /> Edit
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Controls */}
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-white py-3">
                    <div className="flex items-center mb-4 sm:mb-0">
                        <span className="text-sm text-gray-700 mr-4">
                            Showing <span className="font-medium">{users.length > 0 ? (page - 1) * limit + 1 : 0}</span> to{" "}
                            <span className="font-medium">{Math.min(page * limit, total)}</span> of{" "}
                            <span className="font-medium">{total}</span> users
                        </span>
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1); // Reset to first page when changing limit
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
            </div>

            {/* View User Modal */}
            {showViewModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-200 animate-fadeIn">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center transition-colors"
                            onClick={() => setShowViewModal(false)}
                            aria-label="Close"
                        >
                            <FiX />
                        </button>
                        <div className="flex flex-col items-center mb-6 pt-2">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center mb-4 border-4 border-indigo-100">
                                <img
                                    src={selectedUser.profile_image || "/user-dummy-img.png"}
                                    alt={selectedUser.full_name}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/user-dummy-img.png";
                                    }}
                                    className="object-cover w-24 h-24"
                                />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">{selectedUser.full_name}</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <p className="text-xs text-gray-500">Gender</p>
                                        <p className="font-medium">{selectedUser.gender}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <p className="text-xs text-gray-500">Age</p>
                                        <p className="font-medium">{calculateAge(selectedUser.date_of_birth)} years</p>
                                    </div>
                                </div>
                                <div className="mt-3 bg-white p-3 rounded-lg shadow-sm">
                                    <p className="text-xs text-gray-500">Date of Birth</p>
                                    <p className="font-medium">{formatDate(selectedUser.date_of_birth)}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Information</h3>
                                <div className="space-y-3">
                                    <div className="bg-white p-3 rounded-lg shadow-sm flex items-start">
                                        <FiMail className="text-indigo-500 mt-1 mr-2" />
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="font-medium break-all">{selectedUser.email}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg shadow-sm flex items-start">
                                        <FiPhone className="text-indigo-500 mt-1 mr-2" />
                                        <div>
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <p className="font-medium">{selectedUser.phone_number}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">System Information</h3>
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <p className="text-xs text-gray-500">User ID</p>
                                    <p className="font-medium text-sm break-all font-mono">{selectedUser.firebase_uid}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Link
                                href={`/users/create?mode=edit&id=${selectedUser.firebase_uid}`}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium shadow-sm"
                            >
                                <FiEdit /> Edit User
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Users() {
    return (
        <Suspense fallback={<div className="container mx-auto p-6 max-w-7xl">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex items-center justify-center h-64">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-gray-200 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-48 mb-2.5"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
            </div>
        </div>}>
            <UsersContent />
        </Suspense>
    );
}