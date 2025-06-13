import type { Metadata } from "next";
import "./globals.css";
import { LoadingProvider } from "@/context/loadingContext";

export const metadata: Metadata = {
  title: "Admin Panel | Vedantaastro",
  description: "Admin Panel for Vedantaastro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}
