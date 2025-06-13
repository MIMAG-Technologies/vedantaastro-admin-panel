"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { toast } from "react-toastify";
import { Mail, Lock, ArrowLeft, Shield } from "lucide-react";
import { useLoading } from "@/context/loadingContext";

export default function AuthPage() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"email" | "otp">("email");
    const { isLoading, setLoading } = useLoading();

    const { sendOTP, login, isAuthenticated } = useAuth();
    const router = useRouter();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, router]);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!email.trim()) {
            toast.error("Please enter your email address");
            setLoading(false);
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address");
            setLoading(false);
            return;
        }

        try {
            const result = await sendOTP(email);

            if (result.success) {
                toast.success(result.message || "OTP sent successfully!");
                setStep("otp");
            } else {
                toast.error(result.message || "Failed to send OTP");
            }
        } catch (error) {
            toast.error("Something went wrong, please try again");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!otp.trim()) {
            toast.error("Please enter the OTP");
            setLoading(false);
            return;
        }

        if (otp.length !== 6) {
            toast.error("OTP must be 6 digits");
            setLoading(false);
            return;
        }

        try {
            const result = await login(email, parseInt(otp));

            if (result.success) {
                toast.success(result.message || "Login successful!");
                router.push("/dashboard");
            } else {
                toast.error(result.message || "Invalid OTP");
            }
        } catch (error) {
            toast.error("Something went wrong, please try again");
        } finally {
            setLoading(false);
        }
    };

    const handleBackToEmail = () => {
        setStep("email");
        setOtp("");
    };

    const handleResendOTP = async () => {
        setLoading(true);
        try {
            const result = await sendOTP(email);
            if (result.success) {
                toast.success("OTP resent successfully!");
            } else {
                toast.error(result.message || "Failed to resend OTP");
            }
        } catch (error) {
            toast.error("Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo and Header */}
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                        <img
                            src="/logo.png"
                            alt="Company Logo"
                            className="w-12 h-12 object-contain"
                            onError={(e) => {
                                // Fallback to shield icon if logo fails to load
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                        <Shield className="w-12 h-12 text-white hidden" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Admin Portal
                    </h2>
                    <p className="text-gray-600 text-center max-w-sm">
                        {step === "email"
                            ? "Enter your email address to receive a secure verification code"
                            : "Enter the 6-digit verification code sent to your email"
                        }
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
                    {step === "email" ? (
                        /* Email Step */
                        <form className="space-y-6" onSubmit={handleSendOTP}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                        placeholder="admin@company.com"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Sending OTP...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4 mr-2" />
                                        Send Verification Code
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        /* OTP Step */
                        <form className="space-y-6" onSubmit={handleVerifyOTP}>
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                    Verification Code
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center text-lg tracking-[0.5em] font-mono transition-all duration-200"
                                        placeholder="000000"
                                        disabled={isLoading}
                                    />
                                </div>
                                <p className="mt-2 text-sm text-gray-500 text-center">
                                    Code sent to: <span className="font-medium text-gray-700">{email}</span>
                                </p>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={handleBackToEmail}
                                    disabled={isLoading}
                                    className="flex-1 flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4 mr-2" />
                                            Verify & Login
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === "otp" && (
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Didn't receive the code?{" "}
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={isLoading}
                                    className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    Resend Code
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}