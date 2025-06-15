"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import {
    FaHome,
    FaUsers,
    FaUser,
    FaStar,
    FaCalendarAlt,
    FaShoppingBag,
    FaCog,
    FaMoneyBillWave,
    FaQuestionCircle,
    FaBlog,
    FaBuilding,
    FaChevronDown,
    FaChevronRight,
    FaMoon,
    FaBox,
    FaTruck,
    FaCreditCard,
    FaNewspaper,
    FaCircle,
    FaHeadset,
    FaUserShield,
    FaChartBar,
    FaVideo,
    FaHeart,
    FaPray,
    FaMailBulk,
    FaLanguage,
    FaWallet,
    FaCoins
} from "react-icons/fa";
import { BiExit, BiMenu, BiX } from "react-icons/bi";
import { toast } from "react-toastify";
import { useAuth } from "@/context/authContext";

export default function SideNavbar({
    children,
}: {
    children: ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState(["overview", "users"]);
    const router = useRouter();

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem("vedantaastro-admin-token");
        }
        toast.success("Logged out Successfully!");
        router.push("/auth");
    };

    const { admin } = useAuth();

    const routeGroups = [
        {
            id: "overview",
            name: "Overview",
            icon: <FaHome />,
            items: [
                { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
            ]
        },
        {
            id: "users",
            name: "User Management",
            icon: <FaUsers />,
            items: [
                { name: "Users", icon: <FaUser />, path: "/users" },
                { name: "Astrologers", icon: <FaMoon />, path: "/astrologers" },
                { name: "Admins", icon: <FaUserShield />, path: "/admins" }
            ]
        },
        {
            id: "consultations",
            name: "Consultations",
            icon: <FaCalendarAlt />,
            items: [
                { name: "Offline Sessions", icon: <FaBuilding />, path: "/session/offline" },
                { name: "Online Sessions", icon: <FaVideo />, path: "/session/online" }
            ]
        },
        {
            id: "services",
            name: "Services",
            icon: <FaStar />,
            items: [
                { name: "Consultations Services", icon: <FaMoon />, path: "/services/consultations" },
                { name: "Product Selling", icon: <FaShoppingBag />, path: "/services/product" },
                { name: "Puja Path", icon: <FaPray />, path: "/services/puja" }
            ]
        },

        {
            id: "commerce",
            name: "E-Commerce",
            icon: <FaShoppingBag />,
            items: [
                { name: "Products", icon: <FaBox />, path: "/products" },
                { name: "Orders", icon: <FaTruck />, path: "/orders" },
            ]
        },
        {
            id: "payments",
            name: "Payments",
            icon: <FaCreditCard />,
            items: [
                { name: "Analytics", icon: <FaChartBar />, path: "/payments/analytics" },
                { name: "Consultations Payments", icon: <FaWallet />, path: "/payments/consultations" },
                { name: "Astrologer Earnings", icon: <FaCoins />, path: "/payments/astrologer" },
                { name: "Product Earnings", icon: <FaMoneyBillWave />, path: "/payments/product" },
                { name: "Puja Path Earnings", icon: <FaHeart />, path: "/payments/puja" }
            ]
        },
        {
            id: "filters",
            name: "Filters & Centers",
            icon: <FaCog />,
            items: [
                { name: "Centers", icon: <FaBuilding />, path: "/centers" },
                { name: "Languages", icon: <FaLanguage />, path: "/languages" },
            ]
        },
        {
            id: "content",
            name: "Content Management",
            icon: <FaBlog />,
            items: [
                { name: "Blogs", icon: <FaNewspaper />, path: "/blogs" },
                { name: "Horoscopes", icon: <FaCircle />, path: "/horoscopes" }
            ]
        },
        {
            id: "support",
            name: "Customer Support",
            icon: <FaHeadset />,
            items: [
                { name: "Inquiries", icon: <FaQuestionCircle />, path: "/inquiries" },
                { name: "Newsletter", icon: <FaMailBulk />, path: "/newsletter" }
            ]
        },

    ];

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const isItemActive = (path: string) => {
        return pathname.includes(path);
    };

    const isGroupActive = (items: any[]) => {
        return items.some(item => pathname.includes(item.path));
    };

    const renderGroupedNavigation = (isMobile = false) => (
        <div className="space-y-1">
            {routeGroups.map((group) => {
                const isExpanded = expandedGroups.includes(group.id);
                const isActive = isGroupActive(group.items);

                return (
                    <div key={group.id}>
                        <button
                            onClick={() => toggleGroup(group.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 text-left
                                ${isActive
                                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                    : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{group.icon}</span>
                                <span className="font-medium text-sm">{group.name}</span>
                            </div>
                            {isExpanded ?
                                <FaChevronDown className="text-xs text-gray-400" /> :
                                <FaChevronRight className="text-xs text-gray-400" />
                            }
                        </button>

                        {isExpanded && (
                            <div className="ml-2 mt-1 space-y-1">
                                {group.items.map((item) => {
                                    const isItemActiveState = isItemActive(item.path);
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.path}
                                            className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-200
                                                ${isItemActiveState
                                                    ? "text-indigo-500 font-bold"
                                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                                }
                                            `}
                                            onClick={() => isMobile && setSidebarOpen(false)}
                                        >
                                            <span className="text-sm">{item.icon}</span>
                                            <span className="font-medium text-sm">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <>
            {/* Top Navbar - unchanged */}
            <nav className="flex justify-between items-center p-4 bg-slate-50 border-b border-slate-200">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden text-2xl text-gray-700"
                >
                    <BiMenu />
                </button>
                <span className="font-bold text-lg">
                    {admin ? `Welcome back ${admin.name.split(' ')[0]} (${admin.email})` : "Admin Panel"}
                </span>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white font-bold bg-red-400 hover:bg-red-500 rounded-md transition-colors"
                >
                    <BiExit className="text-lg" />
                    Logout
                </button>
            </nav>

            <div className="flex h-[90vh]">
                {/* Desktop Sidebar */}
                <nav className="hidden lg:flex w-[280px] h-full bg-white text-gray-800 flex-col p-4 border-r border-gray-200 overflow-y-auto">
                    {renderGroupedNavigation()}
                </nav>

                {/* Mobile Sidebar */}
                <div
                    className={`fixed top-0 left-0 w-[280px] h-full bg-white p-4 border-r border-gray-200 flex flex-col gap-4 transition-transform duration-300 overflow-y-auto
                        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:hidden z-50`}
                >
                    {/* Close Button */}
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <span className="font-bold text-lg">Admin Panel</span>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <BiX className="text-xl" />
                        </button>
                    </div>

                    {renderGroupedNavigation(true)}
                </div>

                {/* Main Content */}
                <main className={`transition-all duration-300 ${isSidebarOpen ? "w-0" : "w-full lg:w-[calc(100vw-280px)]"
                    } overflow-y-scroll overflow-x-hidden`}>
                    {children}
                </main>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </>
    );
}