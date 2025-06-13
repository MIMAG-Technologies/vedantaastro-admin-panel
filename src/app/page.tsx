"use client";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/auth");
    }
  }, [isAuthenticated]);
  return <main></main>;
}
