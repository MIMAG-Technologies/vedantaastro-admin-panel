"use client";
import "./globals.css";
import { LoadingProvider } from "@/context/loadingContext";
import { AuthProvider } from "@/context/authContext";
import { Bounce, toast, ToastContainer } from "react-toastify";
import SideNavbar from "@/components/common/Sidebar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BiExit, BiMenu } from "react-icons/bi";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

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
            <SideNavbar children={children} />
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
