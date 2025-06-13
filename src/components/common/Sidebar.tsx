"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import {
    FaHome,
    FaUsers,
    FaUserAstronaut,
    FaStar,
    FaCalendarAlt,
    FaShoppingBag,
    FaUserShield,
    FaCog,
    FaMoneyBillWave,
    FaQuestionCircle,
    FaBlog,
    FaBuilding,
    FaFilter
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
    const router = useRouter();
    const handleLogout = () => {
        localStorage.removeItem("vedantaastro-admin-token");
        toast.success("Logged out Successfully!");
        router.push("/auth");
    };
    const { admin } = useAuth();

    const routes: { name: string; icon: ReactNode; path: string }[] = [
        { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
        { name: "Users", icon: <FaUsers />, path: "/users" },
        { name: "Astrologers", icon: <FaUserAstronaut />, path: "/astrologers" },
        { name: "Sessions", icon: <FaCalendarAlt />, path: "/sessions" },
        { name: "Services", icon: <FaStar />, path: "/services" },
        { name: "Shop & Products", icon: <FaShoppingBag />, path: "/products" },
        { name: "Payments", icon: <FaMoneyBillWave />, path: "/payments" },
        { name: "Filters", icon: <FaFilter />, path: "/filters" },
        { name: "Blogs & Horoscopes", icon: <FaBlog />, path: "/content" },
        { name: "Inquiries", icon: <FaQuestionCircle />, path: "/inquiries" },
        { name: "Centers", icon: <FaBuilding />, path: "/centers" },
        { name: "Admin Settings", icon: <FaCog />, path: "/settings" }
    ];

    return (
        <>
            <nav className="flex justify-between items-center p-4 bg-slate-100 border-b border-slate-200">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden text-2xl text-gray-700"
                >
                    <BiMenu />
                </button>
                <span className="font-bold text-lg"> {admin ? `Welcome back ${admin.name.split(' ')[0]} (${admin.email})` : "Admin Panel"}</span>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white font-bold bg-red-400 hover:bg-red-500 rounded-md transition-colors"
                >
                    <BiExit className="text-lg" />
                    Logout
                </button>
            </nav>

            <div className="flex h-[90vh]">
                <nav className="hidden lg:flex w-[250px] h-full bg-gray-100 text-gray-800 flex-col gap-2 p-4 border-r border-gray-300">
                    {routes.map(({ name, icon, path }) => {
                        const isActive = pathname.includes(path);
                        return (
                            <Link
                                key={name}
                                href={path}
                                className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-300
                  ${isActive
                                        ? "bg-indigo-500 text-white shadow-md"
                                        : "bg-white hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-300"
                                    }
              `}
                            >
                                <span className="text-lg">{icon}</span>
                                <span className="font-medium">{name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div
                    className={`fixed top-0 left-0 w-[250px] bg-gray-100 p-4 border-r border-gray-300 flex flex-col gap-4 transition-transform duration-300 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        } lg:hidden z-50`}
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="text-2xl text-gray-700"
                    >
                        <BiX />
                    </button>

                    {routes.map(({ name, icon, path }) => {
                        const isActive = pathname === path;
                        return (
                            <Link
                                key={name}
                                href={path}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300
                ${isActive
                                        ? "bg-indigo-500 text-white shadow-md"
                                        : "bg-white hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-300"
                                    }
              `}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <span className="text-lg">{icon}</span>
                                <span className="font-medium">{name}</span>
                            </Link>
                        );
                    })}
                </div>
                <main
                    className={` transition-all duration-300 ${isSidebarOpen ? "w-0" : "w-full lg:w-[calc(100vw-250px)]"
                        } overflow-y-scroll overflow-x-hidden`}
                >
                    {children}
                </main>
            </div>
        </>
    );
}