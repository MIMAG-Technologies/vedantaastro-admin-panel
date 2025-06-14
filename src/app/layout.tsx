"use client";
import "./globals.css";
import { LoadingProvider } from "@/context/loadingContext";
import { AuthProvider } from "@/context/authContext";
import { Bounce, ToastContainer } from "react-toastify";
import SideNavbar from "@/components/common/Sidebar";
import { usePathname } from "next/navigation";

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
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover={false}
          theme="light"
          transition={Bounce}
        />
        <LoadingProvider>
          <AuthProvider>
            {pathname === "/auth" ? children : <SideNavbar children={children} />}
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
