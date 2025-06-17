"use client";
import { useEffect, useState } from "react";
import { Center, CreateCenterArgs, DetaileCenter } from "@/types/centers";
import { createCenter, deleteCenter, getCenters, getOneCenter, updateCenter } from "@/utils/centers";
import { useLoading } from "@/context/loadingContext";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import { toast } from "react-hot-toast";

export default function Centers() {
    const [centers, setCenters] = useState<Center[]>([]);
    const { setLoading } = useLoading();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState<DetaileCenter | null>(null);
    const [formData, setFormData] = useState<CreateCenterArgs>({
        name: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        contact_number: "",
        email: "",
        google_maps_link: "",
    });
    const [errors, setErrors] = useState<Partial<CreateCenterArgs>>({});

    useEffect(() => {
        const fetchCenters = async () => {
            const fetchedCenters = await getCenters();
            setCenters(fetchedCenters);
            setLoading(false);
        }

        setLoading(true);
        fetchCenters();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        // Clear error when user types
        if (errors[name as keyof CreateCenterArgs]) {
            setErrors({
                ...errors,
                [name]: "",
            });
        }
    };

    useEffect(() => {
        const updateGoogleMapsLink = () => {
            const googleMapsLink = formData.google_maps_link.trim();
            const iframeSrcMatch = googleMapsLink.match(/<iframe.*?src=["'](.*?)["']/);

            if (iframeSrcMatch && iframeSrcMatch[1]) {
                // Extract the src from the iframe and update the formData
                setFormData((prevData) => ({
                    ...prevData,
                    google_maps_link: iframeSrcMatch[1],
                }));
            }
        };

        updateGoogleMapsLink();
    }, [formData.google_maps_link]);

    const validateForm = (): boolean => {
        const newErrors: Partial<CreateCenterArgs> = {};
        let isValid = true;

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
            isValid = false;
        }

        if (!formData.address.trim()) {
            newErrors.address = "Address is required";
            isValid = false;
        }

        if (!formData.city.trim()) {
            newErrors.city = "City is required";
            isValid = false;
        }

        if (!formData.state.trim()) {
            newErrors.state = "State is required";
            isValid = false;
        }

        if (!formData.pincode.trim()) {
            newErrors.pincode = "Pincode is required";
            isValid = false;
        } else if (!/^\d{6}$/.test(formData.pincode)) {
            newErrors.pincode = "Pincode must be 6 digits";
            isValid = false;
        }

        if (!formData.contact_number.trim()) {
            newErrors.contact_number = "Contact number is required";
            isValid = false;
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
            isValid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleCreateCenter = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        const success = await createCenter(formData);

        if (success) {
            toast.success("Center created successfully");
            setShowCreateModal(false);
            // Reset form
            setFormData({
                name: "",
                address: "",
                city: "",
                state: "",
                pincode: "",
                contact_number: "",
                email: "",
                google_maps_link: "",
            });
            // Refresh centers list
            const updatedCenters = await getCenters();
            setCenters(updatedCenters);
        } else {
            toast.error("Failed to create center");
        }
        setLoading(false);
    };

    const handleEditClick = async (id: number) => {
        setLoading(true);
        const { center, success } = await getOneCenter(id);

        if (success && center) {
            setSelectedCenter(center);
            setFormData({
                name: center.name,
                address: center.address,
                city: center.city,
                state: center.state,
                pincode: center.pincode,
                contact_number: center.contact_number,
                email: center.email,
                google_maps_link: center.google_maps_link,
            });
            setShowEditModal(true);
        } else {
            toast.error("Failed to fetch center details");
        }
        setLoading(false);
    };

    const handleUpdateCenter = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !selectedCenter) {
            return;
        }

        setLoading(true);
        const success = await updateCenter(selectedCenter.id, formData);

        if (success) {
            toast.success("Center updated successfully");
            setShowEditModal(false);
            // Refresh centers list
            const updatedCenters = await getCenters();
            setCenters(updatedCenters);
        } else {
            toast.error("Failed to update center");
        }
        setLoading(false);
    };

    const handleDeleteClick = (center: Center) => {
        setSelectedCenter(center as unknown as DetaileCenter);
        setShowDeleteModal(true);
    };

    const handleDeleteCenter = async () => {
        if (!selectedCenter) return;

        setLoading(true);
        const success = await deleteCenter(selectedCenter.id);

        if (success) {
            toast.success("Center deleted successfully");
            setShowDeleteModal(false);
            // Refresh centers list
            const updatedCenters = await getCenters();
            setCenters(updatedCenters);
        } else {
            toast.error("Failed to delete center");
        }
        setLoading(false);
    };

    return (
        <div className="container mx-auto p-4 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-800">Centers</h1>
                <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-500 bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition"
                    onClick={() => setShowCreateModal(true)}
                >
                    <FiPlus className="text-lg" /> Add Center
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {centers.map((center) => (
                    <div key={center.id} className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                        <div className="rounded-t-xl overflow-hidden mb-3">
                            <iframe
                                src={center.google_maps_link}
                                width="100%"
                                height="180"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                className="w-full"
                            ></iframe>
                        </div>
                        <div className="flex-1 flex flex-col justify-between px-4 pb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-1 truncate">{center.name}</h2>
                                <div className="text-sm text-gray-600 space-y-1 mb-2">
                                    <div><span className="font-medium">City:</span> {center.city}</div>
                                    <div><span className="font-medium">State:</span> {center.state}</div>
                                    <div><span className="font-medium">Pincode:</span> {center.pincode}</div>
                                    <div><span className="font-medium">Contact:</span> {center.contact_number}</div>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${center.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {center.is_active ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-6">
                                <button
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md border border-yellow-400 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition text-sm font-medium"
                                    onClick={() => handleEditClick(center.id)}
                                >
                                    <FiEdit /> Edit
                                </button>
                                <button
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md border border-red-400 text-red-700 bg-red-50 hover:bg-red-100 transition text-sm font-medium"
                                    onClick={() => handleDeleteClick(center)}
                                >
                                    <FiTrash2 /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Center Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="relative bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
                            onClick={() => setShowCreateModal(false)}
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Center</h2>
                        <form onSubmit={handleCreateCenter}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={`w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                    <input
                                        type="text"
                                        name="contact_number"
                                        value={formData.contact_number}
                                        onChange={handleInputChange}
                                        className={`w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.contact_number ? 'border-red-400' : 'border-gray-300'}`}
                                    />
                                    {errors.contact_number && <p className="text-red-500 text-xs mt-1">{errors.contact_number}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className={`w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.city ? 'border-red-400' : 'border-gray-300'}`}
                                    />
                                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className={`w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.state ? 'border-red-400' : 'border-gray-300'}`}
                                    />
                                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        className={`w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.pincode ? 'border-red-400' : 'border-gray-300'}`}
                                    />
                                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className={`w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.address ? 'border-red-400' : 'border-gray-300'}`}
                                    />
                                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Link</label>
                                    <input
                                        type="text"
                                        name="google_maps_link"
                                        value={formData.google_maps_link}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                                >
                                    Create Center
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Center Modal */}
            {showEditModal && selectedCenter && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="relative bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
                            onClick={() => setShowEditModal(false)}
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Center: {selectedCenter.name}</h2>
                        <form onSubmit={handleUpdateCenter}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={`w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                    <input
                                        type="text"
                                        name="contact_number"
                                        value={formData.contact_number}
                                        onChange={handleInputChange}
                                        className={`w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.contact_number ? 'border-red-400' : 'border-gray-300'}`}
                                    />
                                    {errors.contact_number && <p className="text-red-500 text-xs mt-1">{errors.contact_number}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className={`w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.city ? 'border-red-400' : 'border-gray-300'}`}
                                    />
                                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className={`w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.state ? 'border-red-400' : 'border-gray-300'}`}
                                    />
                                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        className={`w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.pincode ? 'border-red-400' : 'border-gray-300'}`}
                                    />
                                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className={`w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.address ? 'border-red-400' : 'border-gray-300'}`}
                                    />
                                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Link</label>
                                    <input
                                        type="text"
                                        name="google_maps_link"
                                        value={formData.google_maps_link}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-semibold"
                                >
                                    Update Center
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedCenter && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="relative bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-200">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
                            onClick={() => setShowDeleteModal(false)}
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Delete Center</h2>
                        <p className="mb-6 text-gray-700">Are you sure you want to delete the center <span className="font-semibold">"{selectedCenter.name}"</span>? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteCenter}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 