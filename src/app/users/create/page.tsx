"use client";
import { useLoading } from "@/context/loadingContext";
import { CreateUserArgs, User } from "@/types/user";
import { CreateUser, GetAllUsers, UpdateUser } from "@/utils/user";
import { useEffect, useState, Suspense } from "react";
import { FiArrowLeft, FiSave, FiX, FiUser } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function UserFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode") || "create";
    const userId = searchParams.get("id") || "";
    const isEditMode = mode === "edit";
    const { setLoading } = useLoading();

    const [formData, setFormData] = useState<CreateUserArgs>({
        full_name: "",
        email: "",
        phone_number: "",
        gender: "Male",
        date_of_birth: "",
    });

    const [errors, setErrors] = useState<Partial<CreateUserArgs>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch user data if in edit mode
    useEffect(() => {
        const fetchUserData = async () => {
            if (isEditMode && userId) {
                setLoading(true);
                const response = await GetAllUsers(1, 1, "", userId);
                if (response.success && response.users.length > 0) {
                    const user = response.users[0];
                    setFormData({
                        full_name: user.full_name,
                        email: user.email,
                        phone_number: user.phone_number,
                        gender: user.gender,
                        date_of_birth: new Date(user.date_of_birth).toISOString().split('T')[0],
                    });
                } else {
                    toast.error("User not found");
                    router.push("/users");
                }
                setLoading(false);
            }
        };

        fetchUserData();
    }, [isEditMode, userId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Clear error when user types
        if (errors[name as keyof CreateUserArgs]) {
            setErrors({
                ...errors,
                [name]: "",
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<CreateUserArgs> = {};
        let isValid = true;

        if (!formData.full_name.trim()) {
            newErrors.full_name = "Full name is required";
            isValid = false;
        }

        if (!isEditMode && !formData.email.trim()) {
            newErrors.email = "Email is required";
            isValid = false;
        } else if (!isEditMode && !/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
            isValid = false;
        }

        if (!isEditMode && !formData.phone_number.trim()) {
            newErrors.phone_number = "Phone number is required";
            isValid = false;
        }

        if (!formData.date_of_birth) {
            newErrors.date_of_birth = "Date of birth is required";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setLoading(true);

        try {
            let success = false;
            let message = "";

            if (isEditMode) {
                // Update existing user
                const response = await UpdateUser(userId, {
                    full_name: formData.full_name,
                    gender: formData.gender,
                    date_of_birth: formData.date_of_birth,
                });
                success = response.success;
                message = response.message;
            } else {
                // Create new user
                const response = await CreateUser(formData);
                success = response.success;
                message = response.message;
            }

            if (success) {
                toast.success(isEditMode ? "User updated successfully" : "User created successfully");
                router.back();
            } else {
                toast.error(message || (isEditMode ? "Failed to update user" : "Failed to create user"));
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
            console.error(error);
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fadeIn relative">
                {/* Header */}
                <div className="bg-indigo-600 text-white p-5 rounded-t-xl flex justify-between items-center">
                    <h2 className="text-xl font-semibold flex items-center">
                        <FiUser className="mr-2" />
                        {isEditMode ? "Edit User" : "Create New User"}
                    </h2>
                    <button
                        onClick={() => router.back()}
                        className="text-white hover:bg-indigo-700 rounded-full p-1.5 transition-colors"
                        aria-label="Close"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleInputChange}
                                placeholder="Enter full name"
                                className={`w-full p-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 ${errors.full_name ? 'border-red-400' : 'border-gray-300'}`}
                            />
                            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter email address"
                                disabled={isEditMode}
                                className={`w-full p-2.5 border rounded-lg ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-indigo-300 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                type="text"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleInputChange}
                                placeholder="Enter phone number"
                                disabled={isEditMode}
                                className={`w-full p-2.5 border rounded-lg ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-indigo-300 ${errors.phone_number ? 'border-red-400' : 'border-gray-300'}`}
                            />
                            {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                            <input
                                type="date"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleInputChange}
                                className={`w-full p-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 ${errors.date_of_birth ? 'border-red-400' : 'border-gray-300'}`}
                            />
                            {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => router.back()}
                                type="button"
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center"
                            >
                                <FiX className="mr-1.5" /> Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition font-medium ${isEditMode
                                    ? 'bg-indigo-600 hover:bg-indigo-700'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                    } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <FiSave />
                                {isSubmitting ? 'Processing...' : isEditMode ? "Update User" : "Create User"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function UserForm() {
    return (
        <Suspense fallback={
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        }>
            <UserFormContent />
        </Suspense>
    );
} 