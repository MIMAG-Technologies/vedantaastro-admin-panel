"use client";
import { useLoading } from "@/context/loadingContext";
import { CreateServiceArgs, Service } from "@/types/services";
import { AddServiceImages, createService, deleteServiceImages, getAllServices, getServiceImgURL, UpdateService } from "@/utils/services";
import { useEffect, useState, Suspense } from "react";
import { FiArrowLeft, FiSave, FiX, FiUpload, FiTrash2 } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ServiceFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode") || "create";
    const serviceId = searchParams.get("id") || "";
    const serviceType = searchParams.get("type") || "";
    const isEditMode = mode === "edit";
    const { setLoading } = useLoading();

    const [formData, setFormData] = useState<CreateServiceArgs>({
        title: "",
        description: "",
        service_type: serviceType as "PRODUCT" | "ONE_ON_ONE" | "QUERY_BASED" | "HOME_PUJA",
    });

    const [errors, setErrors] = useState<Partial<CreateServiceArgs>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serviceImages, setServiceImages] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

    // Fetch service data if in edit mode
    useEffect(() => {
        const fetchServiceData = async () => {
            if (isEditMode && serviceId) {
                setLoading(true);
                const response = await getAllServices(1, "", formData.service_type, "");

                if (response.success) {
                    const service = response.services.find(s => s.id.toString() === serviceId);
                    if (service) {
                        setFormData({
                            title: service.title,
                            description: service.description,
                            service_type: service.service_type,
                        });
                        setServiceImages(service.service_images || []);
                    } else {
                        toast.error("Service not found");
                        router.push(`/services/${getServiceTypeRoute(formData.service_type)}`);
                    }
                } else {
                    toast.error("Failed to fetch service data");
                    router.push(`/services/${getServiceTypeRoute(formData.service_type)}`);
                }
                setLoading(false);
            }
        };

        fetchServiceData();
    }, [isEditMode, serviceId, serviceType]);

    // Clean up object URLs when component unmounts
    useEffect(() => {
        return () => {
            // Clean up any created object URLs
            newImagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    const getServiceTypeRoute = (type: string): string => {
        switch (type) {
            case "ONE_ON_ONE":
                return "consultations";
            case "QUERY_BASED":
                return "consultations";
            case "PRODUCT":
                return "product";
            case "HOME_PUJA":
                return "puja";
            default:
                return "";
        }
    };

    const getServiceTypeName = (type: string): string => {
        switch (type) {
            case "ONE_ON_ONE":
                return "One-on-One Consultation";
            case "QUERY_BASED":
                return "Query Based Consultation";
            case "PRODUCT":
                return "Product";
            case "HOME_PUJA":
                return "Home Puja";
            default:
                return "Service";
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Clear error when user types
        if (errors[name as keyof CreateServiceArgs]) {
            setErrors({
                ...errors,
                [name]: "",
            });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files);
            setNewImages([...newImages, ...filesArray]);

            // Create preview URLs for the new images
            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setNewImagePreviews([...newImagePreviews, ...newPreviews]);
        }
    };

    const removeNewImage = (index: number) => {
        const updatedImages = [...newImages];
        updatedImages.splice(index, 1);
        setNewImages(updatedImages);

        const updatedPreviews = [...newImagePreviews];
        URL.revokeObjectURL(updatedPreviews[index]);
        updatedPreviews.splice(index, 1);
        setNewImagePreviews(updatedPreviews);
    };

    const toggleImageToDelete = (imageName: string) => {
        if (imagesToDelete.includes(imageName)) {
            setImagesToDelete(imagesToDelete.filter(name => name !== imageName));
        } else {
            setImagesToDelete([...imagesToDelete, imageName]);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<CreateServiceArgs> = {};
        let isValid = true;

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
            isValid = false;
        }

        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
            isValid = false;
        }

        if (!formData.service_type) {
            newErrors.service_type = "Service type is required" as any;
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
            let newServiceId = "";

            if (isEditMode) {
                // Update existing service
                const response = await UpdateService(serviceId, formData);
                success = response.success;
                message = response.message;
                newServiceId = serviceId;
            } else {
                // Create new service
                const response = await createService(formData);
                success = response.success;
                message = response.message;

                // Extract ID from success message if available
                const idMatch = message.match(/ID: (\d+)/);
                if (idMatch && idMatch[1]) {
                    newServiceId = idMatch[1];
                }
            }

            if (success) {
                // Handle image operations if service was created/updated successfully
                if (newServiceId) {
                    let hasErrors = false;

                    // Delete marked images if any
                    if (isEditMode && imagesToDelete.length > 0) {
                        const deleteResponse = await deleteServiceImages(newServiceId, imagesToDelete);
                        if (!deleteResponse.success) {
                            toast.error("Failed to delete some images: " + deleteResponse.message);
                            hasErrors = true;
                        }
                    }

                    // Upload new images if any
                    if (newImages.length > 0) {
                        const imagesResponse = await AddServiceImages(newServiceId, newImages);
                        if (!imagesResponse.success) {
                            toast.error("Failed to upload some images: " + imagesResponse.message);
                            hasErrors = true;
                        }
                    }
                }

                // Clean up any object URLs
                newImagePreviews.forEach(url => URL.revokeObjectURL(url));

                toast.success(isEditMode ? "Service updated successfully" : "Service created successfully");

                // Force a refresh by adding a timestamp parameter
                router.push(`/services/${getServiceTypeRoute(formData.service_type)}?refresh=${Date.now()}`);
            } else {
                toast.error(message || (isEditMode ? "Failed to update service" : "Failed to create service"));
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
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl animate-fadeIn relative">
                {/* Header */}
                <div className="bg-indigo-600 text-white p-5 rounded-t-xl flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                        {isEditMode ? "Edit" : "Create"} {getServiceTypeName(formData.service_type)}
                    </h2>
                    <button
                        onClick={() => {
                            // Clean up any object URLs before navigating away
                            newImagePreviews.forEach(url => URL.revokeObjectURL(url));
                            router.push(`/services/${getServiceTypeRoute(formData.service_type)}`);
                        }}
                        className="text-white hover:bg-indigo-700 rounded-full p-1.5 transition-colors"
                        aria-label="Close"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Service Type</label>
                            <input
                                type="text"
                                value={getServiceTypeName(formData.service_type)}
                                disabled
                                className="w-full p-2.5 border rounded-lg bg-gray-100 cursor-not-allowed text-gray-700 border-gray-300"
                            />
                            <p className="text-xs text-gray-500 mt-1">Service type cannot be changed</p>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter service title"
                                className={`w-full p-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 ${errors.title ? 'border-red-400' : 'border-gray-300'}`}
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter service description"
                                rows={5}
                                className={`w-full p-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
                            />
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                        </div>

                        {/* Only show image management in edit mode */}
                        {isEditMode && (
                            <>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Current Images</label>
                                    {serviceImages.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {serviceImages.map((image, index) => (
                                                <div key={index} className="relative group">
                                                    <div className={`h-32 rounded-lg overflow-hidden border-2 ${imagesToDelete.includes(image) ? 'border-red-400 opacity-50' : 'border-transparent'}`}>
                                                        <img
                                                            src={getServiceImgURL(image || "")}
                                                            alt={`Service image ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = "/thumbnail.png";
                                                            }}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleImageToDelete(image)}
                                                        className={`absolute top-2 right-2 p-1.5 rounded-full ${imagesToDelete.includes(image) ? 'bg-red-500 text-white' : 'bg-white text-gray-700'} shadow-md hover:bg-red-500 hover:text-white transition`}
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                    {imagesToDelete.includes(image) && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <span className="text-red-600 font-medium text-sm bg-white px-2 py-1 rounded shadow">Marked for deletion</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No images available</p>
                                    )}
                                    {imagesToDelete.length > 0 && (
                                        <p className="text-sm text-red-500">
                                            {imagesToDelete.length} image(s) will be deleted upon saving
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Add New Images</label>
                                    <div className="flex items-center justify-center w-full">
                                        <label
                                            htmlFor="image-upload"
                                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <FiUpload className="w-8 h-8 mb-3 text-gray-400" />
                                                <p className="mb-2 text-sm text-gray-500">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500">PNG, JPG or WEBP (Max 5MB each)</p>
                                            </div>
                                            <input
                                                id="image-upload"
                                                type="file"
                                                accept="image/png, image/jpeg, image/webp"
                                                className="hidden"
                                                onChange={handleImageChange}
                                                multiple
                                            />
                                        </label>
                                    </div>

                                    {newImagePreviews.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">New Images Preview</h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                {newImagePreviews.map((preview, index) => (
                                                    <div key={index} className="relative group">
                                                        <div className="h-32 rounded-lg overflow-hidden border-2 border-transparent">
                                                            <img
                                                                src={preview}
                                                                alt={`New image ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeNewImage(index)}
                                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white text-gray-700 shadow-md hover:bg-red-500 hover:text-white transition"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    // Clean up any object URLs before navigating away
                                    newImagePreviews.forEach(url => URL.revokeObjectURL(url));
                                    router.push(`/services/${getServiceTypeRoute(formData.service_type)}`);
                                }}
                                type="button"
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center"
                            >
                                <FiX className="mr-1.5" /> Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium"
                            >
                                <FiSave />
                                {isSubmitting ? 'Processing...' : isEditMode ? "Update Service" : "Create Service"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function ServiceForm() {
    return (
        <Suspense fallback={
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        }>
            <ServiceFormContent />
        </Suspense>
    );
}
