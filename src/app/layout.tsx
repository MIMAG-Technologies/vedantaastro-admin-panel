"use client";
import "./globals.css";
import { LoadingProvider } from "@/context/loadingContext";
import { AuthProvider } from "@/context/authContext";
import SideNavbar from "@/components/common/Sidebar";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <head>
        <title>Admin Panel | Vedantaastro</title>
        <meta name="description" content="Admin Panel for Vedantaastro" />
        <link rel="icon" href="/logo.png" />
      </head>
      <body>
        <Toaster position="top-right" />
        <LoadingProvider>
          <AuthProvider>
            {pathname === "/auth" ? children : <SideNavbar children={children} />}
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
